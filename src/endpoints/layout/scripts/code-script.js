export const codeScript = `
(function () {
  function copyToClipboard(text) {
    RFM.copyText(text).then((copied) => {
      RFM.toast(copied ? 'Copied to clipboard' : 'Could not copy', copied ? 'success' : 'error');
    });
  }

  // Source viewer: wrapping, copying, previewing and line anchors
  document.addEventListener('click', (event) => {
    const wrapButton = event.target.closest('[data-command="toggle-wrap"]');
    if (wrapButton) {
      event.preventDefault();
      const container = wrapButton.closest('.code-view, .editor');
      if (container) container.classList.toggle('is-wrapped');
      return;
    }

    const copyButton = event.target.closest('[data-command="copy-code"]');
    if (copyButton) {
      event.preventDefault();
      const view = copyButton.closest('.code-view');
      if (!view) return;
      const lines = Array.prototype.slice.call(view.querySelectorAll('.code-line-content'));
      copyToClipboard(lines.map((line) => line.textContent.replace(/\\u200b/g, '')).join('\\n'));
      return;
    }

    const copyEditorButton = event.target.closest('[data-command="copy-editor"]');
    if (copyEditorButton) {
      event.preventDefault();
      const editor = copyEditorButton.closest('.editor');
      const input = editor ? editor.querySelector('[data-editor-input]') : null;
      if (input) copyToClipboard(input.value);
      return;
    }

    const previewButton = event.target.closest('[data-command="toggle-preview"]');
    if (previewButton) {
      event.preventDefault();
      const view = previewButton.closest('.code-view');
      const preview = view ? view.querySelector('.code-preview') : null;
      if (!preview) return;
      const isPreviewing = view.classList.toggle('is-previewing');
      preview.hidden = !isPreviewing;
      previewButton.classList.toggle('is-active', isPreviewing);
      previewButton.setAttribute('aria-pressed', String(isPreviewing));
      const frame = preview.querySelector('iframe[data-src]');
      if (frame && isPreviewing && !frame.getAttribute('src')) {
        frame.setAttribute('src', frame.dataset.src);
      }
      return;
    }

    const lineNumber = event.target.closest('.code-line-number a');
    if (lineNumber) {
      const view = lineNumber.closest('.code-view');
      if (view) {
        view.querySelectorAll('.code-line.is-highlighted').forEach((line) => line.classList.remove('is-highlighted'));
        lineNumber.closest('.code-line').classList.add('is-highlighted');
      }
    }
  });

  // Diff viewer: layout switching and per file collapsing
  document.addEventListener('click', (event) => {
    const layoutButton = event.target.closest('[data-diff-layout]');
    if (layoutButton) {
      event.preventDefault();
      const container = layoutButton.closest('.diff-container');
      if (!container) return;
      container.dataset.diffMode = layoutButton.dataset.diffLayout;
      container.querySelectorAll('[data-diff-layout]').forEach((button) => {
        button.classList.toggle('is-active', button === layoutButton);
      });
      try {
        localStorage.setItem('rfm-diff-mode', layoutButton.dataset.diffLayout);
      } catch (error) {}
      return;
    }

    const fileToggle = event.target.closest('.diff-file-toggle');
    if (fileToggle) {
      event.preventDefault();
      const file = fileToggle.closest('.diff-file');
      const isCollapsed = file.classList.toggle('is-collapsed');
      fileToggle.setAttribute('aria-expanded', String(!isCollapsed));
      return;
    }

    const jumpLink = event.target.closest('[data-jump-to-file]');
    if (jumpLink) {
      const target = document.querySelector('.diff-file[data-path="' + CSS.escape(jumpLink.dataset.jumpToFile) + '"]');
      if (target) {
        event.preventDefault();
        target.classList.remove('is-collapsed');
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });

  const diffContainer = document.querySelector('.diff-container');
  if (diffContainer) {
    let storedMode = null;
    try {
      storedMode = localStorage.getItem('rfm-diff-mode');
    } catch (error) {}
    if (storedMode === 'split' || storedMode === 'unified') {
      diffContainer.dataset.diffMode = storedMode;
      diffContainer.querySelectorAll('[data-diff-layout]').forEach((button) => {
        button.classList.toggle('is-active', button.dataset.diffLayout === storedMode);
      });
    }
  }
})();
`;
