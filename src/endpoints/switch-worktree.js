import { resolveWorktreeDirectory } from "../git/git-worktree.js";
import { getWorkingDir, setWorkingDir } from "../workspace.js";
import { normalizePath } from "./utils.js";

// The explorer reopens the directory the user was looking at, as long as the
// selected worktree has it too
async function resolveExplorerPath(requestedPath) {
  const path = normalizePath(
    typeof requestedPath === "string" ? requestedPath : "",
  );
  if (!path) {
    return ".";
  }
  try {
    return (await Deno.stat(path)).isDirectory ? path : ".";
  } catch (_error) {
    return ".";
  }
}

export async function switchWorktree(c) {
  try {
    const body = await c.req.json();
    const requestedPath = typeof body.path === "string" ? body.path : "";
    if (!requestedPath) {
      return c.json({ ok: false, message: "Worktree path is required" }, 400);
    }

    const resolved = await resolveWorktreeDirectory(
      getWorkingDir(),
      requestedPath,
    );
    if (!resolved.ok) {
      return c.json({ ok: false, message: resolved.message }, 400);
    }

    setWorkingDir(resolved.directory);
    console.log(`Switched to worktree: ${resolved.directory}`);

    return c.json({
      ok: true,
      directory: resolved.directory,
      path: await resolveExplorerPath(body.currentPath),
      message: `Switched to ${resolved.worktree.label}`,
    });
  } catch (error) {
    return c.json({ ok: false, message: error.message }, 500);
  }
}
