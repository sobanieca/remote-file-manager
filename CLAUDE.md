# CLAUDE.md - Project Guidelines

## Project Overview
Remote File Manager - A web-based file explorer for managing files on a remote machine. It allows to serve files as well as manage them and edit (text files).

## Build Commands
- Start server: `deno task dev`
- Format code: `deno fmt`
- Lint code: `deno lint`

## Code Style Guidelines
- **Framework**: Uses Hono.js with Deno runtime
- **Imports**: Group imports by source (JSR)
- **Error handling**: Use try/catch blocks with specific error messages
- **Naming**: 
  - Variables/functions: camelCase
  - Constants: UPPER_CASE
  - File paths: kebab-case
- **Formatting**: 2-space indentation
- **Async handling**: Use async/await pattern consistently

## Security Considerations
- Validate all user inputs, especially file paths
- Avoid directory traversal vulnerabilities
- Don't expose sensitive system information/files
