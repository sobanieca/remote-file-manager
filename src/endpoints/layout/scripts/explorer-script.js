export const explorerScript = `
(function () {
  const explorer = document.querySelector('.explorer');
  if (!explorer) return;

  const VIEW_MODE_KEY = 'rfm-view-mode';
  const SORT_KEY = 'rfm-sort-key';
  const SORT_DIRECTION_KEY = 'rfm-sort-direction';

  const paneState = new WeakMap();

  function readSetting(key, fallback) {
    try {
      return localStorage.getItem(key) || fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeSetting(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {}
  }

  function getPanes() {
    return Array.prototype.slice.call(explorer.querySelectorAll('.pane'));
  }

  function isSplit() {
    return explorer.dataset.split === 'true';
  }

  function getState(pane) {
    if (!paneState.has(pane)) {
      paneState.set(pane, {
        history: [],
        filter: '',
        sortKey: readSetting(SORT_KEY, 'name'),
        sortDirection: readSetting(SORT_DIRECTION_KEY, 'asc'),
        anchorIndex: -1
      });
    }
    return paneState.get(pane);
  }

  function getActivePane() {
    return explorer.querySelector('.pane.is-active') || getPanes()[0];
  }

  function getOtherPane(pane) {
    return getPanes().filter((candidate) => candidate !== pane)[0] || null;
  }

  function setActivePane(pane) {
    getPanes().forEach((candidate) => candidate.classList.toggle('is-active', candidate === pane));
  }

  function getRows(pane) {
    return Array.prototype.slice.call(pane.querySelectorAll('.file-row:not(.is-parent)'));
  }

  function getVisibleRows(pane) {
    return getRows(pane).filter((row) => !row.hidden);
  }

  function getSelectedRows(pane) {
    return getRows(pane).filter((row) => row.classList.contains('is-selected'));
  }

  function updateUrl() {
    const panes = getPanes();
    const params = new URLSearchParams();
    params.set('path', panes[0].dataset.path);
    if (isSplit() && panes[1]) {
      params.set('right', panes[1].dataset.path);
    }
    history.replaceState(null, '', '/file-explorer?' + params.toString());
  }

  function applyViewMode(pane) {
    const list = pane.querySelector('.file-list');
    if (!list) return;
    const mode = readSetting(VIEW_MODE_KEY, 'list');
    list.classList.toggle('is-grid', mode === 'grid');
    pane.querySelectorAll('[data-view-mode]').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.viewMode === mode);
    });
  }

  function compareRows(first, second, key, direction) {
    const firstIsDirectory = first.dataset.directory === 'true';
    const secondIsDirectory = second.dataset.directory === 'true';
    if (firstIsDirectory !== secondIsDirectory) return firstIsDirectory ? -1 : 1;

    let result = 0;
    if (key === 'size') {
      result = Number(first.dataset.size) - Number(second.dataset.size);
    } else if (key === 'modified') {
      result = Number(first.dataset.modified) - Number(second.dataset.modified);
    } else {
      result = (first.dataset.name || '').localeCompare(second.dataset.name || '', undefined, { numeric: true, sensitivity: 'base' });
    }
    if (result === 0) {
      result = (first.dataset.name || '').localeCompare(second.dataset.name || '');
    }
    return direction === 'desc' ? -result : result;
  }

  function applySort(pane) {
    const state = getState(pane);
    const container = pane.querySelector('.file-rows');
    if (!container) return;

    const rows = getRows(pane);
    rows.sort((first, second) => compareRows(first, second, state.sortKey, state.sortDirection));
    rows.forEach((row) => container.appendChild(row));

    pane.querySelectorAll('.column-sort').forEach((button) => {
      const isSorted = button.dataset.sortKey === state.sortKey;
      button.classList.toggle('is-sorted', isSorted);
      button.classList.toggle('is-descending', isSorted && state.sortDirection === 'desc');
    });
  }

  function applyFilter(pane) {
    const state = getState(pane);
    const needle = state.filter.trim().toLowerCase();
    let visibleCount = 0;

    getRows(pane).forEach((row) => {
      const matches = !needle || (row.dataset.name || '').toLowerCase().indexOf(needle) !== -1;
      row.hidden = !matches;
      if (matches) visibleCount++;
      if (!matches && row.classList.contains('is-selected')) {
        setRowSelected(row, false);
      }
    });

    const parentRow = pane.querySelector('.file-row.is-parent');
    if (parentRow) parentRow.hidden = Boolean(needle);

    const noMatches = pane.querySelector('.pane-no-matches');
    if (noMatches) noMatches.hidden = !needle || visibleCount > 0;

    updateSelectionUi(pane);
  }

  function setRowSelected(row, isSelected) {
    row.classList.toggle('is-selected', isSelected);
    const checkbox = row.querySelector('.row-select');
    if (checkbox) checkbox.checked = isSelected;
  }

  function clearSelection(pane) {
    getRows(pane).forEach((row) => setRowSelected(row, false));
    updateSelectionUi(pane);
  }

  function updateSelectionUi(pane) {
    const selected = getSelectedRows(pane);
    const bar = pane.querySelector('.selection-bar');
    const summary = pane.querySelector('.selection-summary');
    const statusSelection = pane.querySelector('.pane-status-selection');

    if (bar) bar.hidden = selected.length === 0;
    if (summary) summary.textContent = selected.length + ' selected';
    if (statusSelection) statusSelection.textContent = selected.length > 0 ? selected.length + ' selected' : '';

    const selectAll = pane.querySelector('.select-all');
    if (selectAll) {
      const visible = getVisibleRows(pane);
      selectAll.checked = visible.length > 0 && selected.length === visible.length;
      selectAll.indeterminate = selected.length > 0 && selected.length < visible.length;
    }

    pane.querySelectorAll('[data-split-only="true"]').forEach((element) => {
      element.style.display = isSplit() ? '' : 'none';
    });
  }

  function setFocusedRow(pane, row) {
    getRows(pane).forEach((candidate) => candidate.classList.toggle('is-focused', candidate === row));
    if (row) row.scrollIntoView({ block: 'nearest' });
  }

  function getFocusedRow(pane) {
    return pane.querySelector('.file-row.is-focused');
  }

  function applyPaneState(pane) {
    applyViewMode(pane);
    applySort(pane);
    applyFilter(pane);
    updateSelectionUi(pane);
    const filterInput = pane.querySelector('.filter-input');
    if (filterInput) filterInput.value = getState(pane).filter;
  }

  async function loadPane(pane, path) {
    try {
      const response = await fetch('/file-pane?path=' + encodeURIComponent(path));
      if (!response.ok) {
        RFM.toast(await response.text(), 'error');
        return false;
      }
      pane.innerHTML = await response.text();
      pane.dataset.path = path;
      applyPaneState(pane);
      updateUrl();
      return true;
    } catch (error) {
      RFM.toast('Could not load ' + path, 'error');
      return false;
    }
  }

  function refreshPane(pane) {
    return loadPane(pane, pane.dataset.path);
  }

  function refreshAllPanes() {
    return Promise.all(getPanes().map((pane) => refreshPane(pane)));
  }

  async function navigate(pane, path) {
    const state = getState(pane);
    const previousPath = pane.dataset.path;
    state.filter = '';
    const loaded = await loadPane(pane, path);
    if (loaded && previousPath !== path) {
      state.history.push(previousPath);
    }
  }

  function goBack(pane) {
    const state = getState(pane);
    if (state.history.length === 0) return;
    const previous = state.history.pop();
    state.filter = '';
    loadPane(pane, previous);
  }

  function goUp(pane) {
    const current = pane.dataset.path;
    if (current === '.') return;
    const segments = current.split('/');
    segments.pop();
    navigate(pane, segments.join('/') || '.');
  }

  function collectPaths(rows) {
    return rows.map((row) => row.dataset.path);
  }

  function describeTargets(rows) {
    if (rows.length === 1) return '"' + rows[0].dataset.name + '"';
    return rows.length + ' items';
  }

  function targetsFor(pane, element) {
    if (element && element.dataset && element.dataset.path) {
      const row = element.closest('.file-row');
      if (row && row.classList.contains('is-selected') && getSelectedRows(pane).length > 1) {
        return getSelectedRows(pane);
      }
      return row ? [row] : [];
    }
    const selected = getSelectedRows(pane);
    if (selected.length > 0) return selected;
    const focused = getFocusedRow(pane);
    return focused ? [focused] : [];
  }

  async function deleteTargets(pane, rows, isRecursive) {
    if (rows.length === 0) {
      RFM.toast('Nothing selected', 'error');
      return;
    }
    const paths = collectPaths(rows);
    const result = await RFM.postJson('/delete-items', { paths: paths, recursive: isRecursive === true });

    if (result.notEmpty && result.notEmpty.length > 0) {
      RFM.openDialog({
        title: 'Folder not empty',
        bodyHtml: '<p>' + RFM.escapeHtml(result.notEmpty.join(', ')) + ' is not empty. Delete everything inside?</p>',
        confirmLabel: 'Delete recursively',
        isDanger: true,
        onConfirm: () => deleteTargets(pane, rows, true)
      });
      return;
    }

    RFM.toast(result.message, result.ok ? 'success' : 'error');
    refreshAllPanes();
  }

  function confirmDelete(pane, rows) {
    if (rows.length === 0) {
      RFM.toast('Nothing selected', 'error');
      return;
    }
    RFM.openDialog({
      title: 'Delete',
      bodyHtml: '<p>Permanently delete ' + RFM.escapeHtml(describeTargets(rows)) + '? This cannot be undone.</p>',
      confirmLabel: 'Delete',
      isDanger: true,
      onConfirm: () => deleteTargets(pane, rows, false)
    });
  }

  async function transfer(pane, rows, isMove, overwrite) {
    const other = getOtherPane(pane);
    if (!other) {
      RFM.toast('Enable split view to copy or move between panes', 'error');
      return;
    }
    if (rows.length === 0) {
      RFM.toast('Nothing selected', 'error');
      return;
    }

    const endpoint = isMove ? '/move-items' : '/copy-items';
    const result = await RFM.postJson(endpoint, {
      paths: collectPaths(rows),
      targetPath: other.dataset.path,
      overwrite: overwrite === true
    });

    if (result.conflicts && result.conflicts.length > 0) {
      RFM.openDialog({
        title: 'Already exists',
        bodyHtml: '<p>These items already exist in the target folder:</p><ul class="dialog-list">' +
          result.conflicts.map((name) => '<li>' + RFM.escapeHtml(name) + '</li>').join('') +
          '</ul><p>Overwrite them?</p>',
        confirmLabel: 'Overwrite',
        isDanger: true,
        onConfirm: () => transfer(pane, rows, isMove, true)
      });
      return;
    }

    RFM.toast(result.message, result.ok ? 'success' : 'error');
    refreshAllPanes();
  }

  function promptCreate(pane, isDirectory) {
    RFM.openDialog({
      title: isDirectory ? 'New folder' : 'New file',
      bodyHtml: '<label for="create-name">Name</label><input type="text" id="create-name" name="name" autocomplete="off">',
      confirmLabel: 'Create',
      focusSelector: '#create-name',
      onConfirm: async (values) => {
        const name = (values.name || '').trim();
        if (!name) return;
        const result = await RFM.postJson('/create-item', {
          path: pane.dataset.path,
          name: name,
          type: isDirectory ? 'directory' : 'file'
        });
        RFM.toast(result.message, result.ok ? 'success' : 'error');
        if (result.ok) refreshAllPanes();
      }
    });
  }

  function promptRename(pane, row) {
    if (!row) {
      RFM.toast('Nothing selected', 'error');
      return;
    }
    RFM.openDialog({
      title: 'Rename',
      bodyHtml: '<label for="rename-name">New name</label><input type="text" id="rename-name" name="name" value="' +
        RFM.escapeHtml(row.dataset.name) + '" autocomplete="off">',
      confirmLabel: 'Rename',
      focusSelector: '#rename-name',
      onConfirm: async (values) => {
        const newName = (values.name || '').trim();
        if (!newName || newName === row.dataset.name) return;
        const result = await RFM.postJson('/rename-item', { path: row.dataset.path, newName: newName });
        RFM.toast(result.message, result.ok ? 'success' : 'error');
        if (result.ok) refreshAllPanes();
      }
    });
  }

  function downloadSelection(pane, rows) {
    if (rows.length === 0) {
      RFM.toast('Nothing selected', 'error');
      return;
    }
    if (rows.length === 1) {
      const row = rows[0];
      const type = row.dataset.directory === 'true' ? 'directory' : 'file';
      window.location.href = '/download-item?path=' + encodeURIComponent(row.dataset.path) + '&type=' + type;
      return;
    }
    RFM.submitHiddenForm('/download-items', collectPaths(rows).map((path) => ['paths', path]));
  }

  function startUpload(pane, isFolder) {
    const input = document.getElementById('file-input');
    if (!input) return;
    if (isFolder) {
      input.setAttribute('webkitdirectory', '');
      input.setAttribute('directory', '');
    } else {
      input.removeAttribute('webkitdirectory');
      input.removeAttribute('directory');
    }
    input.dataset.targetPane = pane.dataset.pane;
    input.value = '';
    input.click();
  }

  const fileInput = document.getElementById('file-input');
  if (fileInput) {
    fileInput.addEventListener('change', async () => {
      if (fileInput.files.length === 0) return;
      const pane = explorer.querySelector('.pane[data-pane="' + fileInput.dataset.targetPane + '"]') || getActivePane();
      const formData = new FormData();
      formData.append('path', pane.dataset.path);
      for (const file of fileInput.files) {
        formData.append('files', file, file.webkitRelativePath || file.name);
      }
      RFM.toast('Uploading ' + fileInput.files.length + ' file(s)…');
      const result = await RFM.request('/upload-files', { method: 'POST', body: formData });
      RFM.toast(result.message, result.ok ? 'success' : 'error');
      refreshAllPanes();
    });
  }

  function setLayout(layout) {
    const panes = getPanes();
    const params = new URLSearchParams();
    params.set('path', panes[0].dataset.path);
    if (layout === 'split') {
      params.set('right', panes[1] ? panes[1].dataset.path : panes[0].dataset.path);
    }
    window.location.href = '/file-explorer?' + params.toString();
  }

  function openRow(pane, row) {
    if (!row) return;
    if (row.dataset.directory === 'true' && row.dataset.deleted !== 'true') {
      navigate(pane, row.dataset.path);
      return;
    }
    const link = row.querySelector('.entry-link');
    if (link && link.href) window.location.href = link.href;
  }

  function revealRow(pane, path) {
    const row = getRows(pane).find((candidate) => candidate.dataset.path === path);
    if (!row) return false;
    clearSelection(pane);
    setRowSelected(row, true);
    getState(pane).anchorIndex = getVisibleRows(pane).indexOf(row);
    updateSelectionUi(pane);
    setFocusedRow(pane, row);
    return true;
  }

  function parentOf(path) {
    const slash = path.lastIndexOf('/');
    return slash === -1 ? '.' : path.slice(0, slash);
  }

  async function revealPath(path) {
    const pane = getActivePane();
    const parent = parentOf(path);
    if (pane.dataset.path !== parent) {
      await navigate(pane, parent);
    }
    if (!revealRow(pane, path)) RFM.toast('Could not find ' + path, 'error');
  }

  function selectRange(pane, row) {
    const state = getState(pane);
    const visible = getVisibleRows(pane);
    const targetIndex = visible.indexOf(row);
    const anchorIndex = state.anchorIndex >= 0 && state.anchorIndex < visible.length ? state.anchorIndex : targetIndex;
    const start = Math.min(anchorIndex, targetIndex);
    const end = Math.max(anchorIndex, targetIndex);
    visible.forEach((candidate, index) => setRowSelected(candidate, index >= start && index <= end));
    updateSelectionUi(pane);
  }

  // Pane level interactions
  explorer.addEventListener('mousedown', (event) => {
    const pane = event.target.closest('.pane');
    if (pane) setActivePane(pane);
  });

  explorer.addEventListener('click', (event) => {
    const pane = event.target.closest('.pane');

    const navigateLink = event.target.closest('[data-navigate]');
    if (navigateLink && pane) {
      event.preventDefault();
      navigate(pane, navigateLink.dataset.navigate);
      return;
    }

    const sortButton = event.target.closest('.column-sort');
    if (sortButton && pane) {
      const state = getState(pane);
      if (state.sortKey === sortButton.dataset.sortKey) {
        state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortKey = sortButton.dataset.sortKey;
        state.sortDirection = 'asc';
      }
      writeSetting(SORT_KEY, state.sortKey);
      writeSetting(SORT_DIRECTION_KEY, state.sortDirection);
      getPanes().forEach((candidate) => {
        const candidateState = getState(candidate);
        candidateState.sortKey = state.sortKey;
        candidateState.sortDirection = state.sortDirection;
        applySort(candidate);
      });
      return;
    }

    const viewModeButton = event.target.closest('[data-view-mode]');
    if (viewModeButton) {
      writeSetting(VIEW_MODE_KEY, viewModeButton.dataset.viewMode);
      getPanes().forEach(applyViewMode);
      return;
    }

    if (event.target.closest('.cell-select')) {
      return;
    }

    const row = event.target.closest('.file-row');
    if (row && pane && !row.classList.contains('is-parent') && !event.target.closest('.entry-menu')) {
      if (event.target.closest('.entry-link')) {
        setFocusedRow(pane, row);
        return;
      }
      if (event.shiftKey) {
        event.preventDefault();
        selectRange(pane, row);
      } else if (event.ctrlKey || event.metaKey) {
        setRowSelected(row, !row.classList.contains('is-selected'));
        getState(pane).anchorIndex = getVisibleRows(pane).indexOf(row);
        updateSelectionUi(pane);
      } else {
        getState(pane).anchorIndex = getVisibleRows(pane).indexOf(row);
      }
      setFocusedRow(pane, row);
    }
  });

  explorer.addEventListener('dblclick', (event) => {
    const pane = event.target.closest('.pane');
    const row = event.target.closest('.file-row');
    if (pane && row && !event.target.closest('.entry-link') && !event.target.closest('.entry-menu')) {
      openRow(pane, row);
    }
  });

  explorer.addEventListener('input', (event) => {
    if (event.target.classList.contains('filter-input')) {
      const pane = event.target.closest('.pane');
      getState(pane).filter = event.target.value;
      applyFilter(pane);
    }
  });

  // Checkboxes are wrapped in labels, so listen for change rather than click
  explorer.addEventListener('change', (event) => {
    const pane = event.target.closest('.pane');
    if (!pane) return;

    if (event.target.classList.contains('select-all')) {
      const shouldSelect = event.target.checked;
      getVisibleRows(pane).forEach((row) => setRowSelected(row, shouldSelect));
      updateSelectionUi(pane);
      return;
    }

    if (event.target.classList.contains('row-select')) {
      const row = event.target.closest('.file-row');
      setRowSelected(row, event.target.checked);
      getState(pane).anchorIndex = getVisibleRows(pane).indexOf(row);
      updateSelectionUi(pane);
    }
  });

  // Command dispatch shared by toolbars, menus and the function bar
  document.addEventListener('click', (event) => {
    const commandElement = event.target.closest('[data-command]');
    if (!commandElement) return;
    const command = commandElement.dataset.command;
    if (command === 'toggle-dropdown') return;

    const pane = commandElement.closest('.pane') || getActivePane();
    if (!pane) return;

    const menuRow = commandElement.dataset.path
      ? explorer.querySelector('.file-row[data-path="' + CSS.escape(commandElement.dataset.path) + '"]')
      : null;

    const handlers = {
      'pane-back': () => goBack(pane),
      'pane-up': () => goUp(pane),
      'pane-refresh': () => refreshPane(pane),
      'new-folder': () => promptCreate(pane, true),
      'new-file': () => promptCreate(pane, false),
      'upload-files': () => startUpload(pane, false),
      'upload-folder': () => startUpload(pane, true),
      'set-layout': () => setLayout(commandElement.dataset.layout),
      'selection-clear': () => clearSelection(pane),
      'selection-delete': () => confirmDelete(pane, targetsFor(pane, null)),
      'selection-copy': () => transfer(pane, targetsFor(pane, null), false),
      'selection-move': () => transfer(pane, targetsFor(pane, null), true),
      'selection-download': () => downloadSelection(pane, targetsFor(pane, null)),
      'rename': () => promptRename(pane, menuRow),
      'delete': () => confirmDelete(pane, menuRow ? [menuRow] : []),
      'copy-to-other': () => transfer(pane, menuRow ? [menuRow] : [], false),
      'move-to-other': () => transfer(pane, menuRow ? [menuRow] : [], true),
      'rename-focused': () => promptRename(pane, getFocusedRow(pane) || getSelectedRows(pane)[0]),
      'view-focused': () => {
        const row = getFocusedRow(pane) || getSelectedRows(pane)[0];
        if (row) openRow(pane, row);
      },
      'edit-focused': () => {
        const row = getFocusedRow(pane) || getSelectedRows(pane)[0];
        if (row && row.dataset.directory !== 'true') {
          window.location.href = '/edit-file?path=' + encodeURIComponent(row.dataset.path);
        }
      },
      'copy-path': async () => {
        const copied = await RFM.copyText(commandElement.dataset.path);
        RFM.toast(copied ? 'Path copied' : 'Could not copy path', copied ? 'success' : 'error');
      }
    };

    if (handlers[command]) {
      event.preventDefault();
      RFM.closeAllMenus();
      handlers[command]();
    }
  });

  // List navigation only, actions are triggered from the command bar and menus
  document.addEventListener('keydown', (event) => {
    if (document.querySelector('.dialog-overlay, .search-overlay:not([hidden])')) return;
    const isTyping = /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName);
    const pane = getActivePane();
    if (!pane) return;

    if (event.key === 'Escape' && isTyping && event.target.classList.contains('filter-input')) {
      event.target.value = '';
      getState(pane).filter = '';
      applyFilter(pane);
      event.target.blur();
      return;
    }

    if (isTyping) return;

    if (event.key === 'Tab' && isSplit()) {
      event.preventDefault();
      const other = getOtherPane(pane);
      if (other) setActivePane(other);
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
      event.preventDefault();
      getVisibleRows(pane).forEach((row) => setRowSelected(row, true));
      updateSelectionUi(pane);
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const visible = getVisibleRows(pane);
      if (visible.length === 0) return;
      const currentIndex = visible.indexOf(getFocusedRow(pane));
      const step = event.key === 'ArrowDown' ? 1 : -1;
      const nextIndex = currentIndex === -1
        ? (step === 1 ? 0 : visible.length - 1)
        : Math.min(Math.max(currentIndex + step, 0), visible.length - 1);
      setFocusedRow(pane, visible[nextIndex]);
      if (event.shiftKey) selectRange(pane, visible[nextIndex]);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      openRow(pane, getFocusedRow(pane));
      return;
    }

    if (event.key === ' ') {
      const row = getFocusedRow(pane);
      if (row) {
        event.preventDefault();
        setRowSelected(row, !row.classList.contains('is-selected'));
        updateSelectionUi(pane);
      }
      return;
    }

    if (event.key === 'Backspace') {
      event.preventDefault();
      goUp(pane);
      return;
    }

    if (event.key === 'Delete') {
      event.preventDefault();
      confirmDelete(pane, targetsFor(pane, null));
    }
  });

  window.RFM_EXPLORER = {
    refreshPane: refreshPane,
    refreshAllPanes: refreshAllPanes,
    getActivePane: getActivePane,
    navigateActive: (path) => navigate(getActivePane(), path),
    revealPath: revealPath
  };

  const panes = getPanes();
  setActivePane(panes[0]);
  panes.forEach(applyPaneState);

  const revealTarget = new URLSearchParams(window.location.search).get('reveal');
  if (revealTarget) {
    revealRow(panes[0], revealTarget);
    updateUrl();
  }
})();
`;
