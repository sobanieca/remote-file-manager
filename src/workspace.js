const initialWorkingDir = Deno.cwd();

/**
 * Returns the directory currently served by the file manager
 * @returns {string} - The absolute served directory
 */
export function getWorkingDir() {
  return Deno.cwd();
}

/**
 * Returns the directory the server was started in
 * @returns {string} - The absolute initial directory
 */
export function getInitialWorkingDir() {
  return initialWorkingDir;
}

/**
 * Switches the served directory, which every endpoint resolves paths against
 * @param {string} directory - The absolute directory to serve from now on
 */
export function setWorkingDir(directory) {
  Deno.chdir(directory);
}
