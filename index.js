import { Hono } from "jsr:@hono/hono";
import { serve } from "https://deno.land/std@0.220.1/http/server.ts";
import { join } from "https://deno.land/std@0.220.1/path/mod.ts";
import { contentType } from "https://deno.land/std@0.220.1/media_types/mod.ts";

const app = new Hono();
const BASE_DIR = "./"; // The directory to serve files from

// Helper function to list directory contents
async function listDirectory(path) {
  const entries = [];
  for await (const entry of Deno.readDir(path)) {
    const fullPath = join(path, entry.name);
    const stats = await Deno.stat(fullPath);
    entries.push({
      name: entry.name,
      isDirectory: entry.isDirectory,
      size: stats.size,
      modified: stats.mtime,
    });
  }
  return entries;
}

// File explorer route should be first
/* app.get("/file-explorer/*", async (c) => {
  const requestPath = c.req.path.replace("/file-explorer", "") || "/";
  const fullPath = join(BASE_DIR, requestPath);
  
  try {
    const stat = await Deno.stat(fullPath);
    
    if (stat.isDirectory) {
      const entries = await listDirectory(fullPath);
      const parentPath = requestPath === "/" ? "" : requestPath.split("/").slice(0, -1).join("/");
  }
  return c.text("500 Internal Server Error", 500);
}); */

// File explorer UI
app.get("/file-explorer*", async (c) => {
  const requestPath = c.req.path.replace("/file-explorer", "") || "/";
  const fullPath = join(BASE_DIR, requestPath);
  
  try {
    const stat = await Deno.stat(fullPath);
    
    if (stat.isDirectory) {
      const entries = await listDirectory(fullPath);
      const parentPath = requestPath === "/" ? "" : requestPath.split("/").slice(0, -1).join("/");
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>File Explorer - ${requestPath}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .entry { margin: 5px 0; }
            .directory { font-weight: bold; }
            .actions { margin-left: 10px; }
          </style>
        </head>
        <body>
          <h1>Directory: ${requestPath}</h1>
          ${parentPath ? `<a href="/file-explorer${parentPath}">..</a><br>` : ""}
          ${entries.map(entry => `
            <div class="entry ${entry.isDirectory ? 'directory' : ''}">
              <a href="/file-explorer${requestPath}/${entry.name}">
                ${entry.name}
              </a>
              ${!entry.isDirectory ? `
                <span class="actions">
                  <a href="/file-explorer${requestPath}/${entry.name}?action=edit">[Edit]</a>
                </span>
              ` : ''}
            </div>
          `).join("")}
        </body>
        </html>
      `;
      return c.html(html);
    } else {
      const action = new URL(c.req.url).searchParams.get("action");
      
      if (action === "edit") {
        const content = await Deno.readTextFile(fullPath);
        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Edit - ${fullPath}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              textarea { width: 100%; height: 400px; }
            </style>
          </head>
          <body>
            <h1>Edit: ${fullPath}</h1>
            <form method="POST" action="/file-explorer${requestPath}">
              <textarea name="content">${content}</textarea>
              <br><br>
              <input type="submit" value="Save">
              <a href="/file-explorer${requestPath.split("/").slice(0, -1).join("/")}">Cancel</a>
            </form>
          </body>
          </html>
        `;
        return c.html(html);
      } else {
        const content = await Deno.readFile(fullPath);
        const mimeType = contentType(fullPath.split(".").pop() || "") || "application/octet-stream";
        return new Response(content, {
          headers: { "Content-Type": mimeType },
        });
      }
    }
  } catch (error) {
    return c.text(`Error: ${error.message}`, 500);
  }
});

// Handle file updates
app.post("/file-explorer/*", async (c) => {
  const path = c.req.path.replace("/file-explorer", "");
  const fullPath = join(BASE_DIR, path);
  
  try {
    const formData = await c.req.formData();
    const content = formData.get("content");
    await Deno.writeTextFile(fullPath, content);
    return c.redirect(`/file-explorer${path.split("/").slice(0, -1).join("/")}`);
  } catch (error) {
    return c.text(`Error saving file: ${error.message}`, 500);
  }
});

// Start the server
serve(app.fetch, { port: 8000 });
console.log("Server running on http://localhost:8000");
console.log("File explorer running on http://localhost:8000/file-explorer");
// Serve static files (this should be last)
app.get("/*", async (c) => {
  const path = c.req.path;
  
  try {
    const filePath = join(BASE_DIR, path === "/" ? "index.html" : path);
    const fileInfo = await Deno.stat(filePath);
    
    if (fileInfo.isFile) {
      const content = await Deno.readFile(filePath);
      const mimeType = contentType(filePath.split(".").pop() || "") || "application/octet-stream";
      return new Response(content, {
        headers: { "Content-Type": mimeType },
      });
    }
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return c.text("404 Not Found", 404);
    }
  }
  return c.text("500 Internal Server Error", 500);
});
