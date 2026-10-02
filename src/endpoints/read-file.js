import { normalizePath } from "./utils.js";
import { describePath } from "./file-entries.js";

const MAX_TEXT_BYTES = 5_000_000;

export async function readFile(c) {
  try {
    const filePath = normalizePath(c.req.query("path") || "");
    if (!filePath || filePath === ".") {
      return c.json({ ok: false, message: "Invalid file path" }, 400);
    }

    let entry;
    try {
      entry = await describePath(filePath);
    } catch (_error) {
      return c.json({ ok: false, message: "File not found" }, 404);
    }

    if (entry.isDirectory) {
      return c.json(
        {
          ok: false,
          isDirectory: true,
          path: filePath,
          message: "Is a directory",
        },
        400,
      );
    }

    const isTooLarge = (entry.size ?? 0) > MAX_TEXT_BYTES;
    let content = null;
    if (entry.isText && !isTooLarge) {
      try {
        content = await Deno.readTextFile(filePath);
      } catch (_error) {
        content = null;
      }
    }

    return c.json({ ok: true, entry, content, isTooLarge });
  } catch (error) {
    return c.json({ ok: false, message: error.message }, 500);
  }
}
