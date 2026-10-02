// Helper functions for file and path operations

/**
 * Normalizes a path relative to the served directory and rejects anything that
 * could escape it, such as absolute paths or parent directory segments
 * @param {string} path - The path to normalize
 * @returns {string|null} - The normalized path or null if invalid
 */
export function normalizePath(path) {
  if (typeof path !== "string" || path.length === 0 || path.includes("\0")) {
    return null;
  }
  const unixPath = path.replace(/\\/g, "/");
  if (unixPath.startsWith("/")) {
    return null;
  }
  const segments = [];
  for (const segment of unixPath.split("/")) {
    if (segment === "" || segment === ".") {
      continue;
    }
    if (segment === "..") {
      return null;
    }
    segments.push(segment);
  }
  return segments.join("/") || ".";
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
 * Decodes a percent encoded URL path, keeping it as is when it is malformed
 * @param {string} path - The encoded path
 * @returns {string} - The decoded path
 */
export function decodeUrlPath(path) {
  try {
    return decodeURIComponent(path);
  } catch (_error) {
    return path;
  }
}

/**
 * Checks if a file is markdown based on its extension
 * @param {string} filename - The filename to check
 * @returns {boolean} - True if the file is markdown
 */
export function isMarkdownFile(filename) {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf("."));
  return ext === ".md";
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
  ".avif",
  ".mp3",
  ".mp4",
  ".avi",
  ".mov",
  ".mkv",
  ".webm",
  ".wmv",
  ".flv",
  ".m4v",
  ".wav",
  ".flac",
  ".ogg",
  ".aac",
  ".m4a",
  ".opus",
  ".wma",
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
 * Checks whether a file mode carries any executable bit
 * @param {number|null} mode - The file mode reported by Deno.stat
 * @returns {boolean} - True when the file is executable by someone
 */
export function isExecutableMode(mode) {
  return typeof mode === "number" && (mode & 0o111) !== 0;
}

const EXTENSIONS_BY_KIND = {
  image: [
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
  ],
  video: [".mp4", ".avi", ".mov", ".mkv", ".webm", ".wmv", ".flv", ".m4v"],
  audio: [".mp3", ".wav", ".flac", ".ogg", ".aac", ".m4a", ".opus", ".wma"],
  archive: [
    ".zip",
    ".rar",
    ".7z",
    ".tar",
    ".gz",
    ".bz2",
    ".xz",
    ".zst",
    ".tgz",
    ".jar",
  ],
  pdf: [".pdf"],
  document: [".doc", ".docx", ".odt", ".rtf", ".ppt", ".pptx", ".odp"],
  spreadsheet: [".xls", ".xlsx", ".ods", ".csv", ".tsv"],
  code: [
    ".js",
    ".mjs",
    ".cjs",
    ".jsx",
    ".ts",
    ".mts",
    ".cts",
    ".tsx",
    ".json",
    ".jsonc",
    ".html",
    ".htm",
    ".xml",
    ".vue",
    ".svelte",
    ".css",
    ".scss",
    ".sass",
    ".less",
    ".yml",
    ".yaml",
    ".toml",
    ".ini",
    ".cfg",
    ".conf",
    ".sh",
    ".bash",
    ".zsh",
    ".fish",
    ".ps1",
    ".py",
    ".go",
    ".rs",
    ".java",
    ".kt",
    ".swift",
    ".cs",
    ".c",
    ".h",
    ".cpp",
    ".cc",
    ".cxx",
    ".hpp",
    ".php",
    ".rb",
    ".pl",
    ".lua",
    ".r",
    ".sql",
    ".graphql",
    ".proto",
    ".tf",
    ".dockerfile",
  ],
  text: [".txt", ".md", ".markdown", ".rst", ".log", ".env", ".gitignore"],
};

const KIND_BY_EXTENSION = new Map();
for (const [kind, extensions] of Object.entries(EXTENSIONS_BY_KIND)) {
  for (const extension of extensions) {
    KIND_BY_EXTENSION.set(extension, kind);
  }
}

const KIND_BY_FILENAME = {
  "dockerfile": "code",
  "containerfile": "code",
  "makefile": "code",
  "readme": "text",
  "license": "text",
};

/**
 * Classifies a file into a broad kind used for icons and colouring
 * @param {string} filename - The filename to classify
 * @returns {string} - A kind such as "image", "code" or "file"
 */
export function getFileKind(filename) {
  const lowerCaseName = filename.toLowerCase();
  if (KIND_BY_FILENAME[lowerCaseName]) {
    return KIND_BY_FILENAME[lowerCaseName];
  }
  return KIND_BY_EXTENSION.get(getFileExtension(lowerCaseName)) || "file";
}

/**
 * Checks whether a file can be opened in the text viewer and editor
 * @param {string} filename - The filename to check
 * @returns {boolean} - True when the file is treated as text
 */
export function isTextFile(filename) {
  return !isBinaryFile(filename);
}
