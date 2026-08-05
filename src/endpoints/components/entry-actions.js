import { escapeHtml } from "../utils.js";
import { icon } from "./icons.js";

/**
 * Resolves the page a directory entry opens in when activated
 * @param {object} entry - The entry descriptor
 * @returns {string} - The href to navigate to
 */
export function getEntryHref(entry) {
  if (entry.isDirectory) {
    return `/file-explorer?path=${encodeURIComponent(entry.path)}`;
  }
  if (entry.isMarkdown) {
    return `/markdown?path=${encodeURIComponent(entry.path)}`;
  }
  return `/view-file?path=${encodeURIComponent(entry.path)}`;
}

/**
 * Builds the ordered action list offered for a directory entry
 * @param {object} entry - The entry descriptor
 * @param {object} options - Context flags such as isSplit and inViewer
 * @returns {object[]} - Action descriptors
 */
export function getEntryActions(entry, options = {}) {
  const encodedPath = encodeURIComponent(entry.path);
  const actions = [];

  if (entry.isDeleted) {
    return [{
      id: "diff",
      label: "View git diff",
      iconName: "diff",
      href: `/git-diff?path=${encodedPath}`,
    }];
  }

  if (entry.isDirectory) {
    if (!options.inViewer) {
      actions.push({
        id: "open",
        label: "Open",
        iconName: "folder",
        href: getEntryHref(entry),
      });
    }
    actions.push({
      id: "download",
      label: "Download as ZIP",
      iconName: "download",
      href: `/download-item?path=${encodedPath}&type=directory`,
    });
  } else {
    if (!options.inViewer) {
      actions.push({
        id: "open",
        label: entry.isMarkdown ? "Open rendered" : "Open",
        iconName: "eye",
        href: getEntryHref(entry),
      });
    }
    if (entry.isMarkdown) {
      actions.push({
        id: "source",
        label: "View source",
        iconName: "file-code",
        href: `/view-file?path=${encodedPath}`,
      });
    }
    if (entry.isText) {
      actions.push({
        id: "edit",
        label: "Edit",
        iconName: "pencil",
        href: `/edit-file?path=${encodedPath}`,
      });
    }
    actions.push({
      id: "raw",
      label: "Open raw",
      iconName: "external-link",
      href: `/${entry.path}`,
      newTab: true,
    });
    actions.push({
      id: "download",
      label: "Download",
      iconName: "download",
      href: `/download-item?path=${encodedPath}&type=file`,
    });
  }

  if (entry.gitStatus && entry.gitStatus !== "added" && entry.isText) {
    actions.push({
      id: "diff",
      label: "View git diff",
      iconName: "diff",
      href: `/git-diff?path=${encodedPath}`,
    });
  }
  actions.push({
    id: "history",
    label: "File history",
    iconName: "history",
    href: `/git-log?path=${encodedPath}`,
  });

  actions.push({ id: "separator" });
  actions.push({
    id: "rename",
    label: "Rename",
    iconName: "pencil",
    command: "rename",
  });
  actions.push({
    id: "copy-path",
    label: "Copy path",
    iconName: "clipboard",
    command: "copy-path",
  });
  actions.push({
    id: "copy",
    label: "Copy to other pane",
    iconName: "copy",
    command: "copy-to-other",
    splitOnly: true,
  });
  actions.push({
    id: "move",
    label: "Move to other pane",
    iconName: "move",
    command: "move-to-other",
    splitOnly: true,
  });
  actions.push({ id: "separator" });
  actions.push({
    id: "delete",
    label: "Delete",
    iconName: "trash",
    command: "delete",
    isDanger: true,
  });

  return actions;
}

function renderAction(action, entry, tagName) {
  const dataAttributes = `data-path="${escapeHtml(entry.path)}" data-name="${
    escapeHtml(entry.name)
  }" data-type="${entry.isDirectory ? "directory" : "file"}"`;
  const classNames = [tagName, action.isDanger ? "is-danger" : ""]
    .filter(Boolean)
    .join(" ");
  const splitAttribute = action.splitOnly ? ' data-split-only="true"' : "";

  if (action.href) {
    const target = action.newTab ? ' target="_blank" rel="noopener"' : "";
    return `<a class="${classNames}" href="${action.href}"${target}${splitAttribute} ${dataAttributes}>${
      icon(action.iconName)
    }<span>${action.label}</span></a>`;
  }
  return `<button type="button" class="${classNames}" data-command="${action.command}"${splitAttribute} ${dataAttributes}>${
    icon(action.iconName)
  }<span>${action.label}</span></button>`;
}

/**
 * Renders the overflow menu shown on each row of the file list
 * @param {object} entry - The entry descriptor
 * @returns {string} - The menu markup
 */
export function renderEntryMenu(entry) {
  const items = getEntryActions(entry)
    .map((action) =>
      action.id === "separator"
        ? '<div class="menu-separator"></div>'
        : renderAction(action, entry, "menu-item")
    )
    .join("");

  return `<div class="entry-menu">
    <button type="button" class="entry-menu-trigger" aria-haspopup="true" aria-expanded="false" title="Actions">${
    icon("more-vertical")
  }</button>
    <div class="menu-popover" role="menu">${items}</div>
  </div>`;
}

/**
 * Renders the same actions as a toolbar for the file details page
 * @param {object} entry - The entry descriptor
 * @returns {string} - The toolbar markup
 */
export function renderEntryActionBar(entry) {
  const actions = getEntryActions(entry, { inViewer: true })
    .filter((action) => action.id !== "separator" && !action.splitOnly);
  return `<div class="action-bar">${
    actions.map((action) => renderAction(action, entry, "action-button")).join(
      "",
    )
  }</div>`;
}
