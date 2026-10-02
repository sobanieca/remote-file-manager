import { parseDiff } from "../git/diff-parser.js";
import { getChangedFiles, getCommit } from "../git/git-log.js";
import { getRevisionDiff } from "../git/git-diff.js";
import { getBranchInfo, toServedPath } from "../git/git-status.js";
import { getWorkingDir } from "../workspace.js";

export async function gitCompare(c) {
  try {
    const workingDir = getWorkingDir();
    const branchInfo = await getBranchInfo(workingDir);

    if (!branchInfo) {
      return c.json({ ok: true, repository: null });
    }

    const fromRevision = c.req.query("from");
    const toRevision = c.req.query("to");
    if (!fromRevision || !toRevision) {
      return c.json(
        { ok: false, message: "Select two commits to compare" },
        400,
      );
    }

    const diffText = await getRevisionDiff(
      workingDir,
      fromRevision,
      toRevision,
    );
    if (diffText === null) {
      return c.json({
        ok: false,
        message:
          "Could not compare those revisions. They may not exist in this repository.",
      }, 404);
    }

    const [fromCommit, toCommit, changedFiles] = await Promise.all([
      getCommit(workingDir, fromRevision),
      getCommit(workingDir, toRevision),
      getChangedFiles(workingDir, fromRevision, toRevision),
    ]);

    return c.json({
      ok: true,
      repository: branchInfo,
      from: { revision: fromRevision, commit: fromCommit },
      to: { revision: toRevision, commit: toCommit },
      changes: changedFiles ? changedFiles.changes : [],
      files: parseDiff(diffText).map((file) => ({
        ...file,
        servedPath: file.status === "deleted"
          ? null
          : toServedPath(branchInfo.repoRoot, workingDir, file.path),
      })),
    });
  } catch (error) {
    return c.json({ ok: false, message: error.message }, 500);
  }
}
