export const fileEditorStyles = `
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
