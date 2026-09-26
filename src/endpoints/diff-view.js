import { escapeHtml } from "./utils.js";
import { highlightLine, resolveLanguage } from "./code-highlight.js";
import { icon } from "./components/icons.js";

function createFile(path) {
  return {
    path,
    originalPath: null,
    status: "modified",
    isBinary: false,
    hunks: [],
    added: 0,
    removed: 0,
  };
}

function parseHunkHeader(line) {
  const match = line.match(/^@@+ (-(\d+)(?:,\d+)? \+(\d+)(?:,\d+)?) @@+(.*)$/);
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

function parseGitHeaderPaths(line) {
  const match = line.match(/^diff --git a\/(.+) b\/(.+)$/);
  return match ? { original: match[1], target: match[2] } : null;
}

/**
 * Parses a unified diff into per-file hunks
 * @param {string} diffText - The raw diff produced by git
 * @returns {object[]} - One descriptor per changed file
 */
export function parseDiff(diffText) {
  const files = [];
  let currentFile = null;
  let currentHunk = null;
  let oldLineNumber = 0;
  let newLineNumber = 0;

  for (const line of diffText.replace(/\n$/, "").split("\n")) {
    const headerPaths = parseGitHeaderPaths(line);
    if (headerPaths) {
      currentFile = createFile(headerPaths.target);
      currentFile.originalPath = headerPaths.original !== headerPaths.target
        ? headerPaths.original
        : null;
      currentHunk = null;
      files.push(currentFile);
      continue;
    }
    if (!currentFile) {
      continue;
    }
    if (line.startsWith("new file mode")) {
      currentFile.status = "added";
      continue;
    }
    if (line.startsWith("deleted file mode")) {
      currentFile.status = "deleted";
      continue;
    }
    if (line.startsWith("rename from ")) {
      currentFile.status = "renamed";
      currentFile.originalPath = line.substring("rename from ".length);
      continue;
    }
    if (line.startsWith("rename to ")) {
      currentFile.status = "renamed";
      currentFile.path = line.substring("rename to ".length);
      continue;
    }
    if (line.startsWith("Binary files ") || line.startsWith("GIT binary ")) {
      currentFile.isBinary = true;
      continue;
    }
    if (line.startsWith("--- ") || line.startsWith("+++ ")) {
      const path = line.substring(4);
      if (path !== "/dev/null") {
        const stripped = path.replace(/^[ab]\//, "");
        if (line.startsWith("+++ ")) {
          currentFile.path = stripped;
        }
      }
      continue;
    }

    const hunkHeader = parseHunkHeader(line);
    if (hunkHeader) {
      currentHunk = {
        range: hunkHeader.range,
        heading: hunkHeader.heading,
        lines: [],
      };
      currentFile.hunks.push(currentHunk);
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
      currentFile.added++;
    } else if (marker === "-") {
      currentHunk.lines.push({
        type: "removed",
        content,
        oldLineNumber: oldLineNumber++,
      });
      currentFile.removed++;
    } else if (marker === " " || line === "") {
      currentHunk.lines.push({
        type: "context",
        content,
        oldLineNumber: oldLineNumber++,
        newLineNumber: newLineNumber++,
      });
    }
  }

  return files;
}

const MARKERS = { added: "+", removed: "-", context: " " };

function renderUnifiedRow(line, language) {
  if (line.type === "note") {
    return `<tr class="diff-row diff-note"><td class="diff-gutter"></td><td class="diff-gutter"></td><td class="diff-content">${
      escapeHtml(line.content)
    }</td></tr>`;
  }
  return `<tr class="diff-row diff-${line.type}"><td class="diff-gutter">${
    line.oldLineNumber || ""
  }</td><td class="diff-gutter">${
    line.newLineNumber || ""
  }</td><td class="diff-content"><span class="diff-marker">${
    MARKERS[line.type]
  }</span><span class="diff-code">${
    highlightLine(line.content, language)
  }</span></td></tr>`;
}

function renderUnifiedHunk(hunk, language) {
  const headingHtml = hunk.heading
    ? ` <span class="diff-hunk-heading">${escapeHtml(hunk.heading)}</span>`
    : "";
  const hunkRow =
    `<tr class="diff-row diff-hunk"><td class="diff-gutter diff-hunk-gutter" colspan="2">⋯</td><td class="diff-content">@@ ${
      escapeHtml(hunk.range)
    } @@${headingHtml}</td></tr>`;
  return hunkRow +
    hunk.lines.map((line) => renderUnifiedRow(line, language)).join("");
}

// Turns a sequence of hunk lines into left/right pairs for side-by-side display
function pairHunkLines(lines) {
  const pairs = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (line.type === "context" || line.type === "note") {
      pairs.push({ left: line, right: line });
      index++;
      continue;
    }

    const removed = [];
    const added = [];
    while (index < lines.length && lines[index].type === "removed") {
      removed.push(lines[index++]);
    }
    while (index < lines.length && lines[index].type === "added") {
      added.push(lines[index++]);
    }
    const pairCount = Math.max(removed.length, added.length);
    for (let offset = 0; offset < pairCount; offset++) {
      pairs.push({
        left: removed[offset] || null,
        right: added[offset] || null,
      });
    }
  }

  return pairs;
}

function renderSplitCell(line, side, language) {
  if (!line) {
    return `<td class="diff-gutter"></td><td class="diff-content diff-empty-cell"></td>`;
  }
  if (line.type === "note") {
    return `<td class="diff-gutter"></td><td class="diff-content diff-note">${
      escapeHtml(line.content)
    }</td>`;
  }
  const lineNumber = side === "left" ? line.oldLineNumber : line.newLineNumber;
  return `<td class="diff-gutter">${
    lineNumber || ""
  }</td><td class="diff-content diff-${line.type}"><span class="diff-code">${
    highlightLine(line.content, language)
  }</span></td>`;
}

function renderSplitHunk(hunk, language) {
  const headingHtml = hunk.heading
    ? ` <span class="diff-hunk-heading">${escapeHtml(hunk.heading)}</span>`
    : "";
  const hunkRow =
    `<tr class="diff-row diff-hunk"><td class="diff-gutter diff-hunk-gutter">⋯</td><td class="diff-content">@@ ${
      escapeHtml(hunk.range)
    } @@${headingHtml}</td><td class="diff-gutter diff-hunk-gutter">⋯</td><td class="diff-content"></td></tr>`;
  const rows = pairHunkLines(hunk.lines)
    .map((pair) =>
      `<tr class="diff-row">${renderSplitCell(pair.left, "left", language)}${
        renderSplitCell(pair.right, "right", language)
      }</tr>`
    )
    .join("");
  return hunkRow + rows;
}

const STATUS_LABELS = {
  added: "added",
  deleted: "deleted",
  renamed: "renamed",
  modified: "modified",
};

function renderFileBody(file, language) {
  if (file.isBinary) {
    return `<div class="diff-empty">Binary file — no textual diff to show.</div>`;
  }
  if (file.hunks.length === 0) {
    return `<div class="diff-empty">No changes to show for this file.</div>`;
  }
  const unifiedRows = file.hunks
    .map((hunk) => renderUnifiedHunk(hunk, language))
    .join("");
  const splitRows = file.hunks
    .map((hunk) => renderSplitHunk(hunk, language))
    .join("");
  return `<div class="diff-scroll diff-mode-unified">
      <table class="diff-table"><tbody>${unifiedRows}</tbody></table>
    </div>
    <div class="diff-scroll diff-mode-split">
      <table class="diff-table diff-table-split"><tbody>${splitRows}</tbody></table>
    </div>`;
}

function resolveServedPath(file, options) {
  if (!options.linkToFiles || file.status === "deleted") {
    return null;
  }
  return options.resolvePath ? options.resolvePath(file.path) : file.path;
}

function renderFile(file, options) {
  const language = resolveLanguage(file.path);
  const renamedFrom = file.originalPath
    ? `<span class="diff-file-rename">${escapeHtml(file.originalPath)} ${
      icon("arrow-right")
    }</span>`
    : "";
  const servedPath = resolveServedPath(file, options);
  const viewLink = servedPath
    ? `<a class="diff-file-link" href="/view-file?path=${
      encodeURIComponent(servedPath)
    }" title="Open file">${icon("eye")}</a>`
    : "";

  return `<section class="diff-file" data-path="${escapeHtml(file.path)}">
    <header class="diff-file-header">
      <button type="button" class="diff-file-toggle" aria-expanded="true">${
    icon("chevron-down")
  }</button>
      <span class="diff-file-status diff-status-${file.status}">${
    STATUS_LABELS[file.status]
  }</span>
      <span class="diff-file-path">${renamedFrom}${escapeHtml(file.path)}</span>
      <span class="diff-file-stats">
        <span class="diff-stat diff-stat-added">+${file.added}</span>
        <span class="diff-stat diff-stat-removed">-${file.removed}</span>
      </span>
      ${viewLink}
    </header>
    <div class="diff-file-body">${renderFileBody(file, language)}</div>
  </section>`;
}

/**
 * Renders a complete diff, with unified and side-by-side layouts
 * @param {string} diffText - The raw diff produced by git
 * @param {object} options - Rendering options: linkToFiles adds a link to
 *   every file, resolvePath maps a diff path to the served path for that link
 * @returns {string} - The diff markup
 */
export function diffView(diffText, options = {}) {
  const files = parseDiff(diffText);

  if (files.length === 0) {
    return `<div class="diff-empty">No changes to show.</div>`;
  }

  const totals = files.reduce(
    (sum, file) => ({
      added: sum.added + file.added,
      removed: sum.removed + file.removed,
    }),
    { added: 0, removed: 0 },
  );

  const fileCountLabel = `${files.length} file${
    files.length === 1 ? "" : "s"
  } changed`;

  return `<div class="diff-container" data-diff-mode="unified">
    <div class="diff-toolbar">
      <span class="diff-summary-text">${fileCountLabel}</span>
      <span class="diff-stat diff-stat-added">+${totals.added}</span>
      <span class="diff-stat diff-stat-removed">-${totals.removed}</span>
      <div class="diff-toolbar-spacer"></div>
      <div class="segmented" role="group" aria-label="Diff layout">
        <button type="button" class="segmented-option is-active" data-diff-layout="unified" title="Unified view">${
    icon("list")
  }<span>Unified</span></button>
        <button type="button" class="segmented-option" data-diff-layout="split" title="Side by side view">${
    icon("columns")
  }<span>Split</span></button>
      </div>
    </div>
    ${files.map((file) => renderFile(file, options)).join("")}
  </div>`;
}
