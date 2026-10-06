# AGENTS.md - Project Guidelines

## Project Overview

Remote File Manager - A web-based file explorer for managing files on a remote
machine. It allows to serve files as well as manage them and edit (text files).

The project has two parts:

- `src/` - the Deno server. It serves the working directory as static files and
  a JSON API under `/api`. It also serves the built user interface at
  `/file-explorer` from `src/ui-assets.js`, a generated file.
- `ui/` - the user interface, a single page application built with imp. Run
  `imp skill` inside `ui/` to learn imp before changing anything there.

## Build Commands

- Start server: `deno task dev`, builds the UI and serves `test/` (don't try to
  run this command to avoid infinite loop)

> Ensure that watch is not set for this command.

- Format code: `deno fmt` (server) and `imp fmt` (inside `ui/`)
- Lint code: `deno lint` (server) and `imp lint` (inside `ui/`)
- UI tests: `imp test --unit` and `imp test --e2e --mock` inside `ui/`
- Build the UI into the server: `deno task build-ui`. Run it after every UI
  change and commit the regenerated `src/ui-assets.js`

## Code Style Guidelines

### Server (`src/`)

- **Framework**: Uses Hono.js with Deno runtime
- **Imports**: Use deps.js file which will contain all external imports (and it
  will re-export them)
- **Error handling**: Use try/catch blocks with specific error messages
- **Naming**:
  - Variables/functions: camelCase
  - Constants: UPPER_CASE
  - File paths: kebab-case
- **Formatting**: 2-space indentation
- **Async handling**: Use async/await pattern consistently
- **Endpoints**: Each endpoint should be present in separate file (as ES
  Module). Endpoints return JSON, the server renders no HTML
- **Comments**: Avoid writing comments, try to write self documenting code using
  proper variables names

### User interface (`ui/`)

- **Framework**: imp. Never guess its API, read `imp skill <subject>` first
- **Components**: Re-use imp standard components (`imp/std/...`) wherever one
  fits. Write a component of your own only for what the library does not cover
- **Files**: Keep each component in separate file, with a `*.skill.md` sidecar
  next to it
- **Style**: Follow `imp fmt` (single quotes, no semicolons)

## Security Considerations

- Validate all user inputs, especially file paths
- Avoid directory traversal vulnerabilities
- Don't expose sensitive system information/files

## Landing Page

- When you add a feature or change existing behavior, update the landing page in
  `docs/index.html` as well, so it always reflects the current feature set
