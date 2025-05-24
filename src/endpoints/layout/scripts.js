export const scripts = `
  // Close context menus and upload dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.context-menu-trigger')) {
      document.querySelectorAll('.context-menu-trigger.active').forEach(menu => {
        menu.classList.remove('active');
      });
    }
    if (!e.target.closest('.upload-dropdown')) {
      document.querySelectorAll('.upload-dropdown.active').forEach(dropdown => {
        dropdown.classList.remove('active');
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

  // Upload dropdown functionality
  const uploadTrigger = document.querySelector('.upload-trigger');
  const uploadDropdown = document.querySelector('.upload-dropdown');
  const fileInput = document.getElementById('file-input');
  const uploadForm = document.getElementById('upload-form');

  if (uploadTrigger && uploadDropdown) {
    uploadTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      uploadDropdown.classList.toggle('active');
    });

    // Handle upload option selection
    document.querySelectorAll('.upload-option').forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = option.getAttribute('data-type');
        
        if (type === 'files') {
          fileInput.removeAttribute('webkitdirectory');
          fileInput.removeAttribute('directory');
          fileInput.setAttribute('multiple', '');
        } else if (type === 'folder') {
          fileInput.setAttribute('webkitdirectory', '');
          fileInput.setAttribute('directory', '');
          fileInput.setAttribute('multiple', '');
        }
        
        uploadDropdown.classList.remove('active');
        fileInput.click();
      });
    });

    // Auto-submit form when files are selected
    if (fileInput) {
      fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
          uploadForm.submit();
        }
      });
    }
  }
`;
