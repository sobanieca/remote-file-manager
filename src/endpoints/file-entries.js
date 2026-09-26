import { basename, dirname } from "../deps.js";
import {
  combinePaths,
  getFileKind,
  isExecutableMode,
  isImageFile,
  isMarkdownFile,
  isTextFile,
} from "./utils.js";
import {
  getDeletedEntries,
  getEntryGitChange,
  getGitStatusInfo,
} from "../git/git-status.js";
import { getWorkingDir } from "../workspace.js";

async function describeEntry(directoryPath, name, isDirectory, isSymlink) {
  const path = combinePaths(directoryPath, name);
  const entry = {
    name,
    path,
    isDirectory,
    isSymlink,
    isDeleted: false,
    size: null,
    mode: null,
    modifiedAt: null,
    isExecutable: false,
    kind: isDirectory ? "folder" : getFileKind(name),
    isImage: !isDirectory && isImageFile(name),
    isMarkdown: !isDirectory && isMarkdownFile(name),
    isText: !isDirectory && isTextFile(name),
    isBroken: false,
    gitStatus: null,
    hasGitDiff: false,
  };

  try {
    const stat = await Deno.stat(path);
    entry.size = stat.isDirectory ? null : stat.size;
    entry.mode = stat.mode;
    entry.modifiedAt = stat.mtime;
    entry.isExecutable = !stat.isDirectory && isExecutableMode(stat.mode);
    if (isSymlink && stat.isDirectory) {
      entry.isDirectory = true;
      entry.kind = "folder";
    }
  } catch (_error) {
    entry.isBroken = true;
  }

  return entry;
}

function describeDeletedEntry(directoryPath, name, isDirectory) {
  return {
    name,
    path: combinePaths(directoryPath, name),
    isDirectory,
    isSymlink: false,
    isDeleted: true,
    size: null,
    mode: null,
    modifiedAt: null,
    isExecutable: false,
    kind: isDirectory ? "folder" : getFileKind(name),
    isImage: false,
    isMarkdown: false,
    isText: false,
    isBroken: false,
    gitStatus: "deleted",
    hasGitDiff: true,
  };
}

function applyGitChange(entry, gitInfo, workingDir) {
  if (entry.isDeleted) {
    return;
  }
  const change = getEntryGitChange(
    gitInfo,
    workingDir,
    entry.path,
    entry.isDirectory,
  );
  entry.gitStatus = change ? change.status : null;
  entry.hasGitDiff = change ? change.hasDiff : false;
}

/**
 * Builds the descriptor for a single path, including its git status
 * @param {string} path - The normalized path to describe
 * @returns {Promise<object>} - The entry descriptor
 */
export async function describePath(path) {
  const linkStat = await Deno.lstat(path);
  const entry = await describeEntry(
    dirname(path) || ".",
    basename(path),
    linkStat.isDirectory,
    linkStat.isSymlink,
  );

  const workingDir = getWorkingDir();
  const gitInfo = await getGitStatusInfo(workingDir);
  applyGitChange(entry, gitInfo, workingDir);

  return entry;
}

function compareEntries(first, second) {
  if (first.isDirectory !== second.isDirectory) {
    return first.isDirectory ? -1 : 1;
  }
  return first.name.localeCompare(second.name, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

/**
 * Reads a directory and returns rich descriptors for every entry
 * @param {string} directoryPath - The normalized directory path to read
 * @param {object|null} [gitInfo] - Status info to reuse instead of reading it
 * @returns {Promise<{entries: object[], totalSize: number}>} - The listing
 */
export async function readDirectoryEntries(directoryPath, gitInfo) {
  const workingDir = getWorkingDir();
  const statusInfo = gitInfo === undefined
    ? await getGitStatusInfo(workingDir)
    : gitInfo;
  const pendingEntries = [];

  for await (const entry of Deno.readDir(directoryPath)) {
    pendingEntries.push(
      describeEntry(
        directoryPath,
        entry.name,
        entry.isDirectory,
        entry.isSymlink,
      ),
    );
  }

  const entries = await Promise.all(pendingEntries);
  const existingNames = new Set(entries.map((entry) => entry.name));

  for (
    const deleted of getDeletedEntries(
      statusInfo,
      workingDir,
      directoryPath,
      existingNames,
    )
  ) {
    entries.push(
      describeDeletedEntry(directoryPath, deleted.name, deleted.isDirectory),
    );
  }

  for (const entry of entries) {
    applyGitChange(entry, statusInfo, workingDir);
  }

  entries.sort(compareEntries);

  const totalSize = entries.reduce(
    (sum, entry) => sum + (entry.size || 0),
    0,
  );

  return { entries, totalSize };
}
