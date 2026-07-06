import { markdownCss, renderMarkdown } from "../deps.js";
import { layout } from "./layout/index.js";
import { normalizePath } from "./utils.js";

export async function markdown(c) {
  try {
    const filePath = c.req.query("path");

    if (!filePath) {
      return c.html("File path is required", 400);
    }

    const normalizedPath = normalizePath(filePath);
    if (!normalizedPath) {
      return c.html("Invalid file path", 400);
    }

    let fileContent;
    try {
      fileContent = await Deno.readTextFile(normalizedPath);
    } catch (_error) {
      return c.html("File not found", 404);
    }

    const renderedHtml = renderMarkdown(fileContent);
    const parentPath = filePath.substring(0, filePath.lastIndexOf("/")) || ".";

    const content = `
      <style>${markdownCss}</style>
      <div class="markdown-header">
        <h2>${filePath}</h2>
        <div class="markdown-actions">
          <a href="/edit-file?path=${
      encodeURIComponent(filePath)
    }" class="edit-button">Edit</a>
          <a href="/file-explorer?path=${
      encodeURIComponent(parentPath)
    }" class="back-button">← Back to Explorer</a>
        </div>
      </div>
      <div class="markdown-body" data-color-mode="auto" data-light-theme="light" data-dark-theme="dark">
        ${renderedHtml}
      </div>
    `;

    return c.html(layout("Markdown - " + filePath, content));
  } catch (error) {
    return c.html(`An error occurred: ${error.message}`, 500);
  }
}
