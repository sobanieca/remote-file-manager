export const baseStyles = `
  body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    margin: 0;
    padding: 20px;
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
`;