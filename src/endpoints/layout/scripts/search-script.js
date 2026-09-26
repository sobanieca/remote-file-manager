export const searchScript = `
(function () {
  const overlay = document.getElementById('search-overlay');
  if (!overlay) return;

  const input = overlay.querySelector('[data-search-input]');
  const list = overlay.querySelector('[data-search-results]');
  const statusLabel = overlay.querySelector('[data-search-status]');

  const ICON_BY_KIND = {
    folder: 'folder', image: 'image', video: 'video', audio: 'audio', archive: 'archive',
    pdf: 'pdf', spreadsheet: 'spreadsheet', document: 'file-text', text: 'file-text',
    code: 'file-code', file: 'file'
  };

  let results = [];
  let activeIndex = -1;
  let debounceTimer = null;
  let controller = null;
  let latestRequest = 0;
  let indexSummary = null;

  function isOpen() {
    return !overlay.hidden;
  }

  function parentOf(path) {
    const slash = path.lastIndexOf('/');
    return slash === -1 ? '.' : path.slice(0, slash);
  }

  function describeIndex() {
    if (!indexSummary) return '';
    return indexSummary.indexedCount.toLocaleString() + ' entries' + (indexSummary.truncated ? ' (partial index)' : '');
  }

  function setStatus(text) {
    statusLabel.textContent = text;
  }

  function renderSegment(text, offset, marks) {
    let html = '';
    for (let index = 0; index < text.length; index++) {
      const character = RFM.escapeHtml(text[index]);
      html += marks.has(offset + index) ? '<mark>' + character + '</mark>' : character;
    }
    return html;
  }

  function renderPath(result) {
    const marks = new Set(result.positions || []);
    const slash = result.path.lastIndexOf('/');
    const directory = slash === -1 ? '' : result.path.slice(0, slash + 1);
    const name = result.path.slice(slash + 1);
    const directoryHtml = directory
      ? '<span class="search-result-dir">' + renderSegment(directory, 0, marks) + '</span>'
      : '';
    return '<span class="search-result-name">' + renderSegment(name, slash + 1, marks) + '</span>' + directoryHtml;
  }

  function renderResults() {
    list.innerHTML = results.map((result, index) => {
      const iconName = ICON_BY_KIND[result.kind] || 'file';
      return '<li class="search-result' + (index === activeIndex ? ' is-active' : '') +
        '" role="option" data-index="' + index + '" aria-selected="' + (index === activeIndex) + '">' +
        '<span class="entry-visual entry-visual-' + result.kind + '"><svg class="icon" aria-hidden="true"><use href="#icon-' + iconName + '"/></svg></span>' +
        '<span class="search-result-path" title="' + RFM.escapeHtml(result.path) + '">' + renderPath(result) + '</span>' +
        '<button type="button" class="icon-button search-result-reveal" data-search-reveal="' + index + '" title="Reveal in file explorer" aria-label="Reveal in file explorer">' +
          '<svg class="icon" aria-hidden="true"><use href="#icon-folder-up"/></svg>' +
        '</button>' +
      '</li>';
    }).join('');
  }

  function setActive(index) {
    if (results.length === 0) {
      activeIndex = -1;
      return;
    }
    activeIndex = Math.min(Math.max(index, 0), results.length - 1);
    list.querySelectorAll('.search-result').forEach((element) => {
      const isActive = Number(element.dataset.index) === activeIndex;
      element.classList.toggle('is-active', isActive);
      element.setAttribute('aria-selected', String(isActive));
      if (isActive) element.scrollIntoView({ block: 'nearest' });
    });
  }

  async function search(query) {
    if (controller) controller.abort();
    controller = new AbortController();
    const requestId = ++latestRequest;
    const trimmed = query.trim();

    try {
      const response = await fetch('/search-files?q=' + encodeURIComponent(trimmed), { signal: controller.signal });
      const payload = await response.json();
      if (requestId !== latestRequest) return;
      if (!payload.ok) {
        setStatus(payload.message || 'Search failed');
        return;
      }
      indexSummary = { indexedCount: payload.indexedCount, truncated: payload.truncated };
      results = payload.results || [];
      activeIndex = results.length > 0 ? 0 : -1;
      renderResults();
      if (!trimmed) {
        setStatus(describeIndex());
      } else if (results.length === 0) {
        setStatus('No matches');
      } else if (payload.total > results.length) {
        setStatus('Top ' + results.length + ' of ' + payload.total.toLocaleString() + ' matches');
      } else {
        setStatus(payload.total + (payload.total === 1 ? ' match' : ' matches'));
      }
    } catch (error) {
      if (error.name !== 'AbortError' && requestId === latestRequest) {
        setStatus('Search failed');
      }
    }
  }

  function scheduleSearch() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => search(input.value), 70);
  }

  function open() {
    if (!isOpen()) {
      overlay.hidden = false;
      search(input.value);
    }
    input.focus();
    input.select();
  }

  function close() {
    if (!isOpen()) return;
    overlay.hidden = true;
    if (controller) controller.abort();
    if (debounceTimer) clearTimeout(debounceTimer);
  }

  function openResult(result, reveal) {
    const explorer = window.RFM_EXPLORER;
    if (reveal) {
      if (explorer) {
        close();
        explorer.revealPath(result.path);
        return;
      }
      window.location.href = '/file-explorer?path=' + encodeURIComponent(parentOf(result.path)) +
        '&reveal=' + encodeURIComponent(result.path);
      return;
    }
    if (result.isDirectory) {
      if (explorer) {
        close();
        explorer.navigateActive(result.path);
        return;
      }
      window.location.href = '/file-explorer?path=' + encodeURIComponent(result.path);
      return;
    }
    window.location.href = (result.isMarkdown ? '/markdown?path=' : '/view-file?path=') +
      encodeURIComponent(result.path);
  }

  input.addEventListener('input', scheduleSearch);

  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive(activeIndex + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive(activeIndex - 1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) openResult(results[activeIndex], event.shiftKey);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      close();
    }
  });

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay || event.target.closest('[data-search-close]')) {
      close();
      return;
    }
    const revealButton = event.target.closest('[data-search-reveal]');
    if (revealButton) {
      event.preventDefault();
      const result = results[Number(revealButton.dataset.searchReveal)];
      if (result) openResult(result, true);
      return;
    }
    const row = event.target.closest('.search-result');
    if (row) {
      const result = results[Number(row.dataset.index)];
      if (result) openResult(result, false);
    }
  });

  list.addEventListener('mousemove', (event) => {
    const row = event.target.closest('.search-result');
    if (row && Number(row.dataset.index) !== activeIndex) setActive(Number(row.dataset.index));
  });

  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-search-open]')) {
      event.preventDefault();
      open();
    }
  });

  // Registered in the capture phase so the shortcut wins over page level
  // keyboard handling such as the file list navigation
  document.addEventListener('keydown', (event) => {
    const isShortcut = (event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey &&
      (event.key === 'p' || event.key === 'P');
    if (isShortcut) {
      event.preventDefault();
      event.stopPropagation();
      open();
      return;
    }
    if (event.key === 'Escape' && isOpen()) {
      event.stopPropagation();
      close();
    }
  }, true);

  window.RFM_SEARCH = { open: open, close: close, isOpen: isOpen };
})();
`;
