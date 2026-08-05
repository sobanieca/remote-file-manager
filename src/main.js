/* @ts-self-types="./main.d.ts" */
import { Hono, serveStatic } from "./deps.js";
import { fileExplorer } from "./endpoints/file-explorer.js";
import { filePane } from "./endpoints/file-pane.js";
import { createItem } from "./endpoints/create-item.js";
import { deleteItems } from "./endpoints/delete-items.js";
import { copyItems } from "./endpoints/copy-items.js";
import { moveItems } from "./endpoints/move-items.js";
import { uploadFiles } from "./endpoints/upload-files.js";
import { downloadItem } from "./endpoints/download-item.js";
import { downloadItems } from "./endpoints/download-items.js";
import { editFile, saveFile } from "./endpoints/edit-file.js";
import { viewFile } from "./endpoints/view-file.js";
import { highlightCode } from "./endpoints/highlight-code.js";
import { pasteContent } from "./endpoints/paste-content.js";
import { thumbnail } from "./endpoints/thumbnail.js";
import { markdown } from "./endpoints/markdown.js";
import { renameItem } from "./endpoints/rename-item.js";
import { gitDiff } from "./endpoints/git-diff.js";
import { gitOverview } from "./endpoints/git-overview.js";
import { gitLog } from "./endpoints/git-log.js";
import { gitCompare } from "./endpoints/git-compare.js";
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
const workingDir = Deno.cwd();

// File explorer endpoints
app.get("/file-explorer", (c) => fileExplorer(c));
app.get("/file-pane", (c) => filePane(c));
app.get("/view-file", (c) => viewFile(c));
app.get("/edit-file", (c) => editFile(c));
app.post("/save-file", (c) => saveFile(c));
app.post("/highlight-code", (c) => highlightCode(c));
app.get("/thumbnail", (c) => thumbnail(c));
app.get("/markdown", (c) => markdown(c));

// File operation endpoints
app.post("/create-item", (c) => createItem(c));
app.post("/rename-item", (c) => renameItem(c));
app.post("/delete-items", (c) => deleteItems(c));
app.post("/copy-items", (c) => copyItems(c));
app.post("/move-items", (c) => moveItems(c));
app.post("/upload-files", (c) => uploadFiles(c));
app.post("/paste-content", (c) => pasteContent(c));
app.get("/download-item", (c) => downloadItem(c));
app.post("/download-items", (c) => downloadItems(c));

// Git endpoints
app.get("/git", (c) => gitOverview(c));
app.get("/git-log", (c) => gitLog(c));
app.get("/git-compare", (c) => gitCompare(c));
app.get("/git-diff", (c) => gitDiff(c));

app.use("/*", async (c, next) => {
  const path = c.req.path;
  if (path.endsWith(".md")) {
    const filePath = "." + path;
    return c.redirect(`/markdown?path=${encodeURIComponent(filePath)}`);
  }
  await next();
});

// Serve static files with proper MIME types
app.use(
  "/*",
  serveStatic({
    root: workingDir,
  }),
);

console.log(`Remote File Manager server running at http://localhost:${port}`);
console.log(`Use --port or -p to change port (current: ${port})`);
console.log(`Serving files from: ${workingDir}`);
console.log(
  `File Explorer available at: http://localhost:${port}/file-explorer`,
);

// Start the server
Deno.serve({ port }, app.fetch);
