import { relative } from "../deps.js";
import { isBinaryFile } from "./utils.js";
import {
  getBranchInfo,
  getStatusOverview,
  toServedPath,
} from "../git/git-status.js";
import { getCommits } from "../git/git-log.js";
import { listWorktrees } from "../git/git-worktree.js";
import { getWorkingDir } from "../workspace.js";

const STATUS_ORDER = ["added", "modified", "renamed", "deleted"];

function describeChange(record, repoRoot, workingDir) {
  const servedPath = toServedPath(repoRoot, workingDir, record.path);
  // Untracked files have no committed version to compare against, and binary
  // files have no textual diff to render
  const canDiff = servedPath !== null && !record.isUntracked &&
    !isBinaryFile(record.path);
  const originalDisplayPath = record.originalPath
    ? toServedPath(repoRoot, workingDir, record.originalPath) ||
      record.originalPath
    : null;

  return {
    path: record.path,
    servedPath,
    displayPath: servedPath || record.path,
    originalDisplayPath,
    status: record.status,
    statusCode: record.statusCode.trim() || record.status[0].toUpperCase(),
    canDiff,
    canOpen: servedPath !== null && record.status !== "deleted",
  };
}

function describeChanges(records, repoRoot, workingDir) {
  return [...records]
    .sort((first, second) =>
      STATUS_ORDER.indexOf(first.status) -
        STATUS_ORDER.indexOf(second.status) ||
      first.path.localeCompare(second.path)
    )
    .map((record) => describeChange(record, repoRoot, workingDir));
}

export async function gitOverview(c) {
  try {
    const workingDir = getWorkingDir();
    const branchInfo = await getBranchInfo(workingDir);

    if (!branchInfo) {
      return c.json({ ok: true, repository: null });
    }

    const [overview, recent, worktrees] = await Promise.all([
      getStatusOverview(workingDir),
      getCommits(workingDir, { limit: 5 }),
      listWorktrees(workingDir),
    ]);
    const repoRoot = branchInfo.repoRoot;

    return c.json({
      ok: true,
      repository: branchInfo,
      scopePath: relative(repoRoot, workingDir),
      changeCount: overview ? overview.changeCount : 0,
      staged: describeChanges(overview?.staged || [], repoRoot, workingDir),
      unstaged: describeChanges(overview?.unstaged || [], repoRoot, workingDir),
      untracked: describeChanges(
        overview?.untracked || [],
        repoRoot,
        workingDir,
      ),
      recentCommits: recent ? recent.commits : [],
      worktrees: worktrees || [],
    });
  } catch (error) {
    return c.json({ ok: false, message: error.message }, 500);
  }
}
