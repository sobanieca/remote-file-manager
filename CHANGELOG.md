# Changelog

All notable changes to Remote File Manager are documented here.

## 0.10.1

### Fixed

- On a phone, or in a narrow pane, the list view shows one compact row per entry
  again (checkbox, name, size and actions) instead of a tall card per file. The
  grid view is unchanged.

## 0.10.0

### Changed

- The user interface is now a single page application built with imp in `ui/`,
  served at `/file-explorer`. Navigating between files, the viewer, the editor
  and the git pages no longer reloads the page, and the app routes in the URL
  fragment (`/file-explorer#/view?path=README.md`). Old
  `/file-explorer?path=...` links are redirected.
- The server no longer renders HTML. It serves a JSON API under `/api`, and the
  built app is embedded in the package as `src/ui-assets.js`.
- Markdown files open in the file viewer, with a Rendered and a Source tab. HTML
  files get the same two tabs.
- The theme follows the system preference and can be set to light, dark or
  system from the app bar.

### Added

- Markdown tables render as tables.
- The upload dialog accepts dropped files.
- Renaming or deleting a file from the file viewer now works and returns to the
  renamed file or its folder.

### Removed

- The line wrapping toggle of the code viewer and the editor.
- The server side Prism and GFM dependencies.

## 0.9.1

### Changed

- The file search shortcut is now `Ctrl`/`Cmd` + `P`. `Ctrl`/`Cmd` + `K` no
  longer opens it.

### Fixed

- Landing page: the SSH tunnel label in the hero diagram overlapped the server
  box and hid the connector line on desktop layouts.

## 0.9.0

### Added

- Fuzzy file search across the whole served directory. Open it with the **Search
  files** button in the app bar or `Ctrl`/`Cmd` + `P`. `Enter` opens a file or
  folder, `Shift` + `Enter` reveals it in the explorer. The index skips `.git`,
  refreshes in the background and is invalidated by every file operation.
- Git worktree support. The status page lists every worktree of the repository
  with its branch and HEAD, and the branch chip in the app bar becomes a
  worktree switcher when there is more than one. Switching serves the selected
  worktree, keeping the same sub directory and the folder you were viewing when
  it exists there.
- Deleted directories are listed in the explorer next to deleted files, and both
  open the git diff of what was removed.
- Folder history from the entry menu.

### Fixed

- Absolute paths such as `/etc/passwd` were accepted by every endpoint and could
  read files outside the served directory.
- A repository whose branch has no commits yet was shown as `detached`.
- Commit and compare diffs linked files by their repository path, which was
  wrong when serving a sub directory of the repository. Links now target the
  served path and are dropped for files outside it.
- Merge commits showed an empty diff. They are now shown against their first
  parent.
- An untracked folder was badged as modified instead of added, and a folder
  containing only deleted files was not visible at all.
- A file that was staged as new and then modified again had no diff action.
- Raw links, image and media previews broke for names containing `#`, `?` or
  `%`.
- Renaming, creating, uploading or pasting in split view left the other pane
  stale when it showed the same folder.
- Opening a file path with the explorer now redirects to the viewer instead of
  failing.
- The change counter on the status page and in the app bar now agree; a file
  with both staged and unstaged changes counts once.

## 0.8.0

- Inline previews for HTML, markdown, video, audio and PDF files, copy all
  button and video playback.
- Git status scoped to the served directory.
- Extended file explorer with dual panes, sorting, filtering, grid view and bulk
  actions.
- Git status, commit history, diffs and commit comparison.
- Landing page and GitHub Pages workflow.
