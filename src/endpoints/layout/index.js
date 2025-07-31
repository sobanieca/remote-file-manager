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
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><rect width='32' height='32' fill='%232563eb'/><path d='M6 8h8l2 2h10v16H6V8z' fill='%23ffffff' stroke='%23e5e7eb' stroke-width='0.5'/><path d='M8 12h16v2H8zm0 4h12v2H8zm0 4h10v2H8z' fill='%232563eb'/></svg>">
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
