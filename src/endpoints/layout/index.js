import { baseStyles } from "./base-styles.js";
import { fileExplorerStyles } from "./file-explorer-styles.js";
import { fileEditorStyles } from "./file-editor-styles.js";
import { scripts } from "./scripts.js";

export function layout(title, content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    ${baseStyles}
    ${fileExplorerStyles}
    ${fileEditorStyles}
  </style>
</head>
<body>
  ${content}
  <script>
    ${scripts}
  </script>
</body>
</html>`;
}
