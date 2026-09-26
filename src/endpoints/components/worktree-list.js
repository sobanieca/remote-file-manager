import { escapeHtml } from "../utils.js";
import { icon } from "./icons.js";

function renderWorktreeFlags(worktree) {
  const flags = [];
  if (worktree.isCurrent) {
    flags.push('<span class="worktree-flag is-current">current</span>');
  }
  if (worktree.isDetached) {
    flags.push('<span class="worktree-flag">detached</span>');
  }
  if (worktree.isLocked) {
    flags.push(
      `<span class="worktree-flag" title="${
        escapeHtml(worktree.lockReason || "Locked")
      }">locked</span>`,
    );
  }
  if (worktree.isPrunable) {
    flags.push(
      `<span class="worktree-flag is-warning" title="${
        escapeHtml(worktree.pruneReason || "Prunable")
      }">missing</span>`,
    );
  }
  return flags.join("");
}

function renderWorktreeRow(worktree) {
  const action = worktree.isCurrent
    ? `<span class="worktree-current">${icon("check")}</span>`
    : `<button type="button" class="button button-small" data-switch-worktree="${
      escapeHtml(worktree.path)
    }"${worktree.isPrunable ? " disabled" : ""}>${
      icon("arrow-right")
    }<span>Switch</span></button>`;

  return `<li class="worktree-row${worktree.isCurrent ? " is-current" : ""}">
    <span class="worktree-icon">${icon("branch")}</span>
    <span class="worktree-body">
      <span class="worktree-branch">${escapeHtml(worktree.label)}${
    renderWorktreeFlags(worktree)
  }</span>
      <span class="worktree-path" title="${escapeHtml(worktree.path)}">${
    escapeHtml(worktree.path)
  }</span>
    </span>
    <code class="worktree-head">${escapeHtml(worktree.shortHead || "—")}</code>
    <span class="worktree-actions">${action}</span>
  </li>`;
}

/**
 * Renders the worktrees of the repository with a switch action for each
 * @param {object[]} worktrees - The worktrees from listWorktrees
 * @returns {string} - The section markup, empty when there are none
 */
export function renderWorktreeList(worktrees) {
  if (worktrees.length === 0) {
    return "";
  }
  return `<section class="git-group">
    <header class="git-group-header">
      <h2>Worktrees</h2>
      <span class="git-group-count">${worktrees.length}</span>
      <div class="git-group-spacer"></div>
      <span class="git-group-hint">Switching serves that worktree's files</span>
    </header>
    <ul class="worktree-list">${worktrees.map(renderWorktreeRow).join("")}</ul>
  </section>`;
}

/**
 * Renders the worktree entries of the branch menu in the app bar
 * @param {object[]} worktrees - The worktrees from listWorktrees
 * @returns {string} - The menu items markup
 */
export function renderWorktreeMenuItems(worktrees) {
  return worktrees
    .map((worktree) =>
      `<button type="button" class="menu-item worktree-item${
        worktree.isCurrent ? " is-current" : ""
      }" data-switch-worktree="${escapeHtml(worktree.path)}"${
        worktree.isCurrent || worktree.isPrunable ? " disabled" : ""
      } title="${escapeHtml(worktree.path)}">
        <span class="worktree-item-check">${
        worktree.isCurrent ? icon("check") : ""
      }</span>
        <span class="worktree-item-body">
          <span class="worktree-item-branch">${
        escapeHtml(worktree.label)
      }</span>
          <span class="worktree-item-path">${escapeHtml(worktree.path)}</span>
        </span>
      </button>`
    )
    .join("");
}
