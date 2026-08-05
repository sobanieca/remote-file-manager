import { basename, dirname } from "../deps.js";
import {
  combinePaths,
  getFileKind,
  isExecutableMode,
  isImageFile,
  isMarkdownFile,
  isTextFile,
} from "./utils.js";
import {
  getDeletedEntryNames,
  getEntryGitStatus,
  getGitStatusInfo,
} from "../git/git-status.js";

async function describeEntry(directoryPath, name, isDirectory, isSymlink) {
  const path = combinePaths(directoryPath, name);
  const entry = {
    name,
    path,
    isDirectory,
    isSymlink,
    isDeleted: false,
    size: null,
    mode: null,
    modifiedAt: null,
    isExecutable: false,
    kind: isDirectory ? "folder" : getFileKind(name),
    isImage: !isDirectory && isImageFile(name),
    isMarkdown: !isDirectory && isMarkdownFile(name),
    isText: !isDirectory && isTextFile(name),
    isBroken: false,
  };

  try {
    const stat = await Deno.stat(path);
    entry.size = stat.isDirectory ? null : stat.size;
    entry.mode = stat.mode;
    entry.modifiedAt = stat.mtime;
    entry.isExecutable = !stat.isDirectory && isExecutableMode(stat.mode);
    if (isSymlink && stat.isDirectory) {
      entry.isDirectory = true;
    }
  } catch (_error) {
    entry.isBroken = true;
  }

  return entry;
}

/**
 * Builds the descriptor for a single path, including its git status
 * @param {string} path - The normalized path to describe
 * @returns {Promise<object>} - The entry descriptor
 */
export async function describePath(path) {
  const linkStat = await Deno.lstat(path);
  const entry = await describeEntry(
    dirname(path) || ".",
    basename(path),
    linkStat.isDirectory,
    linkStat.isSymlink,
  );

  const workingDir = Deno.cwd();
  const gitInfo = await getGitStatusInfo(workingDir);
  entry.gitStatus = getEntryGitStatus(
    gitInfo,
    workingDir,
    entry.path,
    entry.isDirectory,
  );

  return entry;
}

function compareEntries(first, second) {
  if (first.isDirectory !== second.isDirectory) {
    return first.isDirectory ? -1 : 1;
  }
  return first.name.localeCompare(second.name, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

/**
 * Reads a directory and returns rich descriptors for every entry
 * @param {string} directoryPath - The normalized directory path to read
 * @returns {Promise<{entries: object[], totalSize: number}>} - The listing
 */
export async function readDirectoryEntries(directoryPath) {
  const workingDir = Deno.cwd();
  const gitInfo = await getGitStatusInfo(workingDir);
  const pendingEntries = [];

  for await (const entry of Deno.readDir(directoryPath)) {
    pendingEntries.push(
      describeEntry(
        directoryPath,
        entry.name,
        entry.isDirectory,
        entry.isSymlink,
      ),
    );
  }

  const entries = await Promise.all(pendingEntries);

  for (
    const deletedName of getDeletedEntryNames(
      gitInfo,
      workingDir,
      directoryPath,
    )
  ) {
    entries.push({
      name: deletedName,
      path: combinePaths(directoryPath, deletedName),
      isDirectory: false,
      isSymlink: false,
      isDeleted: true,
      size: null,
      mode: null,
      modifiedAt: null,
      isExecutable: false,
      kind: getFileKind(deletedName),
      isImage: false,
      isMarkdown: false,
      isText: false,
      isBroken: false,
    });
  }

  for (const entry of entries) {
    entry.gitStatus = entry.isDeleted ? "deleted" : getEntryGitStatus(
      gitInfo,
      workingDir,
      entry.path,
      entry.isDirectory,
    );
  }

  entries.sort(compareEntries);

  const totalSize = entries.reduce(
    (sum, entry) => sum + (entry.size || 0),
    0,
  );

  return { entries, totalSize };
}
