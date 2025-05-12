import { normalizePath } from "./utils.js";

export async function deleteItem(c) {
  try {
    // Get form data
    const data = await c.req.parseBody();
    const path = data.path;
    const type = data.type; // "file" or "directory"
    const parentPath = data.parentPath || ".";

    // Validate inputs
    if (!path) {
      return c.redirect(
        `/file-explorer?path=${
          encodeURIComponent(parentPath)
        }&error=invalid_path`,
      );
    }

    // Normalize path to prevent directory traversal
    const normalizedPath = normalizePath(path);
    if (!normalizedPath) {
      return c.redirect(`/file-explorer?error=invalid_path`);
    }

    try {
      // Delete the file or directory based on type
      if (type === "file") {
        await Deno.remove(normalizedPath);
      } else if (type === "directory") {
        // Try to remove directory (will fail if not empty)
        try {
          await Deno.remove(normalizedPath, { recursive: false });
        } catch (e) {
          // Check if the error is because directory is not empty
          if (e instanceof Deno.errors.NotEmpty) {
            return c.redirect(
              `/file-explorer?path=${
                encodeURIComponent(parentPath)
              }&error=not_empty`,
            );
          }
          throw e; // Re-throw if it's a different error
        }
      } else {
        return c.redirect(
          `/file-explorer?path=${
            encodeURIComponent(parentPath)
          }&error=invalid_type`,
        );
      }

      // Redirect back to the file explorer with success message
      return c.redirect(
        `/file-explorer?path=${
          encodeURIComponent(parentPath)
        }&success=item_deleted`,
      );
    } catch (error) {
      // Handle specific errors
      console.error("Error deleting item:", error);
      return c.redirect(
        `/file-explorer?path=${encodeURIComponent(parentPath)}&error=${
          encodeURIComponent(error.message)
        }`,
      );
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return c.redirect(`/file-explorer?error=server_error`);
  }
}
