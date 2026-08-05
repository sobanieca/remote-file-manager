import { layout } from "./layout/index.js";
import {
  escapeHtml,
  formatRelativeTime,
  formatTimestamp,
  normalizePath,
} from "./utils.js";
import { icon } from "./components/icons.js";
import { renderNotARepository } from "./git-overview.js";
import { getCommits } from "../git/git-log.js";
import { getBranchInfo } from "../git/git-status.js";
import { join, relative } from "../deps.js";

const PAGE_SIZE = 40;

function renderRefs(refs) {
  return refs
    .map((ref) => {
      const label = ref.replace(/^HEAD -> /, "");
      const isHead = ref.startsWith("HEAD");
      return `<span class="commit-ref${isHead ? " is-head" : ""}">${
        escapeHtml(label)
      }</span>`;
    })
    .join("");
}

function renderCommitRow(commit, index) {
  return `<li class="log-row" data-hash="${
    escapeHtml(commit.hash)
  }" data-short="${escapeHtml(commit.shortHash)}">
    <span class="log-select">
      <label class="log-radio" title="Compare from this commit">
        <input type="radio" name="compare-from" value="${
    escapeHtml(commit.hash)
  }" data-role="from"${index === 1 ? " checked" : ""}>
        <span>A</span>
      </label>
      <label class="log-radio" title="Compare to this commit">
        <input type="radio" name="compare-to" value="${
    escapeHtml(commit.hash)
  }" data-role="to"${index === 0 ? " checked" : ""}>
        <span>B</span>
      </label>
    </span>
    <span class="log-graph">${icon("commit")}</span>
    <span class="log-body">
      <a class="log-subject" href="/git-diff?commit=${
    encodeURIComponent(commit.hash)
  }">${escapeHtml(commit.subject)}</a>
      ${renderRefs(commit.refs)}
      <span class="log-meta">
        <code class="log-hash">${escapeHtml(commit.shortHash)}</code>
        <span>${escapeHtml(commit.author)}</span>
        <span title="${formatTimestamp(commit.date)}">${
    formatRelativeTime(commit.date)
  }</span>
      </span>
    </span>
    <span class="log-actions">
      <a class="icon-button" href="/git-diff?commit=${
    encodeURIComponent(commit.hash)
  }" title="View changes in this commit">${icon("diff")}</a>
    </span>
  </li>`;
}

function buildPageHref(basePath, skip) {
  const params = new URLSearchParams();
  if (basePath) {
    params.set("path", basePath);
  }
  if (skip > 0) {
    params.set("skip", String(skip));
  }
  const query = params.toString();
  return query ? `/git-log?${query}` : "/git-log";
}

export async function gitLog(c) {
  try {
    const workingDir = Deno.cwd();
    const branchInfo = await getBranchInfo(workingDir);

    if (!branchInfo) {
      return c.html(
        await layout(
          "Commit history",
          renderNotARepository(
            "The served directory is not inside a git repository.",
          ),
          { activeSection: "history" },
        ),
      );
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
    const commits = result ? result.commits : [];

    const scopeNotice = gitPath
      ? `<div class="scope-notice">${icon("info")}<span>History for <code>${
        escapeHtml(servedPath)
      }</code></span><a class="button button-small button-ghost" href="/git-log">${
        icon("close")
      }<span>Clear</span></a></div>`
      : "";

    const emptyState = commits.length === 0
      ? `<div class="preview-panel preview-unavailable">${
        icon("info")
      }<p>No commits found${gitPath ? " for this path" : ""}.</p></div>`
      : "";

    const previousHref = skip > 0
      ? buildPageHref(servedPath, Math.max(skip - PAGE_SIZE, 0))
      : null;
    const nextHref = result && result.hasMore
      ? buildPageHref(servedPath, skip + PAGE_SIZE)
      : null;

    const pagination = previousHref || nextHref
      ? `<div class="pagination">
          ${
        previousHref
          ? `<a class="button button-small" href="${previousHref}">${
            icon("arrow-left")
          }<span>Newer</span></a>`
          : ""
      }
          ${
        nextHref
          ? `<a class="button button-small" href="${nextHref}">${
            icon("arrow-right")
          }<span>Older</span></a>`
          : ""
      }
        </div>`
      : "";

    const content = `
      <div class="page-header">
        <div class="page-title">
          <span class="page-title-icon">${icon("history")}</span>
          <div>
            <h1>Commit history</h1>
            <span class="page-subtitle">${escapeHtml(branchInfo.branch)}</span>
          </div>
        </div>
        <a class="button" href="/git">${
      icon("git-status")
    }<span>Git status</span></a>
      </div>
      ${scopeNotice}
      ${
      commits.length > 0
        ? `<div class="compare-bar" data-compare-bar>
            <span class="compare-hint">${
          icon("info")
        }<span>Pick <strong>A</strong> (from) and <strong>B</strong> (to) to compare</span></span>
            <span class="compare-selection" data-compare-selection></span>
            <div class="compare-spacer"></div>
            <button type="button" class="button button-small" data-command="swap-compare">${
          icon("refresh")
        }<span>Swap</span></button>
            <button type="button" class="button button-primary button-small" data-command="compare-commits">${
          icon("diff")
        }<span>Compare</span></button>
          </div>
          <ul class="log-list" data-log-list>${
          commits.map(renderCommitRow).join("")
        }</ul>`
        : ""
    }
      ${emptyState}
      ${pagination}
    `;

    return c.html(
      await layout("Commit history", content, {
        activeSection: "history",
        wide: true,
      }),
    );
  } catch (error) {
    return c.html(`An error occurred: ${error.message}`, 500);
  }
}
