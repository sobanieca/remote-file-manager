export const diffStyles = `
  .diff-container {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background-color: var(--surface);
    overflow: hidden;
  }
  .diff-toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    background-color: var(--panel-bg);
    border-bottom: 1px solid var(--border);
    font-size: 13px;
    flex-wrap: wrap;
    position: sticky;
    top: var(--app-bar-offset, var(--app-bar-height));
    z-index: 50;
  }
  .diff-toolbar-spacer {
    flex: 1;
  }
  .diff-summary-text {
    font-weight: 600;
    color: var(--heading);
  }
  .diff-stat {
    font-family: var(--font-mono);
    font-weight: 600;
    font-size: 12px;
  }
  .diff-stat-added {
    color: var(--success-text);
  }
  .diff-stat-removed {
    color: var(--error-text);
  }

  .diff-file {
    border-bottom: 1px solid var(--border);
  }
  .diff-file:last-child {
    border-bottom: none;
  }
  .diff-file-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background-color: var(--panel-bg);
    border-bottom: 1px solid var(--border-subtle);
    position: sticky;
    top: calc(var(--app-bar-offset, var(--app-bar-height)) + 37px);
    z-index: 40;
  }
  .diff-file-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    padding: 0;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--muted);
    cursor: pointer;
  }
  .diff-file-toggle:hover {
    background-color: var(--panel-hover);
  }
  .diff-file-toggle[aria-expanded="false"] .icon {
    transform: rotate(-90deg);
  }
  .diff-file-status {
    padding: 1px 7px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }
  .diff-status-added {
    background-color: var(--success-bg);
    color: var(--success-text);
  }
  .diff-status-modified {
    background-color: var(--warning-bg);
    color: var(--warning-text);
  }
  .diff-status-deleted {
    background-color: var(--error-bg);
    color: var(--error-text);
  }
  .diff-status-renamed {
    background-color: var(--notice-bg);
    color: var(--notice-text);
  }
  .diff-file-path {
    flex: 1;
    min-width: 0;
    font-family: var(--font-mono);
    font-size: 12.5px;
    color: var(--heading);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .diff-file-rename {
    color: var(--muted);
  }
  .diff-file-rename .icon {
    display: inline-block;
    width: 12px;
    height: 12px;
    vertical-align: -2px;
    margin: 0 2px;
  }
  .diff-file-stats {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
  }
  .diff-file-link {
    display: flex;
    color: var(--muted);
    flex-shrink: 0;
  }
  .diff-file-link:hover {
    color: var(--link);
  }
  .diff-file.is-collapsed .diff-file-body {
    display: none;
  }

  .diff-scroll {
    overflow-x: auto;
  }
  .diff-container[data-diff-mode="unified"] .diff-mode-split,
  .diff-container[data-diff-mode="split"] .diff-mode-unified {
    display: none;
  }
  @media (max-width: 800px) {
    .diff-container[data-diff-mode="split"] .diff-mode-split {
      display: none;
    }
    .diff-container[data-diff-mode="split"] .diff-mode-unified {
      display: block;
    }
  }
  .diff-table {
    width: 100%;
    border-collapse: collapse;
    font-family: var(--font-mono);
    font-size: 12.5px;
    line-height: 1.5;
  }
  .diff-table-split {
    table-layout: fixed;
  }
  .diff-table-split .diff-content {
    width: 50%;
    overflow: hidden;
  }
  .diff-gutter {
    width: 1%;
    min-width: 44px;
    padding: 0 8px;
    text-align: right;
    vertical-align: top;
    user-select: none;
    color: var(--diff-hunk-text);
    background-color: var(--panel-bg);
    border-right: 1px solid var(--border-subtle);
    white-space: nowrap;
  }
  .diff-content {
    padding: 0 10px 0 4px;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    vertical-align: top;
    tab-size: 2;
  }
  .diff-marker {
    display: inline-block;
    width: 12px;
    color: var(--diff-hunk-text);
    user-select: none;
  }
  .diff-row.diff-added,
  .diff-content.diff-added {
    background-color: var(--diff-add-bg);
  }
  .diff-row.diff-added .diff-gutter {
    background-color: var(--diff-add-gutter-bg);
  }
  .diff-row.diff-removed,
  .diff-content.diff-removed {
    background-color: var(--diff-remove-bg);
  }
  .diff-row.diff-removed .diff-gutter {
    background-color: var(--diff-remove-gutter-bg);
  }
  .diff-hunk {
    background-color: var(--diff-hunk-bg);
    color: var(--diff-hunk-text);
  }
  .diff-hunk .diff-content {
    font-size: 12px;
  }
  .diff-hunk-gutter {
    text-align: center;
  }
  .diff-hunk-heading {
    color: var(--muted);
  }
  .diff-note {
    color: var(--muted);
    font-style: italic;
  }
  .diff-empty-cell {
    background-color: var(--panel-bg);
    opacity: 0.5;
  }
  .diff-empty {
    padding: 32px 20px;
    text-align: center;
    color: var(--muted);
    font-size: 13px;
  }
`;
