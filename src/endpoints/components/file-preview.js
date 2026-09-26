import { markdownCss, renderMarkdown } from "../../deps.js";
import { MarkdownLinkRenderer } from "../markdown-link-renderer.js";
import {
  escapeHtml,
  getFileExtension,
  getParentPath,
  isAudioFile,
  isVideoFile,
  stripFrontmatter,
  toUrlPath,
} from "../utils.js";

const HTML_EXTENSIONS = [".html", ".htm"];

/**
 * Resolves which inline preview a text file supports
 * @param {object} entry - The entry descriptor
 * @returns {string|null} - "markdown", "html" or null when not previewable
 */
export function getTextPreviewKind(entry) {
  if (entry.isMarkdown) {
    return "markdown";
  }
  if (HTML_EXTENSIONS.includes(getFileExtension(entry.name))) {
    return "html";
  }
  return null;
}

/**
 * Resolves which media player a binary file can be shown with
 * @param {object} entry - The entry descriptor
 * @returns {string|null} - "video", "audio", "pdf" or null
 */
export function getMediaPreviewKind(entry) {
  if (isVideoFile(entry.name)) {
    return "video";
  }
  if (isAudioFile(entry.name)) {
    return "audio";
  }
  if (getFileExtension(entry.name) === ".pdf") {
    return "pdf";
  }
  return null;
}

function renderRawFrame(entry) {
  return `<iframe class="preview-frame" data-src="/${
    toUrlPath(entry.path)
  }" title="${escapeHtml(entry.name)}"></iframe>`;
}

/**
 * Renders the preview shown in place of the source view of a text file
 * @param {object} entry - The entry descriptor
 * @param {string} fileContent - The file contents
 * @returns {string} - The preview markup, empty when unsupported
 */
export function renderTextPreview(entry, fileContent) {
  const previewKind = getTextPreviewKind(entry);
  if (previewKind === "markdown") {
    const renderedHtml = renderMarkdown(stripFrontmatter(fileContent), {
      renderer: new MarkdownLinkRenderer(getParentPath(entry.path)),
    });
    return `<style>${markdownCss}</style>
      <div class="markdown-body" data-color-mode="auto" data-light-theme="light" data-dark-theme="dark">${renderedHtml}</div>`;
  }
  if (previewKind === "html") {
    return renderRawFrame(entry);
  }
  return "";
}

/**
 * Renders a media player for video, audio and PDF files
 * @param {object} entry - The entry descriptor
 * @returns {string} - The player markup, empty when unsupported
 */
export function renderMediaPreview(entry) {
  const previewKind = getMediaPreviewKind(entry);
  const source = `/${toUrlPath(entry.path)}`;
  if (previewKind === "video") {
    return `<div class="preview-panel preview-media">
      <video class="video-preview" controls preload="metadata" src="${source}"></video>
    </div>`;
  }
  if (previewKind === "audio") {
    return `<div class="preview-panel preview-media">
      <audio class="audio-preview" controls preload="metadata" src="${source}"></audio>
    </div>`;
  }
  if (previewKind === "pdf") {
    return `<div class="preview-panel preview-document">
      <iframe class="preview-frame" src="${source}" title="${
      escapeHtml(entry.name)
    }"></iframe>
    </div>`;
  }
  return "";
}
