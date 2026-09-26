import { escapeHtml } from "../utils.js";
import { icon } from "./icons.js";
import { renderWorktreeMenuItems } from "./worktree-list.js";

function renderTrackingBadges(branchInfo) {
  const parts = [];
  if (branchInfo.ahead > 0) {
    parts.push(
      `<span class="branch-ahead" title="${branchInfo.ahead} commit(s) ahead of ${
        escapeHtml(branchInfo.upstream || "upstream")
      }">↑${branchInfo.ahead}</span>`,
    );
  }
  if (branchInfo.behind > 0) {
    parts.push(
      `<span class="branch-behind" title="${branchInfo.behind} commit(s) behind ${
        escapeHtml(branchInfo.upstream || "upstream")
      }">↓${branchInfo.behind}</span>`,
    );
  }
  const changeCount = branchInfo.changeCount || 0;
  if (changeCount > 0) {
    parts.push(
      `<span class="branch-dirty" title="${changeCount} uncommitted change(s)">${changeCount}</span>`,
    );
  }
  return parts.join("");
}

function renderBranchChip(branchInfo) {
  if (!branchInfo) {
    return "";
  }

  const chipClass = `branch-chip${branchInfo.isDetached ? " is-detached" : ""}`;
  const chipContent = `${icon("branch")}<span>${
    escapeHtml(branchInfo.branch || "unknown")
  }</span>${renderTrackingBadges(branchInfo)}`;

  const worktrees = branchInfo.worktrees || [];
  if (worktrees.length < 2) {
    return `<a class="${chipClass}" href="/git" title="Git status">${chipContent}</a>`;
  }

  return `<div class="dropdown worktree-dropdown">
    <button type="button" class="${chipClass} dropdown-trigger" title="Switch worktree" aria-haspopup="true">${chipContent}${
    icon("chevron-down", "icon-small")
  }</button>
    <div class="menu-popover worktree-menu" role="menu">
      <div class="menu-heading">Worktrees</div>
      ${renderWorktreeMenuItems(worktrees)}
      <div class="menu-separator"></div>
      <a class="menu-item" href="/git">${
    icon("git-status")
  }<span>Git status</span></a>
    </div>
  </div>`;
}

const NAV_ITEMS = [
  { id: "files", label: "Files", href: "/file-explorer", iconName: "folder" },
  { id: "git", label: "Status", href: "/git", iconName: "git-status" },
  { id: "history", label: "History", href: "/git-log", iconName: "history" },
];

/**
 * Renders the persistent top bar shared by every page
 * @param {object} options - The active section and optional branch info
 * @returns {string} - The app bar markup
 */
export function renderAppBar({ activeSection, branchInfo } = {}) {
  const navItems = NAV_ITEMS
    .filter((item) => item.id === "files" || branchInfo)
    .map((item) =>
      `<a class="app-nav-item${
        item.id === activeSection ? " is-active" : ""
      }" href="${item.href}">${
        icon(item.iconName)
      }<span>${item.label}</span></a>`
    )
    .join("");

  return `<header class="app-bar">
    <a class="app-brand" href="/file-explorer">${
    icon("folder")
  }<span>Remote File Manager</span></a>
    <nav class="app-nav">${navItems}</nav>
    <div class="app-bar-spacer"></div>
    <button type="button" class="search-trigger" data-search-open title="Search files in the whole directory (Ctrl+K)">${
    icon("search")
  }<span>Search files</span><kbd>Ctrl K</kbd></button>
    ${renderBranchChip(branchInfo)}
    <button type="button" id="theme-toggle" class="icon-button theme-toggle" aria-label="Toggle theme"></button>
  </header>`;
}
