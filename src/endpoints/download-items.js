import { basename, BlobReader, BlobWriter, walk, ZipWriter } from "../deps.js";
import { normalizePath } from "./utils.js";

async function addFileToZip(zipWriter, filePath, entryName) {
  const fileContent = await Deno.readFile(filePath);
  const fileBlobReader = new BlobReader(new Blob([fileContent]));
  await zipWriter.add(entryName, fileBlobReader);
}

async function addPathToZip(zipWriter, path) {
  const stat = await Deno.stat(path);
  const name = basename(path);

  if (!stat.isDirectory) {
    await addFileToZip(zipWriter, path, name);
    return;
  }

  for await (const entry of walk(path, { includeDirs: false })) {
    const relativePath = entry.path.slice(path.length + 1);
    await addFileToZip(zipWriter, entry.path, `${name}/${relativePath}`);
  }
}

export async function downloadItems(c) {
  try {
    const formData = await c.req.formData();
    const requestedPaths = formData.getAll("paths");

    if (requestedPaths.length === 0) {
      return c.text("No items selected", 400);
    }

    const blobWriter = new BlobWriter("application/zip");
    const zipWriter = new ZipWriter(blobWriter);
    let addedCount = 0;

    for (const requestedPath of requestedPaths) {
      const path = normalizePath(String(requestedPath));
      if (!path) {
        continue;
      }
      try {
        await addPathToZip(zipWriter, path);
        addedCount++;
      } catch (error) {
        console.error(`Error adding ${path} to archive:`, error);
      }
    }

    await zipWriter.close();

    if (addedCount === 0) {
      return c.text("Nothing could be added to the archive", 400);
    }

    const zipBlob = await blobWriter.getData();
    const zipBytes = new Uint8Array(await zipBlob.arrayBuffer());
    const archiveName = addedCount === 1
      ? `${basename(normalizePath(String(requestedPaths[0])))}.zip`
      : "download.zip";

    c.header("Content-Type", "application/zip");
    c.header(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(archiveName)}"`,
    );
    c.header("Content-Length", zipBytes.length.toString());

    return c.body(zipBytes);
  } catch (error) {
    console.error("Bulk download error:", error);
    return c.text("Error creating ZIP archive", 500);
  }
}
