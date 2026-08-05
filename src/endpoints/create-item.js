import { combinePaths, normalizePath } from "./utils.js";

function isValidName(name) {
  return typeof name === "string" &&
    name.length > 0 &&
    name !== "." &&
    name !== ".." &&
    !name.includes("/") &&
    !name.includes("\\") &&
    !name.includes("\0");
}

export async function createItem(c) {
  try {
    const body = await c.req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const isDirectory = body.type !== "file";

    if (!isValidName(name)) {
      return c.json({ ok: false, message: "Invalid name" }, 400);
    }

    const directoryPath = normalizePath(body.path || ".");
    if (!directoryPath) {
      return c.json({ ok: false, message: "Invalid path" }, 400);
    }

    const newItemPath = combinePaths(directoryPath, name);

    try {
      if (isDirectory) {
        await Deno.mkdir(newItemPath);
      } else {
        const file = await Deno.open(newItemPath, {
          write: true,
          createNew: true,
        });
        file.close();
      }
    } catch (error) {
      if (error instanceof Deno.errors.AlreadyExists) {
        return c.json({
          ok: false,
          message: `"${name}" already exists`,
        }, 409);
      }
      throw error;
    }

    return c.json({
      ok: true,
      path: newItemPath,
      message: `${isDirectory ? "Folder" : "File"} "${name}" created`,
    });
  } catch (error) {
    return c.json({ ok: false, message: error.message }, 500);
  }
}
