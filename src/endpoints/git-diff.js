import { layout } from "./layout/index.js";
import { escapeHtml, formatRelativeTime, normalizePath } from "./utils.js";
import { icon } from "./components/icons.js";
import { diffView } from "./diff-view.js";
import { renderNotARepository } from "./git-overview.js";
import {
  getCommitDiff,
  getFileDiff,
  getWorkingTreeDiff,
} from "../git/git-diff.js";
import { getCommit } from "../git/git-log.js";
import { getBranchInfo } from "../git/git-status.js";

async function resolveDiffRequest(c, workingDir) {
  const commit = c.req.query("commit");
  if (commit) {
    const [diffText, commitInfo] = await Promise.all([
      getCommitDiff(workingDir, commit),
      getCommit(workingDir, commit),
    ]);
    return {
      diffText,
      title: commitInfo ? commitInfo.subject : "Commit",
      subtitle: commitInfo
        ? `${commitInfo.shortHash} · ${commitInfo.author} · ${
          formatRelativeTime(commitInfo.date)
        }`
        : commit,
      backHref: "/git-log",
      backLabel: "Back to history",
    };
  }

  if (c.req.query("staged") !== undefined) {
    return {
      diffText: await getWorkingTreeDiff(workingDir, true),
      title: "Staged changes",
      subtitle: "Differences between the index and HEAD",
      backHref: "/git",
      backLabel: "Back to status",
    };
  }

  if (c.req.query("all") !== undefined) {
    return {
      diffText: await getWorkingTreeDiff(workingDir, false),
      title: "Working tree changes",
      subtitle: "All uncommitted changes",
      backHref: "/git",
      backLabel: "Back to status",
    };
  }

  const requestedPath = c.req.query("path");
  if (!requestedPath) {
    return null;
  }

  const filePath = normalizePath(requestedPath);
  if (!filePath) {
    return null;
  }

  const mode = c.req.query("mode");
  const isFromStatusPage = mode === "staged" || mode === "unstaged";
  const subtitles = {
    staged: "Staged changes, index against HEAD",
    unstaged: "Unstaged changes, working tree against the index",
  };

  return {
    diffText: await getFileDiff(workingDir, filePath, mode),
    title: filePath,
    subtitle: subtitles[mode] || "Uncommitted changes",
    backHref: isFromStatusPage
      ? "/git"
      : `/file-explorer?path=${
        encodeURIComponent(filePath.split("/").slice(0, -1).join("/") || ".")
      }`,
    backLabel: isFromStatusPage ? "Back to status" : "Back to files",
    filePath,
  };
}

export async function gitDiff(c) {
  try {
    const workingDir = Deno.cwd();
    const branchInfo = await getBranchInfo(workingDir);

    if (!branchInfo) {
      return c.html(
        await layout(
          "Git diff",
          renderNotARepository(
            "The served directory is not inside a git repository.",
          ),
          { activeSection: "git" },
        ),
      );
    }

    const request = await resolveDiffRequest(c, workingDir);
    if (!request) {
      return c.html("Nothing to diff", 400);
    }

    if (request.diffText === null) {
      return c.html(
        await layout(
          "Git diff",
          renderNotARepository("Unable to read this diff."),
          { activeSection: "git" },
        ),
      );
    }

    const fileActions = request.filePath
      ? `<a class="button" href="/edit-file?path=${
        encodeURIComponent(request.filePath)
      }">${icon("pencil")}<span>Edit</span></a>
         <a class="button" href="/git-log?path=${
        encodeURIComponent(request.filePath)
      }">${icon("history")}<span>History</span></a>`
      : "";

    const content = `
      <div class="page-header">
        <div class="page-title">
          <span class="page-title-icon">${icon("diff")}</span>
          <div>
            <h1>${escapeHtml(request.title)}</h1>
            <span class="page-subtitle">${escapeHtml(request.subtitle)}</span>
          </div>
        </div>
        <div class="page-header-actions">
          ${fileActions}
          <a class="button" href="${request.backHref}">${
      icon("arrow-left")
    }<span>${request.backLabel}</span></a>
        </div>
      </div>
      ${diffView(request.diffText, { linkToFiles: true })}
    `;

    return c.html(
      await layout(`Diff · ${request.title}`, content, {
        activeSection: request.filePath ? "files" : "git",
        wide: true,
      }),
    );
  } catch (error) {
    return c.html(`An error occurred: ${error.message}`, 500);
  }
}
