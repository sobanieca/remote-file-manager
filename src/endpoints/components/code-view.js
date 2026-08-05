import { escapeHtml, formatFileSize } from "../utils.js";
import { highlightToLines, resolveLanguage } from "../code-highlight.js";
import { icon } from "./icons.js";

const MAX_HIGHLIGHT_BYTES = 1_000_000;
const MAX_HIGHLIGHT_LINES = 20_000;

function renderLines(lines) {
  return lines
    .map((line, index) => {
      const lineNumber = index + 1;
      return `<tr class="code-line" id="L${lineNumber}"><td class="code-line-number"><a href="#L${lineNumber}" aria-label="Line ${lineNumber}">${lineNumber}</a></td><td class="code-line-content">${
        line || "​"
      }</td></tr>`;
    })
    .join("");
}

/**
 * Renders a syntax highlighted, line numbered view of source code
 * @param {string} filePath - The path of the file, used to pick a language
 * @param {string} content - The file contents
 * @param {number} byteSize - The size of the file on disk
 * @returns {string} - The code view markup
 */
export function renderCodeView(filePath, content, byteSize) {
  const rawLines = content.replace(/\n$/, "").split("\n");
  const isTooLarge = byteSize > MAX_HIGHLIGHT_BYTES ||
    rawLines.length > MAX_HIGHLIGHT_LINES;
  const language = isTooLarge ? null : resolveLanguage(filePath);
  const lines = isTooLarge
    ? rawLines.map((line) => escapeHtml(line))
    : highlightToLines(content.replace(/\n$/, ""), language);

  const languageLabel = language || "plain text";
  const highlightNotice = isTooLarge
    ? `<span class="code-notice" title="Syntax highlighting is disabled for very large files">${
      icon("info")
    }highlighting off</span>`
    : "";

  return `<div class="code-view" data-language="${escapeHtml(languageLabel)}">
    <div class="code-toolbar">
      <span class="code-language">${escapeHtml(languageLabel)}</span>
      <span class="code-meta">${lines.length} line${
    lines.length === 1 ? "" : "s"
  } · ${formatFileSize(byteSize)}</span>
      ${highlightNotice}
      <div class="code-toolbar-spacer"></div>
      <button type="button" class="button button-small button-ghost" data-command="toggle-wrap" title="Toggle line wrapping">${
    icon("wrap")
  }<span>Wrap</span></button>
      <button type="button" class="button button-small button-ghost" data-command="copy-code" title="Copy file contents">${
    icon("clipboard")
  }<span>Copy</span></button>
    </div>
    <div class="code-scroll">
      <table class="code-table"><tbody>${renderLines(lines)}</tbody></table>
    </div>
  </div>`;
}
