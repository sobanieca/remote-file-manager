import { basename, copy } from "../deps.js";
import { combinePaths, normalizePath } from "./utils.js";

async function pathExists(path) {
  try {
    await Deno.lstat(path);
    return true;
  } catch {
    return false;
  }
}

function isInside(candidatePath, directoryPath) {
  return candidatePath === directoryPath ||
    candidatePath.startsWith(`${directoryPath}/`);
}

function isCrossDeviceError(error) {
  return error.code === "EXDEV" || error.name === "CrossDevice";
}

async function movePath(sourcePath, destinationPath) {
  try {
    await Deno.rename(sourcePath, destinationPath);
  } catch (error) {
    // Renaming across mount points is not supported, copy and remove instead
    if (!isCrossDeviceError(error)) {
      throw error;
    }
    await copy(sourcePath, destinationPath, { overwrite: true });
    await Deno.remove(sourcePath, { recursive: true });
  }
}

/**
 * Copies or moves a set of entries into a target directory
 * @param {object} options - The paths, target, direction and overwrite flag
 * @returns {Promise<object>} - A per-item report of the operation
 */
export async function transferItems({ paths, targetPath, isMove, overwrite }) {
  const normalizedTarget = normalizePath(targetPath);
  if (!normalizedTarget) {
    return { ok: false, message: "Invalid target path" };
  }

  try {
    const targetStat = await Deno.stat(normalizedTarget);
    if (!targetStat.isDirectory) {
      return { ok: false, message: "Target is not a directory" };
    }
  } catch {
    return { ok: false, message: "Target directory does not exist" };
  }

  const conflicts = [];
  const errors = [];
  let processed = 0;

  for (const rawPath of paths) {
    const sourcePath = normalizePath(rawPath);
    if (!sourcePath || sourcePath === ".") {
      errors.push({ path: String(rawPath), message: "Invalid path" });
      continue;
    }

    const name = basename(sourcePath);
    const destinationPath = combinePaths(normalizedTarget, name);

    if (destinationPath === sourcePath) {
      errors.push({ path: name, message: "Source and target are the same" });
      continue;
    }
    if (isInside(destinationPath, sourcePath)) {
      errors.push({
        path: name,
        message: "Cannot place a folder inside itself",
      });
      continue;
    }

    try {
      if (await pathExists(destinationPath)) {
        if (!overwrite) {
          conflicts.push(name);
          continue;
        }
        await Deno.remove(destinationPath, { recursive: true });
      }

      if (isMove) {
        await movePath(sourcePath, destinationPath);
      } else {
        await copy(sourcePath, destinationPath, { preserveTimestamps: true });
      }
      processed++;
    } catch (error) {
      errors.push({ path: name, message: error.message });
    }
  }

  const verb = isMove ? "Moved" : "Copied";
  const messageParts = [];
  if (processed > 0) {
    messageParts.push(`${verb} ${processed} item${processed === 1 ? "" : "s"}`);
  }
  if (conflicts.length > 0) {
    messageParts.push(`${conflicts.length} already exist`);
  }
  if (errors.length > 0) {
    messageParts.push(`${errors.length} failed`);
  }

  return {
    ok: errors.length === 0,
    processed,
    conflicts,
    errors,
    message: messageParts.join(", ") || "Nothing to do",
  };
}
