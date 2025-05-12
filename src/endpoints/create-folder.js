import { combinePaths, normalizePath } from "./utils.js";

export async function createFolder(c) {
  try {
    // Get form data
    const data = await c.req.parseBody();
    const path = data.path || ".";
    const folderName = data.folderName;

    // Validate inputs
    if (
      !folderName || folderName.includes("/") || folderName.includes("\\") ||
      folderName.includes("..")
    ) {
      return c.redirect(
        `/file-explorer?path=${encodeURIComponent(path)}&error=invalid_name`,
      );
    }

    // Normalize path to prevent directory traversal
    const normalizedPath = normalizePath(path);
    if (!normalizedPath) {
      return c.redirect(`/file-explorer?error=invalid_path`);
    }

    // Combine paths to get the full folder path
    const newFolderPath = combinePaths(normalizedPath, folderName);

    try {
      // Create the directory
      await Deno.mkdir(newFolderPath);
      // Redirect back to the file explorer with success message
      return c.redirect(
        `/file-explorer?path=${
          encodeURIComponent(normalizedPath)
        }&success=folder_created`,
      );
    } catch (error) {
      // Handle specific errors
      if (error instanceof Deno.errors.AlreadyExists) {
        return c.redirect(
          `/file-explorer?path=${
            encodeURIComponent(normalizedPath)
          }&error=already_exists`,
        );
      }

      // Handle other errors
      console.error("Error creating folder:", error);
      return c.redirect(
        `/file-explorer?path=${encodeURIComponent(normalizedPath)}&error=${
          encodeURIComponent(error.message)
        }`,
      );
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return c.redirect(`/file-explorer?error=server_error`);
  }
}
