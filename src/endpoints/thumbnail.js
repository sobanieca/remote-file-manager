import { normalizePath } from "./utils.js";

export async function thumbnail(c) {
  try {
    const path = c.req.query("path");
    if (!path) {
      return c.text("Path parameter is required", 400);
    }

    const normalizedPath = normalizePath(path);
    if (!normalizedPath) {
      return c.text("Invalid path", 400);
    }

    try {
      const fileInfo = await Deno.stat(normalizedPath);
      if (!fileInfo.isFile) {
        return c.text("Path is not a file", 400);
      }

      const ext = normalizedPath.toLowerCase().substring(
        normalizedPath.lastIndexOf("."),
      );

      // For SVG files, serve them directly as thumbnails
      if (ext === ".svg") {
        const fileContent = await Deno.readFile(normalizedPath);
        return c.body(fileContent, {
          headers: {
            "Content-Type": "image/svg+xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      }

      // For other image formats, serve them directly but with cache headers
      // In a production environment, you might want to implement actual resizing
      const imageExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".bmp",
        ".webp",
        ".tiff",
        ".tif",
        ".ico",
        ".avif",
      ];

      if (imageExtensions.includes(ext)) {
        const fileContent = await Deno.readFile(normalizedPath);

        // Determine MIME type
        let mimeType = "image/jpeg"; // default
        switch (ext) {
          case ".png":
            mimeType = "image/png";
            break;
          case ".gif":
            mimeType = "image/gif";
            break;
          case ".bmp":
            mimeType = "image/bmp";
            break;
          case ".webp":
            mimeType = "image/webp";
            break;
          case ".tiff":
          case ".tif":
            mimeType = "image/tiff";
            break;
          case ".ico":
            mimeType = "image/x-icon";
            break;
          case ".avif":
            mimeType = "image/avif";
            break;
        }

        return c.body(fileContent, {
          headers: {
            "Content-Type": mimeType,
            "Cache-Control": "public, max-age=3600",
          },
        });
      }

      return c.text("Unsupported image format", 400);
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        return c.text("File not found", 404);
      }
      return c.text(`Error reading file: ${error.message}`, 500);
    }
  } catch (error) {
    return c.text(`Server error: ${error.message}`, 500);
  }
}
