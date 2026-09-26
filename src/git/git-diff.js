import { join, relative } from "../deps.js";
import {
  getRepoRoot,
  hasCommits,
  isValidRevision,
  runGit,
} from "./git-command.js";

const DIFF_BASE_ARGS = ["--no-color", "--no-ext-diff", "-M"];
// Working tree diffs run in the served directory so that they cover the same
// files as the status page and report paths the file explorer can open
const WORKING_TREE_DIFF_ARGS = [...DIFF_BASE_ARGS, "--relative"];

function toRepoRelativePath(repoRoot, workingDir, entryPath) {
  const absolutePath = join(workingDir, entryPath);
  const repoRelativePath = relative(repoRoot, absolutePath);
  if (repoRelativePath.startsWith("..")) {
    return null;
  }
  return repoRelativePath;
}

/**
 * Reads the diff for a single file
 * @param {string} workingDir - The served working directory
 * @param {string} entryPath - The file path relative to the working directory
 * @param {string} mode - "staged" for index against HEAD, "unstaged" for the
 *   working tree against the index, anything else for working tree against HEAD
 * @returns {Promise<string|null>} - The diff text, or null when unavailable
 */
export async function getFileDiff(workingDir, entryPath, mode) {
  const repoRoot = await getRepoRoot(workingDir);
  if (!repoRoot) {
    return null;
  }
  if (toRepoRelativePath(repoRoot, workingDir, entryPath) === null) {
    return null;
  }

  const pathArgs = ["--", `:(literal)${entryPath}`];
  if (mode === "unstaged") {
    return await runGit(
      ["diff", ...WORKING_TREE_DIFF_ARGS, ...pathArgs],
      workingDir,
    );
  }

  const revisionArgs = await hasCommits(repoRoot) ? ["HEAD"] : [];
  const stagedArgs = mode === "staged" ? ["--cached"] : [];
  return await runGit(
    [
      "diff",
      ...WORKING_TREE_DIFF_ARGS,
      ...stagedArgs,
      ...revisionArgs,
      ...pathArgs,
    ],
    workingDir,
  );
}

/**
 * Reads the full working tree diff against HEAD
 * @param {string} workingDir - The served working directory
 * @param {boolean} stagedOnly - Whether to limit the diff to staged changes
 * @returns {Promise<string|null>} - The diff text, or null when unavailable
 */
export async function getWorkingTreeDiff(workingDir, stagedOnly) {
  const repoRoot = await getRepoRoot(workingDir);
  if (!repoRoot) {
    return null;
  }
  const revisionArgs = await hasCommits(repoRoot) ? ["HEAD"] : [];
  return await runGit(
    [
      "diff",
      ...WORKING_TREE_DIFF_ARGS,
      ...(stagedOnly ? ["--cached"] : []),
      ...revisionArgs,
    ],
    workingDir,
  );
}

/**
 * Reads the diff between two revisions, optionally limited to one file
 * @param {string} workingDir - The served working directory
 * @param {string} fromRevision - The base revision
 * @param {string} toRevision - The target revision
 * @param {string|null} repoRelativePath - An optional path filter
 * @returns {Promise<string|null>} - The diff text, or null when unavailable
 */
export async function getRevisionDiff(
  workingDir,
  fromRevision,
  toRevision,
  repoRelativePath = null,
) {
  const repoRoot = await getRepoRoot(workingDir);
  if (!repoRoot) {
    return null;
  }
  if (!isValidRevision(fromRevision) || !isValidRevision(toRevision)) {
    return null;
  }
  const pathArgs = repoRelativePath
    ? ["--", `:(literal)${repoRelativePath}`]
    : [];
  return await runGit(
    ["diff", ...DIFF_BASE_ARGS, fromRevision, toRevision, ...pathArgs],
    repoRoot,
  );
}

/**
 * Reads the diff introduced by a single commit
 * @param {string} workingDir - The served working directory
 * @param {string} revision - The commit to show
 * @returns {Promise<string|null>} - The diff text, or null when unavailable
 */
export async function getCommitDiff(workingDir, revision) {
  const repoRoot = await getRepoRoot(workingDir);
  if (!repoRoot || !isValidRevision(revision)) {
    return null;
  }
  // Merge commits are shown against their first parent, which older git
  // versions cannot express, so the plain form remains as a fallback
  const firstParentDiff = await runGit(
    [
      "show",
      ...DIFF_BASE_ARGS,
      "--format=",
      "--diff-merges=first-parent",
      revision,
    ],
    repoRoot,
  );
  if (firstParentDiff !== null) {
    return firstParentDiff;
  }
  return await runGit(
    ["show", ...DIFF_BASE_ARGS, "--format=", revision],
    repoRoot,
  );
}
