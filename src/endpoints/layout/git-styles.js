export const gitStyles = `
  .git-group {
    margin-bottom: 20px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
  }
  .git-group-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    background-color: var(--panel-bg);
    border-bottom: 1px solid var(--border-subtle);
  }
  .git-group-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    border-radius: 999px;
    background-color: var(--surface);
    border: 1px solid var(--border);
    font-size: 11px;
    font-weight: 600;
    color: var(--muted);
  }
  .git-group-spacer {
    flex: 1;
  }
  .git-clean {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 14px 16px;
    margin-bottom: 20px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background-color: var(--success-bg);
    color: var(--success-text);
    font-weight: 500;
  }

  .change-list,
  .commit-list,
  .log-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .change-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px 14px;
    border-bottom: 1px solid var(--border-subtle);
    font-size: 13px;
  }
  .change-row:last-child {
    border-bottom: none;
  }
  .change-row:hover {
    background-color: var(--row-hover);
  }
  .change-status {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 20px;
    padding: 0 5px;
    border-radius: 4px;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 700;
    white-space: pre;
    flex-shrink: 0;
  }
  .change-added {
    background-color: var(--success-bg);
    color: var(--success-text);
  }
  .change-modified {
    background-color: var(--warning-bg);
    color: var(--warning-text);
  }
  .change-deleted {
    background-color: var(--error-bg);
    color: var(--error-text);
  }
  .change-renamed {
    background-color: var(--notice-bg);
    color: var(--notice-text);
  }
  .change-path {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: var(--font-mono);
    font-size: 12.5px;
    color: var(--text);
    text-decoration: none;
  }
  a.change-path:hover {
    color: var(--link);
    text-decoration: underline;
  }
  .change-rename {
    color: var(--muted);
  }
  .change-rename .icon {
    display: inline-block;
    width: 12px;
    height: 12px;
    vertical-align: -2px;
    margin: 0 2px;
  }
  .change-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }
  .change-binary {
    font-size: 11px;
    color: var(--muted);
  }

  .commit-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 14px;
    border-bottom: 1px solid var(--border-subtle);
    font-size: 13px;
  }
  .commit-row:last-child {
    border-bottom: none;
  }
  .commit-hash {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--link);
    text-decoration: none;
    flex-shrink: 0;
  }
  .commit-subject {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .commit-meta {
    color: var(--muted);
    font-size: 12px;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .commit-ref {
    display: inline-flex;
    align-items: center;
    margin-left: 6px;
    padding: 0 6px;
    height: 17px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background-color: var(--panel-bg);
    font-size: 10px;
    font-weight: 600;
    color: var(--muted);
  }
  .commit-ref.is-head {
    border-color: var(--primary);
    color: var(--primary);
  }

  .compare-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    margin-bottom: 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background-color: var(--panel-bg);
    flex-wrap: wrap;
    position: sticky;
    top: calc(var(--app-bar-offset, var(--app-bar-height)) + 8px);
    z-index: 100;
  }
  .compare-hint {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--muted);
  }
  .compare-selection {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--heading);
  }
  .compare-spacer {
    flex: 1;
  }

  .log-list {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
  }
  .log-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 14px;
    border-bottom: 1px solid var(--border-subtle);
  }
  .log-row:last-child {
    border-bottom: none;
  }
  .log-row:hover {
    background-color: var(--row-hover);
  }
  .log-row.is-from {
    box-shadow: inset 3px 0 0 var(--warning-text);
  }
  .log-row.is-to {
    box-shadow: inset 3px 0 0 var(--success-text);
  }
  .log-row.is-from.is-to {
    box-shadow: inset 3px 0 0 var(--primary);
  }
  .log-select {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
  }
  .log-radio {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 24px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background-color: var(--surface);
    cursor: pointer;
    position: relative;
    font-size: 11px;
    font-weight: 700;
    color: var(--muted);
  }
  .log-radio input {
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    cursor: pointer;
  }
  .log-radio:has(input:checked) {
    background-color: var(--primary);
    border-color: var(--primary);
    color: var(--on-accent);
  }
  .log-graph {
    display: flex;
    color: var(--muted);
    flex-shrink: 0;
  }
  .log-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .log-subject {
    color: var(--heading);
    text-decoration: none;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .log-subject:hover {
    color: var(--link);
  }
  .log-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 12px;
    color: var(--muted);
    flex-wrap: wrap;
  }
  .log-hash {
    font-family: var(--font-mono);
    font-size: 11.5px;
  }
  .log-actions {
    flex-shrink: 0;
  }

  .revision-strip {
    display: flex;
    align-items: stretch;
    gap: 12px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  .revision-card {
    flex: 1;
    min-width: 220px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: 12px 14px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background-color: var(--panel-bg);
  }
  .revision-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted);
  }
  .revision-hash {
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--link);
  }
  .revision-subject {
    font-size: 13px;
    color: var(--heading);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .revision-meta {
    font-size: 12px;
    color: var(--muted);
  }
  .revision-arrow {
    display: flex;
    align-items: center;
    color: var(--muted);
  }
`;
