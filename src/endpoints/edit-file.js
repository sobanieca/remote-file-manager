import { layout } from "./layout/index.js";
import {
  escapeHtml,
  formatFileSize,
  getParentPath,
  normalizePath,
} from "./utils.js";
import { describePath } from "./file-entries.js";
import { highlightToLines, resolveLanguage } from "./code-highlight.js";
import { getEntryIconName, icon } from "./components/icons.js";

const MAX_EDIT_BYTES = 5_000_000;

function renderUnsupported(entry, parentPath, reason) {
  return `
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
    </div>
    <div class="preview-panel preview-unavailable">
      ${icon("info")}
      <p>${reason}</p>
      <div class="action-bar">
        <a class="action-button" href="/view-file?path=${
    encodeURIComponent(entry.path)
  }">${icon("eye")}<span>View details</span></a>
        <a class="action-button" href="/download-item?path=${
    encodeURIComponent(entry.path)
  }&type=file">${icon("download")}<span>Download</span></a>
      </div>
    </div>`;
}

export async function editFile(c) {
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

    const parentPath = getParentPath(filePath);

    if (entry.isDirectory) {
      return c.redirect(`/file-explorer?path=${encodeURIComponent(filePath)}`);
    }
    if (!entry.isText) {
      return c.html(
        await layout(
          `Edit ${entry.name}`,
          renderUnsupported(
            entry,
            parentPath,
            "This looks like a binary file and cannot be edited as text.",
          ),
          { activeSection: "files", wide: true },
        ),
      );
    }
    if ((entry.size ?? 0) > MAX_EDIT_BYTES) {
      return c.html(
        await layout(
          `Edit ${entry.name}`,
          renderUnsupported(
            entry,
            parentPath,
            `This file is ${
              formatFileSize(entry.size)
            } and is too large to edit in the browser.`,
          ),
          { activeSection: "files", wide: true },
        ),
      );
    }

    let fileContent = "";
    try {
      fileContent = await Deno.readTextFile(filePath);
    } catch (error) {
      return c.html(`Error reading file: ${error.message}`, 500);
    }

    const language = resolveLanguage(filePath);
    const highlightedContent = highlightToLines(fileContent, language).join(
      "\n",
    );
    const lineCount = fileContent.split("\n").length;
    const gutterContent = Array.from(
      { length: lineCount },
      (_unused, index) => index + 1,
    ).join("\n");

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
      </div>
      <div class="editor" data-path="${escapeHtml(filePath)}">
        <div class="editor-toolbar">
          <span class="code-language">${
      escapeHtml(language || "plain text")
    }</span>
          <span class="editor-status" data-editor-status></span>
          <div class="code-toolbar-spacer"></div>
          <button type="button" class="button button-small button-ghost" data-command="toggle-wrap">${
      icon("wrap")
    }<span>Wrap</span></button>
          <button type="button" class="button button-small button-ghost" data-command="copy-editor" title="Copy the whole file to the clipboard">${
      icon("clipboard")
    }<span>Copy all</span></button>
          <a class="button button-small button-ghost" href="/view-file?path=${
      encodeURIComponent(filePath)
    }">${icon("eye")}<span>View</span></a>
          <button type="button" class="button button-small button-primary" data-command="save-file">${
      icon("save")
    }<span>Save</span></button>
        </div>
        <div class="editor-surface">
          <pre class="editor-gutter" aria-hidden="true" data-editor-gutter>${gutterContent}</pre>
          <div class="editor-code">
            <pre class="editor-highlight" aria-hidden="true"><code data-editor-highlight>${highlightedContent}
</code></pre>
            <textarea class="editor-input" data-editor-input spellcheck="false" autocomplete="off" autocapitalize="off" autocorrect="off" wrap="off" aria-label="File contents">${
      escapeHtml(fileContent)
    }</textarea>
          </div>
        </div>
      </div>
    `;

    return c.html(
      await layout(`Edit ${entry.name}`, content, {
        activeSection: "files",
        wide: true,
      }),
    );
  } catch (error) {
    return c.html(`An error occurred: ${error.message}`, 500);
  }
}

export async function saveFile(c) {
  try {
    const body = await c.req.json();
    const filePath = normalizePath(body.path || "");
    if (!filePath || filePath === ".") {
      return c.json({ ok: false, message: "Invalid path" }, 400);
    }
    if (typeof body.content !== "string") {
      return c.json({ ok: false, message: "Missing content" }, 400);
    }

    let content = body.content.replace(/\r\n/g, "\n");

    try {
      const originalContent = await Deno.readTextFile(filePath);
      if (originalContent.endsWith("\n") && !content.endsWith("\n")) {
        content += "\n";
      }
    } catch (_error) {
      // The file may not exist yet, write it as provided
    }

    await Deno.writeTextFile(filePath, content);

    return c.json({ ok: true, message: "File saved" });
  } catch (error) {
    return c.json({ ok: false, message: error.message }, 500);
  }
}
