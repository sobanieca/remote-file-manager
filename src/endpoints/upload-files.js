import { dirname, ensureDir, join } from "../deps.js";
import { combinePaths, normalizePath } from "./utils.js";
import { invalidateFileIndex } from "../search/file-index.js";

function isSafeRelativePath(relativePath) {
  return !relativePath.split("/").some((segment) =>
    segment === ".." || segment === "" || segment.includes("\0")
  );
}

export async function uploadFiles(c) {
  try {
    const formData = await c.req.formData();
    const targetPath = formData.get("path") || ".";

    const directoryPath = normalizePath(String(targetPath));
    if (!directoryPath) {
      return c.json({ ok: false, message: "Invalid path" }, 400);
    }

    const files = formData.getAll("files").filter((file) =>
      file instanceof File && file.name
    );
    if (files.length === 0) {
      return c.json({ ok: false, message: "No files were selected" }, 400);
    }

    const createdDirectories = new Set();
    let uploadedCount = 0;
    let failedCount = 0;

    for (const file of files) {
      try {
        const relativePath = file.name.replace(/\\/g, "/");
        if (!isSafeRelativePath(relativePath)) {
          failedCount++;
          continue;
        }

        let destinationPath;
        if (relativePath.includes("/")) {
          const relativeDirectory = dirname(relativePath);
          const fullDirectory = join(directoryPath, relativeDirectory);
          if (!createdDirectories.has(fullDirectory)) {
            await ensureDir(fullDirectory);
            createdDirectories.add(fullDirectory);
          }
          destinationPath = join(directoryPath, relativePath);
        } else {
          destinationPath = combinePaths(directoryPath, relativePath);
        }

        const content = new Uint8Array(await file.arrayBuffer());
        await Deno.writeFile(destinationPath, content);
        uploadedCount++;
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        failedCount++;
      }
    }

    invalidateFileIndex();
    const folderCount = createdDirectories.size;
    const messageParts = [
      `Uploaded ${uploadedCount} file${uploadedCount === 1 ? "" : "s"}`,
    ];
    if (folderCount > 0) {
      messageParts.push(`${folderCount} folder${folderCount === 1 ? "" : "s"}`);
    }
    if (failedCount > 0) {
      messageParts.push(`${failedCount} failed`);
    }

    return c.json({
      ok: failedCount === 0,
      uploadedCount,
      folderCount,
      failedCount,
      message: messageParts.join(", "),
    });
  } catch (error) {
    console.error("Upload error:", error);
    return c.json({ ok: false, message: error.message }, 500);
  }
}
