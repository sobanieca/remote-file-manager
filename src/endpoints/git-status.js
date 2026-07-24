import { basename, dirname, join, relative } from "../deps.js";

async function runGit(args, cwd) {
  try {
    const command = new Deno.Command("git", {
      args,
      cwd,
      stdout: "piped",
      stderr: "null",
    });
    const { code, stdout } = await command.output();
    if (code !== 0) {
      return null;
    }
    return new TextDecoder().decode(stdout);
  } catch {
    return null;
  }
}

function resolveStatus(statusCode) {
  if (statusCode === "??") {
    return "added";
  }
  const indexStatus = statusCode[0];
  const worktreeStatus = statusCode[1];
  if (indexStatus === "A" || worktreeStatus === "A") {
    return "added";
  }
  if (indexStatus === "D" || worktreeStatus === "D") {
    return "deleted";
  }
  if (indexStatus === "R" || indexStatus === "C") {
    return "renamed";
  }
  return "modified";
}

export async function getGitStatusInfo(workingDir) {
  const topLevel = await runGit(
    ["rev-parse", "--show-toplevel"],
    workingDir,
  );
  if (!topLevel) {
    return null;
  }
  const repoRoot = topLevel.trim();

  const output = await runGit(
    ["status", "--porcelain", "-z", "--untracked-files=all"],
    repoRoot,
  );
  if (output === null) {
    return null;
  }

  const statusMap = new Map();
  const tokens = output.split("\0");
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!token) {
      continue;
    }
    const statusCode = token.slice(0, 2);
    const filePath = token.slice(3);
    if (statusCode[0] === "R" || statusCode[0] === "C") {
      i++;
    }
    statusMap.set(filePath, resolveStatus(statusCode));
  }

  return { repoRoot, statusMap };
}

export function getEntryGitStatus(gitInfo, workingDir, entryPath, isDirectory) {
  if (!gitInfo) {
    return null;
  }
  const absolutePath = join(workingDir, entryPath);
  const gitRelativePath = relative(gitInfo.repoRoot, absolutePath);
  if (!isDirectory) {
    return gitInfo.statusMap.get(gitRelativePath) || null;
  }
  const prefix = gitRelativePath + "/";
  for (const key of gitInfo.statusMap.keys()) {
    if (key.startsWith(prefix)) {
      return "modified";
    }
  }
  return null;
}

export function getDeletedEntryNames(gitInfo, workingDir, directoryPath) {
  if (!gitInfo) {
    return [];
  }
  const absoluteDir = join(workingDir, directoryPath);
  const relativeDir = relative(gitInfo.repoRoot, absoluteDir) || ".";
  const names = [];
  for (const [key, status] of gitInfo.statusMap.entries()) {
    if (status === "deleted" && dirname(key) === relativeDir) {
      names.push(basename(key));
    }
  }
  return names;
}

export function gitStatusBadge(status) {
  if (!status) {
    return "";
  }
  const labels = {
    added: "A",
    modified: "M",
    deleted: "D",
    renamed: "R",
  };
  const titles = {
    added: "Added / Untracked",
    modified: "Modified",
    deleted: "Deleted",
    renamed: "Renamed",
  };
  return `<span class="git-status git-${status}" title="${titles[status]}">${
    labels[status]
  }</span>`;
}
