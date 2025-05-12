import { Hono, serveStatic } from "./deps.js";
import { fileExplorer } from "./endpoints/file-explorer.js";
import { createFolder } from "./endpoints/create-folder.js";
import { deleteItem } from "./endpoints/delete-item.js";
import { uploadFiles } from "./endpoints/upload-files.js";
import { downloadItem } from "./endpoints/download-item.js";

const app = new Hono();

// Parse command line arguments
const defaultPort = 8000;
let port = defaultPort;

// Simple argument parsing
for (let i = 0; i < Deno.args.length; i++) {
  const arg = Deno.args[i];
  if (arg.startsWith("--port=")) {
    port = parseInt(arg.split("=")[1], 10) || defaultPort;
  }
}
const workingDir = Deno.cwd();

// File explorer endpoints
app.get("/file-explorer", (c) => fileExplorer(c));
app.post("/create-folder", (c) => createFolder(c));
app.post("/delete-item", (c) => deleteItem(c));
app.post("/upload-files", (c) => uploadFiles(c));
app.get("/download-item", (c) => downloadItem(c));

// Serve static files with proper MIME types
app.use(
  "/*",
  serveStatic({
    root: workingDir,
  }),
);

console.log(`Remote File Manager server running at http://localhost:${port}`);
console.log(`Serving files from: ${workingDir}`);
console.log(
  `File Explorer available at: http://localhost:${port}/file-explorer`,
);

// Start the server
Deno.serve({ port }, app.fetch);
