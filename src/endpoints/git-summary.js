import { getBranchInfo, getGitStatusInfo } from "../git/git-status.js";
import { listWorktrees } from "../git/git-worktree.js";
import { getWorkingDir } from "../workspace.js";

export async function gitSummary(c) {
  try {
    const workingDir = getWorkingDir();
    const branchInfo = await getBranchInfo(workingDir);
    if (!branchInfo) {
      return c.json({ ok: true, repository: null });
    }

    const [statusInfo, worktrees] = await Promise.all([
      getGitStatusInfo(workingDir),
      listWorktrees(workingDir),
    ]);

    return c.json({
      ok: true,
      repository: {
        ...branchInfo,
        changeCount: statusInfo ? statusInfo.records.length : 0,
        worktrees: worktrees || [],
      },
    });
  } catch (error) {
    return c.json({ ok: false, message: error.message }, 500);
  }
}
