# AGENTS.md - Project Guidelines

## Project Overview

Remote File Manager (`rfm`) - A web-based file explorer for managing files on a
remote machine. It allows to serve files as well as manage them and edit (text
files). It's written in Rust and distributed as a single binary.

The project has two parts:

- `src/` - the Rust server. It serves the working directory as static files and
  a JSON API under `/api`. It also serves the built user interface at
  `/file-explorer`, embedded into the binary from `src/ui-assets/` through the
  generated `src/ui_assets.rs`.
- `ui/` - the user interface, a single page application built with imp. Run
  `imp skill` inside `ui/` to learn imp before changing anything there.

## Build Commands

Development tasks are cargo aliases defined in `.cargo/config.toml` (backed by
the `xtask` crate):

```bash
cargo rfm [args]     # Run rfm from source in the current directory
cargo verify         # fmt --check, clippy -D warnings and all tests
cargo build-ui       # Build ui/ with imp and embed it into the server
cargo dev            # Build the UI and serve test/
```

- `cargo verify` is the pre-commit check and is what CI runs
- `cargo dev` starts a server that runs until it is stopped (don't try to run
  this command to avoid an infinite loop)
- Format code: `cargo fmt` (server) and `imp fmt` (inside `ui/`)
- Lint code: `cargo clippy` (server) and `imp lint` (inside `ui/`)
- UI tests: `imp test --unit` and `imp test --e2e --mock` inside `ui/`
- Build the UI into the server: `cargo build-ui`. Run it after every UI change
  and commit the regenerated `src/ui-assets/` and `src/ui_assets.rs`.
  `cargo xtask bundle-ui` embeds an existing `ui/dist` without rebuilding

## Architecture

`src/main.rs` parses the arguments (`--port`, `update`, `--version`, `--help`),
resolves the port (a custom port is remembered in
`$XDG_CONFIG_HOME/rfm/settings.json`, `src/settings.rs`) and starts the server.

- `src/http/` - a small HTTP/1.1 server on `std::net`: one thread per
  connection, keep-alive, `Content-Length` and chunked bodies, form data
  (`multipart/form-data` and urlencoded) and responses from memory, files
  (with byte ranges) or streams (chunked)
- `src/app.rs` - routing: API endpoints, the user interface, the redirect of
  `*.md` links into the viewer and static files as the fallback
- `src/endpoints/` - one endpoint per file. Endpoints return JSON (or file
  contents), the server renders no HTML
- `src/workspace.rs` - the served directory. Every API path is normalized with
  `src/paths.rs` and resolved against it. Switching git worktrees changes it
- `src/git/` - git integration through the `git` executable (status, log,
  diffs, worktrees) and the unified diff parser
- `src/search/` - the in-memory file index and the fzy fuzzy matcher
- `src/zip.rs` - streaming ZIP writer (deflate, data descriptors, ZIP64) for
  folder and bulk downloads
- `src/json.rs` - JSON parsing and serialization (`object!` builds objects)
- `src/update.rs` - `rfm update` (self-update from GitHub releases) and the
  daily check for new versions
- `src/help.txt` - the help text

## Code Style Guidelines

### Server (`src/`)

- **Dependencies**: Keep them minimal: `flate2` (deflate for ZIP archives) and
  `ureq` (self-update). HTTP, JSON, form data, ZIP and fuzzy matching are
  implemented in the crate
- **Error handling**: Unexpected failures answer 500 with `{ ok: false,
  message }` (`endpoints::respond`), expected ones a specific status and
  message
- **Naming**: Rust conventions (snake_case functions and files, UpperCamelCase
  types, UPPER_CASE constants). JSON fields stay camelCase, the UI reads them
- **Formatting**: `cargo fmt`
- **Endpoints**: Each endpoint is in a separate file in `src/endpoints/` with a
  `handle(&Request) -> Response` function, registered in `src/app.rs`
- **Comments**: Avoid writing comments, try to write self documenting code using
  proper variables names (module doc comments are fine)

### User interface (`ui/`)

- **Framework**: imp. Never guess its API, read `imp skill <subject>` first
- **Components**: Re-use imp standard components (`imp/std/...`) wherever one
  fits. Write a component of your own only for what the library does not cover
- **Files**: Keep each component in separate file, with a `*.skill.md` sidecar
  next to it
- **Style**: Follow `imp fmt` (single quotes, no semicolons)

## Testing

- Unit tests live next to the code (`#[cfg(test)]`).
- `tests/api.rs` runs the compiled binary in temporary directories (and git
  repositories) and exercises the API, the user interface and static files
  over HTTP (`tests/support/mod.rs`).

## Security Considerations

- Validate all user inputs, especially file paths (`paths::normalize`)
- Avoid directory traversal vulnerabilities
- Don't expose sensitive system information/files
- Revisions passed to git are validated (`git::command::is_valid_revision`)

## Landing Page

- When you add a feature or change existing behavior, update the landing page in
  `docs/index.html` as well, so it always reflects the current feature set

## Publishing

- When updating the version update `Cargo.toml` and add a `CHANGELOG.md` entry
- Every push to `main` builds binaries for Linux (musl, static) and macOS
  (x64/arm64) and publishes them as GitHub release `v<version>` (version from
  `Cargo.toml`). `install.sh` and `rfm update` download these release assets,
  so their names (`remote-file-manager-linux-x64`, ...) must not change
