import { Hono, serveStatic } from "./deps.js";

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

// Serve static files with proper MIME types
app.use(
  "/*",
  serveStatic({
    root: workingDir
  }),
);

console.log(`Remote File Manager server running at http://localhost:${port}`);
console.log(`Serving files from: ${workingDir}`);

// Start the server
Deno.serve({ port }, app.fetch);
