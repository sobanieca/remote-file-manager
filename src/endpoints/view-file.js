import { layout } from "./layout/index.js";
import {
  escapeHtml,
  formatFileSize,
  formatOctalPermissions,
  formatPermissions,
  formatRelativeTime,
  formatTimestamp,
  getParentPath,
  normalizePath,
} from "./utils.js";
import { describePath } from "./file-entries.js";
import { renderCodeView } from "./components/code-view.js";
import { renderEntryActionBar } from "./components/entry-actions.js";
import { getEntryIconName, icon } from "./components/icons.js";
import { gitStatusBadge } from "../git/git-status.js";

const MAX_TEXT_BYTES = 5_000_000;

function renderMetaItem(label, value, title) {
  return `<div class="meta-item"><span class="meta-label">${label}</span><span class="meta-value"${
    title ? ` title="${escapeHtml(title)}"` : ""
  }>${value}</span></div>`;
}

function renderMetaStrip(entry) {
  const permissions = formatPermissions(
    entry.mode,
    entry.isDirectory,
    entry.isSymlink,
  );
  const octal = formatOctalPermissions(entry.mode);
  const items = [
    renderMetaItem(
      "Size",
      formatFileSize(entry.size ?? 0),
      `${entry.size} bytes`,
    ),
    renderMetaItem(
      "Permissions",
      `<code>${permissions || "—"}</code>`,
      octal ? `Mode ${octal}` : "",
    ),
    renderMetaItem(
      "Modified",
      formatRelativeTime(entry.modifiedAt) || "—",
      formatTimestamp(entry.modifiedAt),
    ),
    renderMetaItem("Kind", escapeHtml(entry.kind)),
  ];

  if (entry.isExecutable) {
    items.push(renderMetaItem(
      "Flags",
      '<span class="entry-badge entry-badge-executable">executable</span>',
    ));
  }
  if (entry.isSymlink) {
    items.push(renderMetaItem(
      "Flags",
      '<span class="entry-badge entry-badge-symlink">symlink</span>',
    ));
  }

  return `<div class="meta-strip">${items.join("")}</div>`;
}

function renderPreview(entry, fileContent) {
  if (entry.isImage) {
    return `<div class="preview-panel">
      <img class="image-preview" src="/${entry.path}" alt="${
      escapeHtml(entry.name)
    }">
    </div>`;
  }

  if (fileContent === null) {
    return `<div class="preview-panel preview-unavailable">
      ${icon("info")}
      <p>No inline preview available for this file type.</p>
      <a class="button button-primary" href="/download-item?path=${
      encodeURIComponent(entry.path)
    }&type=file">${icon("download")}<span>Download</span></a>
    </div>`;
  }

  return renderCodeView(entry.path, fileContent, entry.size ?? 0);
}

export async function viewFile(c) {
  try {
    const requestedPath = c.req.query("path");
    if (!requestedPath) {
      return c.html("File path is required", 400);
    }

    const filePath = normalizePath(requestedPath);
    if (!filePath || filePath === ".") {
      return c.html("Invalid file path", 400);
    }

    let entry;
    try {
      entry = await describePath(filePath);
    } catch (_error) {
      return c.html("File not found", 404);
    }

    if (entry.isDirectory) {
      return c.redirect(`/file-explorer?path=${encodeURIComponent(filePath)}`);
    }

    let fileContent = null;
    if (entry.isText && (entry.size ?? 0) <= MAX_TEXT_BYTES) {
      try {
        fileContent = await Deno.readTextFile(filePath);
      } catch (_error) {
        fileContent = null;
      }
    }

    const parentPath = getParentPath(filePath);
    const content = `
      <div class="page-header">
        <div class="page-title">
          <span class="page-title-icon">${icon(getEntryIconName(entry))}</span>
          <div>
            <h1>${escapeHtml(entry.name)}</h1>
            <a class="page-subtitle" href="/file-explorer?path=${
      encodeURIComponent(parentPath)
    }">${icon("folder")}<span>${
      escapeHtml(parentPath === "." ? "root" : parentPath)
    }</span></a>
          </div>
        </div>
        ${gitStatusBadge(entry.gitStatus)}
      </div>
      ${renderMetaStrip(entry)}
      ${renderEntryActionBar(entry)}
      ${renderPreview(entry, fileContent)}
    `;

    return c.html(
      await layout(entry.name, content, {
        activeSection: "files",
        wide: true,
      }),
    );
  } catch (error) {
    return c.html(`An error occurred: ${error.message}`, 500);
  }
}
