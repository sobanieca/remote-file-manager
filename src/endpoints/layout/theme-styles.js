const lightPalette = `
    --bg: #ffffff;
    --text: #1f2328;
    --heading: #333333;
    --muted: #666666;
    --surface: #ffffff;
    --panel-bg: #f8f9fa;
    --panel-hover: #f0f4f8;
    --menu-hover: #f5f5f5;
    --border: #dddddd;
    --border-subtle: #eeeeee;
    --link: #0366d6;
    --link-hover: #0255b3;
    --editor-bg: #fafafa;
    --primary: #0366d6;
    --primary-hover: #0255b3;
    --success: #28a745;
    --success-hover: #218838;
    --danger: #dc3545;
    --danger-hover: #c82333;
    --secondary: #6c757d;
    --secondary-hover: #5a6268;
    --on-accent: #ffffff;
    --overlay: rgba(0, 0, 0, 0.5);
    --shadow: rgba(0, 0, 0, 0.1);
    --shadow-strong: rgba(0, 0, 0, 0.15);
    --focus-ring: rgba(3, 102, 214, 0.3);
    --success-bg: #e6f4ea;
    --success-text: #137333;
    --error-bg: #fce8e6;
    --error-text: #c5221f;
    --warning-bg: #fff7e6;
    --warning-text: #b06000;
    --notice-bg: #fff3cd;
    --notice-border: #ffeaa7;
    --notice-text: #856404;
`;

const darkPalette = `
    --bg: #0d1117;
    --text: #c9d1d9;
    --heading: #e6edf3;
    --muted: #8b949e;
    --surface: #161b22;
    --panel-bg: #161b22;
    --panel-hover: #21262d;
    --menu-hover: #21262d;
    --border: #30363d;
    --border-subtle: #21262d;
    --link: #58a6ff;
    --link-hover: #79c0ff;
    --editor-bg: #0d1117;
    --primary: #1f6feb;
    --primary-hover: #388bfd;
    --success: #238636;
    --success-hover: #2ea043;
    --danger: #da3633;
    --danger-hover: #f85149;
    --secondary: #484f58;
    --secondary-hover: #5a626c;
    --on-accent: #ffffff;
    --overlay: rgba(0, 0, 0, 0.7);
    --shadow: rgba(0, 0, 0, 0.5);
    --shadow-strong: rgba(0, 0, 0, 0.6);
    --focus-ring: rgba(88, 166, 255, 0.4);
    --success-bg: #12261a;
    --success-text: #3fb950;
    --error-bg: #2d1514;
    --error-text: #f85149;
    --warning-bg: #2d2410;
    --warning-text: #d29922;
    --notice-bg: #2d2410;
    --notice-border: #473c1a;
    --notice-text: #d29922;
`;

export const themeStyles = `
  :root {
    ${lightPalette}
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      ${darkPalette}
    }
  }
  :root[data-theme="dark"] {
    ${darkPalette}
  }
  .theme-toggle {
    position: fixed;
    top: 16px;
    right: 16px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1px solid var(--border);
    background-color: var(--surface);
    color: var(--text);
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 6px var(--shadow);
    z-index: 1100;
    padding: 0;
  }
  .theme-toggle:hover {
    background-color: var(--panel-hover);
  }
`;
