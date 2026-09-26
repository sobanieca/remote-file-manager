import { searchFileIndex } from "../search/file-index.js";
import { getWorkingDir } from "../workspace.js";

const MAX_QUERY_LENGTH = 200;
const RESULT_LIMIT = 50;

export async function searchFiles(c) {
  try {
    const query = (c.req.query("q") || "").slice(0, MAX_QUERY_LENGTH);
    const result = await searchFileIndex(getWorkingDir(), query, RESULT_LIMIT);
    return c.json({ ok: true, query, ...result });
  } catch (error) {
    return c.json({ ok: false, message: error.message }, 500);
  }
}
