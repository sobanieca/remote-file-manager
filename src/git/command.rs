use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::sync::{Mutex, OnceLock};

const QUOTE_PATH_OFF: [&str; 2] = ["-c", "core.quotePath=false"];

/// Runs git and returns its standard output, `None` when the command failed.
pub fn run_git(args: &[&str], cwd: &Path) -> Option<String> {
    let output = Command::new("git")
        .args(QUOTE_PATH_OFF)
        .args(args)
        .current_dir(cwd)
        .stdin(Stdio::null())
        .stderr(Stdio::null())
        .output()
        .ok()?;
    if !output.status.success() {
        return None;
    }
    Some(String::from_utf8_lossy(&output.stdout).into_owned())
}

/// A served directory never changes repository while the server runs, so the
/// lookup is cached to keep requests from spawning git repeatedly.
fn repo_root_cache() -> &'static Mutex<HashMap<PathBuf, Option<PathBuf>>> {
    static CACHE: OnceLock<Mutex<HashMap<PathBuf, Option<PathBuf>>>> = OnceLock::new();
    CACHE.get_or_init(|| Mutex::new(HashMap::new()))
}

/// The root directory of the repository containing a directory.
pub fn repo_root(working_dir: &Path) -> Option<PathBuf> {
    if let Some(cached) = repo_root_cache()
        .lock()
        .ok()
        .and_then(|cache| cache.get(working_dir).cloned())
    {
        return cached;
    }
    let repo_root = run_git(&["rev-parse", "--show-toplevel"], working_dir)
        .map(|top_level| PathBuf::from(top_level.trim()));
    if let Ok(mut cache) = repo_root_cache().lock() {
        cache.insert(working_dir.to_path_buf(), repo_root.clone());
    }
    repo_root
}

pub fn has_commits(repo_root: &Path) -> bool {
    run_git(&["rev-parse", "--verify", "HEAD"], repo_root).is_some()
}

/// Rejects revisions that git could interpret as options or ranges.
pub fn is_valid_revision(revision: &str) -> bool {
    !revision.is_empty()
        && revision.len() <= 255
        && revision
            .bytes()
            .all(|byte| byte.is_ascii_alphanumeric() || b"._/~^{}@-".contains(&byte))
        && !revision.starts_with('-')
        && !revision.contains("..")
}

/// A pathspec matching exactly one path.
pub fn literal_pathspec(path: &str) -> String {
    format!(":(literal){path}")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn validates_revisions() {
        assert!(is_valid_revision("HEAD~2"));
        assert!(is_valid_revision("feature/x@{1}"));
        assert!(is_valid_revision("abc123^"));
        assert!(!is_valid_revision("--output=/tmp/x"));
        assert!(!is_valid_revision("main..dev"));
        assert!(!is_valid_revision("a b"));
        assert!(!is_valid_revision(""));
    }
}
