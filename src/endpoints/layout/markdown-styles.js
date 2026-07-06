export const markdownStyles = `
  .markdown-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 15px;
    background-color: var(--panel-bg);
    border-radius: 4px;
  }
  .markdown-header h2 {
    margin: 0;
    color: var(--heading);
    font-size: 18px;
  }
  .markdown-actions {
    display: flex;
    gap: 10px;
  }
  .edit-button {
    padding: 8px 16px;
    background-color: var(--primary);
    color: var(--on-accent);
    text-decoration: none;
    border-radius: 4px;
    font-size: 14px;
  }
  .edit-button:hover {
    background-color: var(--primary-hover);
  }
`;
