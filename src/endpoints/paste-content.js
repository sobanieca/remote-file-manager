import { combinePaths, normalizePath } from "./utils.js";

export async function pasteContent(c) {
  try {
    const formData = await c.req.formData();
    const path = formData.get("path") || ".";
    const filename = formData.get("filename");
    const file = formData.get("file");

    if (!filename || !file) {
      return c.text("Missing filename or file data", 400);
    }

    // Validate and normalize path
    const normalizedPath = normalizePath(path);
    if (!normalizedPath) {
      return c.text("Invalid path", 400);
    }

    // Validate filename
    if (
      filename.includes("/") || filename.includes("\\") ||
      filename.includes("..")
    ) {
      return c.text("Invalid filename", 400);
    }

    const fullFilePath = combinePaths(normalizedPath, filename);

    try {
      // Check if file already exists
      try {
        await Deno.stat(fullFilePath);
        return c.text("File already exists", 409);
      } catch (error) {
        // File doesn't exist, which is what we want
        if (!(error instanceof Deno.errors.NotFound)) {
          throw error;
        }
      }

      // Read file content
      const arrayBuffer = await file.arrayBuffer();
      const content = new Uint8Array(arrayBuffer);

      // Write file to disk
      await Deno.writeFile(fullFilePath, content);

      // Redirect back to file explorer with success message
      const redirectPath = `/file-explorer?path=${
        encodeURIComponent(normalizedPath)
      }&success=file_created`;
      return c.redirect(redirectPath);
    } catch (error) {
      console.error("Error saving pasted file:", error);
      const redirectPath = `/file-explorer?path=${
        encodeURIComponent(normalizedPath)
      }&error=save_failed`;
      return c.redirect(redirectPath);
    }
  } catch (error) {
    console.error("Error processing paste request:", error);
    return c.text("Internal server error", 500);
  }
}
