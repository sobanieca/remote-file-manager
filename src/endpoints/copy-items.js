import { transferItems } from "./transfer-items.js";

export async function copyItems(c) {
  try {
    const body = await c.req.json();
    const paths = Array.isArray(body.paths) ? body.paths : [];
    if (paths.length === 0) {
      return c.json({ ok: false, message: "No items selected" }, 400);
    }

    const result = await transferItems({
      paths,
      targetPath: body.targetPath,
      isMove: false,
      overwrite: body.overwrite === true,
    });

    return c.json(result, result.message === "Invalid target path" ? 400 : 200);
  } catch (error) {
    return c.json({ ok: false, message: error.message }, 500);
  }
}
