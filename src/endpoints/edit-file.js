import { layout } from "./layout/index.js";
import { normalizePath } from "./utils.js";

const BINARY_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".bmp",
  ".ico",
  ".tiff",
  ".webp",
  ".mp3",
  ".mp4",
  ".avi",
  ".mov",
  ".mkv",
  ".wav",
  ".flac",
  ".ogg",
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".zip",
  ".rar",
  ".7z",
  ".tar",
  ".gz",
  ".exe",
  ".bin",
  ".dll",
  ".so",
];

function isBinaryFile(filePath) {
  const extension = filePath.toLowerCase().substring(filePath.lastIndexOf("."));
  return BINARY_EXTENSIONS.includes(extension);
}

export async function editFile(c) {
  try {
    const filePath = c.req.query("path");

    if (!filePath) {
      return c.html("File path is required", 400);
    }

    const normalizedPath = normalizePath(filePath);
    if (!normalizedPath) {
      return c.html("Invalid file path", 400);
    }

    try {
      const stat = await Deno.stat(normalizedPath);
      if (stat.isDirectory) {
        return c.html("Cannot edit a directory", 400);
      }
    } catch (error) {
      return c.html(`File not found: ${error.message}`, 404);
    }

    if (isBinaryFile(normalizedPath)) {
      const content = `
        <h1>File Editor</h1>
        <div class="editor-header">
          <h2>${filePath}</h2>
          <a href="/file-explorer?path=${
        encodeURIComponent(
          filePath.substring(0, filePath.lastIndexOf("/")) || ".",
        )
      }" class="back-button">← Back to Explorer</a>
        </div>
        <div class="binary-file-message">
          <p>⚠️ This file appears to be a binary file and cannot be edited.</p>
          <p>Supported file types for editing: text files (.txt, .js, .json, .html, .css, .md, etc.)</p>
        </div>
      `;
      return c.html(layout("File Editor", content));
    }

    let fileContent = "";
    try {
      fileContent = await Deno.readTextFile(normalizedPath);
    } catch (error) {
      return c.html(`Error reading file: ${error.message}`, 500);
    }

    const content = `
      <h1>File Editor</h1>
      <div class="editor-header">
        <h2>${filePath}</h2>
        <a href="/file-explorer?path=${
      encodeURIComponent(
        filePath.substring(0, filePath.lastIndexOf("/")) || ".",
      )
    }" class="back-button">← Back to Explorer</a>
      </div>
      <form action="/save-file" method="POST" class="editor-form">
        <input type="hidden" name="path" value="${filePath}">
        <textarea name="content" class="file-editor" rows="25" cols="80">${
      fileContent.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(
        />/g,
        "&gt;",
      )
    }</textarea>
        <div class="editor-actions">
          <button type="submit" class="save-button">💾 Save File</button>
          <button type="button" class="cancel-button" onclick="history.back()">❌ Cancel</button>
        </div>
      </form>
    `;

    return c.html(layout("File Editor", content));
  } catch (error) {
    return c.html(`An error occurred: ${error.message}`, 500);
  }
}

export async function saveFile(c) {
  try {
    const body = await c.req.formData();
    const filePath = body.get("path");
    const content = body.get("content");

    if (!filePath || content === null) {
      return c.redirect(
        `/edit-file?path=${encodeURIComponent(filePath)}&error=missing_data`,
      );
    }

    const normalizedPath = normalizePath(filePath);
    if (!normalizedPath) {
      return c.redirect(
        `/edit-file?path=${encodeURIComponent(filePath)}&error=invalid_path`,
      );
    }

    try {
      let normalizedContent = content.replace(/\r\n/g, "\n");

      try {
        const originalContent = await Deno.readTextFile(normalizedPath);
        const originalHadFinalNewline = originalContent.endsWith("\n");

        if (originalHadFinalNewline && !normalizedContent.endsWith("\n")) {
          normalizedContent += "\n";
        }
      } catch (_error) {
        // Ignore errors when reading original file (e.g., file doesn't exist yet)
      }

      await Deno.writeTextFile(normalizedPath, normalizedContent);
      const parentPath = filePath.substring(0, filePath.lastIndexOf("/")) ||
        ".";
      return c.redirect(
        `/file-explorer?path=${
          encodeURIComponent(parentPath)
        }&success=file_saved`,
      );
    } catch (_error) {
      return c.redirect(
        `/edit-file?path=${encodeURIComponent(filePath)}&error=save_failed`,
      );
    }
  } catch (error) {
    return c.html(`An error occurred: ${error.message}`, 500);
  }
}
