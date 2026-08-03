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
export function isMarkdownFile(filename) {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf("."));
  return ext === ".md";
}

const FRONTMATTER_PATTERN =
  /^(---|\+\+\+)[ \t]*\r?\n(?:[\s\S]*?\r?\n)?\1[ \t]*(?:\r?\n|$)/;

/**
 * Removes a leading YAML/TOML frontmatter block from markdown content
 * @param {string} markdownContent - The raw markdown content
 * @returns {string} - The content without its frontmatter block
 */
export function stripFrontmatter(markdownContent) {
  return markdownContent.replace(FRONTMATTER_PATTERN, "");
}

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
  return imageExtensions.includes(getFileExtension(filename));
}

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

/**
 * Returns the lower-cased extension of a file name, including the leading dot
 * @param {string} filename - The filename to inspect
 * @returns {string} - The extension or an empty string when there is none
 */
export function getFileExtension(filename) {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot < 0) {
    return "";
  }
  return filename.toLowerCase().substring(lastDot);
}

/**
 * Checks if a file is binary (and therefore not editable/diffable) by extension
 * @param {string} filename - The filename to check
 * @returns {boolean} - True if the file is considered binary
 */
export function isBinaryFile(filename) {
  return BINARY_EXTENSIONS.includes(getFileExtension(filename));
}

/**
 * Escapes characters that would otherwise be interpreted as HTML markup
 * @param {string} text - The text to escape
 * @returns {string} - The escaped text
 */
export function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
