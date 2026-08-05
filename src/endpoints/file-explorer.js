import { layout } from "./layout/index.js";
import { normalizePath } from "./utils.js";
import { readDirectoryEntries } from "./file-entries.js";
import { renderPane } from "./components/file-pane.js";
import { icon } from "./components/icons.js";

const COMMAND_BUTTONS = [
  { label: "Rename", iconName: "pencil", command: "rename-focused" },
  { label: "View", iconName: "eye", command: "view-focused" },
  { label: "Edit", iconName: "file-code", command: "edit-focused" },
  {
    label: "Copy",
    iconName: "copy",
    command: "selection-copy",
    splitOnly: true,
  },
  {
    label: "Move",
    iconName: "move",
    command: "selection-move",
    splitOnly: true,
  },
  { label: "New folder", iconName: "folder-plus", command: "new-folder" },
  {
    label: "Delete",
    iconName: "trash",
    command: "selection-delete",
    isDanger: true,
  },
];

function renderCommandBar() {
  const buttons = COMMAND_BUTTONS.map((entry) =>
    `<button type="button" class="command-button${
      entry.splitOnly ? " is-split-only" : ""
    }${entry.isDanger ? " is-danger" : ""}" data-command="${entry.command}">${
      icon(entry.iconName)
    }<span>${entry.label}</span></button>`
  ).join("");
  return `<div class="command-bar">${buttons}</div>`;
}

async function buildPane(pane, requestedPath) {
  const directoryPath = normalizePath(requestedPath) || ".";
  const { entries, totalSize } = await readDirectoryEntries(directoryPath);
  return renderPane({ pane, directoryPath, entries, totalSize });
}

export async function fileExplorer(c) {
  try {
    const leftPath = c.req.query("path") || ".";
    const rightPath = c.req.query("right");
    const isSplit = rightPath !== undefined;

    const normalizedLeft = normalizePath(leftPath);
    if (!normalizedLeft) {
      return c.html("Invalid path", 400);
    }

    let leftPaneHtml;
    try {
      leftPaneHtml = await buildPane("left", normalizedLeft);
    } catch (error) {
      return c.html(`Error reading directory: ${error.message}`, 500);
    }

    let rightPaneHtml = "";
    if (isSplit) {
      const normalizedRight = normalizePath(rightPath || ".") || ".";
      try {
        rightPaneHtml = await buildPane("right", normalizedRight);
      } catch (_error) {
        rightPaneHtml = await buildPane("right", ".");
      }
    }

    const content = `
      <div class="explorer" data-split="${isSplit}">
        <div class="explorer-header">
          <div class="segmented" role="group" aria-label="Pane layout">
            <button type="button" class="segmented-option${
      isSplit ? "" : " is-active"
    }" data-command="set-layout" data-layout="single" title="Single pane">${
      icon("panel")
    }<span>Single</span></button>
            <button type="button" class="segmented-option${
      isSplit ? " is-active" : ""
    }" data-command="set-layout" data-layout="split" title="Split panes">${
      icon("columns")
    }<span>Split</span></button>
          </div>
        </div>
        <div class="panes">
          ${leftPaneHtml}
          ${rightPaneHtml}
        </div>
        ${renderCommandBar()}
      </div>
      <form id="upload-form" hidden>
        <input type="file" id="file-input" multiple>
      </form>
    `;

    return c.html(
      await layout("File Explorer", content, {
        activeSection: "files",
        wide: true,
        bodyClass: "is-explorer",
      }),
    );
  } catch (error) {
    return c.html(`An error occurred: ${error.message}`, 500);
  }
}
