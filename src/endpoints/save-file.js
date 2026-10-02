import { normalizePath } from "./utils.js";

export async function saveFile(c) {
  try {
    const body = await c.req.json();
    const filePath = normalizePath(body.path || "");
    if (!filePath || filePath === ".") {
      return c.json({ ok: false, message: "Invalid path" }, 400);
    }
    if (typeof body.content !== "string") {
      return c.json({ ok: false, message: "Missing content" }, 400);
    }

    let content = body.content.replace(/\r\n/g, "\n");

    try {
      const originalContent = await Deno.readTextFile(filePath);
      if (originalContent.endsWith("\n") && !content.endsWith("\n")) {
        content += "\n";
      }
    } catch (_error) {
      // The file may not exist yet, write it as provided
    }

    await Deno.writeTextFile(filePath, content);

    return c.json({ ok: true, message: "File saved" });
  } catch (error) {
    return c.json({ ok: false, message: error.message }, 500);
  }
}
