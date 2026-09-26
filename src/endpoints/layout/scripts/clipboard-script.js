export const clipboardScript = `
(function () {
  const explorer = document.querySelector('.explorer');
  if (!explorer) return;

  function extensionForType(type) {
    if (!type) return 'txt';
    if (type === 'image/png') return 'png';
    if (type === 'image/jpeg') return 'jpg';
    if (type === 'image/gif') return 'gif';
    if (type === 'image/webp') return 'webp';
    if (type === 'image/svg+xml') return 'svg';
    if (type.indexOf('image/') === 0) return type.split('/')[1] || 'img';
    if (type === 'text/html') return 'html';
    return 'txt';
  }

  function timestampName() {
    const now = new Date();
    const pad = (value) => String(value).padStart(2, '0');
    return 'pasted-' + now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate()) +
      '-' + pad(now.getHours()) + pad(now.getMinutes()) + pad(now.getSeconds());
  }

  function showSaveDialog(pane, blob, extension) {
    const defaultName = timestampName() + '.' + extension;
    RFM.openDialog({
      title: 'Save clipboard content',
      bodyHtml: '<label for="paste-name">File name</label><input type="text" id="paste-name" name="name" value="' +
        RFM.escapeHtml(defaultName) + '" autocomplete="off">',
      confirmLabel: 'Save',
      focusSelector: '#paste-name',
      onConfirm: async (values) => {
        const name = (values.name || '').trim();
        if (!name) return;
        const formData = new FormData();
        formData.append('path', pane.dataset.path);
        formData.append('filename', name);
        formData.append('file', blob, name);
        const result = await RFM.request('/paste-content', { method: 'POST', body: formData });
        RFM.toast(result.message, result.ok ? 'success' : 'error');
        if (result.ok && window.RFM_EXPLORER) window.RFM_EXPLORER.refreshAllPanes();
      }
    });
  }

  async function pasteFromClipboard(pane) {
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const binaryType = item.types.find((type) => type.indexOf('image/') === 0);
          if (binaryType) {
            const blob = await item.getType(binaryType);
            showSaveDialog(pane, blob, extensionForType(binaryType));
            return;
          }
        }
      }
      const text = await navigator.clipboard.readText();
      if (text && text.trim().length > 0) {
        showSaveDialog(pane, new Blob([text], { type: 'text/plain' }), 'txt');
        return;
      }
      RFM.toast('Clipboard is empty', 'error');
    } catch (error) {
      RFM.toast('Clipboard access was denied. Use Ctrl+V instead.', 'error');
    }
  }

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-command="paste-clipboard"]');
    if (!trigger) return;
    event.preventDefault();
    const pane = trigger.closest('.pane') ||
      (window.RFM_EXPLORER && window.RFM_EXPLORER.getActivePane());
    if (pane) pasteFromClipboard(pane);
  });

  document.addEventListener('paste', (event) => {
    if (/^(INPUT|TEXTAREA)$/.test(event.target.tagName)) return;
    if (document.querySelector('.dialog-overlay')) return;

    const clipboardData = event.clipboardData;
    if (!clipboardData) return;

    const pane = window.RFM_EXPLORER ? window.RFM_EXPLORER.getActivePane() : null;
    if (!pane) return;

    if (clipboardData.files && clipboardData.files.length > 0) {
      event.preventDefault();
      const file = clipboardData.files[0];
      showSaveDialog(pane, file, extensionForType(file.type));
      return;
    }

    const html = clipboardData.getData('text/html');
    const text = clipboardData.getData('text/plain');
    if (html || text) {
      event.preventDefault();
      const content = html || text;
      showSaveDialog(pane, new Blob([content], { type: html ? 'text/html' : 'text/plain' }), html ? 'html' : 'txt');
    }
  });
})();
`;
