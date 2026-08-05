export const fileExplorerStyles = `
  body.is-explorer .main-container {
    padding-bottom: 16px;
  }
  .explorer {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .explorer-header {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
  }
  .panes {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
    align-items: start;
  }
  .explorer[data-split="true"] .panes {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: 900px) {
    .explorer[data-split="true"] .panes {
      grid-template-columns: 1fr;
    }
  }

  .pane {
    display: flex;
    flex-direction: column;
    min-width: 0;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background-color: var(--pane-bg);
    overflow: hidden;
  }
  .pane:focus {
    outline: none;
  }
  .explorer[data-split="true"] .pane.is-active {
    border-color: var(--selected-border);
    box-shadow: 0 0 0 1px var(--selected-border);
  }

  .pane-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-bottom: 1px solid var(--border-subtle);
    background-color: var(--panel-bg);
  }
  .pane-nav {
    display: flex;
    gap: 2px;
    flex-shrink: 0;
  }
  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 1px;
    flex: 1;
    min-width: 0;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .breadcrumb::-webkit-scrollbar {
    display: none;
  }
  .breadcrumb-item {
    display: inline-flex;
    align-items: center;
    padding: 3px 6px;
    border-radius: 4px;
    color: var(--link);
    text-decoration: none;
    font-size: 13px;
    white-space: nowrap;
  }
  .breadcrumb-item:hover {
    background-color: var(--panel-hover);
  }
  .breadcrumb-item.is-current {
    color: var(--heading);
    font-weight: 600;
  }
  .breadcrumb-home .icon {
    width: 14px;
    height: 14px;
  }
  .breadcrumb-separator {
    display: inline-flex;
    color: var(--muted);
    opacity: 0.6;
  }
  .breadcrumb-separator .icon {
    width: 12px;
    height: 12px;
  }
  .pane-filter {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background-color: var(--surface);
    flex-shrink: 0;
    max-width: 180px;
  }
  .pane-filter .icon {
    color: var(--muted);
    width: 14px;
    height: 14px;
  }
  .filter-input {
    width: 100%;
    min-width: 0;
    border: none;
    background: transparent;
    color: var(--text);
    font-family: inherit;
    font-size: 13px;
    outline: none;
  }

  .pane-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 10px;
    border-bottom: 1px solid var(--border-subtle);
    flex-wrap: wrap;
  }
  .pane-actions-spacer {
    flex: 1;
  }
  .explorer[data-split="true"] .pane-actions .button span:not(.icon) {
    display: none;
  }

  .selection-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-bottom: 1px solid var(--border-subtle);
    background-color: var(--selected-bg);
    flex-wrap: wrap;
  }
  .selection-bar[hidden] {
    display: none;
  }
  .selection-summary {
    font-size: 13px;
    font-weight: 600;
    color: var(--heading);
  }
  .selection-actions {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .pane-body {
    overflow-x: auto;
    max-height: calc(100vh - 300px);
    overflow-y: auto;
  }
  .file-list {
    min-width: 100%;
    width: max-content;
  }
  .explorer[data-split="true"] .file-list {
    width: 100%;
  }

  .file-list-header,
  .file-row {
    display: grid;
    grid-template-columns: 34px minmax(180px, 1fr) 88px 116px 128px 40px;
    align-items: center;
    gap: 4px;
  }
  .file-list-header {
    position: sticky;
    top: 0;
    z-index: 5;
    padding: 6px 8px;
    border-bottom: 1px solid var(--border);
    background-color: var(--panel-bg);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted);
  }
  /* Line the label up with the file names, which sit after their icon */
  .file-list-header .cell-name {
    padding-left: 30px;
  }
  .column-sort {
    display: flex;
    align-items: center;
    gap: 4px;
    border: none;
    background: transparent;
    padding: 0;
    color: inherit;
    font: inherit;
    text-transform: inherit;
    letter-spacing: inherit;
    cursor: pointer;
  }
  .column-sort:hover {
    color: var(--text);
  }
  .sort-indicator {
    width: 12px;
    height: 12px;
    opacity: 0;
  }
  .column-sort.is-sorted .sort-indicator {
    opacity: 1;
  }
  .column-sort.is-descending .sort-indicator {
    transform: rotate(180deg);
  }

  .file-row {
    padding: 4px 8px;
    border-bottom: 1px solid var(--border-subtle);
    color: var(--text);
  }
  .file-row:hover {
    background-color: var(--row-hover);
  }
  .file-row.is-selected {
    background-color: var(--selected-bg);
  }
  .file-row.is-focused {
    box-shadow: inset 2px 0 0 var(--selected-border);
  }
  .file-row[hidden] {
    display: none;
  }
  .file-row.is-broken .entry-link {
    color: var(--danger);
  }

  .cell {
    min-width: 0;
    font-size: 13px;
  }
  .cell-select {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  .cell-select input {
    margin: 0;
    cursor: pointer;
    accent-color: var(--primary);
  }
  .cell-name {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .entry-visual {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    flex-shrink: 0;
    color: var(--muted);
  }
  .entry-visual-folder,
  .is-directory .entry-visual {
    color: #e8ab30;
  }
  .entry-visual-code {
    color: var(--link);
  }
  .entry-visual-image,
  .entry-visual-video {
    color: #a371f7;
  }
  .entry-visual-archive {
    color: #d29922;
  }
  .is-executable .entry-visual {
    color: var(--executable-text);
  }
  .entry-thumbnail {
    width: 22px;
    height: 22px;
    object-fit: cover;
    border-radius: 3px;
    border: 1px solid var(--border);
  }
  .entry-link {
    color: var(--text);
    text-decoration: none;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .entry-link:hover {
    color: var(--link);
    text-decoration: underline;
  }
  .is-directory .entry-link {
    font-weight: 600;
  }
  .is-executable .entry-link {
    color: var(--executable-text);
    font-weight: 600;
  }
  .entry-deleted {
    color: var(--muted);
    text-decoration: line-through;
    opacity: 0.75;
  }
  .entry-badge {
    display: inline-flex;
    align-items: center;
    padding: 0 5px;
    height: 16px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    flex-shrink: 0;
  }
  .entry-badge-executable {
    background-color: var(--executable-bg);
    color: var(--executable-text);
  }
  .entry-badge-symlink {
    background-color: var(--symlink-bg);
    color: var(--symlink-text);
  }
  .cell-size,
  .cell-modified {
    color: var(--muted);
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }
  .cell-permissions code {
    font-size: 12px;
    color: var(--muted);
    white-space: nowrap;
  }
  .cell-actions {
    display: flex;
    justify-content: flex-end;
  }
  .entry-menu {
    position: relative;
  }
  .entry-menu-trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    padding: 0;
    border: none;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--muted);
    cursor: pointer;
    opacity: 0;
  }
  .file-row:hover .entry-menu-trigger,
  .entry-menu.is-open .entry-menu-trigger,
  .entry-menu-trigger:focus-visible {
    opacity: 1;
  }
  .entry-menu-trigger:hover {
    background-color: var(--panel-hover);
    color: var(--text);
  }

  .git-status {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 700;
    font-family: var(--font-mono);
    flex-shrink: 0;
  }
  .git-added {
    background-color: var(--success-bg);
    color: var(--success-text);
  }
  .git-modified {
    background-color: var(--warning-bg);
    color: var(--warning-text);
  }
  .git-deleted {
    background-color: var(--error-bg);
    color: var(--error-text);
  }
  .git-renamed {
    background-color: var(--notice-bg);
    color: var(--notice-text);
  }

  .pane-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 48px 20px;
    color: var(--muted);
  }
  .pane-empty .icon {
    width: 28px;
    height: 28px;
    opacity: 0.6;
  }
  .pane-empty p {
    margin: 0;
    font-size: 13px;
  }
  .pane-no-matches {
    padding: 32px 20px;
    text-align: center;
    color: var(--muted);
    font-size: 13px;
  }
  .pane-no-matches[hidden] {
    display: none;
  }

  .pane-status {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 7px 12px;
    border-top: 1px solid var(--border-subtle);
    background-color: var(--panel-bg);
    color: var(--muted);
    font-size: 12px;
  }
  .pane-status-selection {
    color: var(--heading);
    font-weight: 600;
  }

  .file-list.is-grid .file-list-header {
    display: none;
  }
  .file-list.is-grid .file-rows {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
    gap: 8px;
    padding: 12px;
  }
  .file-list.is-grid .file-row {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 12px 8px;
    border: 1px solid transparent;
    border-radius: var(--radius);
    text-align: center;
    position: relative;
  }
  .file-list.is-grid .file-row:hover {
    border-color: var(--border);
  }
  .file-list.is-grid .file-row.is-selected {
    border-color: var(--selected-border);
  }
  .file-list.is-grid .cell-name {
    flex-direction: column;
    gap: 6px;
    width: 100%;
  }
  .file-list.is-grid .entry-visual {
    width: 52px;
    height: 52px;
  }
  .file-list.is-grid .entry-visual .icon {
    width: 34px;
    height: 34px;
  }
  .file-list.is-grid .entry-thumbnail {
    width: 64px;
    height: 64px;
  }
  .file-list.is-grid .entry-link {
    white-space: normal;
    overflow-wrap: anywhere;
    font-size: 12px;
    line-height: 1.35;
    max-height: 2.7em;
    overflow: hidden;
  }
  .file-list.is-grid .cell-permissions,
  .file-list.is-grid .cell-modified {
    display: none;
  }
  .file-list.is-grid .cell-size {
    font-size: 11px;
  }
  .file-list.is-grid .cell-select {
    position: absolute;
    top: 6px;
    left: 6px;
  }
  .file-list.is-grid .cell-actions {
    position: absolute;
    top: 4px;
    right: 4px;
  }

  .command-bar {
    display: flex;
    gap: 4px;
    padding: 6px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background-color: var(--panel-bg);
    overflow-x: auto;
  }
  .command-button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border: none;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--text);
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
  }
  .command-button:hover {
    background-color: var(--panel-hover);
  }
  .command-button .icon {
    color: var(--muted);
  }
  .command-button.is-danger {
    color: var(--danger);
  }
  .command-button.is-danger .icon {
    color: var(--danger);
  }
  .command-button.is-danger:hover {
    background-color: var(--error-bg);
  }
  .explorer[data-split="false"] .is-split-only,
  .explorer[data-split="false"] [data-split-only="true"] {
    display: none;
  }
  @media (max-width: 640px) {
    .command-button span {
      display: none;
    }
    .command-button {
      flex: 1;
      justify-content: center;
    }
    /* Fit the listing to the viewport so the header cells stay above their
       column instead of scrolling off to the side with long file names */
    .file-list {
      width: 100%;
      min-width: 0;
    }
    .file-list-header,
    .file-row {
      grid-template-columns: 30px minmax(0, 1fr) 68px 34px;
    }
    .cell-permissions,
    .cell-modified {
      display: none;
    }
    /* Let the page scroll as one instead of nesting a scroll area. Both axes
       must be set, a lone visible value computes back to auto. */
    .pane-body {
      max-height: none;
      overflow: visible;
    }
    /* The pane clips its overflow, which would anchor a sticky header to the
       pane rather than the viewport */
    .file-list-header {
      position: static;
    }
    .pane-toolbar {
      flex-wrap: wrap;
    }
    .pane-filter {
      order: 3;
      width: 100%;
      max-width: none;
    }
  }
`;
