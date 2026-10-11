//! API endpoints, one per file. Endpoints answer JSON (or file contents) and
//! resolve every path inside the served directory.

pub mod copy_items;
pub mod create_item;
pub mod delete_items;
pub mod download_item;
pub mod download_items;
pub mod file_entries;
pub mod git_compare;
pub mod git_diff;
pub mod git_log;
pub mod git_overview;
pub mod git_summary;
pub mod list_entries;
pub mod move_items;
pub mod paste_content;
pub mod read_file;
pub mod rename_item;
pub mod save_file;
pub mod search_files;
pub mod static_files;
pub mod switch_worktree;
pub mod thumbnail;
pub mod transfer_items;
pub mod ui_app;
pub mod upload_files;

use crate::http::Response;
use crate::object;
use std::io;
use std::path::Path;

pub fn json_error(status: u16, message: impl Into<String>) -> Response {
    Response::json(
        status,
        object! { "ok" => false, "message" => message.into() },
    )
}

/// Unexpected failures answer 500 with their message.
pub fn respond(result: Result<Response, String>) -> Response {
    result.unwrap_or_else(|message| json_error(500, message))
}

/// `"3 items"`, `"1 item"`.
pub fn count_of(count: usize, noun: &str) -> String {
    if count == 1 {
        format!("{count} {noun}")
    } else {
        format!("{count} {noun}s")
    }
}

pub fn exists(path: &Path) -> bool {
    path.symlink_metadata().is_ok()
}

/// Removes a file, a symbolic link or a directory (`Deno.remove`).
pub fn remove_path(path: &Path, recursive: bool) -> io::Result<()> {
    let metadata = path.symlink_metadata()?;
    if !metadata.is_dir() {
        std::fs::remove_file(path)
    } else if recursive {
        std::fs::remove_dir_all(path)
    } else {
        std::fs::remove_dir(path)
    }
}

pub fn attachment(filename: &str) -> String {
    format!(
        "attachment; filename=\"{}\"",
        crate::http::url::encode_component(filename)
    )
}

/// Valid names for new or renamed entries: no separators and not `.`/`..`.
pub fn is_valid_name(name: &str) -> bool {
    !name.is_empty()
        && name != "."
        && name != ".."
        && !name.contains('/')
        && !name.contains('\\')
        && !name.contains('\0')
}
