import { normalizePath } from "./utils.js";
import { getCommits } from "../git/git-log.js";
import { getBranchInfo } from "../git/git-status.js";
import { join, relative } from "../deps.js";
import { getWorkingDir } from "../workspace.js";

const PAGE_SIZE = 40;

export async function gitLog(c) {
  try {
    const workingDir = getWorkingDir();
    const branchInfo = await getBranchInfo(workingDir);

    if (!branchInfo) {
      return c.json({ ok: true, repository: null });
    }

    const requestedPath = c.req.query("path");
    const servedPath = requestedPath ? normalizePath(requestedPath) : null;
    const skip = Math.max(parseInt(c.req.query("skip"), 10) || 0, 0);

    let gitPath = null;
    if (servedPath && servedPath !== ".") {
      const absolutePath = join(workingDir, servedPath);
      const repoRelativePath = relative(branchInfo.repoRoot, absolutePath);
      if (!repoRelativePath.startsWith("..")) {
        gitPath = repoRelativePath;
      }
    }

    const result = await getCommits(workingDir, {
      limit: PAGE_SIZE,
      skip,
      path: gitPath,
    });

    return c.json({
      ok: true,
      repository: branchInfo,
      scopePath: gitPath ? servedPath : null,
      commits: result ? result.commits : [],
      hasMore: result ? result.hasMore : false,
    });
  } catch (error) {
    return c.json({ ok: false, message: error.message }, 500);
  }
}
