import { markdownCss, renderMarkdown } from "../deps.js";
import { layout } from "./layout/index.js";
import { MarkdownLinkRenderer } from "./markdown-link-renderer.js";
import {
  escapeHtml,
  getParentPath,
  normalizePath,
  stripFrontmatter,
} from "./utils.js";
import { describePath } from "./file-entries.js";
import { renderEntryActionBar } from "./components/entry-actions.js";
import { icon } from "./components/icons.js";

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

    const parentPath = getParentPath(normalizedPath);
    const renderedHtml = renderMarkdown(stripFrontmatter(fileContent), {
      renderer: new MarkdownLinkRenderer(parentPath),
    });

    let actionBarHtml = "";
    try {
      actionBarHtml = renderEntryActionBar(await describePath(normalizedPath));
    } catch (_error) {
      actionBarHtml = "";
    }

    const content = `
      <style>${markdownCss}</style>
      <div class="page-header">
        <div class="page-title">
          <span class="page-title-icon">${icon("file-text")}</span>
          <div>
            <h1>${escapeHtml(normalizedPath.split("/").pop())}</h1>
            <a class="page-subtitle" href="/file-explorer?path=${
      encodeURIComponent(parentPath)
    }">${icon("folder")}<span>${
      escapeHtml(parentPath === "." ? "root" : parentPath)
    }</span></a>
          </div>
        </div>
      </div>
      ${actionBarHtml}
      <div class="markdown-body" data-color-mode="auto" data-light-theme="light" data-dark-theme="dark">
        ${renderedHtml}
      </div>
    `;

    return c.html(
      await layout(`${normalizedPath}`, content, {
        activeSection: "files",
        wide: true,
      }),
    );
  } catch (error) {
    return c.html(`An error occurred: ${error.message}`, 500);
  }
}
