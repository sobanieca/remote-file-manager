import { normalizePath } from "./utils.js";
import { readDirectoryEntries } from "./file-entries.js";
import { renderPaneContent } from "./components/file-pane.js";

export async function filePane(c) {
  try {
    const requestedPath = c.req.query("path") || ".";
    const directoryPath = normalizePath(requestedPath);
    if (!directoryPath) {
      return c.text("Invalid path", 400);
    }

    try {
      const stat = await Deno.stat(directoryPath);
      if (!stat.isDirectory) {
        return c.text("Not a directory", 400);
      }
    } catch (_error) {
      return c.text("Directory not found", 404);
    }

    const { entries, totalSize } = await readDirectoryEntries(directoryPath);

    return c.html(renderPaneContent(directoryPath, entries, totalSize), 200, {
      "X-Pane-Path": encodeURIComponent(directoryPath),
    });
  } catch (error) {
    return c.text(`Error reading directory: ${error.message}`, 500);
  }
}
