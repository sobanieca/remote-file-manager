export const themeHeadScript = `
  (function () {
    try {
      const preference = localStorage.getItem('theme-preference');
      const root = document.documentElement;
      if (preference === 'light' || preference === 'dark') {
        root.setAttribute('data-theme', preference);
      } else {
        root.removeAttribute('data-theme');
      }
    } catch (error) {}
  })();
`;

export const themeScript = `
  (function () {
    const button = document.getElementById('theme-toggle');
    if (!button) return;

    const root = document.documentElement;
    const preferences = ['system', 'light', 'dark'];
    const icons = { system: '🖥️', light: '☀️', dark: '🌙' };
    const labels = { system: 'System theme', light: 'Light theme', dark: 'Dark theme' };

    function getPreference() {
      try {
        const stored = localStorage.getItem('theme-preference');
        return preferences.includes(stored) ? stored : 'system';
      } catch (error) {
        return 'system';
      }
    }

    function applyPreference(preference) {
      if (preference === 'light' || preference === 'dark') {
        root.setAttribute('data-theme', preference);
      } else {
        root.removeAttribute('data-theme');
      }

      const colorMode = preference === 'system' ? 'auto' : preference;
      document.querySelectorAll('.markdown-body').forEach((element) => {
        element.setAttribute('data-color-mode', colorMode);
      });

      button.textContent = icons[preference];
      button.title = labels[preference] + ' (click to change)';
      button.setAttribute('aria-label', labels[preference]);
    }

    applyPreference(getPreference());

    button.addEventListener('click', () => {
      const current = getPreference();
      const next = preferences[(preferences.indexOf(current) + 1) % preferences.length];
      try {
        localStorage.setItem('theme-preference', next);
      } catch (error) {}
      applyPreference(next);
    });
  })();
`;
