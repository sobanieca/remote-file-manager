export const styles = `
  body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    margin: 0;
    padding: 20px;
  }
  .breadcrumb {
    margin-bottom: 20px;
    padding: 8px 16px;
    background-color: #f8f9fa;
    border-radius: 4px;
  }
  .breadcrumb a {
    text-decoration: none;
    color: #0366d6;
    margin: 0 5px;
  }
  .file-list {
    list-style: none;
    padding: 0;
  }
  .file-list li {
    padding: 8px 0;
    border-bottom: 1px solid #eee;
  }
  .file-list a {
    text-decoration: none;
    color: #0366d6;
    display: flex;
    align-items: center;
  }
  .file-list .folder::before {
    content: "📁";
    margin-right: 8px;
  }
  .file-list .file::before {
    content: "📄";
    margin-right: 8px;
  }
  .new-folder-form {
    margin-bottom: 20px;
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 4px;
    display: flex;
  }
  .new-folder-form input[type="text"] {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-right: 10px;
    flex-grow: 1;
  }
  .new-folder-form button {
    padding: 8px 16px;
    background-color: #0366d6;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .new-folder-form button:hover {
    background-color: #0255b3;
  }
  .status-section {
    margin: 10px 0;
  }
  .status-message {
    padding: 8px;
    border-radius: 4px;
    width: 100%;
  }
  .status-message.success {
    background-color: #e6f4ea;
    color: #137333;
  }
  .status-message.error {
    background-color: #fce8e6;
    color: #c5221f;
  }
  .status-message.warning {
    background-color: #fff7e6;
    color: #b06000;
  }
  .file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  .file-item a {
    flex-grow: 1;
  }
  .context-menu-trigger {
    position: relative;
    cursor: pointer;
  }
  .dots {
    font-size: 18px;
    padding: 4px 8px;
    color: #666;
  }
  .context-menu {
    position: absolute;
    right: 0;
    top: 24px;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    z-index: 100;
    min-width: 160px;
    display: none;
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
    color: #333;
    text-decoration: none;
    font-size: 14px;
    white-space: nowrap;
  }
  .context-menu-item:hover {
    background-color: #f5f5f5;
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
    background-color: #f8f9fa;
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
    background-color: #0366d6;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .upload-trigger:hover {
    background-color: #0255b3;
  }
  .dropdown-arrow {
    font-size: 12px;
  }
  .upload-menu {
    position: absolute;
    top: 100%;
    left: 0;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
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
    color: #333;
    font-size: 14px;
    white-space: nowrap;
  }
  .upload-option:hover {
    background-color: #f5f5f5;
  }
  .upload-option .icon {
    font-size: 16px;
  }
  .paste-button {
    padding: 8px 16px;
    background-color: #28a745;
    color: white;
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
    background-color: #218838;
  }
  .paste-button:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
    opacity: 0.6;
  }
  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 4px;
  }
  .editor-header h2 {
    margin: 0;
    color: #333;
    font-size: 18px;
  }
  .back-button {
    padding: 8px 16px;
    background-color: #6c757d;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    font-size: 14px;
  }
  .back-button:hover {
    background-color: #5a6268;
  }
  .editor-form {
    margin-bottom: 20px;
  }
  .file-editor {
    width: 100%;
    padding: 16px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: 'Courier New', Monaco, monospace;
    font-size: 14px;
    line-height: 1.4;
    resize: vertical;
    background-color: #fafafa;
    box-sizing: border-box;
  }
  .file-editor:focus {
    outline: none;
    border-color: #0366d6;
    box-shadow: 0 0 5px rgba(3, 102, 214, 0.3);
  }
  .editor-actions {
    margin-top: 15px;
    display: flex;
    gap: 10px;
  }
  .save-button {
    padding: 10px 20px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }
  .save-button:hover {
    background-color: #218838;
  }
  .cancel-button {
    padding: 10px 20px;
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }
  .cancel-button:hover {
    background-color: #c82333;
  }
  .binary-file-message {
    padding: 20px;
    background-color: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 4px;
    margin: 20px 0;
    text-align: center;
  }
  .binary-file-message p {
    margin: 10px 0;
    color: #856404;
  }
  .paste-dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  .paste-dialog {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    width: 90%;
    max-width: 400px;
  }
  .paste-dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #eee;
  }
  .paste-dialog-header h3 {
    margin: 0;
    color: #333;
    font-size: 18px;
  }
  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    color: #666;
    cursor: pointer;
    padding: 0;
  }
  .close-btn:hover {
    color: #333;
  }
  .paste-dialog-body {
    padding: 20px;
  }
  .paste-dialog-body label {
    display: block;
    margin-bottom: 8px;
    color: #333;
    font-weight: 500;
  }
  .paste-dialog-body input[type="text"] {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    box-sizing: border-box;
  }
  .paste-dialog-body input[type="text"]:focus {
    outline: none;
    border-color: #0366d6;
    box-shadow: 0 0 5px rgba(3, 102, 214, 0.3);
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
    background-color: #6c757d;
    color: white;
  }
  .cancel-btn:hover {
    background-color: #5a6268;
  }
  .save-btn {
    background-color: #28a745;
    color: white;
  }
  .save-btn:hover {
    background-color: #218838;
  }
`;
