export const fileExplorerStyles = `
  .breadcrumb {
    margin-bottom: 20px;
    padding: 8px 16px;
    background-color: var(--panel-bg);
    border-radius: 4px;
  }
  .breadcrumb a {
    text-decoration: none;
    color: var(--link);
    margin: 0 5px;
  }
  .file-list {
    list-style: none;
    padding: 0;
  }
  .file-list li {
    padding: 8px 4px;
    border-bottom: 1px solid var(--border-subtle);
    border-radius: 4px;
  }
  .file-list li:hover {
    background-color: var(--panel-hover);
  }
  .file-list a {
    text-decoration: none;
    color: var(--link);
  }
  .file-list .folder::before {
    content: "📁";
    margin-right: 8px;
  }
  .file-list .file::before {
    content: "📄";
    margin-right: 8px;
  }
  .deleted-file {
    color: var(--muted);
    text-decoration: line-through;
    opacity: 0.7;
  }
  .new-folder-form {
    margin-bottom: 20px;
    padding: 15px;
    background-color: var(--panel-bg);
    border-radius: 4px;
    display: flex;
  }
  .new-folder-form input[type="text"] {
    padding: 8px;
    border: 1px solid var(--border);
    border-radius: 4px;
    margin-right: 10px;
    flex-grow: 1;
    background-color: var(--surface);
    color: var(--text);
  }
  .new-folder-form button {
    padding: 8px 16px;
    background-color: var(--primary);
    color: var(--on-accent);
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .new-folder-form button:hover {
    background-color: var(--primary-hover);
  }
  .file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 12px;
  }
  .file-item .file-info {
    display: flex;
    align-items: center;
    width: 100%;
  }
  .thumbnail {
    width: 48px;
    height: 48px;
    object-fit: cover;
    border-radius: 4px;
    border: 1px solid var(--border);
    flex-shrink: 0;
  }
  .git-status {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    margin-left: 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    font-family: monospace;
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
  .context-menu-trigger {
    position: relative;
    cursor: pointer;
    margin-left: auto;
  }
  .dots {
    font-size: 18px;
    padding: 4px 8px;
    color: var(--muted);
  }
  .context-menu {
    position: absolute;
    right: 0;
    top: 24px;
    background-color: var(--surface);
    border: 1px solid var(--border);
    border-radius: 4px;
    box-shadow: 0 4px 8px var(--shadow);
    z-index: 100;
    min-width: 160px;
    display: none;
    overflow: hidden;
  }
  .context-menu-trigger.open-up .context-menu {
    top: auto;
    bottom: 24px;
  }
  .context-menu-trigger:hover .context-menu,
  .context-menu-trigger.active .context-menu {
    display: block;
  }
  .context-menu-item {
    background: none;
    border: none;
    padding: 8px 12px;
    text-align: left;
    cursor: pointer;
    width: 100%;
    display: flex;
    align-items: center;
    color: var(--heading);
    text-decoration: none;
    font-size: 14px;
    white-space: nowrap;
  }
  .context-menu-item:hover {
    background-color: var(--menu-hover);
  }
  .context-menu-item .icon {
    margin-right: 8px;
  }
  .context-menu form {
    margin: 0;
    padding: 0;
    width: 100%;
  }
  .upload-section {
    margin-bottom: 20px;
    padding: 15px;
    background-color: var(--panel-bg);
    border-radius: 4px;
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .upload-dropdown {
    position: relative;
    display: inline-block;
  }
  .upload-trigger {
    padding: 8px 16px;
    background-color: var(--primary);
    color: var(--on-accent);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .upload-trigger:hover {
    background-color: var(--primary-hover);
  }
  .dropdown-arrow {
    font-size: 12px;
  }
  .upload-menu {
    position: absolute;
    top: 100%;
    left: 0;
    background-color: var(--surface);
    border: 1px solid var(--border);
    border-radius: 4px;
    box-shadow: 0 4px 8px var(--shadow);
    z-index: 100;
    min-width: 160px;
    display: none;
  }
  .upload-dropdown.active .upload-menu {
    display: block;
  }
  .upload-option {
    padding: 8px 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--heading);
    font-size: 14px;
    white-space: nowrap;
  }
  .upload-option:hover {
    background-color: var(--menu-hover);
  }
  .upload-option .icon {
    font-size: 16px;
  }
  .paste-button {
    padding: 8px 16px;
    background-color: var(--success);
    color: var(--on-accent);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    white-space: nowrap;
  }
  .paste-button:hover:not(:disabled) {
    background-color: var(--success-hover);
  }
  .paste-button:disabled {
    background-color: var(--secondary);
    cursor: not-allowed;
    opacity: 0.6;
  }
  .paste-dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--overlay);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  .paste-dialog {
    background-color: var(--surface);
    border-radius: 8px;
    box-shadow: 0 4px 12px var(--shadow-strong);
    width: 90%;
    max-width: 400px;
  }
  .paste-dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-subtle);
  }
  .paste-dialog-header h3 {
    margin: 0;
    color: var(--heading);
    font-size: 18px;
  }
  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    color: var(--muted);
    cursor: pointer;
    padding: 0;
  }
  .close-btn:hover {
    color: var(--heading);
  }
  .paste-dialog-body {
    padding: 20px;
  }
  .paste-dialog-body label {
    display: block;
    margin-bottom: 8px;
    color: var(--heading);
    font-weight: 500;
  }
  .paste-dialog-body input[type="text"] {
    width: 100%;
    padding: 10px;
    border: 1px solid var(--border);
    border-radius: 4px;
    font-size: 14px;
    box-sizing: border-box;
    background-color: var(--surface);
    color: var(--text);
  }
  .paste-dialog-body input[type="text"]:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 5px var(--focus-ring);
  }
  .paste-dialog-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }
  .paste-dialog-buttons button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }
  .cancel-btn {
    background-color: var(--secondary);
    color: var(--on-accent);
  }
  .cancel-btn:hover {
    background-color: var(--secondary-hover);
  }
  .save-btn {
    background-color: var(--success);
    color: var(--on-accent);
  }
  .save-btn:hover {
    background-color: var(--success-hover);
  }
`;
