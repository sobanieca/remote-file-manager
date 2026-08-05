export const codeViewStyles = `
  .code-view {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background-color: var(--editor-bg);
    overflow: hidden;
  }
  .code-toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px 12px;
    border-bottom: 1px solid var(--border);
    background-color: var(--panel-bg);
    flex-wrap: wrap;
  }
  .code-toolbar-spacer {
    flex: 1;
  }
  .code-language {
    padding: 2px 8px;
    border-radius: 999px;
    background-color: var(--surface);
    border: 1px solid var(--border);
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted);
  }
  .code-meta,
  .code-notice {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: var(--muted);
  }
  .code-scroll {
    overflow-x: auto;
    max-height: 78vh;
    overflow-y: auto;
  }
  .code-table {
    border-collapse: collapse;
    width: 100%;
    font-family: var(--font-mono);
    font-size: 13px;
    line-height: 1.55;
  }
  .code-line-number {
    width: 1%;
    padding: 0 12px 0 14px;
    text-align: right;
    vertical-align: top;
    user-select: none;
    color: var(--muted);
    background-color: var(--panel-bg);
    border-right: 1px solid var(--border-subtle);
    position: sticky;
    left: 0;
  }
  .code-line-number a {
    color: inherit;
    text-decoration: none;
    font-size: 12px;
  }
  .code-line-content {
    padding: 0 16px 0 12px;
    white-space: pre;
    vertical-align: top;
    tab-size: 2;
  }
  .code-view.is-wrapped .code-line-content {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  .code-line:target,
  .code-line.is-highlighted {
    background-color: var(--notice-bg);
  }
  .code-line:target .code-line-number,
  .code-line.is-highlighted .code-line-number {
    background-color: var(--notice-bg);
    color: var(--notice-text);
  }
  .code-line:hover .code-line-number {
    color: var(--text);
  }

  .token.comment, .token.prolog, .token.doctype, .token.cdata {
    color: var(--syntax-comment);
    font-style: italic;
  }
  .token.punctuation {
    color: var(--syntax-punctuation);
  }
  .token.property, .token.tag, .token.boolean, .token.number,
  .token.constant, .token.symbol, .token.deleted {
    color: var(--syntax-constant);
  }
  .token.selector, .token.attr-name, .token.string, .token.char,
  .token.builtin, .token.inserted {
    color: var(--syntax-string);
  }
  .token.operator, .token.entity, .token.url {
    color: var(--syntax-punctuation);
  }
  .token.atrule, .token.attr-value, .token.keyword {
    color: var(--syntax-keyword);
  }
  .token.function, .token.class-name {
    color: var(--syntax-entity);
  }
  .token.regex, .token.important, .token.variable {
    color: var(--syntax-variable);
  }
  .token.important, .token.bold {
    font-weight: bold;
  }
  .token.italic {
    font-style: italic;
  }
`;
