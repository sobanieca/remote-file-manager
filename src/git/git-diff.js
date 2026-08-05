import { join, relative } from "../deps.js";
import {
  getRepoRoot,
  hasCommits,
  isValidRevision,
  runGit,
} from "./git-command.js";

const DIFF_BASE_ARGS = ["--no-color", "--no-ext-diff", "-M"];

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
  const repoRelativePath = toRepoRelativePath(repoRoot, workingDir, entryPath);
  if (repoRelativePath === null) {
    return null;
  }

  const pathArgs = ["--", `:(literal)${repoRelativePath}`];
  if (mode === "unstaged") {
    return await runGit(["diff", ...DIFF_BASE_ARGS, ...pathArgs], repoRoot);
  }

  const revisionArgs = await hasCommits(repoRoot) ? ["HEAD"] : [];
  const stagedArgs = mode === "staged" ? ["--cached"] : [];
  return await runGit(
    ["diff", ...DIFF_BASE_ARGS, ...stagedArgs, ...revisionArgs, ...pathArgs],
    repoRoot,
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
      ...DIFF_BASE_ARGS,
      ...(stagedOnly ? ["--cached"] : []),
      ...revisionArgs,
    ],
    repoRoot,
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
  return await runGit(
    ["show", ...DIFF_BASE_ARGS, "--format=", revision],
    repoRoot,
  );
}
