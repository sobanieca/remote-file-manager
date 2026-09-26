import { join } from "../deps.js";
import {
  combinePaths,
  getFileKind,
  isMarkdownFile,
} from "../endpoints/utils.js";
import { matchQuery, parseQuery } from "./fuzzy-match.js";

const MAX_ENTRIES = 250_000;
const INDEX_TTL_MS = 10_000;
const SKIPPED_DIRECTORY_NAMES = new Set([".git"]);

// One index per served directory. A stale index keeps answering queries while
// a fresh one is built, so typing never blocks on a directory walk
const indexes = new Map();

async function walkDirectory(rootDir) {
  const entries = [];
  const pendingDirectories = ["."];
  let truncated = false;

  while (pendingDirectories.length > 0 && !truncated) {
    const directory = pendingDirectories.pop();
    const absoluteDirectory = directory === "."
      ? rootDir
      : join(rootDir, directory);
    try {
      for await (const dirEntry of Deno.readDir(absoluteDirectory)) {
        if (
          dirEntry.isDirectory && SKIPPED_DIRECTORY_NAMES.has(dirEntry.name)
        ) {
          continue;
        }
        const path = combinePaths(directory, dirEntry.name);
        entries.push({
          path,
          pathLower: path.toLowerCase(),
          name: dirEntry.name,
          isDirectory: dirEntry.isDirectory,
          isSymlink: dirEntry.isSymlink,
        });
        if (entries.length >= MAX_ENTRIES) {
          truncated = true;
          break;
        }
        // Symbolic links to directories are listed but not descended into,
        // which keeps link cycles from looping forever
        if (dirEntry.isDirectory && !dirEntry.isSymlink) {
          pendingDirectories.push(path);
        }
      }
    } catch (_error) {
      // Unreadable directories are skipped
    }
  }

  return { entries, truncated };
}

async function buildIndex(rootDir) {
  const { entries, truncated } = await walkDirectory(rootDir);
  return { entries, truncated, builtAt: Date.now() };
}

function rebuildInBackground(rootDir, cached) {
  if (cached.rebuild) {
    return;
  }
  cached.rebuild = buildIndex(rootDir)
    .then((fresh) => {
      indexes.set(rootDir, fresh);
    })
    .catch(() => {})
    .finally(() => {
      cached.rebuild = null;
    });
}

/**
 * Returns the entry index of a directory, building it on first use
 * @param {string} rootDir - The served directory
 * @returns {Promise<object>} - The index with entries and truncated flag
 */
export async function getFileIndex(rootDir) {
  const cached = indexes.get(rootDir);
  if (cached) {
    if (Date.now() - cached.builtAt > INDEX_TTL_MS) {
      rebuildInBackground(rootDir, cached);
    }
    return cached;
  }
  const fresh = await buildIndex(rootDir);
  indexes.set(rootDir, fresh);
  return fresh;
}

/**
 * Drops every cached index, used after files were created, moved or removed
 */
export function invalidateFileIndex() {
  indexes.clear();
}

function compareMatches(first, second) {
  if (second.score !== first.score) {
    return second.score - first.score;
  }
  if (first.entry.path.length !== second.entry.path.length) {
    return first.entry.path.length - second.entry.path.length;
  }
  return first.entry.path.localeCompare(second.entry.path);
}

function describeMatch({ entry, score, positions }) {
  return {
    path: entry.path,
    name: entry.name,
    isDirectory: entry.isDirectory,
    isSymlink: entry.isSymlink,
    isMarkdown: !entry.isDirectory && isMarkdownFile(entry.name),
    kind: entry.isDirectory ? "folder" : getFileKind(entry.name),
    score: Number.isFinite(score) ? Math.round(score * 1000) / 1000 : score,
    positions,
  };
}

/**
 * Finds the entries below a directory that fuzzy match a query
 * @param {string} rootDir - The served directory
 * @param {string} query - The raw search query
 * @param {number} limit - The maximum number of results to return
 * @returns {Promise<object>} - The best matches and index statistics
 */
export async function searchFileIndex(rootDir, query, limit) {
  const index = await getFileIndex(rootDir);
  const terms = parseQuery(query);
  const summary = {
    indexedCount: index.entries.length,
    truncated: index.truncated,
  };

  if (terms.length === 0) {
    return { ...summary, total: 0, results: [] };
  }

  const matches = [];
  for (const entry of index.entries) {
    const match = matchQuery(terms, entry.path, entry.pathLower);
    if (match) {
      matches.push({ entry, score: match.score, positions: match.positions });
    }
  }
  matches.sort(compareMatches);

  return {
    ...summary,
    total: matches.length,
    results: matches.slice(0, limit).map(describeMatch),
  };
}
