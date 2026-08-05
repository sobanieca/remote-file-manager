export const fileEditorStyles = `
  .editor {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background-color: var(--editor-bg);
    overflow: hidden;
  }
  .editor-toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px 12px;
    border-bottom: 1px solid var(--border);
    background-color: var(--panel-bg);
    flex-wrap: wrap;
  }
  .editor-status {
    font-size: 12px;
    color: var(--muted);
  }
  .editor-status.is-dirty {
    color: var(--warning-text);
  }
  .editor-surface {
    display: flex;
    align-items: stretch;
    max-height: 74vh;
    overflow: auto;
  }
  .editor-gutter {
    margin: 0;
    padding: 12px 10px 12px 14px;
    border-right: 1px solid var(--border-subtle);
    background-color: var(--panel-bg);
    color: var(--muted);
    font-family: var(--font-mono);
    font-size: 13px;
    line-height: 1.55;
    text-align: right;
    user-select: none;
    white-space: pre;
    position: sticky;
    left: 0;
    z-index: 2;
  }
  .editor-code {
    position: relative;
    flex: 1;
    min-width: 0;
  }
  .editor-highlight,
  .editor-input {
    margin: 0;
    padding: 12px 16px;
    border: none;
    font-family: var(--font-mono);
    font-size: 13px;
    line-height: 1.55;
    tab-size: 2;
    white-space: pre;
    overflow-wrap: normal;
    word-break: normal;
  }
  .editor-highlight {
    min-height: 60vh;
    pointer-events: none;
    background: transparent;
    color: var(--text);
    overflow: visible;
  }
  .editor-highlight code {
    font: inherit;
  }
  .editor-input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    resize: none;
    overflow: hidden;
    background: transparent;
    color: transparent;
    caret-color: var(--text);
    outline: none;
  }
  .editor-input::selection {
    background-color: var(--selected-bg);
  }
  .editor.is-wrapped .editor-highlight,
  .editor.is-wrapped .editor-input {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
`;
