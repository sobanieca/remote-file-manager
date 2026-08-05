import { escapeHtml } from "../utils.js";
import { icon } from "./icons.js";

function renderBranchChip(branchInfo) {
  if (!branchInfo) {
    return "";
  }

  const trackingParts = [];
  if (branchInfo.ahead > 0) {
    trackingParts.push(
      `<span class="branch-ahead" title="${branchInfo.ahead} commit(s) ahead of ${
        escapeHtml(branchInfo.upstream || "upstream")
      }">↑${branchInfo.ahead}</span>`,
    );
  }
  if (branchInfo.behind > 0) {
    trackingParts.push(
      `<span class="branch-behind" title="${branchInfo.behind} commit(s) behind ${
        escapeHtml(branchInfo.upstream || "upstream")
      }">↓${branchInfo.behind}</span>`,
    );
  }

  const changeCount = branchInfo.changeCount || 0;
  const dirtyBadge = changeCount > 0
    ? `<span class="branch-dirty" title="${changeCount} uncommitted change(s)">${changeCount}</span>`
    : "";

  return `<a class="branch-chip${
    branchInfo.isDetached ? " is-detached" : ""
  }" href="/git" title="Git status">${icon("branch")}<span>${
    escapeHtml(branchInfo.branch || "unknown")
  }</span>${trackingParts.join("")}${dirtyBadge}</a>`;
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
    ${renderBranchChip(branchInfo)}
    <button type="button" id="theme-toggle" class="icon-button theme-toggle" aria-label="Toggle theme"></button>
  </header>`;
}
