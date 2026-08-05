export const coreScript = `
window.RFM = (function () {
  const toastStack = document.getElementById('toast-stack');

  function toast(message, kind) {
    if (!toastStack) return;
    const element = document.createElement('div');
    element.className = 'toast' + (kind ? ' is-' + kind : '');
    element.textContent = message;
    toastStack.appendChild(element);
    setTimeout(() => {
      element.style.transition = 'opacity 0.2s';
      element.style.opacity = '0';
      setTimeout(() => element.remove(), 220);
    }, kind === 'error' ? 5000 : 2600);
  }

  async function request(url, options) {
    const response = await fetch(url, options);
    let payload = null;
    try {
      payload = await response.json();
    } catch (error) {
      payload = { ok: false, message: 'Unexpected server response' };
    }
    if (!response.ok && payload && !payload.message) {
      payload.message = 'Request failed with status ' + response.status;
    }
    return payload || { ok: false, message: 'Request failed' };
  }

  function postJson(url, body) {
    return request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  }

  function closeDialog(overlay) {
    if (overlay && overlay.parentNode) overlay.remove();
  }

  function openDialog({ title, bodyHtml, confirmLabel, cancelLabel, isDanger, onConfirm, focusSelector }) {
    const overlay = document.createElement('div');
    overlay.className = 'dialog-overlay';
    overlay.innerHTML =
      '<div class="dialog" role="dialog" aria-modal="true">' +
        '<div class="dialog-header"><h3></h3>' +
          '<button type="button" class="icon-button" data-dialog-close aria-label="Close">' +
            '<svg class="icon"><use href="#icon-close"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="dialog-body">' +
          '<div data-dialog-content></div>' +
          '<div class="dialog-buttons">' +
            '<button type="button" class="button" data-dialog-close></button>' +
            '<button type="button" class="button" data-dialog-confirm></button>' +
          '</div>' +
        '</div>' +
      '</div>';

    overlay.querySelector('h3').textContent = title;
    overlay.querySelector('[data-dialog-content]').innerHTML = bodyHtml || '';
    const cancelButton = overlay.querySelector('.dialog-buttons [data-dialog-close]');
    cancelButton.textContent = cancelLabel || 'Cancel';
    const confirmButton = overlay.querySelector('[data-dialog-confirm]');
    confirmButton.textContent = confirmLabel || 'OK';
    confirmButton.classList.add(isDanger ? 'button-danger' : 'button-primary');

    document.body.appendChild(overlay);

    const focusTarget = focusSelector ? overlay.querySelector(focusSelector) : confirmButton;
    if (focusTarget) {
      focusTarget.focus();
      if (focusTarget.tagName === 'INPUT' && focusTarget.value) {
        const lastDot = focusTarget.value.lastIndexOf('.');
        if (lastDot > 0) focusTarget.setSelectionRange(0, lastDot);
        else focusTarget.select();
      }
    }

    function finish() {
      const values = {};
      overlay.querySelectorAll('input[name]').forEach((input) => {
        values[input.name] = input.value;
      });
      closeDialog(overlay);
      if (onConfirm) onConfirm(values);
    }

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay || event.target.closest('[data-dialog-close]')) {
        closeDialog(overlay);
      } else if (event.target.closest('[data-dialog-confirm]')) {
        finish();
      }
    });
    overlay.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        closeDialog(overlay);
      } else if (event.key === 'Enter' && event.target.tagName === 'INPUT') {
        event.preventDefault();
        finish();
      }
    });

    return overlay;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function submitHiddenForm(action, fields) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = action;
    form.style.display = 'none';
    fields.forEach(([name, value]) => {
      const input = document.createElement('input');
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
    setTimeout(() => form.remove(), 1000);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      const helper = document.createElement('textarea');
      helper.value = text;
      helper.style.position = 'fixed';
      helper.style.opacity = '0';
      document.body.appendChild(helper);
      helper.select();
      let copied = false;
      try {
        copied = document.execCommand('copy');
      } catch (fallbackError) {
        copied = false;
      }
      helper.remove();
      return copied;
    }
  }

  // Popover menus: only one open at a time, flipped up near the viewport bottom
  function closeAllMenus(except) {
    document.querySelectorAll('.dropdown.is-open, .entry-menu.is-open').forEach((menu) => {
      if (menu !== except) menu.classList.remove('is-open');
    });
  }

  function positionMenu(container) {
    const popover = container.querySelector('.menu-popover');
    if (!popover) return;
    popover.classList.remove('is-flipped', 'align-left');
    popover.style.position = '';
    popover.style.top = '';
    popover.style.left = '';

    // Row menus live inside a scrolling pane, so they are pinned to the
    // viewport instead of the row to avoid being clipped by the overflow
    const trigger = container.querySelector('.entry-menu-trigger');
    if (trigger) {
      const triggerRect = trigger.getBoundingClientRect();
      popover.style.position = 'fixed';
      popover.style.left = '0px';
      popover.style.top = '0px';
      const menuRect = popover.getBoundingClientRect();
      let left = triggerRect.right - menuRect.width;
      let top = triggerRect.bottom + 4;
      if (top + menuRect.height > window.innerHeight - 8) {
        top = triggerRect.top - menuRect.height - 4;
      }
      popover.style.left = Math.max(left, 8) + 'px';
      popover.style.top = Math.max(top, 8) + 'px';
      return;
    }

    const rect = popover.getBoundingClientRect();
    if (rect.bottom > window.innerHeight - 8) {
      popover.classList.add('is-flipped');
    }
    if (rect.left < 8) {
      popover.classList.add('align-left');
    }
  }

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('.entry-menu-trigger, .dropdown-trigger');
    if (trigger) {
      event.preventDefault();
      event.stopPropagation();
      const container = trigger.closest('.entry-menu, .dropdown');
      const wasOpen = container.classList.contains('is-open');
      closeAllMenus();
      if (!wasOpen) {
        container.classList.add('is-open');
        positionMenu(container);
      }
      return;
    }
    if (!event.target.closest('.menu-popover')) {
      closeAllMenus();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAllMenus();
  });

  document.addEventListener('scroll', () => closeAllMenus(), true);
  globalThis.addEventListener('resize', () => closeAllMenus());

  // The bar stacks onto two rows on narrow screens, so sticky offsets below it
  // follow its measured height instead of a hard coded value
  const appBar = document.querySelector('.app-bar');
  if (appBar) {
    const syncAppBarOffset = () => {
      document.documentElement.style.setProperty(
        '--app-bar-offset',
        appBar.offsetHeight + 'px'
      );
    };
    syncAppBarOffset();
    globalThis.addEventListener('resize', syncAppBarOffset);
    if (typeof ResizeObserver === 'function') {
      new ResizeObserver(syncAppBarOffset).observe(appBar);
    }
  }

  return { toast, request, postJson, openDialog, closeDialog, escapeHtml, submitHiddenForm, copyText, closeAllMenus };
})();
`;
