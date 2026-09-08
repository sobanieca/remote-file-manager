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
 * Escapes characters that would otherwise be interpreted as HTML markup
 * @param {string} text - The text to escape
 * @returns {string} - The escaped text
 */
export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const FILE_SIZE_UNITS = ["B", "KB", "MB", "GB", "TB", "PB"];

/**
 * Formats a byte count into a short human readable size
 * @param {number} bytes - The size in bytes
 * @returns {string} - A compact size such as "4.1 KB"
 */
export function formatFileSize(bytes) {
  if (typeof bytes !== "number" || !Number.isFinite(bytes) || bytes < 0) {
    return "";
  }
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < FILE_SIZE_UNITS.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  const rounded = unitIndex === 0 || size >= 100
    ? Math.round(size)
    : Math.round(size * 10) / 10;
  return `${rounded} ${FILE_SIZE_UNITS[unitIndex]}`;
}

const PERMISSION_TRIPLETS = [
  "---",
  "--x",
  "-w-",
  "-wx",
  "r--",
  "r-x",
  "rw-",
  "rwx",
];

function applySpecialBit(triplet, isSet, specialChar) {
  if (!isSet) {
    return triplet;
  }
  const isExecutable = triplet[2] === "x";
  return triplet.slice(0, 2) +
    (isExecutable ? specialChar.toLowerCase() : specialChar.toUpperCase());
}

/**
 * Renders a Unix file mode as an ls-style permission string
 * @param {number|null} mode - The file mode reported by Deno.stat
 * @param {boolean} isDirectory - Whether the entry is a directory
 * @param {boolean} isSymlink - Whether the entry is a symbolic link
 * @returns {string} - A string such as "-rwxr-xr-x", or "" when unavailable
 */
export function formatPermissions(mode, isDirectory, isSymlink) {
  if (typeof mode !== "number") {
    return "";
  }
  const entryType = isSymlink ? "l" : isDirectory ? "d" : "-";
  const owner = applySpecialBit(
    PERMISSION_TRIPLETS[(mode >> 6) & 0o7],
    (mode & 0o4000) !== 0,
    "s",
  );
  const group = applySpecialBit(
    PERMISSION_TRIPLETS[(mode >> 3) & 0o7],
    (mode & 0o2000) !== 0,
    "s",
  );
  const others = applySpecialBit(
    PERMISSION_TRIPLETS[mode & 0o7],
    (mode & 0o1000) !== 0,
    "t",
  );
  return entryType + owner + group + others;
}

/**
 * Renders the permission bits of a file mode in octal notation
 * @param {number|null} mode - The file mode reported by Deno.stat
 * @returns {string} - A string such as "0755", or "" when unavailable
 */
export function formatOctalPermissions(mode) {
  if (typeof mode !== "number") {
    return "";
  }
  return (mode & 0o7777).toString(8).padStart(4, "0");
}

/**
 * Checks whether a file mode carries any executable bit
 * @param {number|null} mode - The file mode reported by Deno.stat
 * @returns {boolean} - True when the file is executable by someone
 */
export function isExecutableMode(mode) {
  return typeof mode === "number" && (mode & 0o111) !== 0;
}

const TIME_UNITS = [
  { limit: 60, seconds: 1, name: "second" },
  { limit: 3600, seconds: 60, name: "minute" },
  { limit: 86400, seconds: 3600, name: "hour" },
  { limit: 2592000, seconds: 86400, name: "day" },
  { limit: 31536000, seconds: 2592000, name: "month" },
  { limit: Infinity, seconds: 31536000, name: "year" },
];

/**
 * Formats a timestamp as a short relative age such as "3 days ago"
 * @param {Date|null} date - The timestamp to format
 * @returns {string} - The relative description, or "" when unavailable
 */
export function formatRelativeTime(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "";
  }
  const elapsedSeconds = Math.max(0, (Date.now() - date.getTime()) / 1000);
  if (elapsedSeconds < 45) {
    return "just now";
  }
  const unit = TIME_UNITS.find((candidate) => elapsedSeconds < candidate.limit);
  const value = Math.round(elapsedSeconds / unit.seconds);
  return `${value} ${unit.name}${value === 1 ? "" : "s"} ago`;
}

/**
 * Formats a timestamp as a sortable absolute date and time
 * @param {Date|null} date - The timestamp to format
 * @returns {string} - A string such as "2026-08-05 14:32", or "" when unavailable
 */
export function formatTimestamp(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "";
  }
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${
    pad(date.getDate())
  } ${pad(date.getHours())}:${pad(date.getMinutes())}`;
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
 * Checks if a file is a video based on its extension
 * @param {string} filename - The filename to check
 * @returns {boolean} - True if the file is a video
 */
export function isVideoFile(filename) {
  return EXTENSIONS_BY_KIND.video.includes(getFileExtension(filename));
}

/**
 * Checks if a file is an audio track based on its extension
 * @param {string} filename - The filename to check
 * @returns {boolean} - True if the file is audio
 */
export function isAudioFile(filename) {
  return EXTENSIONS_BY_KIND.audio.includes(getFileExtension(filename));
}

/**
 * Checks whether a file can be opened in the text viewer and editor
 * @param {string} filename - The filename to check
 * @returns {boolean} - True when the file is treated as text
 */
export function isTextFile(filename) {
  return !isBinaryFile(filename);
}
