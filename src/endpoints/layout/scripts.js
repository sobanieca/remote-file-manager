export const scripts = `
  // Close context menus when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.context-menu-trigger')) {
      document.querySelectorAll('.context-menu-trigger.active').forEach(menu => {
        menu.classList.remove('active');
      });
    }
  });

  // Toggle context menu on click
  document.querySelectorAll('.context-menu-trigger').forEach(trigger => {
    trigger.querySelector('.dots').addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const isActive = trigger.classList.contains('active');

      // Close all other menus
      document.querySelectorAll('.context-menu-trigger.active').forEach(menu => {
        menu.classList.remove('active');
      });

      // Toggle current menu
      if (!isActive) {
        trigger.classList.add('active');
      }
    });
  });
`;
