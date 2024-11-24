import { Hono } from "jsr:@hono/hono";
import { serve } from "https://deno.land/std@0.114.0/http/server.ts";
import { MultipartReader } from "https://deno.land/std@0.114.0/mime/mod.ts";
import { ensureDir } from "https://deno.land/std@0.114.0/fs/mod.ts";
const app = new Hono();
const UPLOAD_DIR = "./uploads";
const PUBLIC_DIR = "./public";
// Ensure the upload directory exists
await ensureDir(UPLOAD_DIR);
// Serve the index.html file
app.get("/", async (c) => {
  const filePath = `${PUBLIC_DIR}/index.html`;
  try {
    const fileContent = await Deno.readTextFile(filePath);
    return c.html(fileContent);
  } catch (error) {
    return c.text("Error loading page", 500);
  }
});
// List files in the directory
app.get("/files", async (c) => {
  const files = [];
  for await (const dirEntry of Deno.readDir(UPLOAD_DIR)) {
    if (dirEntry.isFile) {
      files.push(dirEntry.name);
    }
  }
  return c.json(files);
});
// Handle file uploads
app.post("/upload", async (c) => {
  const contentType = c.req.headers.get("content-type");
  if (!contentType || !contentType.startsWith("multipart/form-data")) {
    return c.text("Invalid content type", 400);
  }
  const boundary = contentType.split("boundary=")[1];
  if (!boundary) {
    return c.text("Boundary not found", 400);
  }
  const reader = new MultipartReader(c.req.body, boundary);
  const form = await reader.readForm();
  for (const [name, file] of form.entries()) {
    if (file instanceof File) {
      const filePath = `${UPLOAD_DIR}/${file.name}`;
      await Deno.writeFile(filePath, await file.arrayBuffer());
    }
  }
  return c.text("File uploaded successfully");
});
// Start the server
serve(app.fetch, { port: 8000 });
console.log("Server running on http://localhost:8000");

