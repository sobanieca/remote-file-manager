import { escapeHtml } from "../utils.js";
import { icon } from "./icons.js";

/**
 * Renders the clickable path trail for a pane
 * @param {string} directoryPath - The normalized directory path
 * @returns {string} - The breadcrumb markup
 */
export function renderBreadcrumb(directoryPath) {
  const segments = directoryPath === "." ? [] : directoryPath.split("/").filter(
    Boolean,
  );

  let currentPath = "";
  const crumbs = segments.map((segment, index) => {
    currentPath = currentPath ? `${currentPath}/${segment}` : segment;
    const isLast = index === segments.length - 1;
    return `<span class="breadcrumb-separator">${
      icon("chevron-right")
    }</span><a class="breadcrumb-item${
      isLast ? " is-current" : ""
    }" href="/file-explorer?path=${
      encodeURIComponent(currentPath)
    }" data-navigate="${escapeHtml(currentPath)}">${escapeHtml(segment)}</a>`;
  }).join("");

  return `<nav class="breadcrumb" aria-label="Path">
    <a class="breadcrumb-item breadcrumb-home${
    segments.length === 0 ? " is-current" : ""
  }" href="/file-explorer?path=." data-navigate="." title="Root">${
    icon("home")
  }</a>${crumbs}
  </nav>`;
}
