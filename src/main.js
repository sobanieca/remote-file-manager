import { Hono, serveStatic } from "./deps.js";

const app = new Hono();

// MIME types mapping
const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain",
  ".md": "text/markdown",
  ".pdf": "application/pdf",
  ".zip": "application/zip",
  ".mp4": "video/mp4",
  ".mp3": "audio/mpeg",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".eot": "application/vnd.ms-fontobject",
};

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

// Serve static files with proper MIME types
app.use(
  "/*",
  serveStatic({
    root: workingDir,
    mimes: MIME_TYPES
  }),
);

console.log(`Remote File Manager server running at http://localhost:${port}`);
console.log(`Serving files from: ${workingDir}`);

// Start the server
Deno.serve({ port }, app.fetch);
