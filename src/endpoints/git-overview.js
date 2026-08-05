import { layout } from "./layout/index.js";
import { escapeHtml, formatRelativeTime, isBinaryFile } from "./utils.js";
import { icon } from "./components/icons.js";
import {
  getBranchInfo,
  getStatusOverview,
  toServedPath,
} from "../git/git-status.js";
import { getCommits } from "../git/git-log.js";

const STATUS_ORDER = ["added", "modified", "renamed", "deleted"];

export function renderNotARepository(message) {
  return `<div class="preview-panel preview-unavailable">
    ${icon("info")}
    <p>${message}</p>
    <a class="button button-primary" href="/file-explorer">${
    icon("folder")
  }<span>Back to files</span></a>
  </div>`;
}

function renderChangeRow(record, repoRoot, workingDir, mode) {
  const servedPath = toServedPath(repoRoot, workingDir, record.path);
  const isDeleted = record.status === "deleted";
  // Untracked files have no committed version to compare against, and binary
  // files have no textual diff to render
  const canDiff = servedPath !== null && !record.isUntracked &&
    !isBinaryFile(record.path);
  const renamedFrom = record.originalPath
    ? `<span class="change-rename">${escapeHtml(record.originalPath)} ${
      icon("arrow-right")
    }</span>`
    : "";
  const label = `${renamedFrom}${escapeHtml(record.path)}`;

  let pathHtml;
  let actionsHtml = "";
  if (canDiff) {
    pathHtml = `<a class="change-path" href="/git-diff?path=${
      encodeURIComponent(servedPath)
    }&mode=${mode}" title="View diff for ${
      escapeHtml(record.path)
    }">${label}</a>`;
    if (!isDeleted) {
      actionsHtml = `<a class="icon-button" href="/view-file?path=${
        encodeURIComponent(servedPath)
      }" title="Open file">${icon("eye")}</a>`;
    }
  } else if (servedPath !== null && !isDeleted) {
    pathHtml = `<a class="change-path" href="/view-file?path=${
      encodeURIComponent(servedPath)
    }" title="Open ${escapeHtml(record.path)}">${label}</a>`;
  } else {
    pathHtml = `<span class="change-path">${label}</span>`;
  }

  return `<li class="change-row">
    <span class="change-status change-${record.status}" title="${
    escapeHtml(record.statusCode)
  }">${
    escapeHtml(record.statusCode.trim()) || record.status[0].toUpperCase()
  }</span>
    ${pathHtml}
    <span class="change-actions">${actionsHtml}</span>
  </li>`;
}

function renderChangeGroup(
  { title, records, repoRoot, workingDir, mode, action },
) {
  if (records.length === 0) {
    return "";
  }
  const sorted = [...records].sort((first, second) =>
    STATUS_ORDER.indexOf(first.status) - STATUS_ORDER.indexOf(second.status) ||
    first.path.localeCompare(second.path)
  );

  return `<section class="git-group">
    <header class="git-group-header">
      <h2>${title}</h2>
      <span class="git-group-count">${records.length}</span>
      <div class="git-group-spacer"></div>
      ${action || ""}
    </header>
    <ul class="change-list">${
    sorted
      .map((record) => renderChangeRow(record, repoRoot, workingDir, mode))
      .join("")
  }</ul>
  </section>`;
}

function renderCommitRow(commit) {
  const refs = commit.refs
    .map((ref) => `<span class="commit-ref">${escapeHtml(ref)}</span>`)
    .join("");
  return `<li class="commit-row">
    <a class="commit-hash" href="/git-diff?commit=${
    encodeURIComponent(commit.hash)
  }" title="View changes in this commit">${escapeHtml(commit.shortHash)}</a>
    <span class="commit-subject">${escapeHtml(commit.subject)}${refs}</span>
    <span class="commit-meta">${escapeHtml(commit.author)} · ${
    formatRelativeTime(commit.date)
  }</span>
  </li>`;
}

export async function gitOverview(c) {
  try {
    const workingDir = Deno.cwd();
    const branchInfo = await getBranchInfo(workingDir);

    if (!branchInfo) {
      return c.html(
        await layout(
          "Git",
          renderNotARepository(
            "The served directory is not inside a git repository.",
          ),
          { activeSection: "git" },
        ),
      );
    }

    const overview = await getStatusOverview(workingDir);
    const recent = await getCommits(workingDir, { limit: 5 });
    const repoRoot = branchInfo.repoRoot;

    const totalChanges = overview
      ? overview.staged.length + overview.unstaged.length +
        overview.untracked.length
      : 0;

    const trackingSummary = branchInfo.upstream
      ? `<div class="meta-item"><span class="meta-label">Upstream</span><span class="meta-value">${
        escapeHtml(branchInfo.upstream)
      }</span></div>
         <div class="meta-item"><span class="meta-label">Ahead / behind</span><span class="meta-value">↑${branchInfo.ahead} ↓${branchInfo.behind}</span></div>`
      : `<div class="meta-item"><span class="meta-label">Upstream</span><span class="meta-value">none</span></div>`;

    const cleanState = totalChanges === 0
      ? `<div class="git-clean">${
        icon("check")
      }<span>Working tree is clean</span></div>`
      : "";

    const workingTreeAction =
      `<a class="button button-small" href="/git-diff?all=1">${
        icon("diff")
      }<span>View all changes</span></a>`;
    const stagedAction =
      `<a class="button button-small" href="/git-diff?staged=1">${
        icon("diff")
      }<span>View staged diff</span></a>`;

    const content = `
      <div class="page-header">
        <div class="page-title">
          <span class="page-title-icon">${icon("branch")}</span>
          <div>
            <h1>${escapeHtml(branchInfo.branch)}</h1>
            <span class="page-subtitle">${escapeHtml(repoRoot)}</span>
          </div>
        </div>
        <a class="button" href="/git-log">${
      icon("history")
    }<span>Commit history</span></a>
      </div>
      <div class="meta-strip">
        <div class="meta-item"><span class="meta-label">HEAD</span><span class="meta-value"><code>${
      escapeHtml(branchInfo.head || "—")
    }</code></span></div>
        ${trackingSummary}
        <div class="meta-item"><span class="meta-label">Changes</span><span class="meta-value">${totalChanges}</span></div>
      </div>
      ${cleanState}
      ${
      renderChangeGroup({
        title: "Staged changes",
        records: overview.staged,
        repoRoot,
        workingDir,
        mode: "staged",
        action: stagedAction,
      })
    }
      ${
      renderChangeGroup({
        title: "Unstaged changes",
        records: overview.unstaged,
        repoRoot,
        workingDir,
        mode: "unstaged",
        action: workingTreeAction,
      })
    }
      ${
      renderChangeGroup({
        title: "Untracked files",
        records: overview.untracked,
        repoRoot,
        workingDir,
        mode: "unstaged",
      })
    }
      ${
      recent && recent.commits.length > 0
        ? `<section class="git-group">
            <header class="git-group-header">
              <h2>Recent commits</h2>
              <div class="git-group-spacer"></div>
              <a class="button button-small" href="/git-log">${
          icon("history")
        }<span>View all</span></a>
            </header>
            <ul class="commit-list">${
          recent.commits.map(renderCommitRow).join("")
        }</ul>
          </section>`
        : ""
    }
    `;

    return c.html(
      await layout("Git status", content, {
        activeSection: "git",
        wide: true,
      }),
    );
  } catch (error) {
    return c.html(`An error occurred: ${error.message}`, 500);
  }
}
