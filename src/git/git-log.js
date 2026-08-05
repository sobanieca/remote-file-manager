import { getRepoRoot, isValidRevision, runGit } from "./git-command.js";

const FIELD_SEPARATOR = "\x00";
const RECORD_SEPARATOR = "\x1e";

// Separators are requested as git escapes rather than literal bytes, because a
// process argument cannot carry a NUL. Git expands them into the bytes above.
const COMMIT_FORMAT = [
  "%H",
  "%h",
  "%an",
  "%aE",
  "%aI",
  "%s",
  "%D",
  "%P",
].join("%x00") + "%x1e";

function parseCommits(output) {
  return output
    .split(RECORD_SEPARATOR)
    .map((record) => record.replace(/^\n/, ""))
    .filter((record) => record.trim().length > 0)
    .map((record) => {
      const [hash, shortHash, author, email, date, subject, refs, parents] =
        record.split(FIELD_SEPARATOR);
      return {
        hash,
        shortHash,
        author,
        email,
        date: new Date(date),
        subject,
        refs: refs ? refs.split(", ").filter(Boolean) : [],
        parents: parents ? parents.trim().split(" ").filter(Boolean) : [],
      };
    });
}

/**
 * Reads the commit history of the repository containing a directory
 * @param {string} workingDir - The directory to inspect
 * @param {object} options - Paging options with limit, skip and optional path
 * @returns {Promise<object|null>} - The commits, or null when not a repository
 */
export async function getCommits(workingDir, options = {}) {
  const repoRoot = await getRepoRoot(workingDir);
  if (!repoRoot) {
    return null;
  }

  const limit = Math.min(Math.max(parseInt(options.limit, 10) || 50, 1), 500);
  const skip = Math.max(parseInt(options.skip, 10) || 0, 0);
  const pathArgs = options.path && options.path !== "."
    ? ["--", `:(literal)${options.path}`]
    : [];

  const output = await runGit(
    [
      "log",
      `--max-count=${limit + 1}`,
      `--skip=${skip}`,
      `--pretty=format:${COMMIT_FORMAT}`,
      ...pathArgs,
    ],
    repoRoot,
  );
  if (output === null) {
    return { repoRoot, commits: [], hasMore: false };
  }

  const commits = parseCommits(output);
  const hasMore = commits.length > limit;

  return { repoRoot, commits: commits.slice(0, limit), hasMore };
}

function parseNameStatus(output) {
  const changes = [];
  const tokens = output.split("\0").filter((token) => token.length > 0);
  for (let i = 0; i < tokens.length; i++) {
    const statusCode = tokens[i];
    if (statusCode[0] === "R" || statusCode[0] === "C") {
      changes.push({
        statusCode,
        originalPath: tokens[++i],
        path: tokens[++i],
      });
    } else {
      changes.push({ statusCode, originalPath: null, path: tokens[++i] });
    }
  }
  return changes;
}

// Records are "added\tdeleted\tpath", or "added\tdeleted\t" for renames where
// the original and new path follow as two separate NUL terminated tokens.
function parseNumstat(output) {
  const stats = new Map();
  const tokens = output.split("\0").filter((token) => token.length > 0);
  for (let i = 0; i < tokens.length; i++) {
    const [added, deleted, path] = tokens[i].split("\t");
    const targetPath = path || tokens[i += 2];
    stats.set(targetPath, {
      added: added === "-" ? null : parseInt(added, 10),
      deleted: deleted === "-" ? null : parseInt(deleted, 10),
    });
  }
  return stats;
}

const CHANGE_STATUS_NAMES = {
  A: "added",
  M: "modified",
  D: "deleted",
  R: "renamed",
  C: "renamed",
  T: "modified",
};

/**
 * Lists the files that differ between two revisions
 * @param {string} workingDir - The directory to inspect
 * @param {string} fromRevision - The base revision
 * @param {string} toRevision - The target revision
 * @returns {Promise<object|null>} - The changed files, or null when unavailable
 */
export async function getChangedFiles(workingDir, fromRevision, toRevision) {
  const repoRoot = await getRepoRoot(workingDir);
  if (!repoRoot) {
    return null;
  }
  if (!isValidRevision(fromRevision) || !isValidRevision(toRevision)) {
    return null;
  }

  const nameStatusOutput = await runGit(
    ["diff", "--name-status", "-z", "-M", fromRevision, toRevision],
    repoRoot,
  );
  if (nameStatusOutput === null) {
    return null;
  }
  const numstatOutput = await runGit(
    ["diff", "--numstat", "-z", "-M", fromRevision, toRevision],
    repoRoot,
  ) || "";

  const stats = parseNumstat(numstatOutput);
  const changes = parseNameStatus(nameStatusOutput).map((change) => ({
    ...change,
    status: CHANGE_STATUS_NAMES[change.statusCode[0]] || "modified",
    ...(stats.get(change.path) || { added: null, deleted: null }),
  }));

  return { repoRoot, changes };
}

/**
 * Resolves a revision to its commit metadata
 * @param {string} workingDir - The directory to inspect
 * @param {string} revision - The revision to resolve
 * @returns {Promise<object|null>} - The commit, or null when unresolvable
 */
export async function getCommit(workingDir, revision) {
  const repoRoot = await getRepoRoot(workingDir);
  if (!repoRoot || !isValidRevision(revision)) {
    return null;
  }
  const output = await runGit(
    ["log", "--max-count=1", `--pretty=format:${COMMIT_FORMAT}`, revision],
    repoRoot,
  );
  if (!output) {
    return null;
  }
  return parseCommits(output)[0] || null;
}
