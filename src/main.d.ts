/**
 * Remote File Manager - A web-based file explorer for managing files on a remote machine.
 * 
 * This module starts a Hono.js server that provides:
 * - File explorer interface
 * - File upload/download functionality  
 * - Text file editing capabilities
 * - Static file serving
 * 
 * The server accepts a --port command line argument to specify the port (defaults to 8000).
 * 
 * @example
 * ```bash
 * # Start server on default port 8000
 * rmf
 * 
 * # Start server on custom port
 * rmf --port 3000
 * ```
 */

/**
 * No exports - this module starts a server when imported/executed.
 */
export {};
