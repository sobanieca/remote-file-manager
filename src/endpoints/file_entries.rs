//! Descriptors of directory entries, including their git state.

use crate::date;
use crate::file_kinds;
use crate::git::status::{self, StatusInfo};
use crate::json::{Object, Value};
use crate::object;
use crate::paths;
use crate::workspace;
use std::cmp::Ordering;
use std::collections::HashSet;
use std::io;
use std::os::unix::fs::PermissionsExt;
use std::path::Path;

pub struct Entry {
    pub name: String,
    pub path: String,
    pub is_directory: bool,
    pub is_symlink: bool,
    pub is_deleted: bool,
    pub size: Option<u64>,
    pub mode: Option<u32>,
    pub modified_at: Option<String>,
    pub is_executable: bool,
    pub is_broken: bool,
    pub git_status: Option<&'static str>,
    pub has_git_diff: bool,
}

impl Entry {
    fn is_file(&self) -> bool {
        !self.is_directory && !self.is_deleted
    }

    pub fn is_text(&self) -> bool {
        self.is_file() && file_kinds::is_text(&self.name)
    }

    pub fn to_object(&self) -> Object {
        let is_file = self.is_file();
        object! {
            "name" => self.name.clone(),
            "path" => self.path.clone(),
            "isDirectory" => self.is_directory,
            "isSymlink" => self.is_symlink,
            "isDeleted" => self.is_deleted,
            "size" => self.size,
            "mode" => self.mode,
            "modifiedAt" => self.modified_at.clone(),
            "isExecutable" => self.is_executable,
            "kind" => if self.is_directory { "folder" } else { file_kinds::kind(&self.name) },
            "isImage" => is_file && file_kinds::is_image(&self.name),
            "isMarkdown" => is_file && file_kinds::is_markdown(&self.name),
            "isText" => self.is_text(),
            "isBroken" => self.is_broken,
            "gitStatus" => self.git_status,
            "hasGitDiff" => self.has_git_diff,
        }
    }
}

fn describe_entry(
    root: &Path,
    directory_path: &str,
    name: &str,
    is_directory: bool,
    is_symlink: bool,
) -> Entry {
    let path = paths::combine(directory_path, name);
    let mut entry = Entry {
        name: name.to_string(),
        is_directory,
        is_symlink,
        is_deleted: false,
        size: None,
        mode: None,
        modified_at: None,
        is_executable: false,
        is_broken: false,
        git_status: None,
        has_git_diff: false,
        path,
    };
    match std::fs::metadata(workspace::resolve_in(root, &entry.path)) {
        Ok(metadata) => {
            let mode = metadata.permissions().mode();
            entry.size = (!metadata.is_dir()).then_some(metadata.len());
            entry.mode = Some(mode);
            entry.modified_at = metadata
                .modified()
                .ok()
                .map(date::iso_string_from_system_time);
            entry.is_executable = !metadata.is_dir() && file_kinds::is_executable_mode(mode);
            if is_symlink && metadata.is_dir() {
                entry.is_directory = true;
            }
        }
        Err(_) => entry.is_broken = true,
    }
    entry
}

fn describe_deleted_entry(directory_path: &str, name: &str, is_directory: bool) -> Entry {
    Entry {
        name: name.to_string(),
        path: paths::combine(directory_path, name),
        is_directory,
        is_symlink: false,
        is_deleted: true,
        size: None,
        mode: None,
        modified_at: None,
        is_executable: false,
        is_broken: false,
        git_status: Some("deleted"),
        has_git_diff: true,
    }
}

fn apply_git_change(entry: &mut Entry, info: Option<&StatusInfo>, working_dir: &Path) {
    if entry.is_deleted {
        return;
    }
    let change = status::entry_change(info, working_dir, &entry.path, entry.is_directory);
    entry.git_status = change.as_ref().map(|change| change.status);
    entry.has_git_diff = change.is_some_and(|change| change.has_diff);
}

/// The descriptor of a single path, including its git status.
pub fn describe_path(path: &str) -> io::Result<Entry> {
    let working_dir = workspace::working_dir();
    let link_metadata = workspace::resolve_in(&working_dir, path).symlink_metadata()?;
    let mut entry = describe_entry(
        &working_dir,
        paths::dirname(path),
        paths::basename(path),
        link_metadata.is_dir(),
        link_metadata.is_symlink(),
    );
    let info = status::status_info(&working_dir);
    apply_git_change(&mut entry, info.as_ref(), &working_dir);
    Ok(entry)
}

fn split_digits(text: &str) -> Vec<(bool, String)> {
    let mut chunks: Vec<(bool, String)> = Vec::new();
    for c in text.chars() {
        let is_digit = c.is_ascii_digit();
        match chunks.last_mut() {
            Some((chunk_is_digit, chunk)) if *chunk_is_digit == is_digit => chunk.push(c),
            _ => chunks.push((is_digit, c.to_string())),
        }
    }
    chunks
}

/// Case-insensitive comparison that orders numbers by value, like
/// `localeCompare` with `{ numeric: true, sensitivity: "base" }`.
pub fn natural_compare(first: &str, second: &str) -> Ordering {
    let first_chunks = split_digits(first);
    let second_chunks = split_digits(second);
    for (first_chunk, second_chunk) in first_chunks.iter().zip(&second_chunks) {
        let ordering = match (first_chunk, second_chunk) {
            ((true, a), (true, b)) => {
                let a = a.trim_start_matches('0');
                let b = b.trim_start_matches('0');
                a.len().cmp(&b.len()).then_with(|| a.cmp(b))
            }
            ((_, a), (_, b)) => a.to_lowercase().cmp(&b.to_lowercase()),
        };
        if ordering != Ordering::Equal {
            return ordering;
        }
    }
    first_chunks.len().cmp(&second_chunks.len())
}

fn compare_entries(first: &Entry, second: &Entry) -> Ordering {
    second
        .is_directory
        .cmp(&first.is_directory)
        .then_with(|| natural_compare(&first.name, &second.name))
}

pub struct Listing {
    pub entries: Vec<Value>,
    pub total_size: u64,
}

/// Every entry of a directory, with deleted entries git still knows about.
pub fn read_directory_entries(directory_path: &str) -> io::Result<Listing> {
    let working_dir = workspace::working_dir();
    let info = status::status_info(&working_dir);
    let mut entries = Vec::new();
    for dir_entry in std::fs::read_dir(workspace::resolve_in(&working_dir, directory_path))? {
        let dir_entry = dir_entry?;
        let file_type = dir_entry.file_type()?;
        entries.push(describe_entry(
            &working_dir,
            directory_path,
            &dir_entry.file_name().to_string_lossy(),
            file_type.is_dir(),
            file_type.is_symlink(),
        ));
    }

    let existing_names: HashSet<String> = entries.iter().map(|entry| entry.name.clone()).collect();
    for (name, is_directory) in
        status::deleted_entries(info.as_ref(), &working_dir, directory_path, &existing_names)
    {
        entries.push(describe_deleted_entry(directory_path, &name, is_directory));
    }
    for entry in &mut entries {
        apply_git_change(entry, info.as_ref(), &working_dir);
    }
    entries.sort_by(compare_entries);

    let total_size = entries.iter().filter_map(|entry| entry.size).sum();
    Ok(Listing {
        entries: entries
            .iter()
            .map(|entry| entry.to_object().into())
            .collect(),
        total_size,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn orders_names_naturally() {
        let mut names = vec!["file10.txt", "File2.txt", "file1.txt", "alpha", "Beta"];
        names.sort_by(|a, b| natural_compare(a, b));
        assert_eq!(
            names,
            ["alpha", "Beta", "file1.txt", "File2.txt", "file10.txt"]
        );
    }
}
