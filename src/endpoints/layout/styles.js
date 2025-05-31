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
`;
