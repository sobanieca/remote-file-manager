import { normalizePath } from "./utils.js";
import { dirname, join } from "../deps.js";

export async function renameItem(c) {
  try {
    const body = await c.req.formData();
    const oldPath = body.get("path");
    const newName = body.get("newName");
    const parentPath = body.get("parentPath");

    if (!oldPath || !newName) {
      return c.html("Missing required fields", 400);
    }

    if (newName.includes("/") || newName.includes("\\") || newName === "..") {
      return c.html("Invalid file name", 400);
    }

    const normalizedOldPath = normalizePath(oldPath);
    if (!normalizedOldPath) {
      return c.html("Invalid path", 400);
    }

    const parentDir = dirname(normalizedOldPath);
    const newPath = join(parentDir, newName);

    const normalizedNewPath = normalizePath(newPath);
    if (!normalizedNewPath) {
      return c.html("Invalid new path", 400);
    }

    try {
      await Deno.stat(normalizedNewPath);
      return c.redirect(
        `/file-explorer?path=${
          encodeURIComponent(parentPath || ".")
        }&error=already_exists`,
      );
    } catch (_error) {
      // File doesn't exist, proceed with rename
    }

    try {
      await Deno.rename(normalizedOldPath, normalizedNewPath);
      return c.redirect(
        `/file-explorer?path=${
          encodeURIComponent(parentPath || ".")
        }&success=item_renamed`,
      );
    } catch (_error) {
      return c.redirect(
        `/file-explorer?path=${
          encodeURIComponent(parentPath || ".")
        }&error=rename_failed`,
      );
    }
  } catch (error) {
    return c.html(`An error occurred: ${error.message}`, 500);
  }
}
