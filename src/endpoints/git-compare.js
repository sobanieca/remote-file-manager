import { layout } from "./layout/index.js";
import { escapeHtml, formatRelativeTime, formatTimestamp } from "./utils.js";
import { icon } from "./components/icons.js";
import { diffView } from "./diff-view.js";
import { renderNotARepository } from "./git-overview.js";
import { getChangedFiles, getCommit } from "../git/git-log.js";
import { getRevisionDiff } from "../git/git-diff.js";
import { getBranchInfo } from "../git/git-status.js";

function renderRevisionCard(label, revision, commit) {
  const details = commit
    ? `<span class="revision-subject">${escapeHtml(commit.subject)}</span>
       <span class="revision-meta">${
      escapeHtml(commit.author)
    } · <span title="${formatTimestamp(commit.date)}">${
      formatRelativeTime(commit.date)
    }</span></span>`
    : '<span class="revision-meta">Unresolved revision</span>';

  return `<div class="revision-card">
    <span class="revision-label">${label}</span>
    <code class="revision-hash">${
    escapeHtml(commit ? commit.shortHash : revision)
  }</code>
    ${details}
  </div>`;
}

function renderChangedFileList(changes) {
  if (changes.length === 0) {
    return "";
  }
  const rows = changes
    .map((change) => {
      const renamedFrom = change.originalPath
        ? `<span class="change-rename">${escapeHtml(change.originalPath)} ${
          icon("arrow-right")
        }</span>`
        : "";
      const stats = change.added === null
        ? '<span class="change-binary">binary</span>'
        : `<span class="diff-stat diff-stat-added">+${change.added}</span><span class="diff-stat diff-stat-removed">-${change.deleted}</span>`;
      return `<li class="change-row">
        <span class="change-status change-${change.status}">${
        escapeHtml(change.statusCode)
      }</span>
        <a class="change-path" href="#${
        escapeHtml(change.path)
      }" data-jump-to-file="${escapeHtml(change.path)}">${renamedFrom}${
        escapeHtml(change.path)
      }</a>
        <span class="change-actions">${stats}</span>
      </li>`;
    })
    .join("");

  return `<section class="git-group">
    <header class="git-group-header">
      <h2>Changed files</h2>
      <span class="git-group-count">${changes.length}</span>
    </header>
    <ul class="change-list">${rows}</ul>
  </section>`;
}

export async function gitCompare(c) {
  try {
    const workingDir = Deno.cwd();
    const branchInfo = await getBranchInfo(workingDir);

    if (!branchInfo) {
      return c.html(
        await layout(
          "Compare",
          renderNotARepository(
            "The served directory is not inside a git repository.",
          ),
          { activeSection: "history" },
        ),
      );
    }

    const fromRevision = c.req.query("from");
    const toRevision = c.req.query("to");

    if (!fromRevision || !toRevision) {
      return c.html(
        await layout(
          "Compare",
          renderNotARepository(
            "Select two commits to compare from the commit history.",
          ),
          { activeSection: "history" },
        ),
      );
    }

    const diffText = await getRevisionDiff(
      workingDir,
      fromRevision,
      toRevision,
    );

    if (diffText === null) {
      return c.html(
        await layout(
          "Compare",
          renderNotARepository(
            "Could not compare those revisions. They may not exist in this repository.",
          ),
          { activeSection: "history" },
        ),
      );
    }

    const [fromCommit, toCommit, changedFiles] = await Promise.all([
      getCommit(workingDir, fromRevision),
      getCommit(workingDir, toRevision),
      getChangedFiles(workingDir, fromRevision, toRevision),
    ]);

    const changes = changedFiles ? changedFiles.changes : [];

    const content = `
      <div class="page-header">
        <div class="page-title">
          <span class="page-title-icon">${icon("diff")}</span>
          <div>
            <h1>Comparing commits</h1>
            <span class="page-subtitle">${changes.length} file${
      changes.length === 1 ? "" : "s"
    } changed</span>
          </div>
        </div>
        <a class="button" href="/git-log">${
      icon("history")
    }<span>Back to history</span></a>
      </div>
      <div class="revision-strip">
        ${renderRevisionCard("From (A)", fromRevision, fromCommit)}
        <span class="revision-arrow">${icon("arrow-right")}</span>
        ${renderRevisionCard("To (B)", toRevision, toCommit)}
      </div>
      ${renderChangedFileList(changes)}
      ${diffView(diffText, { linkToFiles: true })}
    `;

    return c.html(
      await layout("Compare commits", content, {
        activeSection: "history",
        wide: true,
      }),
    );
  } catch (error) {
    return c.html(`An error occurred: ${error.message}`, 500);
  }
}
