import { layout } from "./layout/index.js";
import { escapeHtml, getParentPath, normalizePath } from "./utils.js";
import { getFileDiff } from "./git-status.js";
import { diffView } from "./diff-view.js";

export async function gitDiff(c) {
  try {
    const filePath = c.req.query("path");

    if (!filePath) {
      return c.html("File path is required", 400);
    }

    const normalizedPath = normalizePath(filePath);
    if (!normalizedPath) {
      return c.html("Invalid file path", 400);
    }

    const diffText = await getFileDiff(Deno.cwd(), normalizedPath);

    const diffHtml = diffText === null
      ? `<div class="diff-empty">Unable to read the diff. This file is not inside a git repository.</div>`
      : diffView(normalizedPath, diffText);

    const parentPath = getParentPath(normalizedPath);
    const escapedPath = escapeHtml(normalizedPath);

    const content = `
      <h1>Git Diff</h1>
      <div class="diff-header">
        <h2>${escapedPath}</h2>
        <div class="diff-actions">
          <a href="/edit-file?path=${
      encodeURIComponent(normalizedPath)
    }" class="edit-button">Edit</a>
          <a href="/file-explorer?path=${
      encodeURIComponent(parentPath)
    }" class="back-button">← Back to Explorer</a>
        </div>
      </div>
      ${diffHtml}
    `;

    return c.html(layout("Git Diff - " + escapedPath, content));
  } catch (error) {
    return c.html(`An error occurred: ${error.message}`, 500);
  }
}
