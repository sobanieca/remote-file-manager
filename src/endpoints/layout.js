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
  </style>
</head>
<body>
  ${content}
</body>
</html>`;
}
