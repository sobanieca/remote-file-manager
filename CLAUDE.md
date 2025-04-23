# CLAUDE.md - Project Guidelines

## Project Overview

Remote File Manager - A web-based file explorer for managing files on a remote
machine. It allows to serve files as well as manage them and edit (text files).

## Build Commands

- Start server: `deno task dev`

> Ensure that watch is not set for this command.

- Format code: `deno fmt`
- Lint code: `deno lint`

## Code Style Guidelines

- **Framework**: Uses Hono.js with Deno runtime
- **Imports**: Use deps.js file which will contain all external imports (and it will re-export them)
- **Error handling**: Use try/catch blocks with specific error messages
- **Naming**:
  - Variables/functions: camelCase
  - Constants: UPPER_CASE
  - File paths: kebab-case
- **Formatting**: 2-space indentation
- **Async handling**: Use async/await pattern consistently
- **HTML**: Don't repeat common layout. Move it to separate file and re-use when generating endpoints that return HTML
- **Endpoints**: Each endpoint (especially the one that returns HTML) should be present in separate file (as ES Module)

## Security Considerations

- Validate all user inputs, especially file paths
- Avoid directory traversal vulnerabilities
- Don't expose sensitive system information/files
