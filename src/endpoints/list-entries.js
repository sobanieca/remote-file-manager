import { normalizePath } from "./utils.js";
import { readDirectoryEntries } from "./file-entries.js";

export async function listEntries(c) {
  try {
    const directoryPath = normalizePath(c.req.query("path") || ".");
    if (!directoryPath) {
      return c.json({ ok: false, message: "Invalid path" }, 400);
    }

    let stat;
    try {
      stat = await Deno.stat(directoryPath);
    } catch (_error) {
      return c.json({ ok: false, message: "Directory not found" }, 404);
    }
    if (!stat.isDirectory) {
      return c.json(
        {
          ok: false,
          isFile: true,
          path: directoryPath,
          message: "Not a directory",
        },
        400,
      );
    }

    const { entries, totalSize } = await readDirectoryEntries(directoryPath);
    return c.json({ ok: true, path: directoryPath, entries, totalSize });
  } catch (error) {
    return c.json(
      { ok: false, message: `Error reading directory: ${error.message}` },
      500,
    );
  }
}
