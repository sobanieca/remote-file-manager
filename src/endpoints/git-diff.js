import { normalizePath } from "./utils.js";
import { parseDiff } from "../git/diff-parser.js";
import {
  getCommitDiff,
  getFileDiff,
  getWorkingTreeDiff,
} from "../git/git-diff.js";
import { getCommit } from "../git/git-log.js";
import { getBranchInfo, toServedPath } from "../git/git-status.js";
import { getWorkingDir } from "../workspace.js";

const FILE_DIFF_SUBTITLES = {
  staged: "Staged changes, index against HEAD",
  unstaged: "Unstaged changes, working tree against the index",
};

async function resolveDiffRequest(c, workingDir, repoRoot) {
  const commit = c.req.query("commit");
  if (commit) {
    const [diffText, commitInfo] = await Promise.all([
      getCommitDiff(workingDir, commit),
      getCommit(workingDir, commit),
    ]);
    // Commit diffs are produced at the repository root, so their paths have
    // to be mapped back onto the served directory
    return {
      diffText,
      resolvePath: (path) => toServedPath(repoRoot, workingDir, path),
      title: commitInfo ? commitInfo.subject : "Commit",
      commit: commitInfo,
      back: "history",
    };
  }

  if (c.req.query("staged") !== undefined) {
    return {
      diffText: await getWorkingTreeDiff(workingDir, true),
      title: "Staged changes",
      subtitle: "Differences between the index and HEAD",
      back: "status",
    };
  }

  if (c.req.query("all") !== undefined) {
    return {
      diffText: await getWorkingTreeDiff(workingDir, false),
      title: "Working tree changes",
      subtitle: "All uncommitted changes",
      back: "status",
    };
  }

  const filePath = normalizePath(c.req.query("path") || "");
  if (!filePath) {
    return null;
  }

  const mode = c.req.query("mode");
  return {
    diffText: await getFileDiff(workingDir, filePath, mode),
    title: filePath,
    subtitle: FILE_DIFF_SUBTITLES[mode] || "Uncommitted changes",
    back: mode === "staged" || mode === "unstaged" ? "status" : "files",
    filePath,
  };
}

function resolveServedPath(file, resolvePath) {
  if (file.status === "deleted") {
    return null;
  }
  return resolvePath ? resolvePath(file.path) : file.path;
}

export async function gitDiff(c) {
  try {
    const workingDir = getWorkingDir();
    const branchInfo = await getBranchInfo(workingDir);

    if (!branchInfo) {
      return c.json({ ok: true, repository: null });
    }

    const request = await resolveDiffRequest(
      c,
      workingDir,
      branchInfo.repoRoot,
    );
    if (!request) {
      return c.json({ ok: false, message: "Nothing to diff" }, 400);
    }
    if (request.diffText === null) {
      return c.json({ ok: false, message: "Unable to read this diff" }, 404);
    }

    return c.json({
      ok: true,
      repository: branchInfo,
      title: request.title,
      subtitle: request.subtitle || null,
      commit: request.commit || null,
      back: request.back,
      filePath: request.filePath || null,
      files: parseDiff(request.diffText).map((file) => ({
        ...file,
        servedPath: resolveServedPath(file, request.resolvePath),
      })),
    });
  } catch (error) {
    return c.json({ ok: false, message: error.message }, 500);
  }
}
