function createFile(path) {
  return {
    path,
    originalPath: null,
    status: "modified",
    isBinary: false,
    hunks: [],
    added: 0,
    removed: 0,
  };
}

function parseHunkHeader(line) {
  const match = line.match(/^@@+ (-(\d+)(?:,\d+)? \+(\d+)(?:,\d+)?) @@+(.*)$/);
  if (!match) {
    return null;
  }
  return {
    range: match[1],
    oldLineNumber: parseInt(match[2], 10),
    newLineNumber: parseInt(match[3], 10),
    heading: match[4].trim(),
  };
}

function parseGitHeaderPaths(line) {
  const match = line.match(/^diff --git a\/(.+) b\/(.+)$/);
  return match ? { original: match[1], target: match[2] } : null;
}

/**
 * Parses a unified diff into per-file hunks
 * @param {string} diffText - The raw diff produced by git
 * @returns {object[]} - One descriptor per changed file
 */
export function parseDiff(diffText) {
  const files = [];
  let currentFile = null;
  let currentHunk = null;
  let oldLineNumber = 0;
  let newLineNumber = 0;

  for (const line of diffText.replace(/\n$/, "").split("\n")) {
    const headerPaths = parseGitHeaderPaths(line);
    if (headerPaths) {
      currentFile = createFile(headerPaths.target);
      currentFile.originalPath = headerPaths.original !== headerPaths.target
        ? headerPaths.original
        : null;
      currentHunk = null;
      files.push(currentFile);
      continue;
    }
    if (!currentFile) {
      continue;
    }
    if (line.startsWith("new file mode")) {
      currentFile.status = "added";
      continue;
    }
    if (line.startsWith("deleted file mode")) {
      currentFile.status = "deleted";
      continue;
    }
    if (line.startsWith("rename from ")) {
      currentFile.status = "renamed";
      currentFile.originalPath = line.substring("rename from ".length);
      continue;
    }
    if (line.startsWith("rename to ")) {
      currentFile.status = "renamed";
      currentFile.path = line.substring("rename to ".length);
      continue;
    }
    if (line.startsWith("Binary files ") || line.startsWith("GIT binary ")) {
      currentFile.isBinary = true;
      continue;
    }
    if (line.startsWith("--- ") || line.startsWith("+++ ")) {
      const path = line.substring(4);
      if (path !== "/dev/null") {
        const stripped = path.replace(/^[ab]\//, "");
        if (line.startsWith("+++ ")) {
          currentFile.path = stripped;
        }
      }
      continue;
    }

    const hunkHeader = parseHunkHeader(line);
    if (hunkHeader) {
      currentHunk = {
        range: hunkHeader.range,
        heading: hunkHeader.heading,
        lines: [],
      };
      currentFile.hunks.push(currentHunk);
      oldLineNumber = hunkHeader.oldLineNumber;
      newLineNumber = hunkHeader.newLineNumber;
      continue;
    }
    if (!currentHunk) {
      continue;
    }
    if (line.startsWith("\\")) {
      currentHunk.lines.push({ type: "note", content: line.substring(2) });
      continue;
    }

    const marker = line.charAt(0);
    const content = line.substring(1);
    if (marker === "+") {
      currentHunk.lines.push({
        type: "added",
        content,
        newLineNumber: newLineNumber++,
      });
      currentFile.added++;
    } else if (marker === "-") {
      currentHunk.lines.push({
        type: "removed",
        content,
        oldLineNumber: oldLineNumber++,
      });
      currentFile.removed++;
    } else if (marker === " " || line === "") {
      currentHunk.lines.push({
        type: "context",
        content,
        oldLineNumber: oldLineNumber++,
        newLineNumber: newLineNumber++,
      });
    }
  }

  return files;
}
