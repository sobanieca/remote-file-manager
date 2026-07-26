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

function resolveLanguage(filePath) {
  const fileName = filePath.substring(filePath.lastIndexOf("/") + 1)
    .toLowerCase();
  return LANGUAGE_BY_FILENAME[fileName] ||
    LANGUAGE_BY_EXTENSION[getFileExtension(fileName)] || null;
}

function highlightLine(code, language) {
  const grammar = language ? Prism.languages[language] : null;
  if (!grammar) {
    return escapeHtml(code);
  }
  try {
    return Prism.highlight(code, grammar, language);
  } catch (_error) {
    return escapeHtml(code);
  }
}

function parseHunkHeader(line) {
  const match = line.match(
    /^@@ (-(\d+)(?:,\d+)? \+(\d+)(?:,\d+)?) @@(.*)$/,
  );
  if (!match) {
    return null;
  }
  return {
    range: match[1],
    oldLineNumber: parseInt(match[2], 10),
    newLineNumber: parseInt(match[3], 10),
    heading: match[4].trim(),
  };
}

function parseDiff(diffText) {
  const hunks = [];
  let currentHunk = null;
  let oldLineNumber = 0;
  let newLineNumber = 0;
  let isBinary = false;

  for (const line of diffText.replace(/\n$/, "").split("\n")) {
    if (line.startsWith("Binary files ") || line.startsWith("GIT binary ")) {
      isBinary = true;
      continue;
    }
    const hunkHeader = parseHunkHeader(line);
    if (hunkHeader) {
      currentHunk = {
        range: hunkHeader.range,
        heading: hunkHeader.heading,
        lines: [],
      };
      hunks.push(currentHunk);
      oldLineNumber = hunkHeader.oldLineNumber;
      newLineNumber = hunkHeader.newLineNumber;
      continue;
    }
    if (!currentHunk) {
      continue;
    }
    if (line.startsWith("\\")) {
      currentHunk.lines.push({ type: "note", content: line.substring(2) });
      continue;
    }
    const marker = line.charAt(0);
    const content = line.substring(1);
    if (marker === "+") {
      currentHunk.lines.push({
        type: "added",
        content,
        newLineNumber: newLineNumber++,
      });
    } else if (marker === "-") {
      currentHunk.lines.push({
        type: "removed",
        content,
        oldLineNumber: oldLineNumber++,
      });
    } else if (marker === " " || line === "") {
      currentHunk.lines.push({
        type: "context",
        content,
        oldLineNumber: oldLineNumber++,
        newLineNumber: newLineNumber++,
      });
    }
  }

  return { hunks, isBinary };
}

const MARKERS = {
  added: "+",
  removed: "-",
  context: " ",
};

function renderLineRow(line, language) {
  if (line.type === "note") {
    return `<tr class="diff-row diff-note">
      <td class="diff-gutter"></td>
      <td class="diff-gutter"></td>
      <td class="diff-content">${escapeHtml(line.content)}</td>
    </tr>`;
  }
  return `<tr class="diff-row diff-${line.type}">
    <td class="diff-gutter">${line.oldLineNumber || ""}</td>
    <td class="diff-gutter">${line.newLineNumber || ""}</td>
    <td class="diff-content"><span class="diff-marker">${
    MARKERS[line.type]
  }</span><span class="diff-code">${
    highlightLine(line.content, language)
  }</span></td>
  </tr>`;
}

function renderHunk(hunk, language) {
  const headingHtml = hunk.heading
    ? ` <span class="diff-hunk-heading">${escapeHtml(hunk.heading)}</span>`
    : "";
  const hunkRow = `<tr class="diff-row diff-hunk">
    <td class="diff-gutter diff-hunk-gutter" colspan="2">⋯</td>
    <td class="diff-content">@@ ${escapeHtml(hunk.range)} @@${headingHtml}</td>
  </tr>`;
  const lineRows = hunk.lines
    .map((line) => renderLineRow(line, language))
    .join("");
  return hunkRow + lineRows;
}

export function diffView(filePath, diffText) {
  const { hunks, isBinary } = parseDiff(diffText);

  if (isBinary) {
    return `<div class="diff-empty">This is a binary file, no diff to show.</div>`;
  }
  if (hunks.length === 0) {
    return `<div class="diff-empty">No changes to show for this file.</div>`;
  }

  const language = resolveLanguage(filePath);
  let addedCount = 0;
  let removedCount = 0;
  for (const hunk of hunks) {
    for (const line of hunk.lines) {
      if (line.type === "added") addedCount++;
      if (line.type === "removed") removedCount++;
    }
  }

  const rows = hunks.map((hunk) => renderHunk(hunk, language)).join("");

  return `<div class="diff-container">
    <div class="diff-summary">
      <span class="diff-language">${language || "text"}</span>
      <span class="diff-stat diff-stat-added">+${addedCount}</span>
      <span class="diff-stat diff-stat-removed">-${removedCount}</span>
    </div>
    <div class="diff-scroll">
      <table class="diff-table">
        <tbody>${rows}</tbody>
      </table>
    </div>
  </div>`;
}
