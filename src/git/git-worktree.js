import { join, relative } from "../deps.js";
import { getRepoRoot, runGit } from "./git-command.js";

function createWorktree(path) {
  return {
    path,
    head: null,
    branch: null,
    isDetached: false,
    isBare: false,
    isLocked: false,
    lockReason: "",
    isPrunable: false,
    pruneReason: "",
  };
}

function parseWorktreeList(output) {
  const worktrees = [];
  let current = null;

  for (const line of output.split("\n")) {
    if (line === "") {
      if (current) {
        worktrees.push(current);
      }
      current = null;
      continue;
    }
    const separatorIndex = line.indexOf(" ");
    const key = separatorIndex === -1 ? line : line.slice(0, separatorIndex);
    const value = separatorIndex === -1 ? "" : line.slice(separatorIndex + 1);

    if (key === "worktree") {
      current = createWorktree(value);
      continue;
    }
    if (!current) {
      continue;
    }
    if (key === "HEAD") {
      current.head = value;
    } else if (key === "branch") {
      current.branch = value.replace(/^refs\/heads\//, "");
    } else if (key === "detached") {
      current.isDetached = true;
    } else if (key === "bare") {
      current.isBare = true;
    } else if (key === "locked") {
      current.isLocked = true;
      current.lockReason = value;
    } else if (key === "prunable") {
      current.isPrunable = true;
      current.pruneReason = value;
    }
  }
  if (current) {
    worktrees.push(current);
  }
  return worktrees;
}

async function toRealPath(path) {
  try {
    return await Deno.realPath(path);
  } catch (_error) {
    return path;
  }
}

function describeWorktree(worktree, currentRoot) {
  const shortHead = worktree.head ? worktree.head.slice(0, 7) : null;
  const label = worktree.branch ||
    (shortHead ? `detached @ ${shortHead}` : "detached");
  return {
    ...worktree,
    shortHead,
    label,
    isCurrent: worktree.realPath === currentRoot,
  };
}

/**
 * Lists every worktree of the repository containing a directory
 * @param {string} workingDir - The directory to inspect
 * @returns {Promise<object[]|null>} - The worktrees, or null when untracked
 */
export async function listWorktrees(workingDir) {
  const repoRoot = await getRepoRoot(workingDir);
  if (!repoRoot) {
    return null;
  }
  const output = await runGit(["worktree", "list", "--porcelain"], repoRoot);
  if (output === null) {
    return null;
  }

  const currentRoot = await toRealPath(repoRoot);
  const worktrees = [];
  for (const worktree of parseWorktreeList(output)) {
    if (worktree.isBare) {
      continue;
    }
    worktree.realPath = await toRealPath(worktree.path);
    worktrees.push(describeWorktree(worktree, currentRoot));
  }
  return worktrees;
}

/**
 * Resolves the directory to serve after switching to a worktree, keeping the
 * same sub directory that is currently served when the worktree has it
 * @param {string} workingDir - The currently served directory
 * @param {string} requestedPath - The worktree path as listed by git
 * @returns {Promise<{ok: boolean, directory?: string, message?: string}>}
 */
export async function resolveWorktreeDirectory(workingDir, requestedPath) {
  const worktrees = await listWorktrees(workingDir);
  if (!worktrees) {
    return { ok: false, message: "Not inside a git repository" };
  }
  const worktree = worktrees.find((candidate) =>
    candidate.path === requestedPath
  );
  if (!worktree) {
    return { ok: false, message: "Unknown worktree" };
  }

  try {
    const stat = await Deno.stat(worktree.path);
    if (!stat.isDirectory) {
      return { ok: false, message: "Worktree directory is missing" };
    }
  } catch (_error) {
    return { ok: false, message: "Worktree directory is missing" };
  }

  const repoRoot = await getRepoRoot(workingDir);
  const scope = relative(repoRoot, workingDir);
  if (scope && !scope.startsWith("..")) {
    const scopedDirectory = join(worktree.path, scope);
    try {
      if ((await Deno.stat(scopedDirectory)).isDirectory) {
        return { ok: true, directory: scopedDirectory, worktree };
      }
    } catch (_error) {
      // The served sub directory does not exist there, use the worktree root
    }
  }
  return { ok: true, directory: worktree.path, worktree };
}
