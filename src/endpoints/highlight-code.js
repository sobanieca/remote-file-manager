import { highlightToLines, resolveLanguage } from "./code-highlight.js";
import { escapeHtml } from "./utils.js";

const MAX_HIGHLIGHT_LENGTH = 1_000_000;

export async function highlightCode(c) {
  try {
    const body = await c.req.json();
    const content = typeof body.content === "string" ? body.content : "";
    const path = typeof body.path === "string" ? body.path : "";

    if (content.length > MAX_HIGHLIGHT_LENGTH) {
      return c.json({ ok: true, html: escapeHtml(content), language: null });
    }

    const language = resolveLanguage(path);
    const html = highlightToLines(content, language).join("\n");

    return c.json({ ok: true, html, language });
  } catch (error) {
    return c.json({ ok: false, message: error.message }, 500);
  }
}
