import { icon } from "./icons.js";

/**
 * Renders the hidden search overlay that fuzzy finds files across the whole
 * served directory
 * @returns {string} - The palette markup
 */
export function renderSearchPalette() {
  return `<div class="search-overlay" id="search-overlay" hidden>
    <div class="search-panel" role="dialog" aria-modal="true" aria-label="Search files">
      <label class="search-input-row">
        ${icon("search")}
        <input type="text" class="search-input" placeholder="Search files and folders by name or path…" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Search files" data-search-input>
        <span class="search-status" data-search-status></span>
        <button type="button" class="icon-button" data-search-close aria-label="Close search">${
    icon("close")
  }</button>
      </label>
      <ul class="search-results" role="listbox" data-search-results></ul>
      <div class="search-footer">
        <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
        <span><kbd>Enter</kbd> open</span>
        <span><kbd>Shift</kbd>+<kbd>Enter</kbd> reveal in files</span>
        <span><kbd>Esc</kbd> close</span>
      </div>
    </div>
  </div>`;
}
