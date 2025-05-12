import { layout } from "./layout.js";
import { combinePaths, getParentPath, normalizePath } from "./utils.js";

export async function fileExplorer(c) {
  try {
    const path = c.req.query("path") || ".";

    // Validate path to prevent directory traversal
    const normalizedPath = normalizePath(path);
    if (!normalizedPath) {
      return c.html("Invalid path", 400);
    }

    const entries = [];
    const fullPath = normalizedPath;

    try {
      for await (const entry of Deno.readDir(fullPath)) {
        entries.push({
          name: entry.name,
          isDirectory: entry.isDirectory,
          path: combinePaths(normalizedPath, entry.name),
        });
      }
    } catch (error) {
      return c.html(`Error reading directory: ${error.message}`, 500);
    }

    // Sort entries: directories first, then files, both alphabetically
    entries.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });

    // Generate breadcrumb navigation
    const pathParts = normalizedPath.split("/").filter(Boolean);
    let breadcrumbHtml = '<div class="breadcrumb">';
    breadcrumbHtml += '<a href="/file-explorer?path=.">Home</a>';

    let currentPath = "";
    for (const part of pathParts) {
      currentPath += "/" + part;
      breadcrumbHtml += ` / <a href="/file-explorer?path=${
        encodeURIComponent(currentPath.replace(/^\//, ""))
      }">${part}</a>`;
    }
    breadcrumbHtml += "</div>";

    // Generate file list HTML
    let filesHtml = '<ul class="file-list">';

    if (normalizedPath !== ".") {
      // Add parent directory link if not at root
      const parentPath = getParentPath(normalizedPath);
      filesHtml += `<li><a href="/file-explorer?path=${
        encodeURIComponent(parentPath)
      }" class="folder">.. (Parent Directory)</a></li>`;
    }

    for (const entry of entries) {
      if (entry.isDirectory) {
        filesHtml += `<li>
          <a href="/file-explorer?path=${
          encodeURIComponent(entry.path)
        }" class="folder">${entry.name}</a>
          <form action="/delete-item" method="POST" style="display:inline;" onsubmit="return confirm('Are you sure you want to delete this folder? This action cannot be undone.');">
            <input type="hidden" name="path" value="${entry.path}">
            <input type="hidden" name="type" value="directory">
            <input type="hidden" name="parentPath" value="${normalizedPath}">
            <button type="submit" class="delete-btn">Delete</button>
          </form>
        </li>`;
      } else {
        filesHtml += `<li>
          <a href="/${entry.path}" class="file" target="_blank">${entry.name}</a>
          <form action="/delete-item" method="POST" style="display:inline;" onsubmit="return confirm('Are you sure you want to delete this file? This action cannot be undone.');">
            <input type="hidden" name="path" value="${entry.path}">
            <input type="hidden" name="type" value="file">
            <input type="hidden" name="parentPath" value="${normalizedPath}">
            <button type="submit" class="delete-btn">Delete</button>
          </form>
        </li>`;
      }
    }
    filesHtml += "</ul>";

    // Process success/error messages
    let statusMessageHtml = "";
    const success = c.req.query("success");
    const error = c.req.query("error");

    if (success === "folder_created") {
      statusMessageHtml =
        '<div class="status-message success">Folder created successfully!</div>';
    } else if (success === "item_deleted") {
      statusMessageHtml =
        '<div class="status-message success">Item deleted successfully!</div>';
    } else if (error) {
      let errorMessage = "An error occurred";
      if (error === "invalid_name") errorMessage = "Invalid folder name";
      else if (error === "invalid_path") errorMessage = "Invalid path";
      else if (error === "already_exists") {
        errorMessage = "A folder with this name already exists";
      } else if (error === "delete_failed") {
        errorMessage = "Failed to delete item";
      } else if (error === "not_empty") {
        errorMessage = "Directory is not empty";
      } else errorMessage = `Error: ${error}`;

      statusMessageHtml =
        `<div class="status-message error">${errorMessage}</div>`;
    }

    // Form for adding a new folder
    const newFolderFormHtml = `
    <div class="new-folder-form">
      <form action="/create-folder" method="POST">
        <input type="hidden" name="path" value="${normalizedPath}">
        <input type="text" name="folderName" placeholder="New folder name" required>
        <button type="submit">Create Folder</button>
      </form>
      ${statusMessageHtml}
    </div>
  `;

    const content = `
      <h1>File Explorer</h1>
      ${breadcrumbHtml}
      ${newFolderFormHtml}
      ${filesHtml}
    `;

    return c.html(layout("File Explorer", content));
  } catch (error) {
    return c.html(`An error occurred: ${error.message}`, 500);
  }
}
