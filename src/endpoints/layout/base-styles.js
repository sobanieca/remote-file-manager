export const baseStyles = `
  :root {
    --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
    --radius: 8px;
    --radius-sm: 6px;
    --app-bar-height: 52px;
  }
  * {
    box-sizing: border-box;
  }
  body {
    font-family: var(--font-sans);
    font-size: 14px;
    line-height: 1.55;
    margin: 0;
    padding: 0;
    background-color: var(--bg);
    color: var(--text);
    -webkit-font-smoothing: antialiased;
  }
  .main-container {
    max-width: 960px;
    margin: 0 auto;
    padding: 20px 16px 48px;
  }
  .main-container.is-wide {
    max-width: 1600px;
  }
  h1 {
    font-size: 20px;
    font-weight: 600;
    margin: 0;
    color: var(--heading);
  }
  h2 {
    font-size: 15px;
    font-weight: 600;
    margin: 0;
    color: var(--heading);
  }
  code {
    font-family: var(--font-mono);
    font-size: 0.92em;
  }
  .icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    display: block;
  }
  .icon-small {
    width: 12px;
    height: 12px;
  }

  .app-bar {
    position: sticky;
    top: 0;
    z-index: 900;
    display: flex;
    align-items: center;
    gap: 16px;
    min-height: var(--app-bar-height);
    padding: 0 16px;
    background-color: var(--app-bar-bg);
    border-bottom: 1px solid var(--border);
  }
  .app-brand {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: var(--heading);
    text-decoration: none;
    white-space: nowrap;
  }
  .app-brand .icon {
    color: var(--primary);
    width: 18px;
    height: 18px;
  }
  .app-nav {
    display: flex;
    align-items: center;
    gap: 2px;
  }
  .app-nav-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: var(--radius-sm);
    color: var(--muted);
    text-decoration: none;
    font-weight: 500;
  }
  .app-nav-item:hover {
    background-color: var(--panel-hover);
    color: var(--heading);
  }
  .app-nav-item.is-active {
    background-color: var(--panel-hover);
    color: var(--heading);
  }
  .app-bar-spacer {
    flex: 1;
  }
  .branch-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 10px;
    border: 1px solid var(--border);
    border-radius: 999px;
    color: var(--text);
    text-decoration: none;
    font-size: 13px;
    font-weight: 500;
    max-width: 260px;
  }
  .branch-chip:hover {
    background-color: var(--panel-hover);
  }
  .branch-chip > span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .branch-chip .icon {
    color: var(--muted);
  }
  .branch-chip.is-detached {
    border-style: dashed;
  }
  .branch-ahead, .branch-behind {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--muted);
  }
  .branch-dirty {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 999px;
    background-color: var(--warning-bg);
    color: var(--warning-text);
    font-size: 11px;
    font-weight: 600;
  }

  .button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background-color: var(--surface);
    color: var(--text);
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.2;
    cursor: pointer;
    text-decoration: none;
    white-space: nowrap;
  }
  .button:hover {
    background-color: var(--panel-hover);
  }
  .button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .button-primary {
    background-color: var(--primary);
    border-color: var(--primary);
    color: var(--on-accent);
  }
  .button-primary:hover {
    background-color: var(--primary-hover);
    border-color: var(--primary-hover);
  }
  .button-danger {
    background-color: var(--danger);
    border-color: var(--danger);
    color: var(--on-accent);
  }
  .button-danger:hover {
    background-color: var(--danger-hover);
    border-color: var(--danger-hover);
  }
  .button-ghost {
    border-color: transparent;
    background-color: transparent;
    color: var(--muted);
  }
  .button-ghost:hover {
    background-color: var(--panel-hover);
    color: var(--text);
  }
  .button-small {
    padding: 5px 9px;
    font-size: 12px;
  }
  .icon-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    padding: 0;
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--muted);
    cursor: pointer;
    text-decoration: none;
  }
  .icon-button:hover {
    background-color: var(--panel-hover);
    color: var(--text);
  }
  .icon-button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  :focus-visible {
    outline: 2px solid var(--focus-ring-strong);
    outline-offset: 1px;
  }

  .segmented {
    display: inline-flex;
    padding: 2px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background-color: var(--panel-bg);
    gap: 2px;
  }
  .segmented-option {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 9px;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--muted);
    font-family: inherit;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
  }
  .segmented-option:hover {
    color: var(--text);
  }
  .segmented-option.is-active {
    background-color: var(--surface);
    color: var(--heading);
    box-shadow: 0 1px 2px var(--shadow);
  }

  .dropdown {
    position: relative;
  }
  .menu-popover {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    min-width: 200px;
    padding: 4px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background-color: var(--surface);
    box-shadow: 0 8px 24px var(--shadow-strong);
    z-index: 1000;
    display: none;
  }
  .dropdown.is-open > .menu-popover,
  .entry-menu.is-open > .menu-popover {
    display: block;
  }
  .menu-popover.is-flipped {
    top: auto;
    bottom: calc(100% + 4px);
  }
  .menu-popover.align-left {
    right: auto;
    left: 0;
  }
  .menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 7px 10px;
    border: none;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--text);
    font-family: inherit;
    font-size: 13px;
    text-align: left;
    text-decoration: none;
    cursor: pointer;
    white-space: nowrap;
  }
  .menu-item:hover {
    background-color: var(--menu-hover);
  }
  .menu-item .icon {
    color: var(--muted);
  }
  .menu-item.is-danger {
    color: var(--danger);
  }
  .menu-item.is-danger .icon {
    color: var(--danger);
  }
  .menu-separator {
    height: 1px;
    margin: 4px 6px;
    background-color: var(--border-subtle);
  }

  .page-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }
  .page-title {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    flex: 1;
  }
  .page-title h1 {
    overflow-wrap: anywhere;
  }
  .page-title-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: var(--radius);
    background-color: var(--panel-bg);
    color: var(--muted);
    flex-shrink: 0;
  }
  .page-title-icon .icon {
    width: 19px;
    height: 19px;
  }
  .page-subtitle {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: var(--muted);
    font-size: 13px;
    text-decoration: none;
  }
  a.page-subtitle:hover {
    color: var(--link);
  }
  .page-header-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .meta-strip {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 28px;
    padding: 12px 16px;
    margin-bottom: 16px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background-color: var(--panel-bg);
  }
  .meta-item {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }
  .meta-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted);
  }
  .meta-value {
    font-size: 13px;
    color: var(--heading);
  }

  .action-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
  }
  .action-button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background-color: var(--surface);
    color: var(--text);
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    text-decoration: none;
    white-space: nowrap;
  }
  .action-button:hover {
    background-color: var(--panel-hover);
  }
  .action-button .icon {
    color: var(--muted);
  }
  .action-button.is-danger {
    color: var(--danger);
    border-color: var(--border);
  }
  .action-button.is-danger .icon {
    color: var(--danger);
  }
  .action-button.is-danger:hover {
    background-color: var(--error-bg);
  }

  .preview-panel {
    padding: 16px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background-color: var(--surface);
  }
  .preview-unavailable {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 48px 20px;
    color: var(--muted);
    text-align: center;
  }
  .preview-unavailable .icon {
    width: 28px;
    height: 28px;
  }
  .preview-unavailable p {
    margin: 0;
  }
  .image-preview {
    display: block;
    max-width: 100%;
    max-height: 70vh;
    margin: 0 auto;
    border-radius: var(--radius-sm);
  }
  .video-preview {
    display: block;
    width: 100%;
    max-height: 70vh;
    margin: 0 auto;
    border-radius: var(--radius-sm);
    background-color: #000;
  }
  .audio-preview {
    display: block;
    width: 100%;
  }
  .preview-document {
    padding: 0;
    overflow: hidden;
  }
  .preview-frame {
    display: block;
    width: 100%;
    height: 78vh;
    border: 0;
    background-color: #fff;
  }

  .toast-stack {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 2000;
    pointer-events: none;
  }
  .toast {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: var(--radius);
    background-color: var(--toast-bg);
    color: var(--toast-text);
    font-size: 13px;
    box-shadow: 0 6px 20px var(--shadow-strong);
    animation: toast-in 0.18s ease-out;
    pointer-events: auto;
    max-width: 90vw;
  }
  .toast.is-error {
    background-color: var(--danger);
    color: #ffffff;
  }
  .toast.is-success {
    background-color: var(--success);
    color: #ffffff;
  }
  @keyframes toast-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .dialog-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background-color: var(--overlay);
    z-index: 1500;
  }
  .dialog {
    width: 100%;
    max-width: 420px;
    border-radius: var(--radius);
    background-color: var(--surface);
    box-shadow: 0 16px 48px var(--shadow-strong);
    overflow: hidden;
  }
  .dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    border-bottom: 1px solid var(--border-subtle);
  }
  .dialog-header h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--heading);
  }
  .dialog-body {
    padding: 18px;
  }
  .dialog-body label {
    display: block;
    margin-bottom: 6px;
    font-size: 13px;
    color: var(--muted);
  }
  .dialog-body p {
    margin: 0 0 12px;
  }
  .dialog-body input[type="text"] {
    width: 100%;
    padding: 9px 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background-color: var(--bg);
    color: var(--text);
    font-family: inherit;
    font-size: 14px;
  }
  .dialog-body input[type="text"]:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
  .dialog-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 18px;
  }
  .dialog-list {
    max-height: 180px;
    overflow-y: auto;
    margin: 0 0 12px;
    padding-left: 18px;
    color: var(--muted);
    font-size: 13px;
  }

  .status-section {
    margin: 10px 0;
  }
  .status-message {
    padding: 10px 14px;
    border-radius: var(--radius-sm);
  }
  .status-message.success {
    background-color: var(--success-bg);
    color: var(--success-text);
  }
  .status-message.error {
    background-color: var(--error-bg);
    color: var(--error-text);
  }
  .status-message.warning {
    background-color: var(--warning-bg);
    color: var(--warning-text);
  }

  .scope-notice {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    margin-bottom: 16px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background-color: var(--panel-bg);
    font-size: 13px;
    color: var(--muted);
  }
  .scope-notice .icon {
    color: var(--muted);
  }
  .scope-notice a {
    margin-left: auto;
  }

  .pagination {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    margin-top: 16px;
  }
  .pagination :only-child {
    margin-left: auto;
  }

  /* On narrow screens the bar stacks: brand, branch and theme on the first
     row, navigation on a second full width row */
  @media (max-width: 720px) {
    .app-bar {
      flex-wrap: wrap;
      align-items: center;
      gap: 8px 10px;
      padding: 8px 12px;
    }
    .app-brand {
      order: 1;
      font-size: 14px;
    }
    .app-bar-spacer {
      order: 2;
    }
    .branch-chip {
      order: 3;
      max-width: 42vw;
    }
    .theme-toggle {
      order: 4;
    }
    .app-nav {
      order: 5;
      width: 100%;
      gap: 4px;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .app-nav::-webkit-scrollbar {
      display: none;
    }
    .app-nav-item {
      flex: 1 1 0;
      max-width: 200px;
      justify-content: center;
      padding: 6px 8px;
    }
    .main-container {
      padding: 14px 12px 32px;
    }
    .page-header {
      gap: 10px;
    }
  }

  @media (max-width: 420px) {
    .app-brand span {
      display: none;
    }
  }
`;
