export const editorScript = `
(function () {
  const editor = document.querySelector('.editor');
  if (!editor) return;

  const input = editor.querySelector('[data-editor-input]');
  const highlight = editor.querySelector('[data-editor-highlight]');
  const gutter = editor.querySelector('[data-editor-gutter]');
  const statusLabel = editor.querySelector('[data-editor-status]');
  const filePath = editor.dataset.path;

  let savedContent = input.value;
  let highlightTimer = null;
  let highlightPending = false;

  function escapeHtml(value) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function isDirty() {
    return input.value !== savedContent;
  }

  function updateStatus() {
    if (!statusLabel) return;
    statusLabel.textContent = isDirty() ? 'Unsaved changes' : '';
    statusLabel.classList.toggle('is-dirty', isDirty());
  }

  function updateGutter() {
    const lineCount = input.value.split('\\n').length;
    const numbers = [];
    for (let index = 1; index <= lineCount; index++) numbers.push(index);
    gutter.textContent = numbers.join('\\n');
  }

  // The plain text layer updates instantly so the visible text is never stale;
  // colours arrive from the server a moment later. The extra newline keeps the
  // pre element as tall as the textarea, which collapses one trailing newline.
  function renderPlain() {
    highlight.innerHTML = escapeHtml(input.value) + '\\n';
  }

  async function requestHighlight() {
    if (highlightPending) return;
    highlightPending = true;
    const requestedValue = input.value;
    try {
      const result = await RFM.postJson('/highlight-code', { path: filePath, content: requestedValue });
      if (result && result.ok && input.value === requestedValue) {
        highlight.innerHTML = result.html + '\\n';
      }
    } catch (error) {
      // Keep the plain text layer when highlighting is unavailable
    } finally {
      highlightPending = false;
    }
  }

  function scheduleHighlight() {
    if (highlightTimer) clearTimeout(highlightTimer);
    highlightTimer = setTimeout(requestHighlight, 350);
  }

  function handleInput() {
    renderPlain();
    updateGutter();
    updateStatus();
    scheduleHighlight();
  }

  input.addEventListener('input', handleInput);

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const value = input.value;

      if (start !== end && value.slice(start, end).indexOf('\\n') !== -1) {
        const lineStart = value.lastIndexOf('\\n', start - 1) + 1;
        const block = value.slice(lineStart, end);
        const updated = event.shiftKey
          ? block.replace(/^ {1,2}/gm, '')
          : block.replace(/^/gm, '  ');
        input.value = value.slice(0, lineStart) + updated + value.slice(end);
        input.selectionStart = lineStart;
        input.selectionEnd = lineStart + updated.length;
      } else {
        input.value = value.slice(0, start) + '  ' + value.slice(end);
        input.selectionStart = input.selectionEnd = start + 2;
      }
      handleInput();
      return;
    }

    if (event.key === 'Enter') {
      const start = input.selectionStart;
      const value = input.value;
      const lineStart = value.lastIndexOf('\\n', start - 1) + 1;
      const indentMatch = value.slice(lineStart, start).match(/^[ \\t]*/);
      const indent = indentMatch ? indentMatch[0] : '';
      if (indent) {
        event.preventDefault();
        const insertion = '\\n' + indent;
        input.value = value.slice(0, start) + insertion + value.slice(input.selectionEnd);
        input.selectionStart = input.selectionEnd = start + insertion.length;
        handleInput();
      }
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault();
      save();
    }
  });

  async function save() {
    const contentToSave = input.value;
    const result = await RFM.postJson('/save-file', { path: filePath, content: contentToSave });
    if (result.ok) {
      savedContent = contentToSave;
      updateStatus();
    }
    RFM.toast(result.message, result.ok ? 'success' : 'error');
  }

  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-command="save-file"]')) {
      event.preventDefault();
      save();
    }
  });

  globalThis.addEventListener('beforeunload', (event) => {
    if (isDirty()) {
      event.preventDefault();
      event.returnValue = '';
    }
  });

  updateGutter();
  updateStatus();
})();
`;
