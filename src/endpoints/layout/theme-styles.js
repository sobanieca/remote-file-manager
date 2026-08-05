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
    --diff-add-bg: #e6ffec;
    --diff-add-gutter-bg: #ccffd8;
    --diff-remove-bg: #ffebe9;
    --diff-remove-gutter-bg: #ffd7d5;
    --diff-hunk-bg: #f6f8fa;
    --diff-hunk-text: #57606a;
    --syntax-keyword: #cf222e;
    --syntax-string: #0a3069;
    --syntax-comment: #6e7781;
    --syntax-constant: #0550ae;
    --syntax-entity: #8250df;
    --syntax-variable: #953800;
    --syntax-punctuation: #24292f;
    --app-bar-bg: #ffffff;
    --pane-bg: #ffffff;
    --row-hover: #f3f6fa;
    --row-stripe: #fbfcfd;
    --selected-bg: #ddeaff;
    --selected-border: #0366d6;
    --focus-ring-strong: #0366d6;
    --executable-text: #1a7f37;
    --executable-bg: #e6f4ea;
    --symlink-text: #8250df;
    --symlink-bg: #f3eefc;
    --toast-bg: #24292f;
    --toast-text: #ffffff;
    --scrollbar-thumb: #c8cdd4;
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
    --diff-add-bg: #12261e;
    --diff-add-gutter-bg: #1b4721;
    --diff-remove-bg: #25171c;
    --diff-remove-gutter-bg: #542426;
    --diff-hunk-bg: #161b22;
    --diff-hunk-text: #8b949e;
    --syntax-keyword: #ff7b72;
    --syntax-string: #a5d6ff;
    --syntax-comment: #8b949e;
    --syntax-constant: #79c0ff;
    --syntax-entity: #d2a8ff;
    --syntax-variable: #ffa657;
    --syntax-punctuation: #c9d1d9;
    --app-bar-bg: #0d1117;
    --pane-bg: #0d1117;
    --row-hover: #161b22;
    --row-stripe: #10151c;
    --selected-bg: #17324f;
    --selected-border: #58a6ff;
    --focus-ring-strong: #58a6ff;
    --executable-text: #3fb950;
    --executable-bg: #12261a;
    --symlink-text: #d2a8ff;
    --symlink-bg: #221a33;
    --toast-bg: #21262d;
    --toast-text: #e6edf3;
    --scrollbar-thumb: #30363d;
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
    font-size: 16px;
    line-height: 1;
  }
`;
