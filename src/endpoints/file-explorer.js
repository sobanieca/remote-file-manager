import { layout } from "./layout/index.js";
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
          <div class="file-item">
            <a href="/file-explorer?path=${
          encodeURIComponent(entry.path)
        }" class="folder">${entry.name}</a>
            <div class="context-menu-trigger" data-path="${entry.path}" data-type="directory" data-parent="${normalizedPath}">
              <span class="dots">⋮</span>
              <div class="context-menu">
                <a href="/download-item?path=${
          encodeURIComponent(entry.path)
        }&type=directory" class="context-menu-item">
                  <span class="icon">📥</span> Download as ZIP
                </a>
                <form action="/delete-item" method="POST" onsubmit="return confirm('Are you sure you want to delete this folder? This action cannot be undone.');">
                  <input type="hidden" name="path" value="${entry.path}">
                  <input type="hidden" name="type" value="directory">
                  <input type="hidden" name="parentPath" value="${normalizedPath}">
                  <button type="submit" class="context-menu-item">
                    <span class="icon">🗑️</span> Delete
                  </button>
                </form>
              </div>
            </div>
          </div>
        </li>`;
      } else {
        filesHtml += `<li>
          <div class="file-item">
            <a href="/${entry.path}" class="file" target="_blank">${entry.name}</a>
            <div class="context-menu-trigger" data-path="${entry.path}" data-type="file" data-parent="${normalizedPath}">
              <span class="dots">⋮</span>
              <div class="context-menu">
                <a href="/download-item?path=${
          encodeURIComponent(entry.path)
        }&type=file" class="context-menu-item">
                  <span class="icon">📥</span> Download
                </a>
                <form action="/delete-item" method="POST" onsubmit="return confirm('Are you sure you want to delete this file? This action cannot be undone.');">
                  <input type="hidden" name="path" value="${entry.path}">
                  <input type="hidden" name="type" value="file">
                  <input type="hidden" name="parentPath" value="${normalizedPath}">
                  <button type="submit" class="context-menu-item">
                    <span class="icon">🗑️</span> Delete
                  </button>
                </form>
              </div>
            </div>
          </div>
        </li>`;
      }
    }
    filesHtml += "</ul>";

    // Process success/error messages
    let statusMessageHtml = "";
    const success = c.req.query("success");
    const error = c.req.query("error");
    const processedFiles = c.req.query("count") || 0;
    const processedFolders = c.req.query("folders") || 0;
    const failedFiles = c.req.query("failed") || 0;

    if (success === "folder_created") {
      statusMessageHtml =
        '<div class="status-message success">Folder created successfully!</div>';
    } else if (success === "item_deleted") {
      statusMessageHtml =
        '<div class="status-message success">Item deleted successfully!</div>';
    } else if (success === "files_uploaded") {
      statusMessageHtml =
        `<div class="status-message success">${processedFiles} file${
          processedFiles === "1" ? "" : "s"
        } uploaded successfully!</div>`;
    } else if (success === "folders_uploaded") {
      statusMessageHtml =
        `<div class="status-message success">${processedFolders} folder${
          processedFolders === "1" ? "" : "s"
        } uploaded successfully!</div>`;
    } else if (success === "partial_upload") {
      statusMessageHtml =
        `<div class="status-message warning">Uploaded ${processedFiles} file${
          processedFiles === "1" ? "" : "s"
        } and ${processedFolders} folder${
          processedFolders === "1" ? "" : "s"
        }, but ${failedFiles} file${
          failedFiles === "1" ? "" : "s"
        } failed.</div>`;
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
      } else if (error === "no_files") {
        errorMessage = "No files were selected for upload";
      } else if (error === "upload_failed") {
        errorMessage = "Failed to upload files";
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
    </div>
  `;

    // Add status message section if there is a message to show
    const statusSection = statusMessageHtml
      ? `<div class="status-section">${statusMessageHtml}</div>`
      : "";

    // Create upload form HTML
    const uploadFormHtml = `
    <div class="upload-section">
      <div class="upload-forms">
        <div class="upload-form">
          <h3>Upload Files</h3>
          <form action="/upload-files" method="POST" enctype="multipart/form-data">
            <input type="hidden" name="path" value="${normalizedPath}">
            <input type="file" name="files" multiple>
            <button type="submit">Upload Files</button>
          </form>
        </div>
        <div class="upload-form">
          <h3>Upload Folder</h3>
          <form action="/upload-files" method="POST" enctype="multipart/form-data">
            <input type="hidden" name="path" value="${normalizedPath}">
            <input type="file" name="files" webkitdirectory directory multiple>
            <button type="submit">Upload Folder</button>
          </form>
        </div>
      </div>
    </div>
    `;

    const content = `
      <h1>File Explorer</h1>
      ${breadcrumbHtml}
      ${newFolderFormHtml}
      ${uploadFormHtml}
      ${statusSection}
      ${filesHtml}
    `;

    return c.html(layout("File Explorer", content));
  } catch (error) {
    return c.html(`An error occurred: ${error.message}`, 500);
  }
}
