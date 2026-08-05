const QUOTE_PATH_OFF = ["-c", "core.quotePath=false"];

/**
 * Runs a git command and returns its standard output
 * @param {string[]} args - The git arguments
 * @param {string} cwd - The directory to run git in
 * @returns {Promise<string|null>} - The output, or null when the command failed
 */
export async function runGit(args, cwd) {
  try {
    const command = new Deno.Command("git", {
      args: [...QUOTE_PATH_OFF, ...args],
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

// A served directory never changes repository while the server runs, so the
// lookup is cached to keep page renders from spawning git repeatedly
const repoRootCache = new Map();

/**
 * Finds the root directory of the repository containing a directory
 * @param {string} workingDir - The directory to inspect
 * @returns {Promise<string|null>} - The repository root, or null when untracked
 */
export async function getRepoRoot(workingDir) {
  if (repoRootCache.has(workingDir)) {
    return repoRootCache.get(workingDir);
  }
  const topLevel = await runGit(["rev-parse", "--show-toplevel"], workingDir);
  const repoRoot = topLevel ? topLevel.trim() : null;
  repoRootCache.set(workingDir, repoRoot);
  return repoRoot;
}

/**
 * Checks whether the repository has at least one commit
 * @param {string} repoRoot - The repository root
 * @returns {Promise<boolean>} - True when HEAD resolves
 */
export async function hasCommits(repoRoot) {
  return await runGit(["rev-parse", "--verify", "HEAD"], repoRoot) !== null;
}

/**
 * Rejects revision strings that could be interpreted as git options
 * @param {string} revision - The revision to validate
 * @returns {boolean} - True when the revision is safe to pass to git
 */
export function isValidRevision(revision) {
  return typeof revision === "string" &&
    revision.length > 0 &&
    revision.length <= 255 &&
    /^[A-Za-z0-9._\/~^{}@-]+$/.test(revision) &&
    !revision.startsWith("-") &&
    !revision.includes("..");
}
