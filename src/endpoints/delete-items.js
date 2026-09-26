import { basename } from "../deps.js";
import { normalizePath } from "./utils.js";
import { invalidateFileIndex } from "../search/file-index.js";

// Deno no longer exposes a dedicated error class for this case
function isNotEmptyError(error) {
  return error.code === "ENOTEMPTY" || error.code === "EEXIST";
}

export async function deleteItems(c) {
  try {
    const body = await c.req.json();
    const paths = Array.isArray(body.paths) ? body.paths : [];
    const isRecursive = body.recursive === true;

    if (paths.length === 0) {
      return c.json({ ok: false, message: "No items selected" }, 400);
    }

    const errors = [];
    const notEmpty = [];
    let deleted = 0;

    for (const rawPath of paths) {
      const path = normalizePath(rawPath);
      if (!path || path === ".") {
        errors.push({ path: String(rawPath), message: "Invalid path" });
        continue;
      }

      try {
        await Deno.remove(path, { recursive: isRecursive });
        deleted++;
      } catch (error) {
        if (isNotEmptyError(error)) {
          notEmpty.push(basename(path));
        } else {
          errors.push({ path: basename(path), message: error.message });
        }
      }
    }

    invalidateFileIndex();
    const messageParts = [];
    if (deleted > 0) {
      messageParts.push(`Deleted ${deleted} item${deleted === 1 ? "" : "s"}`);
    }
    if (notEmpty.length > 0) {
      messageParts.push(`${notEmpty.length} folder(s) not empty`);
    }
    if (errors.length > 0) {
      messageParts.push(`${errors.length} failed`);
    }

    return c.json({
      ok: errors.length === 0 && notEmpty.length === 0,
      deleted,
      notEmpty,
      errors,
      message: messageParts.join(", ") || "Nothing to delete",
    });
  } catch (error) {
    return c.json({ ok: false, message: error.message }, 500);
  }
}
