//! An in-memory index of every entry below the served directory. A stale
//! index keeps answering queries while a fresh one is built in the
//! background, so typing never blocks on a directory walk.

use super::fuzzy_match::{Candidate, match_query, parse_query};
use crate::file_kinds;
use crate::json::{Object, Value};
use crate::object;
use crate::paths;
use crate::workspace;
use std::cmp::Ordering;
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex, OnceLock};
use std::time::{Duration, Instant};

const MAX_ENTRIES: usize = 250_000;
const INDEX_TTL: Duration = Duration::from_secs(10);
const SKIPPED_DIRECTORY_NAMES: &[&str] = &[".git"];

struct IndexEntry {
    path: String,
    name: String,
    is_directory: bool,
    is_symlink: bool,
    candidate: Candidate,
}

struct FileIndex {
    entries: Vec<IndexEntry>,
    truncated: bool,
    built_at: Instant,
}

#[derive(Default)]
struct Indexes {
    by_root: HashMap<PathBuf, Arc<FileIndex>>,
    rebuilding: Vec<PathBuf>,
    generation: u64,
}

fn indexes() -> &'static Mutex<Indexes> {
    static INDEXES: OnceLock<Mutex<Indexes>> = OnceLock::new();
    INDEXES.get_or_init(|| Mutex::new(Indexes::default()))
}

fn walk_directory(root_dir: &Path) -> FileIndex {
    let mut entries = Vec::new();
    let mut pending_directories = vec![".".to_string()];
    let mut truncated = false;

    while let Some(directory) = pending_directories.pop() {
        let Ok(read_dir) = std::fs::read_dir(workspace::resolve_in(root_dir, &directory)) else {
            continue;
        };
        for dir_entry in read_dir.flatten() {
            let Ok(file_type) = dir_entry.file_type() else {
                continue;
            };
            let name = dir_entry.file_name().to_string_lossy().into_owned();
            if file_type.is_dir() && SKIPPED_DIRECTORY_NAMES.contains(&name.as_str()) {
                continue;
            }
            let path = paths::combine(&directory, &name);
            // Symbolic links to directories are listed but not descended
            // into, which keeps link cycles from looping forever.
            if file_type.is_dir() {
                pending_directories.push(path.clone());
            }
            entries.push(IndexEntry {
                candidate: Candidate::new(&path),
                path,
                name,
                is_directory: file_type.is_dir(),
                is_symlink: file_type.is_symlink(),
            });
            if entries.len() >= MAX_ENTRIES {
                truncated = true;
                break;
            }
        }
        if truncated {
            break;
        }
    }

    FileIndex {
        entries,
        truncated,
        built_at: Instant::now(),
    }
}

fn rebuild_in_background(root_dir: PathBuf, generation: u64) {
    std::thread::spawn(move || {
        let fresh = Arc::new(walk_directory(&root_dir));
        if let Ok(mut indexes) = indexes().lock() {
            indexes.rebuilding.retain(|root| *root != root_dir);
            if indexes.generation == generation {
                indexes.by_root.insert(root_dir, fresh);
            }
        }
    });
}

/// The index of a directory, built on first use.
fn file_index(root_dir: &Path) -> Arc<FileIndex> {
    let generation = {
        let Ok(mut indexes) = indexes().lock() else {
            return Arc::new(walk_directory(root_dir));
        };
        if let Some(cached) = indexes.by_root.get(root_dir).cloned() {
            if cached.built_at.elapsed() > INDEX_TTL
                && !indexes.rebuilding.iter().any(|root| root == root_dir)
            {
                indexes.rebuilding.push(root_dir.to_path_buf());
                rebuild_in_background(root_dir.to_path_buf(), indexes.generation);
            }
            return cached;
        }
        indexes.generation
    };
    let fresh = Arc::new(walk_directory(root_dir));
    if let Ok(mut indexes) = indexes().lock()
        && indexes.generation == generation
    {
        indexes
            .by_root
            .insert(root_dir.to_path_buf(), Arc::clone(&fresh));
    }
    fresh
}

/// Drops every cached index, used after files were created, moved or removed.
pub fn invalidate() {
    if let Ok(mut indexes) = indexes().lock() {
        indexes.by_root.clear();
        indexes.generation += 1;
    }
}

/// Orders like `String.prototype.localeCompare`: case-insensitive first.
pub fn locale_compare(first: &str, second: &str) -> Ordering {
    first
        .to_lowercase()
        .cmp(&second.to_lowercase())
        .then_with(|| second.cmp(first))
}

fn round_score(score: f64) -> f64 {
    if score.is_finite() {
        (score * 1000.0).round() / 1000.0
    } else {
        score
    }
}

pub struct SearchResult {
    pub indexed_count: usize,
    pub truncated: bool,
    pub total: usize,
    pub results: Vec<Value>,
}

/// The entries below a directory that fuzzy match a query, best first.
pub fn search(root_dir: &Path, query: &str, limit: usize) -> SearchResult {
    let index = file_index(root_dir);
    let terms = parse_query(query);
    let mut result = SearchResult {
        indexed_count: index.entries.len(),
        truncated: index.truncated,
        total: 0,
        results: Vec::new(),
    };
    if terms.is_empty() {
        return result;
    }

    let mut matches: Vec<(&IndexEntry, f64, Vec<usize>)> = index
        .entries
        .iter()
        .filter_map(|entry| {
            match_query(&terms, &entry.candidate)
                .map(|matched| (entry, matched.score, matched.positions))
        })
        .collect();
    matches.sort_by(|(first, first_score, _), (second, second_score, _)| {
        second_score
            .partial_cmp(first_score)
            .unwrap_or(Ordering::Equal)
            .then_with(|| first.path.len().cmp(&second.path.len()))
            .then_with(|| locale_compare(&first.path, &second.path))
    });

    result.total = matches.len();
    result.results = matches
        .into_iter()
        .take(limit)
        .map(|(entry, score, positions)| {
            let described: Object = object! {
                "path" => entry.path.clone(),
                "name" => entry.name.clone(),
                "isDirectory" => entry.is_directory,
                "isSymlink" => entry.is_symlink,
                "isMarkdown" => !entry.is_directory && file_kinds::is_markdown(&entry.name),
                "kind" => if entry.is_directory { "folder" } else { file_kinds::kind(&entry.name) },
                "score" => round_score(score),
                "positions" => positions,
            };
            described.into()
        })
        .collect();
    result
}
