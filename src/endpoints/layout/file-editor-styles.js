export const fileEditorStyles = `
  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 15px;
    background-color: var(--panel-bg);
    border-radius: 4px;
  }
  .editor-header h2 {
    margin: 0;
    color: var(--heading);
    font-size: 18px;
  }
  .back-button {
    padding: 8px 16px;
    background-color: var(--secondary);
    color: var(--on-accent);
    text-decoration: none;
    border-radius: 4px;
    font-size: 14px;
  }
  .back-button:hover {
    background-color: var(--secondary-hover);
  }
  .editor-form {
    margin-bottom: 20px;
  }
  .file-editor {
    width: 100%;
    padding: 16px;
    border: 1px solid var(--border);
    border-radius: 4px;
    font-family: 'Courier New', Monaco, monospace;
    font-size: 14px;
    line-height: 1.4;
    resize: vertical;
    background-color: var(--editor-bg);
    color: var(--text);
    box-sizing: border-box;
  }
  .file-editor:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 5px var(--focus-ring);
  }
  .editor-actions {
    margin-top: 15px;
    display: flex;
    gap: 10px;
  }
  .save-button {
    padding: 10px 20px;
    background-color: var(--success);
    color: var(--on-accent);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }
  .save-button:hover {
    background-color: var(--success-hover);
  }
  .cancel-button {
    padding: 10px 20px;
    background-color: var(--danger);
    color: var(--on-accent);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }
  .cancel-button:hover {
    background-color: var(--danger-hover);
  }
  .binary-file-message {
    padding: 20px;
    background-color: var(--notice-bg);
    border: 1px solid var(--notice-border);
    border-radius: 4px;
    margin: 20px 0;
    text-align: center;
  }
  .binary-file-message p {
    margin: 10px 0;
    color: var(--notice-text);
  }
`;
