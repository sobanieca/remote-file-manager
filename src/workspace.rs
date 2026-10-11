//! The directory served by the file manager. Every path received by the API
//! is resolved against it. Switching to another git worktree changes it while
//! the server runs.

use std::path::{Path, PathBuf};
use std::sync::{OnceLock, RwLock};

static WORKING_DIR: OnceLock<RwLock<PathBuf>> = OnceLock::new();

fn cell() -> &'static RwLock<PathBuf> {
    WORKING_DIR
        .get_or_init(|| RwLock::new(std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."))))
}

/// The absolute directory currently served.
pub fn working_dir() -> PathBuf {
    cell().read().map(|dir| dir.clone()).unwrap_or_default()
}

pub fn set_working_dir(directory: PathBuf) {
    if let Ok(mut dir) = cell().write() {
        *dir = directory;
    }
}

/// Resolves a normalized path (see `paths::normalize`) inside `root`.
pub fn resolve_in(root: &Path, path: &str) -> PathBuf {
    if path == "." {
        root.to_path_buf()
    } else {
        root.join(path)
    }
}

/// Resolves a normalized path inside the served directory.
pub fn resolve(path: &str) -> PathBuf {
    resolve_in(&working_dir(), path)
}
