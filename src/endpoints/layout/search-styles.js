export const searchStyles = `
  .search-trigger {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 5px 10px;
    border: 1px solid var(--border);
    border-radius: 999px;
    background-color: var(--panel-bg);
    color: var(--muted);
    font-family: inherit;
    font-size: 13px;
    cursor: pointer;
    white-space: nowrap;
  }
  .search-trigger:hover {
    background-color: var(--panel-hover);
    color: var(--heading);
  }
  .search-trigger kbd,
  .search-footer kbd {
    display: inline-flex;
    align-items: center;
    padding: 0 5px;
    height: 18px;
    border: 1px solid var(--border);
    border-bottom-width: 2px;
    border-radius: 4px;
    background-color: var(--surface);
    font-family: var(--font-mono);
    font-size: 10.5px;
    color: var(--muted);
  }

  .search-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 10vh 16px 16px;
    background-color: var(--overlay);
    z-index: 1400;
  }
  .search-overlay[hidden] {
    display: none;
  }
  .search-panel {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 720px;
    max-height: 80vh;
    border-radius: var(--radius);
    background-color: var(--surface);
    box-shadow: 0 16px 48px var(--shadow-strong);
    overflow: hidden;
  }
  .search-input-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border-bottom: 1px solid var(--border-subtle);
  }
  .search-input-row > .icon {
    color: var(--muted);
    width: 18px;
    height: 18px;
  }
  .search-input {
    flex: 1;
    min-width: 0;
    border: none;
    background: transparent;
    color: var(--text);
    font-family: inherit;
    font-size: 15px;
    outline: none;
  }
  .search-status {
    font-size: 12px;
    color: var(--muted);
    white-space: nowrap;
  }
  .search-results {
    list-style: none;
    margin: 0;
    padding: 6px;
    overflow-y: auto;
    flex: 1;
    min-height: 0;
  }
  .search-result {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 8px;
    border-radius: var(--radius-sm);
    cursor: pointer;
  }
  .search-result.is-active {
    background-color: var(--selected-bg);
  }
  .search-result-path {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 13px;
    color: var(--heading);
  }
  .search-result-dir {
    margin-left: 8px;
    font-size: 12px;
    color: var(--muted);
  }
  .search-result-name {
    font-weight: 600;
  }
  .search-result-path mark {
    background: transparent;
    color: var(--link);
    font-weight: 700;
  }
  .search-result-reveal {
    opacity: 0;
  }
  .search-result.is-active .search-result-reveal,
  .search-result:hover .search-result-reveal,
  .search-result-reveal:focus-visible {
    opacity: 1;
  }
  .search-footer {
    display: flex;
    gap: 16px;
    padding: 8px 14px;
    border-top: 1px solid var(--border-subtle);
    background-color: var(--panel-bg);
    font-size: 12px;
    color: var(--muted);
    flex-wrap: wrap;
  }
  .search-footer span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .menu-heading {
    padding: 6px 10px 4px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted);
  }
  .worktree-menu {
    min-width: 280px;
    max-width: min(420px, calc(100vw - 24px));
  }
  .worktree-item {
    align-items: flex-start;
    white-space: normal;
  }
  .worktree-item:disabled {
    cursor: default;
  }
  .worktree-item.is-current {
    background-color: var(--panel-bg);
  }
  .worktree-item-check {
    display: flex;
    width: 16px;
    height: 20px;
    align-items: center;
    flex-shrink: 0;
    color: var(--primary);
  }
  .worktree-item-body {
    display: flex;
    flex-direction: column;
    min-width: 0;
    gap: 1px;
  }
  .worktree-item-branch {
    font-weight: 500;
    color: var(--heading);
  }
  .worktree-item-path,
  .worktree-path {
    font-family: var(--font-mono);
    font-size: 11.5px;
    color: var(--muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .git-group-hint {
    font-size: 12px;
    color: var(--muted);
  }
  .worktree-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .worktree-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 14px;
    border-bottom: 1px solid var(--border-subtle);
    font-size: 13px;
  }
  .worktree-row:last-child {
    border-bottom: none;
  }
  .worktree-row.is-current {
    background-color: var(--panel-bg);
  }
  .worktree-icon {
    display: flex;
    color: var(--muted);
    flex-shrink: 0;
  }
  .worktree-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .worktree-branch {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 500;
    color: var(--heading);
    flex-wrap: wrap;
  }
  .worktree-flag {
    display: inline-flex;
    align-items: center;
    padding: 0 6px;
    height: 17px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background-color: var(--surface);
    font-size: 10px;
    font-weight: 600;
    color: var(--muted);
  }
  .worktree-flag.is-current {
    border-color: var(--primary);
    color: var(--primary);
  }
  .worktree-flag.is-warning {
    background-color: var(--warning-bg);
    color: var(--warning-text);
    border-color: transparent;
  }
  .worktree-head {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--muted);
    flex-shrink: 0;
  }
  .worktree-actions {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    min-width: 32px;
    justify-content: flex-end;
  }
  .worktree-current {
    display: flex;
    color: var(--success-text);
  }

  @media (max-width: 720px) {
    .search-trigger {
      order: 3;
      padding: 6px;
    }
    .search-trigger span,
    .search-trigger kbd {
      display: none;
    }
    .worktree-dropdown,
    .branch-chip {
      order: 3;
    }
    .search-overlay {
      padding: 12px;
    }
    .search-panel {
      max-height: calc(100vh - 24px);
    }
    .search-footer {
      display: none;
    }
    .worktree-head {
      display: none;
    }
  }
`;
