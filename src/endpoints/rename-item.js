import { dirname, join } from "../deps.js";
import { normalizePath } from "./utils.js";
import { invalidateFileIndex } from "../search/file-index.js";

function isValidName(name) {
  return typeof name === "string" &&
    name.length > 0 &&
    name !== "." &&
    name !== ".." &&
    !name.includes("/") &&
    !name.includes("\\") &&
    !name.includes("\0");
}

export async function renameItem(c) {
  try {
    const body = await c.req.json();
    const newName = typeof body.newName === "string" ? body.newName.trim() : "";

    if (!isValidName(newName)) {
      return c.json({ ok: false, message: "Invalid name" }, 400);
    }

    const currentPath = normalizePath(body.path || "");
    if (!currentPath || currentPath === ".") {
      return c.json({ ok: false, message: "Invalid path" }, 400);
    }

    const newPath = normalizePath(join(dirname(currentPath), newName));
    if (!newPath) {
      return c.json({ ok: false, message: "Invalid target path" }, 400);
    }

    if (newPath === currentPath) {
      return c.json({ ok: true, path: newPath, message: "Name unchanged" });
    }

    try {
      await Deno.lstat(newPath);
      return c.json({
        ok: false,
        message: `"${newName}" already exists`,
      }, 409);
    } catch (_error) {
      // Target is free, continue with the rename
    }

    invalidateFileIndex();
    await Deno.rename(currentPath, newPath);

    return c.json({
      ok: true,
      path: newPath,
      message: `Renamed to "${newName}"`,
    });
  } catch (error) {
    return c.json({ ok: false, message: error.message }, 500);
  }
}
