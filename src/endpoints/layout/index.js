import { themeStyles } from "./theme-styles.js";
import { baseStyles } from "./base-styles.js";
import { fileExplorerStyles } from "./file-explorer-styles.js";
import { fileEditorStyles } from "./file-editor-styles.js";
import { markdownStyles } from "./markdown-styles.js";
import { diffStyles } from "./diff-styles.js";
import { codeViewStyles } from "./code-view-styles.js";
import { gitStyles } from "./git-styles.js";
import { searchStyles } from "./search-styles.js";
import { themeHeadScript, themeScript } from "./theme-script.js";
import { scripts } from "./scripts/index.js";
import { iconSprite } from "../components/icons.js";
import { renderAppBar } from "../components/app-bar.js";
import { renderSearchPalette } from "../components/search-palette.js";
import { getBranchInfo, getGitStatusInfo } from "../../git/git-status.js";
import { listWorktrees } from "../../git/git-worktree.js";
import { getWorkingDir } from "../../workspace.js";

async function resolveBranchInfo() {
  const workingDir = getWorkingDir();
  const branchInfo = await getBranchInfo(workingDir);
  if (!branchInfo) {
    return null;
  }
  const [statusInfo, worktrees] = await Promise.all([
    getGitStatusInfo(workingDir),
    listWorktrees(workingDir),
  ]);
  return {
    ...branchInfo,
    changeCount: statusInfo ? statusInfo.records.length : 0,
    worktrees: worktrees || [],
  };
}

/**
 * Wraps page content in the shared document shell
 * @param {string} title - The document title
 * @param {string} content - The page markup
 * @param {object} options - Layout options such as activeSection and width
 * @returns {Promise<string>} - The complete HTML document
 */
export async function layout(title, content, options = {}) {
  const branchInfo = options.hideBranch ? null : await resolveBranchInfo();
  const containerClass = options.wide
    ? "main-container is-wide"
    : "main-container";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%232563eb'/><path d='M6 9h7l2 2h11v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9z' fill='%23ffffff'/></svg>">
  <script>
    ${themeHeadScript}
  </script>
  <style>
    ${themeStyles}
    ${baseStyles}
    ${fileExplorerStyles}
    ${fileEditorStyles}
    ${codeViewStyles}
    ${markdownStyles}
    ${diffStyles}
    ${gitStyles}
    ${searchStyles}
  </style>
</head>
<body class="${options.bodyClass || ""}">
  ${iconSprite}
  ${renderAppBar({ activeSection: options.activeSection, branchInfo })}
  <div class="${containerClass}">
  ${content}
  </div>
  ${renderSearchPalette()}
  <div class="toast-stack" id="toast-stack" aria-live="polite"></div>
  <script>
    ${themeScript}
    ${scripts}
  </script>
</body>
</html>`;
}
