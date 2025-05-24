import { normalizePath } from "./utils.js";
import {
  basename,
  BlobReader,
  BlobWriter,
  extname,
  join,
  walk,
  ZipWriter,
} from "../deps.js";

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
    c.header(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(fileName)}"`,
    );
    c.header("Content-Length", stat.size.toString());

    return c.body(fileContent);
  } catch (error) {
    console.error("File download error:", error);
    return c.text("Error downloading file", 500);
  }
}

// Download a directory as a ZIP file
async function downloadDirectory(c, dirPath) {
  try {
    // Get the directory name
    const directoryName = basename(dirPath);

    // Create ZIP archive
    const blobWriter = new BlobWriter("application/zip");
    const zipWriter = new ZipWriter(blobWriter);

    // Get all files in the directory
    for await (const entry of walk(dirPath, { includeDirs: false })) {
      const relativePath = entry.path.slice(dirPath.length + 1);
      const fileContent = await Deno.readFile(entry.path);
      const fileBlob = new Blob([fileContent]);
      const fileBlobReader = new BlobReader(fileBlob);
      await zipWriter.add(relativePath, fileBlobReader);
    }

    // Close the ZIP writer and get the blob
    await zipWriter.close();
    const zipBlob = await blobWriter.getData();
    const zipArrayBuffer = await zipBlob.arrayBuffer();
    const zipUint8Array = new Uint8Array(zipArrayBuffer);

    // Set appropriate headers for ZIP download
    c.header("Content-Type", "application/zip");
    c.header(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(directoryName)}.zip"`,
    );
    c.header("Content-Length", zipUint8Array.length.toString());

    return c.body(zipUint8Array);
  } catch (error) {
    console.error("Directory download error:", error);
    return c.text("Error creating ZIP archive", 500);
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
