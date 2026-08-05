export const gitScript = `
(function () {
  const compareBar = document.querySelector('[data-compare-bar]');
  const logList = document.querySelector('[data-log-list]');
  if (!compareBar || !logList) return;

  const selectionLabel = compareBar.querySelector('[data-compare-selection]');

  function getSelected(role) {
    return logList.querySelector('input[data-role="' + role + '"]:checked');
  }

  function updateSelection() {
    const fromInput = getSelected('from');
    const toInput = getSelected('to');

    logList.querySelectorAll('.log-row').forEach((row) => {
      const hash = row.dataset.hash;
      row.classList.toggle('is-from', Boolean(fromInput) && fromInput.value === hash);
      row.classList.toggle('is-to', Boolean(toInput) && toInput.value === hash);
    });

    if (selectionLabel) {
      if (fromInput && toInput) {
        const fromRow = logList.querySelector('.log-row[data-hash="' + CSS.escape(fromInput.value) + '"]');
        const toRow = logList.querySelector('.log-row[data-hash="' + CSS.escape(toInput.value) + '"]');
        selectionLabel.textContent = (fromRow ? fromRow.dataset.short : '') + ' → ' + (toRow ? toRow.dataset.short : '');
      } else {
        selectionLabel.textContent = '';
      }
    }
  }

  logList.addEventListener('change', updateSelection);

  compareBar.addEventListener('click', (event) => {
    if (event.target.closest('[data-command="compare-commits"]')) {
      event.preventDefault();
      const fromInput = getSelected('from');
      const toInput = getSelected('to');
      if (!fromInput || !toInput) {
        RFM.toast('Pick both an A and a B commit', 'error');
        return;
      }
      if (fromInput.value === toInput.value) {
        RFM.toast('Pick two different commits', 'error');
        return;
      }
      window.location.href = '/git-compare?from=' + encodeURIComponent(fromInput.value) +
        '&to=' + encodeURIComponent(toInput.value);
      return;
    }

    if (event.target.closest('[data-command="swap-compare"]')) {
      event.preventDefault();
      const fromInput = getSelected('from');
      const toInput = getSelected('to');
      if (!fromInput || !toInput) return;
      const fromValue = fromInput.value;
      const toValue = toInput.value;
      const newFrom = logList.querySelector('input[data-role="from"][value="' + CSS.escape(toValue) + '"]');
      const newTo = logList.querySelector('input[data-role="to"][value="' + CSS.escape(fromValue) + '"]');
      if (newFrom) newFrom.checked = true;
      if (newTo) newTo.checked = true;
      updateSelection();
    }
  });

  updateSelection();
})();
`;
