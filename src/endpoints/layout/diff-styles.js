export const diffStyles = `
  .diff-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 20px;
    padding: 15px;
    background-color: var(--panel-bg);
    border-radius: 4px;
  }
  .diff-header h2 {
    margin: 0;
    font-family: monospace;
    font-size: 18px;
    word-break: break-all;
    color: var(--heading);
  }
  .diff-actions {
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .diff-container {
    border: 1px solid var(--border);
    border-radius: 6px;
    overflow: hidden;
    background-color: var(--surface);
  }
  .diff-summary {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    background-color: var(--panel-bg);
    border-bottom: 1px solid var(--border);
    font-size: 13px;
  }
  .diff-language {
    padding: 2px 8px;
    border: 1px solid var(--border);
    border-radius: 999px;
    color: var(--muted);
    font-family: monospace;
  }
  .diff-stat {
    font-family: monospace;
    font-weight: 600;
  }
  .diff-stat-added {
    color: var(--success-text);
  }
  .diff-stat-removed {
    color: var(--error-text);
  }
  .diff-scroll {
    overflow-x: auto;
  }
  .diff-table {
    border-collapse: collapse;
    width: 100%;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 12.5px;
    line-height: 20px;
    tab-size: 2;
  }
  .diff-gutter {
    width: 1%;
    min-width: 40px;
    padding: 0 10px;
    text-align: right;
    vertical-align: top;
    color: var(--muted);
    background-color: var(--panel-bg);
    border-right: 1px solid var(--border-subtle);
    user-select: none;
    white-space: nowrap;
  }
  .diff-content {
    padding: 0 10px 0 0;
    white-space: pre;
    vertical-align: top;
    color: var(--text);
  }
  .diff-marker {
    display: inline-block;
    width: 16px;
    padding-left: 6px;
    color: var(--muted);
    user-select: none;
  }
  .diff-added {
    background-color: var(--diff-add-bg);
  }
  .diff-added .diff-gutter {
    background-color: var(--diff-add-gutter-bg);
    color: var(--text);
  }
  .diff-added .diff-marker {
    color: var(--success-text);
  }
  .diff-removed {
    background-color: var(--diff-remove-bg);
  }
  .diff-removed .diff-gutter {
    background-color: var(--diff-remove-gutter-bg);
    color: var(--text);
  }
  .diff-removed .diff-marker {
    color: var(--error-text);
  }
  .diff-hunk .diff-gutter,
  .diff-hunk .diff-content {
    background-color: var(--diff-hunk-bg);
    color: var(--diff-hunk-text);
    padding-top: 4px;
    padding-bottom: 4px;
    border-top: 1px solid var(--border-subtle);
    border-bottom: 1px solid var(--border-subtle);
  }
  .diff-hunk .diff-content {
    padding-left: 22px;
  }
  .diff-hunk-heading {
    color: var(--muted);
  }
  .diff-note .diff-content {
    padding-left: 22px;
    color: var(--muted);
    font-style: italic;
  }
  .diff-empty {
    padding: 20px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background-color: var(--panel-bg);
    color: var(--muted);
  }
  .diff-code .token.comment,
  .diff-code .token.prolog,
  .diff-code .token.cdata {
    color: var(--syntax-comment);
  }
  .diff-code .token.keyword,
  .diff-code .token.rule,
  .diff-code .token.atrule,
  .diff-code .token.important {
    color: var(--syntax-keyword);
  }
  .diff-code .token.string,
  .diff-code .token.char,
  .diff-code .token.attr-value,
  .diff-code .token.regex {
    color: var(--syntax-string);
  }
  .diff-code .token.number,
  .diff-code .token.boolean,
  .diff-code .token.constant,
  .diff-code .token.symbol {
    color: var(--syntax-constant);
  }
  .diff-code .token.function,
  .diff-code .token.class-name,
  .diff-code .token.selector {
    color: var(--syntax-entity);
  }
  .diff-code .token.tag,
  .diff-code .token.attr-name,
  .diff-code .token.property,
  .diff-code .token.variable {
    color: var(--syntax-variable);
  }
  .diff-code .token.operator,
  .diff-code .token.punctuation,
  .diff-code .token.entity,
  .diff-code .token.url {
    color: var(--syntax-punctuation);
  }
  .diff-code .token.deleted {
    color: var(--error-text);
  }
  .diff-code .token.inserted {
    color: var(--success-text);
  }
  @media (max-width: 600px) {
    .diff-table {
      font-size: 11.5px;
    }
    .diff-gutter {
      min-width: 28px;
      padding: 0 6px;
    }
  }
`;
