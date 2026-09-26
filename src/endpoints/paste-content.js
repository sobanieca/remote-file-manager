import { combinePaths, normalizePath } from "./utils.js";
import { invalidateFileIndex } from "../search/file-index.js";

export async function pasteContent(c) {
  try {
    const formData = await c.req.formData();
    const requestedPath = formData.get("path") || ".";
    const filename = formData.get("filename");
    const file = formData.get("file");

    if (!filename || !file) {
      return c.json({ ok: false, message: "Missing filename or data" }, 400);
    }

    const directoryPath = normalizePath(String(requestedPath));
    if (!directoryPath) {
      return c.json({ ok: false, message: "Invalid path" }, 400);
    }

    const name = String(filename);
    if (
      name.includes("/") || name.includes("\\") || name.includes("..") ||
      name.includes("\0")
    ) {
      return c.json({ ok: false, message: "Invalid file name" }, 400);
    }

    const destinationPath = combinePaths(directoryPath, name);

    try {
      await Deno.lstat(destinationPath);
      return c.json({ ok: false, message: `"${name}" already exists` }, 409);
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
      }
    }

    const content = new Uint8Array(await file.arrayBuffer());
    await Deno.writeFile(destinationPath, content);

    invalidateFileIndex();
    return c.json({
      ok: true,
      path: destinationPath,
      message: `Saved "${name}"`,
    });
  } catch (error) {
    console.error("Error saving pasted content:", error);
    return c.json({ ok: false, message: error.message }, 500);
  }
}
