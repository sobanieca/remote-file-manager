export function layout(title, content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 20px;
    }
    .breadcrumb {
      margin-bottom: 20px;
      padding: 8px 16px;
      background-color: #f8f9fa;
      border-radius: 4px;
    }
    .breadcrumb a {
      text-decoration: none;
      color: #0366d6;
      margin: 0 5px;
    }
    .file-list {
      list-style: none;
      padding: 0;
    }
    .file-list li {
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }
    .file-list a {
      text-decoration: none;
      color: #0366d6;
      display: flex;
      align-items: center;
    }
    .file-list .folder::before {
      content: "📁";
      margin-right: 8px;
    }
    .file-list .file::before {
      content: "📄";
      margin-right: 8px;
    }
    .new-folder-form {
      margin-bottom: 20px;
      padding: 15px;
      background-color: #f8f9fa;
      border-radius: 4px;
      display: flex;
    }
    .new-folder-form input[type="text"] {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin-right: 10px;
      flex-grow: 1;
    }
    .new-folder-form button {
      padding: 8px 16px;
      background-color: #0366d6;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .new-folder-form button:hover {
      background-color: #0255b3;
    }
    .status-section {
      margin: 10px 0;
    }
    .status-message {
      padding: 8px;
      border-radius: 4px;
      width: 100%;
    }
    .status-message.success {
      background-color: #e6f4ea;
      color: #137333;
    }
    .status-message.error {
      background-color: #fce8e6;
      color: #c5221f;
    }
    .status-message.warning {
      background-color: #fff7e6;
      color: #b06000;
    }
    .file-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }
    .file-item a {
      flex-grow: 1;
    }
    .context-menu-trigger {
      position: relative;
      cursor: pointer;
    }
    .dots {
      font-size: 18px;
      padding: 4px 8px;
      color: #666;
    }
    .context-menu {
      position: absolute;
      right: 0;
      top: 24px;
      background-color: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      z-index: 100;
      min-width: 160px;
      display: none;
    }
    .context-menu-trigger:hover .context-menu,
    .context-menu-trigger.active .context-menu {
      display: block;
    }
    .context-menu-item {
      background: none;
      border: none;
      padding: 8px 12px;
      text-align: left;
      cursor: pointer;
      width: 100%;
      display: flex;
      align-items: center;
      color: #333;
      text-decoration: none;
      font-size: 14px;
      white-space: nowrap;
    }
    .context-menu-item:hover {
      background-color: #f5f5f5;
    }
    .context-menu-item .icon {
      margin-right: 8px;
    }
    .context-menu form {
      margin: 0;
      padding: 0;
      width: 100%;
    }
    .upload-section {
      margin-bottom: 20px;
      padding: 15px;
      background-color: #f8f9fa;
      border-radius: 4px;
    }
    .upload-forms {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
    }
    .upload-form {
      flex: 1;
      min-width: 250px;
    }
    .upload-form h3 {
      margin-top: 0;
      margin-bottom: 10px;
      font-size: 16px;
      color: #333;
    }
    .upload-form form {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .upload-form input[type="file"] {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background-color: white;
    }
    .upload-form button {
      padding: 8px 16px;
      background-color: #0366d6;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      align-self: flex-start;
    }
    .upload-form button:hover {
      background-color: #0255b3;
    }
  </style>
</head>
<body>
  ${content}
  <script>
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
  </script>
</body>
</html>`;
}
