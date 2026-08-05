import { Prism } from "../deps.js";
import { escapeHtml, getFileExtension } from "./utils.js";

const LANGUAGE_BY_EXTENSION = {
  ".js": "javascript",
  ".mjs": "javascript",
  ".cjs": "javascript",
  ".jsx": "jsx",
  ".ts": "typescript",
  ".mts": "typescript",
  ".cts": "typescript",
  ".tsx": "tsx",
  ".json": "json",
  ".jsonc": "json",
  ".html": "markup",
  ".htm": "markup",
  ".xml": "markup",
  ".svg": "markup",
  ".vue": "markup",
  ".css": "css",
  ".scss": "scss",
  ".sass": "scss",
  ".md": "markdown",
  ".markdown": "markdown",
  ".yml": "yaml",
  ".yaml": "yaml",
  ".sh": "bash",
  ".bash": "bash",
  ".zsh": "bash",
  ".py": "python",
  ".go": "go",
  ".rs": "rust",
  ".java": "java",
  ".cs": "csharp",
  ".c": "c",
  ".h": "c",
  ".cpp": "cpp",
  ".cc": "cpp",
  ".cxx": "cpp",
  ".hpp": "cpp",
  ".php": "php",
  ".rb": "ruby",
  ".sql": "sql",
  ".toml": "toml",
  ".ini": "ini",
  ".cfg": "ini",
  ".conf": "ini",
};

const LANGUAGE_BY_FILENAME = {
  "dockerfile": "docker",
  "containerfile": "docker",
  ".gitignore": "bash",
  ".env": "bash",
};

/**
 * Determines the Prism language used to highlight a file
 * @param {string} filePath - The path of the file being highlighted
 * @returns {string|null} - The language name, or null when unsupported
 */
export function resolveLanguage(filePath) {
  const fileName = filePath.substring(filePath.lastIndexOf("/") + 1)
    .toLowerCase();
  return LANGUAGE_BY_FILENAME[fileName] ||
    LANGUAGE_BY_EXTENSION[getFileExtension(fileName)] || null;
}

function collectSegments(tokens, classNames, segments) {
  for (const token of tokens) {
    if (typeof token === "string") {
      segments.push({ text: token, classNames });
      continue;
    }
    const aliases = token.alias
      ? (Array.isArray(token.alias) ? token.alias : [token.alias])
      : [];
    const tokenClassNames = [...classNames, "token", token.type, ...aliases];
    if (typeof token.content === "string") {
      segments.push({ text: token.content, classNames: tokenClassNames });
    } else if (Array.isArray(token.content)) {
      collectSegments(token.content, tokenClassNames, segments);
    } else {
      collectSegments([token.content], tokenClassNames, segments);
    }
  }
}

function tokenizeToSegments(code, language) {
  const grammar = language ? Prism.languages[language] : null;
  if (!grammar) {
    return [{ text: code, classNames: [] }];
  }
  try {
    const segments = [];
    collectSegments(Prism.tokenize(code, grammar), [], segments);
    return segments;
  } catch (_error) {
    return [{ text: code, classNames: [] }];
  }
}

function renderSegment(text, classNames) {
  if (text.length === 0) {
    return "";
  }
  const escaped = escapeHtml(text);
  if (classNames.length === 0) {
    return escaped;
  }
  return `<span class="${classNames.join(" ")}">${escaped}</span>`;
}

/**
 * Highlights source code and splits the result into one HTML string per line
 * @param {string} code - The source code to highlight
 * @param {string|null} language - The Prism language name
 * @returns {string[]} - Highlighted HTML for each line
 */
export function highlightToLines(code, language) {
  const lines = [];
  let currentLine = "";

  for (const segment of tokenizeToSegments(code, language)) {
    const parts = segment.text.split("\n");
    for (let index = 0; index < parts.length; index++) {
      if (index > 0) {
        lines.push(currentLine);
        currentLine = "";
      }
      currentLine += renderSegment(parts[index], segment.classNames);
    }
  }

  lines.push(currentLine);
  return lines;
}

/**
 * Highlights a single line of source code
 * @param {string} code - The line to highlight
 * @param {string|null} language - The Prism language name
 * @returns {string} - The highlighted HTML
 */
export function highlightLine(code, language) {
  return highlightToLines(code, language)[0] || "";
}
