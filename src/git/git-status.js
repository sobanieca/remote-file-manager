import { basename, dirname, join, relative } from "../deps.js";
import { getRepoRoot, hasCommits, runGit } from "./git-command.js";

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

  const output = await runGit(
    ["status", "--porcelain", "-z", "--untracked-files=all"],
    repoRoot,
  );
  if (output === null) {
    return null;
  }

  const records = parsePorcelain(output);
  const statusMap = new Map();
  for (const record of records) {
    statusMap.set(record.path, record.status);
  }

  return { repoRoot, statusMap, records };
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
  if (!gitInfo) {
    return null;
  }
  const absolutePath = join(workingDir, entryPath);
  const gitRelativePath = relative(gitInfo.repoRoot, absolutePath);
  if (!isDirectory) {
    return gitInfo.statusMap.get(gitRelativePath) || null;
  }
  const prefix = gitRelativePath + "/";
  for (const key of gitInfo.statusMap.keys()) {
    if (key.startsWith(prefix)) {
      return "modified";
    }
  }
  return null;
}

/**
 * Lists names of files git reports as deleted inside a directory
 * @param {object|null} gitInfo - The status info from getGitStatusInfo
 * @param {string} workingDir - The served working directory
 * @param {string} directoryPath - The directory to inspect
 * @returns {string[]} - The deleted file names
 */
export function getDeletedEntryNames(gitInfo, workingDir, directoryPath) {
  if (!gitInfo) {
    return [];
  }
  const absoluteDir = join(workingDir, directoryPath);
  const relativeDir = relative(gitInfo.repoRoot, absoluteDir) || ".";
  const names = [];
  for (const [key, status] of gitInfo.statusMap.entries()) {
    if (status === "deleted" && dirname(key) === relativeDir) {
      names.push(basename(key));
    }
  }
  return names;
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

  const branchOutput = await runGit(
    ["rev-parse", "--abbrev-ref", "HEAD"],
    repoRoot,
  );
  const branch = branchOutput ? branchOutput.trim() : null;
  const isDetached = branch === "HEAD" || branch === null;

  const headOutput = await runGit(["rev-parse", "--short", "HEAD"], repoRoot);
  const head = headOutput ? headOutput.trim() : null;

  const upstreamOutput = await runGit(
    ["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{upstream}"],
    repoRoot,
  );
  const upstream = upstreamOutput ? upstreamOutput.trim() : null;

  let ahead = 0;
  let behind = 0;
  if (upstream) {
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
    hasCommits: await hasCommits(repoRoot),
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

  return { repoRoot: gitInfo.repoRoot, staged, unstaged, untracked };
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
