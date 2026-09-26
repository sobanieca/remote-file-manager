import { join, relative } from "../deps.js";
import { getRepoRoot, runGit } from "./git-command.js";

function resolveStatus(statusCode) {
  if (statusCode === "??") {
    return "added";
  }
  const indexStatus = statusCode[0];
  const worktreeStatus = statusCode[1];
  if (indexStatus === "A" || worktreeStatus === "A") {
    return "added";
  }
  if (indexStatus === "D" || worktreeStatus === "D") {
    return "deleted";
  }
  if (indexStatus === "R" || indexStatus === "C") {
    return "renamed";
  }
  return "modified";
}

function parsePorcelain(output) {
  const records = [];
  const tokens = output.split("\0");
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!token) {
      continue;
    }
    const statusCode = token.slice(0, 2);
    const filePath = token.slice(3);
    let originalPath = null;
    if (statusCode[0] === "R" || statusCode[0] === "C") {
      originalPath = tokens[++i] || null;
    }
    records.push({
      statusCode,
      path: filePath,
      originalPath,
      status: resolveStatus(statusCode),
      isStaged: statusCode[0] !== " " && statusCode[0] !== "?",
      isUnstaged: statusCode[1] !== " " && statusCode[1] !== "?",
      isUntracked: statusCode === "??",
    });
  }
  return records;
}

/**
 * Collects the working tree status for the repository containing a directory
 * @param {string} workingDir - The directory to inspect
 * @returns {Promise<object|null>} - Status info, or null when not a repository
 */
export async function getGitStatusInfo(workingDir) {
  const repoRoot = await getRepoRoot(workingDir);
  if (!repoRoot) {
    return null;
  }

  // Running git in the served directory with a "." pathspec keeps changes from
  // unrelated parts of the repository out of the report. The porcelain format
  // always reports paths relative to the repository root
  const output = await runGit(
    ["status", "--porcelain", "-z", "--untracked-files=all", "--", "."],
    workingDir,
  );
  if (output === null) {
    return null;
  }

  const records = parsePorcelain(output);
  const recordsByPath = new Map();
  for (const record of records) {
    recordsByPath.set(record.path, record);
  }

  return { repoRoot, recordsByPath, records };
}

function toRepoRelativePath(gitInfo, workingDir, entryPath) {
  const absolutePath = entryPath === "."
    ? workingDir
    : join(workingDir, entryPath);
  return relative(gitInfo.repoRoot, absolutePath);
}

function summarizeStatuses(statuses) {
  if (statuses.size === 0) {
    return null;
  }
  if (statuses.size === 1) {
    const [only] = statuses;
    return only === "renamed" ? "modified" : only;
  }
  return "modified";
}

/**
 * Resolves the git change of a directory entry. A directory reports the
 * combined state of everything below it
 * @param {object|null} gitInfo - The status info from getGitStatusInfo
 * @param {string} workingDir - The served working directory
 * @param {string} entryPath - The entry path relative to the working directory
 * @param {boolean} isDirectory - Whether the entry is a directory
 * @returns {object|null} - The status and whether a diff exists, or null
 */
export function getEntryGitChange(gitInfo, workingDir, entryPath, isDirectory) {
  if (!gitInfo) {
    return null;
  }
  const gitRelativePath = toRepoRelativePath(gitInfo, workingDir, entryPath);

  if (!isDirectory) {
    const record = gitInfo.recordsByPath.get(gitRelativePath);
    if (!record) {
      return null;
    }
    return { status: record.status, hasDiff: !record.isUntracked };
  }

  const prefix = gitRelativePath === "" ? "" : gitRelativePath + "/";
  const statuses = new Set();
  let hasDiff = false;
  for (const record of gitInfo.records) {
    if (!record.path.startsWith(prefix)) {
      continue;
    }
    statuses.add(record.status);
    hasDiff = hasDiff || !record.isUntracked;
  }
  const status = summarizeStatuses(statuses);
  return status ? { status, hasDiff } : null;
}

/**
 * Resolves the git status badge for a single directory entry
 * @param {object|null} gitInfo - The status info from getGitStatusInfo
 * @param {string} workingDir - The served working directory
 * @param {string} entryPath - The entry path relative to the working directory
 * @param {boolean} isDirectory - Whether the entry is a directory
 * @returns {string|null} - The status name, or null when unchanged
 */
export function getEntryGitStatus(gitInfo, workingDir, entryPath, isDirectory) {
  const change = getEntryGitChange(gitInfo, workingDir, entryPath, isDirectory);
  return change ? change.status : null;
}

/**
 * Lists entries git reports as deleted directly inside a directory. A
 * directory whose files were all deleted no longer exists on disk, so it is
 * reported as a deleted directory
 * @param {object|null} gitInfo - The status info from getGitStatusInfo
 * @param {string} workingDir - The served working directory
 * @param {string} directoryPath - The directory to inspect
 * @param {Set<string>} existingNames - Names that still exist on disk
 * @returns {object[]} - Deleted entries with name and isDirectory
 */
export function getDeletedEntries(
  gitInfo,
  workingDir,
  directoryPath,
  existingNames,
) {
  if (!gitInfo) {
    return [];
  }
  const relativeDir = toRepoRelativePath(gitInfo, workingDir, directoryPath);
  const prefix = relativeDir === "" ? "" : relativeDir + "/";
  const deleted = new Map();

  for (const record of gitInfo.records) {
    if (record.status !== "deleted" || !record.path.startsWith(prefix)) {
      continue;
    }
    const remainder = record.path.slice(prefix.length);
    const separatorIndex = remainder.indexOf("/");
    const name = separatorIndex === -1
      ? remainder
      : remainder.slice(0, separatorIndex);
    if (!name || existingNames.has(name) || deleted.has(name)) {
      continue;
    }
    deleted.set(name, { name, isDirectory: separatorIndex !== -1 });
  }

  return [...deleted.values()];
}

/**
 * Converts a repository relative path into one relative to the served directory
 * @param {string} repoRoot - The repository root
 * @param {string} workingDir - The served working directory
 * @param {string} gitRelativePath - The path as reported by git
 * @returns {string|null} - The path to use in links, or null when outside
 */
export function toServedPath(repoRoot, workingDir, gitRelativePath) {
  const absolutePath = join(repoRoot, gitRelativePath);
  const servedPath = relative(workingDir, absolutePath);
  if (servedPath.startsWith("..")) {
    return null;
  }
  return servedPath || ".";
}

/**
 * Reads the current branch, head commit and upstream tracking state
 * @param {string} workingDir - The directory to inspect
 * @returns {Promise<object|null>} - Branch info, or null when not a repository
 */
export async function getBranchInfo(workingDir) {
  const repoRoot = await getRepoRoot(workingDir);
  if (!repoRoot) {
    return null;
  }

  // The symbolic ref resolves on a branch without commits too, where
  // rev-parse would fail and misreport the repository as detached
  const [symbolicRef, headOutput, upstreamOutput] = await Promise.all([
    runGit(["symbolic-ref", "--short", "-q", "HEAD"], repoRoot),
    runGit(["rev-parse", "--short", "--verify", "-q", "HEAD"], repoRoot),
    runGit(
      ["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{upstream}"],
      repoRoot,
    ),
  ]);

  const branch = symbolicRef ? symbolicRef.trim() : null;
  const head = headOutput ? headOutput.trim() : null;
  const upstream = upstreamOutput ? upstreamOutput.trim() : null;
  const isDetached = branch === null;

  let ahead = 0;
  let behind = 0;
  if (upstream && head) {
    const counts = await runGit(
      ["rev-list", "--left-right", "--count", `${upstream}...HEAD`],
      repoRoot,
    );
    if (counts) {
      const [behindCount, aheadCount] = counts.trim().split(/\s+/);
      behind = parseInt(behindCount, 10) || 0;
      ahead = parseInt(aheadCount, 10) || 0;
    }
  }

  return {
    repoRoot,
    branch: isDetached ? (head ? `detached @ ${head}` : "detached") : branch,
    isDetached,
    head,
    upstream,
    ahead,
    behind,
    hasCommits: head !== null,
  };
}

/**
 * Groups working tree changes into staged, unstaged and untracked buckets
 * @param {string} workingDir - The directory to inspect
 * @returns {Promise<object|null>} - The overview, or null when not a repository
 */
export async function getStatusOverview(workingDir) {
  const gitInfo = await getGitStatusInfo(workingDir);
  if (!gitInfo) {
    return null;
  }

  const staged = [];
  const unstaged = [];
  const untracked = [];

  for (const record of gitInfo.records) {
    if (record.isUntracked) {
      untracked.push(record);
      continue;
    }
    if (record.isStaged) {
      staged.push(record);
    }
    if (record.isUnstaged) {
      unstaged.push(record);
    }
  }

  return {
    repoRoot: gitInfo.repoRoot,
    staged,
    unstaged,
    untracked,
    changeCount: gitInfo.records.length,
  };
}

const STATUS_LABELS = {
  added: "A",
  modified: "M",
  deleted: "D",
  renamed: "R",
};

const STATUS_TITLES = {
  added: "Added / Untracked",
  modified: "Modified",
  deleted: "Deleted",
  renamed: "Renamed",
};

/**
 * Renders the compact badge shown next to changed entries
 * @param {string|null} status - The status name
 * @returns {string} - The badge markup, or "" when unchanged
 */
export function gitStatusBadge(status) {
  if (!status) {
    return "";
  }
  return `<span class="git-status git-${status}" title="${
    STATUS_TITLES[status]
  }">${STATUS_LABELS[status]}</span>`;
}
