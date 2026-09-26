export const worktreeScript = `
(function () {
  let isSwitching = false;

  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-switch-worktree]');
    if (!button || button.disabled || isSwitching) return;
    event.preventDefault();
    RFM.closeAllMenus();
    isSwitching = true;

    const explorer = window.RFM_EXPLORER;
    const currentPath = explorer ? explorer.getActivePane().dataset.path : '';
    const result = await RFM.postJson('/switch-worktree', {
      path: button.dataset.switchWorktree,
      currentPath: currentPath
    });
    if (!result.ok) {
      isSwitching = false;
      RFM.toast(result.message || 'Could not switch worktree', 'error');
      return;
    }
    RFM.toast(result.message, 'success');
    window.location.href = '/file-explorer?path=' + encodeURIComponent(result.path || '.');
  });
})();
`;
