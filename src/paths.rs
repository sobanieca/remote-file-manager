//! Paths relative to the served directory. They use `/` separators, `.` is
//! the served directory itself and nothing may escape it.

use std::path::{Component, Path};

/// Normalizes a path relative to the served directory and rejects anything
/// that could escape it, such as absolute paths or parent directory segments.
pub fn normalize(path: &str) -> Option<String> {
    if path.is_empty() || path.contains('\0') {
        return None;
    }
    let unix_path = path.replace('\\', "/");
    if unix_path.starts_with('/') {
        return None;
    }
    let mut segments = Vec::new();
    for segment in unix_path.split('/') {
        match segment {
            "" | "." => continue,
            ".." => return None,
            _ => segments.push(segment),
        }
    }
    if segments.is_empty() {
        Some(".".to_string())
    } else {
        Some(segments.join("/"))
    }
}

/// Combines a directory path and a file or folder name.
pub fn combine(directory: &str, name: &str) -> String {
    if directory == "." {
        name.to_string()
    } else {
        format!("{directory}/{name}")
    }
}

pub fn basename(path: &str) -> &str {
    path.rsplit('/').next().unwrap_or(path)
}

pub fn dirname(path: &str) -> &str {
    match path.rfind('/') {
        Some(index) => &path[..index],
        None => ".",
    }
}

/// Joins relative paths lexically, dropping `.` segments and resolving `..`
/// (`@std/path` `join`). Returns `.` for an empty result.
pub fn join(base: &str, path: &str) -> String {
    let mut segments: Vec<&str> = Vec::new();
    for segment in base.split('/').chain(path.split('/')) {
        match segment {
            "" | "." => {}
            ".." => {
                if segments.last().is_some_and(|last| *last != "..") {
                    segments.pop();
                } else {
                    segments.push("..");
                }
            }
            _ => segments.push(segment),
        }
    }
    if segments.is_empty() {
        ".".to_string()
    } else {
        segments.join("/")
    }
}

fn normal_components(path: &Path) -> Vec<String> {
    let mut components: Vec<String> = Vec::new();
    for component in path.components() {
        match component {
            Component::Normal(name) => components.push(name.to_string_lossy().into_owned()),
            Component::ParentDir => {
                components.pop();
            }
            _ => {}
        }
    }
    components
}

/// The path from one absolute path to another (`@std/path` `relative`), `""`
/// when both are the same.
pub fn relative(from: &Path, to: &Path) -> String {
    let from = normal_components(from);
    let to = normal_components(to);
    let common = from
        .iter()
        .zip(&to)
        .take_while(|(first, second)| first == second)
        .count();
    let mut segments: Vec<&str> = vec![".."; from.len() - common];
    segments.extend(to[common..].iter().map(String::as_str));
    segments.join("/")
}

/// Whether a relative path leaves its base directory.
pub fn is_outside(relative_path: &str) -> bool {
    relative_path == ".." || relative_path.starts_with("../")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn normalizes_paths() {
        assert_eq!(normalize("a/./b//c").as_deref(), Some("a/b/c"));
        assert_eq!(normalize("./").as_deref(), Some("."));
        assert_eq!(normalize("a\\b").as_deref(), Some("a/b"));
        assert_eq!(normalize("/etc/passwd"), None);
        assert_eq!(normalize("a/../b"), None);
        assert_eq!(normalize(""), None);
        assert_eq!(normalize("a\0b"), None);
    }

    #[test]
    fn joins_and_splits_paths() {
        assert_eq!(combine(".", "a"), "a");
        assert_eq!(combine("a", "b"), "a/b");
        assert_eq!(basename("a/b.txt"), "b.txt");
        assert_eq!(dirname("a/b.txt"), "a");
        assert_eq!(dirname("b.txt"), ".");
        assert_eq!(join(".", "a/./b"), "a/b");
        assert_eq!(join("a", "../b"), "b");
        assert_eq!(join(".", "."), ".");
    }

    #[test]
    fn computes_relative_paths() {
        assert_eq!(
            relative(Path::new("/repo"), Path::new("/repo/src/a")),
            "src/a"
        );
        assert_eq!(
            relative(Path::new("/repo/src"), Path::new("/repo/docs")),
            "../docs"
        );
        assert_eq!(relative(Path::new("/repo"), Path::new("/repo")), "");
        assert!(is_outside("../docs"));
        assert!(!is_outside("..docs"));
    }
}
