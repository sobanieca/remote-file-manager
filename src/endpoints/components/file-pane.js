import {
  escapeHtml,
  formatFileSize,
  formatOctalPermissions,
  formatPermissions,
  formatRelativeTime,
  formatTimestamp,
  getParentPath,
} from "../utils.js";
import { getEntryIconName, icon } from "./icons.js";
import { getEntryHref, renderEntryMenu } from "./entry-actions.js";
import { renderBreadcrumb } from "./breadcrumb.js";
import { gitStatusBadge } from "../../git/git-status.js";

function renderEntryVisual(entry) {
  if (entry.isImage) {
    return `<span class="entry-visual"><img class="entry-thumbnail" src="/thumbnail?path=${
      encodeURIComponent(entry.path)
    }" alt="" loading="lazy" decoding="async"></span>`;
  }
  return `<span class="entry-visual entry-visual-${entry.kind}">${
    icon(getEntryIconName(entry))
  }</span>`;
}

function renderParentRow(directoryPath) {
  const parentPath = getParentPath(directoryPath);
  return `<div class="file-row is-parent" data-parent-row="true" data-path="${
    escapeHtml(parentPath)
  }" data-directory="true">
    <span class="cell cell-select"></span>
    <span class="cell cell-name">
      <span class="entry-visual entry-visual-folder">${icon("folder-up")}</span>
      <a class="entry-link" href="/file-explorer?path=${
    encodeURIComponent(parentPath)
  }" data-navigate="${escapeHtml(parentPath)}">..</a>
    </span>
    <span class="cell cell-size"></span>
    <span class="cell cell-permissions"></span>
    <span class="cell cell-modified"></span>
    <span class="cell cell-actions"></span>
  </div>`;
}

function renderDeletedRow(entry) {
  const diffHref = `/git-diff?path=${encodeURIComponent(entry.path)}`;
  return `<div class="file-row is-deleted${
    entry.isDirectory ? " is-directory" : " is-file"
  }" data-path="${escapeHtml(entry.path)}" data-name="${
    escapeHtml(entry.name)
  }" data-directory="${entry.isDirectory}" data-deleted="true" data-size="-1" data-modified="0">
      <span class="cell cell-select"></span>
      <span class="cell cell-name">
        <span class="entry-visual${
    entry.isDirectory ? " entry-visual-folder" : ""
  }">${icon(entry.isDirectory ? "folder" : "file")}</span>
        <a class="entry-link entry-deleted" href="${diffHref}" title="${
    escapeHtml(entry.name)
  } was deleted, open the diff">${escapeHtml(entry.name)}</a>
        ${gitStatusBadge("deleted")}
      </span>
      <span class="cell cell-size">—</span>
      <span class="cell cell-permissions">—</span>
      <span class="cell cell-modified">deleted</span>
      <span class="cell cell-actions">${renderEntryMenu(entry)}</span>
    </div>`;
}

function renderEntryRow(entry) {
  if (entry.isDeleted) {
    return renderDeletedRow(entry);
  }

  const permissions = formatPermissions(
    entry.mode,
    entry.isDirectory,
    entry.isSymlink,
  );
  const octal = formatOctalPermissions(entry.mode);
  const sizeLabel = entry.isDirectory ? "—" : formatFileSize(entry.size);
  const modifiedLabel = formatRelativeTime(entry.modifiedAt);
  const modifiedTitle = formatTimestamp(entry.modifiedAt);
  const rowClasses = [
    "file-row",
    entry.isDirectory ? "is-directory" : "is-file",
    entry.isExecutable ? "is-executable" : "",
    entry.isSymlink ? "is-symlink" : "",
    entry.isBroken ? "is-broken" : "",
  ].filter(Boolean).join(" ");

  const executableBadge = entry.isExecutable
    ? '<span class="entry-badge entry-badge-executable" title="Executable file">exec</span>'
    : "";
  const symlinkBadge = entry.isSymlink
    ? '<span class="entry-badge entry-badge-symlink" title="Symbolic link">link</span>'
    : "";
  const navigateAttribute = entry.isDirectory
    ? ` data-navigate="${escapeHtml(entry.path)}"`
    : "";

  return `<div class="${rowClasses}" data-path="${
    escapeHtml(entry.path)
  }" data-name="${
    escapeHtml(entry.name)
  }" data-directory="${entry.isDirectory}" data-size="${
    entry.isDirectory ? -1 : entry.size ?? -1
  }" data-modified="${entry.modifiedAt ? entry.modifiedAt.getTime() : 0}">
    <label class="cell cell-select"><input type="checkbox" class="row-select" aria-label="Select ${
    escapeHtml(entry.name)
  }"></label>
    <span class="cell cell-name">
      ${renderEntryVisual(entry)}
      <a class="entry-link" href="${
    getEntryHref(entry)
  }"${navigateAttribute} title="${escapeHtml(entry.name)}">${
    escapeHtml(entry.name)
  }</a>
      ${gitStatusBadge(entry.gitStatus)}${executableBadge}${symlinkBadge}
    </span>
    <span class="cell cell-size" title="${
    entry.isDirectory ? "" : `${entry.size ?? 0} bytes`
  }">${sizeLabel}</span>
    <span class="cell cell-permissions" title="${
    octal ? `Mode ${octal}` : "Unavailable"
  }"><code>${permissions || "—"}</code></span>
    <span class="cell cell-modified" title="${modifiedTitle}">${
    modifiedLabel || "—"
  }</span>
    <span class="cell cell-actions">${renderEntryMenu(entry)}</span>
  </div>`;
}

function renderToolbar(directoryPath) {
  return `<div class="pane-toolbar">
    <div class="pane-nav">
      <button type="button" class="icon-button" data-command="pane-back" title="Back" aria-label="Back">${
    icon("arrow-left")
  }</button>
      <button type="button" class="icon-button" data-command="pane-up" title="Parent directory" aria-label="Parent directory">${
    icon("arrow-up")
  }</button>
      <button type="button" class="icon-button" data-command="pane-refresh" title="Refresh" aria-label="Refresh">${
    icon("refresh")
  }</button>
    </div>
    ${renderBreadcrumb(directoryPath)}
    <label class="pane-filter">
      ${icon("search")}
      <input type="search" class="filter-input" placeholder="Filter this folder" aria-label="Filter entries in this folder" title="Filter the entries of this folder. Press Ctrl+K to search the whole directory tree">
    </label>
  </div>`;
}

function renderActions() {
  return `<div class="pane-actions">
    <button type="button" class="button button-primary" data-command="new-folder">${
    icon("folder-plus")
  }<span>New folder</span></button>
    <button type="button" class="button" data-command="new-file">${
    icon("file")
  }<span>New file</span></button>
    <div class="dropdown">
      <button type="button" class="button dropdown-trigger" data-command="toggle-dropdown">${
    icon("upload")
  }<span>Upload</span>${icon("chevron-down", "icon-small")}</button>
      <div class="menu-popover">
        <button type="button" class="menu-item" data-command="upload-files">${
    icon("file")
  }<span>Upload files</span></button>
        <button type="button" class="menu-item" data-command="upload-folder">${
    icon("folder")
  }<span>Upload folder</span></button>
      </div>
    </div>
    <button type="button" class="button" data-command="paste-clipboard">${
    icon("clipboard")
  }<span>Paste</span></button>
    <div class="pane-actions-spacer"></div>
    <div class="segmented" role="group" aria-label="View mode">
      <button type="button" class="segmented-option" data-view-mode="list" title="List view" aria-label="List view">${
    icon("list")
  }</button>
      <button type="button" class="segmented-option" data-view-mode="grid" title="Grid view" aria-label="Grid view">${
    icon("grid")
  }</button>
    </div>
  </div>`;
}

function renderSelectionBar() {
  return `<div class="selection-bar" hidden>
    <span class="selection-summary"></span>
    <div class="selection-actions">
      <button type="button" class="button button-small" data-command="selection-copy" data-split-only="true">${
    icon("copy")
  }<span>Copy to other pane</span></button>
      <button type="button" class="button button-small" data-command="selection-move" data-split-only="true">${
    icon("move")
  }<span>Move to other pane</span></button>
      <button type="button" class="button button-small" data-command="selection-download">${
    icon("download")
  }<span>Download</span></button>
      <button type="button" class="button button-small button-danger" data-command="selection-delete">${
    icon("trash")
  }<span>Delete</span></button>
      <button type="button" class="button button-small button-ghost" data-command="selection-clear">${
    icon("close")
  }<span>Clear</span></button>
    </div>
  </div>`;
}

const COLUMNS = [
  { key: "name", label: "Name", className: "cell-name", sortable: true },
  { key: "size", label: "Size", className: "cell-size", sortable: true },
  {
    key: "permissions",
    label: "Permissions",
    className: "cell-permissions",
    sortable: false,
  },
  {
    key: "modified",
    label: "Modified",
    className: "cell-modified",
    sortable: true,
  },
];

function renderHeader() {
  const headerCells = COLUMNS.map((column) => {
    if (!column.sortable) {
      return `<span class="cell ${column.className}">${column.label}</span>`;
    }
    return `<button type="button" class="cell ${column.className} column-sort" data-sort-key="${column.key}">${column.label}${
      icon("sort-asc", "sort-indicator")
    }</button>`;
  }).join("");

  return `<div class="file-list-header">
    <label class="cell cell-select"><input type="checkbox" class="select-all" aria-label="Select all"></label>
    ${headerCells}
    <span class="cell cell-actions"></span>
  </div>`;
}

function renderStatusBar(entries, totalSize) {
  const directoryCount =
    entries.filter((entry) => entry.isDirectory && !entry.isDeleted).length;
  const fileCount =
    entries.filter((entry) => !entry.isDirectory && !entry.isDeleted).length;

  return `<div class="pane-status">
    <span class="pane-status-summary">${directoryCount} folder${
    directoryCount === 1 ? "" : "s"
  } · ${fileCount} file${fileCount === 1 ? "" : "s"} · ${
    formatFileSize(totalSize)
  }</span>
    <span class="pane-status-selection"></span>
  </div>`;
}

/**
 * Renders the inner content of a pane, reused by the full page and by refreshes
 * @param {string} directoryPath - The normalized directory path
 * @param {object[]} entries - The directory entries
 * @param {number} totalSize - The combined size of the listed files
 * @returns {string} - The pane body markup
 */
export function renderPaneContent(directoryPath, entries, totalSize) {
  const parentRow = directoryPath === "." ? "" : renderParentRow(directoryPath);
  const rows = entries.map(renderEntryRow).join("");
  const emptyState = entries.length === 0
    ? `<div class="pane-empty">${
      icon("folder")
    }<p>This folder is empty</p></div>`
    : "";

  return `${renderToolbar(directoryPath)}
    ${renderActions()}
    ${renderSelectionBar()}
    <div class="pane-body">
      <div class="file-list">
        ${renderHeader()}
        <div class="file-rows">${parentRow}${rows}</div>
        ${emptyState}
        <div class="pane-no-matches" hidden>No entries match the filter</div>
      </div>
    </div>
    ${renderStatusBar(entries, totalSize)}`;
}

/**
 * Renders a complete pane element
 * @param {object} options - Pane name, path, entries and total size
 * @returns {string} - The pane markup
 */
export function renderPane({ pane, directoryPath, entries, totalSize }) {
  return `<section class="pane" data-pane="${pane}" data-path="${
    escapeHtml(directoryPath)
  }" tabindex="0">${
    renderPaneContent(directoryPath, entries, totalSize)
  }</section>`;
}
