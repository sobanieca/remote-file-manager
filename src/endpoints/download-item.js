import { normalizePath } from "./utils.js";
import { walk, join, basename, extname } from "../deps.js";

export async function downloadItem(c) {
  try {
    // Get request parameters
    const path = c.req.query("path");
    const type = c.req.query("type"); // "file" or "directory"
    
    // Validate inputs
    if (!path) {
      return c.text("Invalid path", 400);
    }
    
    // Normalize path to prevent directory traversal
    const normalizedPath = normalizePath(path);
    if (!normalizedPath) {
      return c.text("Invalid path", 400);
    }
    
    // Check if path exists
    try {
      const stat = await Deno.stat(normalizedPath);
      
      // Handle based on type
      if (type === "file") {
        return await downloadFile(c, normalizedPath, stat);
      } else if (type === "directory") {
        return await downloadDirectory(c, normalizedPath);
      } else {
        return c.text("Invalid type specified", 400);
      }
    } catch (error) {
      console.error("Error accessing path:", error);
      return c.text("File or directory not found", 404);
    }
  } catch (error) {
    console.error("Download error:", error);
    return c.text("Server error", 500);
  }
}

// Download a single file
async function downloadFile(c, filePath, stat) {
  try {
    // Read file content
    const fileContent = await Deno.readFile(filePath);
    
    // Set appropriate headers for file download
    const fileName = basename(filePath);
    const contentType = getContentType(filePath);
    
    c.header("Content-Type", contentType);
    c.header("Content-Disposition", `attachment; filename="${encodeURIComponent(fileName)}"`);
    c.header("Content-Length", stat.size.toString());
    
    return c.body(fileContent);
  } catch (error) {
    console.error("File download error:", error);
    return c.text("Error downloading file", 500);
  }
}

// Download a directory as a file listing
async function downloadDirectory(c, dirPath) {
  try {
    // Get the directory name
    const directoryName = basename(dirPath);

    // Get all files in the directory
    const files = [];
    for await (const entry of walk(dirPath, { includeDirs: false })) {
      const relativePath = entry.path.slice(dirPath.length + 1);
      files.push({
        path: entry.path,
        relativePath
      });
    }

    // Create an HTML file with links to each file
    const archiveContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Directory Contents: ${directoryName}</title>
        <style>
          body { font-family: sans-serif; line-height: 1.6; padding: 20px; max-width: 800px; margin: 0 auto; }
          h1 { color: #333; }
          ul { list-style-type: none; padding: 0; }
          li { margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 4px; }
          a { color: #0366d6; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .note { background: #fff7e6; padding: 15px; border-radius: 4px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <h1>Files in ${directoryName}</h1>
        <div class="note">
          <strong>Note:</strong> Direct folder downloads as ZIP are not currently available.
          You can download individual files using the links below.
        </div>
        <ul>
          ${files.length === 0 ? '<li>No files found in this directory</li>' : ''}
          ${files.map(file =>
            `<li><a href="/download-item?path=${encodeURIComponent(file.path)}&type=file" target="_blank">${file.relativePath}</a></li>`
          ).join('\n')}
        </ul>
      </body>
      </html>
    `;

    // Set headers for HTML file
    c.header("Content-Type", "text/html");
    c.header("Content-Disposition", `inline; filename="${encodeURIComponent(directoryName)}-files.html"`);

    return c.body(archiveContent);
  } catch (error) {
    console.error("Directory download error:", error);
    return c.text("Error creating directory listing", 500);
  }
}

// Utility function to determine content type based on file extension
function getContentType(filePath) {
  const extension = extname(filePath).toLowerCase();
  
  const mimeTypes = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".txt": "text/plain",
    ".md": "text/markdown",
    ".xml": "application/xml",
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".zip": "application/zip",
    ".mp3": "audio/mpeg",
    ".mp4": "video/mp4",
  };
  
  return mimeTypes[extension] || "application/octet-stream";
}