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

  // Clipboard and paste button functionality
  const pasteButton = document.getElementById('paste-btn');
  let clipboardContent = null;

  // Function to check clipboard content and update button state
  async function checkClipboard() {
    if (!navigator.clipboard || !navigator.clipboard.read) {
      return; // Clipboard API not supported
    }

    try {
      const clipboardItems = await navigator.clipboard.read();
      let hasContent = false;

      for (const item of clipboardItems) {
        // Check for files
        if (item.types.some(type => type.startsWith('image/') || type.startsWith('application/') || type.startsWith('text/'))) {
          hasContent = true;
          break;
        }
      }

      // Also check for text content
      if (!hasContent) {
        try {
          const text = await navigator.clipboard.readText();
          hasContent = text && text.trim().length > 0;
        } catch (e) {
          // Ignore errors when reading text
        }
      }

      if (pasteButton) {
        pasteButton.disabled = !hasContent;
        pasteButton.title = hasContent ? 'Paste clipboard content' : 'No content in clipboard';
      }
    } catch (error) {
      // Clipboard access denied or not available
      if (pasteButton) {
        pasteButton.disabled = true;
        pasteButton.title = 'Clipboard access not available';
      }
    }
  }

  // Check clipboard on page load
  if (pasteButton) {
    checkClipboard();
    
    // Check clipboard periodically
    setInterval(checkClipboard, 2000);
    
    // Check clipboard when window gains focus
    window.addEventListener('focus', checkClipboard);
    
    // Paste button click handler
    pasteButton.addEventListener('click', async () => {
      if (pasteButton.disabled) return;
      
      try {
        // Try to get clipboard content
        const clipboardItems = await navigator.clipboard.read();
        
        for (const item of clipboardItems) {
          // Handle files/images
          for (const type of item.types) {
            if (type.startsWith('image/') || type.startsWith('application/')) {
              const blob = await item.getType(type);
              const file = new File([blob], \`clipboard.\${type.split('/')[1]}\`, { type: type });
              showPasteDialog(file, null);
              return;
            }
          }
        }
        
        // If no files found, try text content
        const text = await navigator.clipboard.readText();
        if (text && text.trim().length > 0) {
          showPasteDialog(null, { content: text, extension: 'txt' });
        }
      } catch (error) {
        console.error('Error reading clipboard:', error);
        // Fallback: show paste dialog with empty content
        showPasteDialog(null, { content: '', extension: 'txt' });
      }
    });
  }

  // Clipboard paste functionality
  document.addEventListener('paste', async (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return; // Don't interfere with regular input paste
    }

    e.preventDefault();
    const clipboardData = e.clipboardData || window.clipboardData;
    
    if (!clipboardData) return;

    // Check for files first
    const files = clipboardData.files;
    if (files && files.length > 0) {
      for (const file of files) {
        showPasteDialog(file, null);
      }
      return;
    }

    // Check for text/html content
    const htmlContent = clipboardData.getData('text/html');
    const textContent = clipboardData.getData('text/plain');
    
    if (htmlContent || textContent) {
      const content = htmlContent || textContent;
      const extension = htmlContent ? 'html' : 'txt';
      showPasteDialog(null, { content, extension });
    }
  });

  function showPasteDialog(file, textData) {
    // Create dialog overlay
    const overlay = document.createElement('div');
    overlay.className = 'paste-dialog-overlay';
    
    // Determine default filename and extension
    let defaultName = 'new-file';
    let extension = 'txt';
    
    if (file) {
      if (file.type.startsWith('image/png')) {
        extension = 'png';
      } else if (file.type.startsWith('image/jpeg')) {
        extension = 'jpg';
      } else if (file.type.startsWith('image/gif')) {
        extension = 'gif';
      } else if (file.type.startsWith('image/')) {
        extension = file.type.split('/')[1] || 'img';
      } else if (file.type.startsWith('text/')) {
        extension = 'txt';
      } else {
        extension = file.name ? file.name.split('.').pop() || 'file' : 'file';
      }
    } else if (textData) {
      extension = textData.extension;
    }

    const dialog = document.createElement('div');
    dialog.className = 'paste-dialog';
    dialog.innerHTML = \`
      <div class="paste-dialog-header">
        <h3>Paste Content</h3>
        <button type="button" class="close-btn">&times;</button>
      </div>
      <div class="paste-dialog-body">
        <label for="filename-input">File name:</label>
        <input type="text" id="filename-input" value="\${defaultName}.\${extension}" />
        <div class="paste-dialog-buttons">
          <button type="button" class="cancel-btn">Cancel</button>
          <button type="button" class="save-btn">Save</button>
        </div>
      </div>
    \`;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    const filenameInput = dialog.querySelector('#filename-input');
    const saveBtn = dialog.querySelector('.save-btn');
    const cancelBtn = dialog.querySelector('.cancel-btn');
    const closeBtn = dialog.querySelector('.close-btn');

    // Focus input and select filename part (without extension)
    filenameInput.focus();
    const lastDot = filenameInput.value.lastIndexOf('.');
    if (lastDot > 0) {
      filenameInput.setSelectionRange(0, lastDot);
    }

    function closeDialog() {
      document.body.removeChild(overlay);
    }

    closeBtn.addEventListener('click', closeDialog);
    cancelBtn.addEventListener('click', closeDialog);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeDialog();
    });

    filenameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        saveBtn.click();
      } else if (e.key === 'Escape') {
        closeDialog();
      }
    });

    saveBtn.addEventListener('click', async () => {
      const filename = filenameInput.value.trim();
      if (!filename) {
        alert('Please enter a filename');
        return;
      }

      try {
        const formData = new FormData();
        const currentPath = new URLSearchParams(window.location.search).get('path') || '.';
        formData.append('path', currentPath);
        formData.append('filename', filename);

        if (file) {
          formData.append('file', file);
        } else if (textData) {
          const blob = new Blob([textData.content], { type: 'text/plain' });
          formData.append('file', blob);
        }

        const response = await fetch('/paste-content', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          closeDialog();
          window.location.reload(); // Refresh to show new file
        } else {
          const errorText = await response.text();
          alert(\`Error saving file: \${errorText}\`);
        }
      } catch (error) {
        alert(\`Error saving file: \${error.message}\`);
      }
    });
  }
`;
