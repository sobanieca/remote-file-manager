export const baseStyles = `
  body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    margin: 0;
    padding: 20px;
    background-color: var(--bg);
    color: var(--text);
  }
  .main-container {
    max-width: 800px;
    margin: 0 auto;
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
`;
