// Helper functions for file and path operations

/**
 * Normalizes a path to prevent directory traversal attacks
 * @param {string} path - The path to normalize
 * @returns {string|null} - The normalized path or null if invalid
 */
export function normalizePath(path) {
  if (!path || path.includes("..")) {
    return null;
  }

  // Convert "./" or just "." to empty string for clean paths
  return path.replace(/^\.\//, "").replace(/^\.$/, ".");
}

/**
 * Combines directory path and file/folder name
 * @param {string} dir - Directory path
 * @param {string} file - File or folder name
 * @returns {string} - Combined path
 */
export function combinePaths(dir, file) {
  if (dir === ".") {
    return file;
  }
  return `${dir}/${file}`;
}

/**
 * Gets parent directory path
 * @param {string} path - Current path
 * @returns {string} - Parent path
 */
export function getParentPath(path) {
  const parts = path.split("/");
  parts.pop();
  return parts.join("/") || ".";
}

/**
 * Checks if a file is an image based on its extension
 * @param {string} filename - The filename to check
 * @returns {boolean} - True if the file is an image
 */
export function isImageFile(filename) {
  const imageExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".webp",
    ".svg",
    ".tiff",
    ".tif",
    ".ico",
    ".avif",
  ];
  const ext = filename.toLowerCase().substring(filename.lastIndexOf("."));
  return imageExtensions.includes(ext);
}
