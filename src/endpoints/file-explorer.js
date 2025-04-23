import { layout } from "./layout.js";

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
        filesHtml += `<li><a href="/file-explorer?path=${
          encodeURIComponent(entry.path)
        }" class="folder">${entry.name}</a></li>`;
      } else {
        filesHtml +=
          `<li><a href="/${entry.path}" class="file" target="_blank">${entry.name}</a></li>`;
      }
    }
    filesHtml += "</ul>";

    const content = `
      <h1>File Explorer</h1>
      ${breadcrumbHtml}
      ${filesHtml}
    `;

    return c.html(layout("File Explorer", content));
  } catch (error) {
    return c.html(`An error occurred: ${error.message}`, 500);
  }
}

// Helper functions
function normalizePath(path) {
  if (!path || path.includes("..")) {
    return null;
  }

  // Convert "./" or just "." to empty string for clean paths
  return path.replace(/^\.\//, "").replace(/^\.$/, ".");
}

function combinePaths(dir, file) {
  if (dir === ".") {
    return file;
  }
  return `${dir}/${file}`;
}

function getParentPath(path) {
  const parts = path.split("/");
  parts.pop();
  return parts.join("/") || ".";
}
