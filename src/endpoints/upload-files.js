import { combinePaths, normalizePath } from "./utils.js";
import { dirname, ensureDir, join } from "../deps.js";

export async function uploadFiles(c) {
  try {
    // Get form data with uploaded files
    const data = await c.req.parseBody();
    const targetPath = data.path || ".";

    // Validate target path
    const normalizedPath = normalizePath(targetPath);
    if (!normalizedPath) {
      return c.redirect(`/file-explorer?error=invalid_path`);
    }

    // Process uploaded files
    let processedFiles = 0;
    let processedFolders = 0;
    let failedFiles = 0;

    // Handle both standard file uploads and directory uploads
    const formData = await c.req.formData();
    const files = formData.getAll("files");

    if (!files || files.length === 0) {
      return c.redirect(
        `/file-explorer?path=${
          encodeURIComponent(normalizedPath)
        }&error=no_files`,
      );
    }

    // Track processed directories to avoid duplicates
    const processedDirs = new Set();

    for (const file of files) {
      try {
        if (!file.name) {
          failedFiles++;
          continue;
        }

        // Handle file paths for folder uploads
        let filePath = file.name;
        let isPartOfFolder = false;

        // If the file is part of a folder upload, it will contain path separators
        if (filePath.includes("/") || filePath.includes("\\")) {
          isPartOfFolder = true;

          // Normalize path separators to forward slashes
          filePath = filePath.replace(/\\/g, "/");

          // Extract the directory structure
          const dirPath = dirname(filePath);

          if (!processedDirs.has(dirPath)) {
            processedDirs.add(dirPath);
            processedFolders++;
          }

          // Create full directory path
          const fullDirPath = join(normalizedPath, dirPath);
          await ensureDir(fullDirPath);

          // Create full file path
          const fullFilePath = join(normalizedPath, filePath);

          // Read file content
          const arrayBuffer = await file.arrayBuffer();
          const fileContent = new Uint8Array(arrayBuffer);

          // Write file
          await Deno.writeFile(fullFilePath, fileContent);
        } else {
          // Regular file upload
          const fullFilePath = combinePaths(normalizedPath, filePath);

          // Read file content
          const arrayBuffer = await file.arrayBuffer();
          const fileContent = new Uint8Array(arrayBuffer);

          // Write file
          await Deno.writeFile(fullFilePath, fileContent);
          processedFiles++;
        }
      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError);
        failedFiles++;
      }
    }

    // Generate appropriate success/error message
    if (failedFiles > 0) {
      if (processedFiles > 0 || processedFolders > 0) {
        // Some files succeeded, some failed
        return c.redirect(
          `/file-explorer?path=${
            encodeURIComponent(normalizedPath)
          }&success=partial_upload&count=${processedFiles}&folders=${processedFolders}&failed=${failedFiles}`,
        );
      } else {
        // All files failed
        return c.redirect(
          `/file-explorer?path=${
            encodeURIComponent(normalizedPath)
          }&error=upload_failed`,
        );
      }
    } else if (processedFolders > 0) {
      // Folder(s) uploaded successfully
      return c.redirect(
        `/file-explorer?path=${
          encodeURIComponent(normalizedPath)
        }&success=folders_uploaded&count=${processedFolders}`,
      );
    } else {
      // File(s) uploaded successfully
      return c.redirect(
        `/file-explorer?path=${
          encodeURIComponent(normalizedPath)
        }&success=files_uploaded&count=${processedFiles}`,
      );
    }
  } catch (error) {
    console.error("Upload error:", error);
    return c.redirect(`/file-explorer?error=server_error`);
  }
}
