/* @ts-self-types="./main.d.ts" */
import { Hono, serveStatic } from "./deps.js";
import { fileExplorer } from "./endpoints/file-explorer.js";
import { createFolder } from "./endpoints/create-folder.js";
import { deleteItem } from "./endpoints/delete-item.js";
import { uploadFiles } from "./endpoints/upload-files.js";
import { downloadItem } from "./endpoints/download-item.js";
import { editFile, saveFile } from "./endpoints/edit-file.js";
import { pasteContent } from "./endpoints/paste-content.js";

// Read and display version from deno.json
try {
  const denoConfigPath = new URL("../deno.json", import.meta.url);
  const denoConfig = JSON.parse(await Deno.readTextFile(denoConfigPath));
  console.log(`Remote File Manager v${denoConfig.version}`);
} catch (_error) {
  console.log("Remote File Manager (version unknown)");
}

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

// If no custom port provided, try to read from localStorage
if (!customPortProvided) {
  try {
    const savedPort = localStorage.getItem("rmf-port");
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
      localStorage.setItem("rmf-port", port.toString());
      console.log(`Port ${port} saved to localStorage for future sessions`);
    } else {
      localStorage.removeItem("rmf-port");
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
app.post("/create-folder", (c) => createFolder(c));
app.post("/delete-item", (c) => deleteItem(c));
app.post("/upload-files", (c) => uploadFiles(c));
app.get("/download-item", (c) => downloadItem(c));
app.get("/edit-file", (c) => editFile(c));
app.post("/save-file", (c) => saveFile(c));
app.post("/paste-content", (c) => pasteContent(c));

// Serve static files with proper MIME types
app.use(
  "/*",
  serveStatic({
    root: workingDir,
    mimes: {
      md: "text/markdown; charset=utf-8",
    },
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
