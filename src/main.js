/* @ts-self-types="./main.d.ts" */
import { Hono, serveStatic } from "./deps.js";
import { listEntries } from "./endpoints/list-entries.js";
import { readFile } from "./endpoints/read-file.js";
import { saveFile } from "./endpoints/save-file.js";
import { createItem } from "./endpoints/create-item.js";
import { deleteItems } from "./endpoints/delete-items.js";
import { copyItems } from "./endpoints/copy-items.js";
import { moveItems } from "./endpoints/move-items.js";
import { uploadFiles } from "./endpoints/upload-files.js";
import { downloadItem } from "./endpoints/download-item.js";
import { downloadItems } from "./endpoints/download-items.js";
import { pasteContent } from "./endpoints/paste-content.js";
import { thumbnail } from "./endpoints/thumbnail.js";
import { renameItem } from "./endpoints/rename-item.js";
import { gitSummary } from "./endpoints/git-summary.js";
import { gitDiff } from "./endpoints/git-diff.js";
import { gitOverview } from "./endpoints/git-overview.js";
import { gitLog } from "./endpoints/git-log.js";
import { gitCompare } from "./endpoints/git-compare.js";
import { searchFiles } from "./endpoints/search-files.js";
import { switchWorktree } from "./endpoints/switch-worktree.js";
import { serveUiApp, UI_PREFIX } from "./endpoints/ui-app.js";
import { decodeUrlPath } from "./endpoints/utils.js";
import { getWorkingDir } from "./workspace.js";
import { update } from "./commands/update.js";
import { version } from "./version.js";

if (Deno.args[0] === "update") {
  await update(Deno.args.slice(1));
  Deno.exit(0);
}

console.log(`Remote File Manager v${version}`);

const app = new Hono();

// Parse command line arguments
const defaultPort = 8000;
let port = defaultPort;
let customPortProvided = false;

// Simple argument parsing
for (let i = 0; i < Deno.args.length; i++) {
  const arg = Deno.args[i];
  if (arg.startsWith("--port=")) {
    port = parseInt(arg.split("=")[1], 10) || defaultPort;
    customPortProvided = true;
  } else if (arg === "--port" || arg === "-p") {
    // Handle --port 3000 or -p 3000 format
    const nextArg = Deno.args[i + 1];
    if (nextArg && !nextArg.startsWith("-")) {
      port = parseInt(nextArg, 10) || defaultPort;
      customPortProvided = true;
      i++; // Skip the next argument since we consumed it
    }
  }
}

const PORT_STORAGE_KEY = "rfm-port";

// If no custom port provided, try to read from localStorage
if (!customPortProvided) {
  try {
    const savedPort = localStorage.getItem(PORT_STORAGE_KEY);
    if (savedPort) {
      const parsedPort = parseInt(savedPort, 10);
      if (parsedPort && parsedPort !== defaultPort) {
        port = parsedPort;
        console.log(`Using saved port from localStorage: ${port}`);
      }
    }
  } catch (error) {
    console.error("Error when accessing localStorage");
    console.error(error);
  }
}

// Save custom port to localStorage for future use or remove if default
if (customPortProvided) {
  try {
    if (port !== defaultPort) {
      localStorage.setItem(PORT_STORAGE_KEY, port.toString());
      console.log(`Port ${port} saved to localStorage for future sessions`);
    } else {
      localStorage.removeItem(PORT_STORAGE_KEY);
      console.log(`Default port used, removed saved port from localStorage`);
    }
  } catch (error) {
    console.error("Error when accessing localStorage");
    console.error(error);
  }
}
const workingDir = getWorkingDir();

app.get(UI_PREFIX, (c) => serveUiApp(c));
app.get(`${UI_PREFIX}/*`, (c) => serveUiApp(c));

app.get("/api/entries", (c) => listEntries(c));
app.get("/api/file", (c) => readFile(c));
app.get("/api/search", (c) => searchFiles(c));
app.get("/api/thumbnail", (c) => thumbnail(c));
app.get("/api/download-item", (c) => downloadItem(c));
app.post("/api/download-items", (c) => downloadItems(c));
app.post("/api/save-file", (c) => saveFile(c));
app.post("/api/create-item", (c) => createItem(c));
app.post("/api/rename-item", (c) => renameItem(c));
app.post("/api/delete-items", (c) => deleteItems(c));
app.post("/api/copy-items", (c) => copyItems(c));
app.post("/api/move-items", (c) => moveItems(c));
app.post("/api/upload-files", (c) => uploadFiles(c));
app.post("/api/paste-content", (c) => pasteContent(c));

app.get("/api/git/summary", (c) => gitSummary(c));
app.get("/api/git/status", (c) => gitOverview(c));
app.get("/api/git/log", (c) => gitLog(c));
app.get("/api/git/diff", (c) => gitDiff(c));
app.get("/api/git/compare", (c) => gitCompare(c));
app.post("/api/git/switch-worktree", (c) => switchWorktree(c));

app.use("/*", async (c, next) => {
  const path = c.req.path;
  if (path.endsWith(".md")) {
    const filePath = decodeUrlPath(path.slice(1));
    return c.redirect(
      `${UI_PREFIX}/#/view?path=${encodeURIComponent(filePath)}`,
    );
  }
  await next();
});

// Serve static files with proper MIME types. The root follows the served
// directory, which changes when another worktree is selected
app.use("/*", (c, next) => serveStatic({ root: getWorkingDir() })(c, next));

console.log(`Remote File Manager server running at http://localhost:${port}`);
console.log(`Use --port or -p to change port (current: ${port})`);
console.log(`Serving files from: ${workingDir}`);
console.log(
  `File Explorer available at: http://localhost:${port}${UI_PREFIX}`,
);

// Start the server
Deno.serve({ port }, app.fetch);
