use super::command::{repo_root, run_git};
use crate::json::Object;
use crate::object;
use crate::paths;
use crate::workspace;
use std::collections::{BTreeSet, HashMap, HashSet};
use std::path::{Path, PathBuf};

#[derive(Clone)]
pub struct StatusRecord {
    pub status_code: String,
    pub path: String,
    pub original_path: Option<String>,
    pub status: &'static str,
    pub is_staged: bool,
    pub is_unstaged: bool,
    pub is_untracked: bool,
}

fn resolve_status(status_code: &str) -> &'static str {
    if status_code == "??" {
        return "added";
    }
    let mut codes = status_code.chars();
    let index_status = codes.next().unwrap_or(' ');
    let worktree_status = codes.next().unwrap_or(' ');
    if index_status == 'A' || worktree_status == 'A' {
        "added"
    } else if index_status == 'D' || worktree_status == 'D' {
        "deleted"
    } else if index_status == 'R' || index_status == 'C' {
        "renamed"
    } else {
        "modified"
    }
}

fn parse_porcelain(output: &str) -> Vec<StatusRecord> {
    let mut records = Vec::new();
    let mut tokens = output.split('\0');
    while let Some(token) = tokens.next() {
        if token.is_empty() {
            continue;
        }
        let status_code: String = token.chars().take(2).collect();
        let path = token.get(3..).unwrap_or_default().to_string();
        let index_status = status_code.chars().next().unwrap_or(' ');
        let worktree_status = status_code.chars().nth(1).unwrap_or(' ');
        let original_path = if index_status == 'R' || index_status == 'C' {
            tokens
                .next()
                .filter(|original| !original.is_empty())
                .map(str::to_string)
        } else {
            None
        };
        records.push(StatusRecord {
            status: resolve_status(&status_code),
            is_staged: index_status != ' ' && index_status != '?',
            is_unstaged: worktree_status != ' ' && worktree_status != '?',
            is_untracked: status_code == "??",
            status_code,
            path,
            original_path,
        });
    }
    records
}

pub struct StatusInfo {
    pub repo_root: PathBuf,
    pub records: Vec<StatusRecord>,
    records_by_path: HashMap<String, usize>,
}

/// The working tree status of the repository containing a directory.
pub fn status_info(working_dir: &Path) -> Option<StatusInfo> {
    let repo_root = repo_root(working_dir)?;
    // Running git in the served directory with a "." pathspec keeps changes
    // from unrelated parts of the repository out of the report. The porcelain
    // format always reports paths relative to the repository root.
    let output = run_git(
        &[
            "status",
            "--porcelain",
            "-z",
            "--untracked-files=all",
            "--",
            ".",
        ],
        working_dir,
    )?;
    let records = parse_porcelain(&output);
    let records_by_path = records
        .iter()
        .enumerate()
        .map(|(index, record)| (record.path.clone(), index))
        .collect();
    Some(StatusInfo {
        repo_root,
        records,
        records_by_path,
    })
}

fn to_repo_relative_path(info: &StatusInfo, working_dir: &Path, entry_path: &str) -> String {
    paths::relative(
        &info.repo_root,
        &workspace::resolve_in(working_dir, entry_path),
    )
}

pub struct EntryChange {
    pub status: &'static str,
    pub has_diff: bool,
}

fn summarize_statuses(statuses: &BTreeSet<&'static str>) -> Option<&'static str> {
    match statuses.len() {
        0 => None,
        1 => statuses
            .first()
            .map(|only| if *only == "renamed" { "modified" } else { only }),
        _ => Some("modified"),
    }
}

/// The git change of a directory entry. A directory reports the combined
/// state of everything below it.
pub fn entry_change(
    info: Option<&StatusInfo>,
    working_dir: &Path,
    entry_path: &str,
    is_directory: bool,
) -> Option<EntryChange> {
    let info = info?;
    let git_relative_path = to_repo_relative_path(info, working_dir, entry_path);

    if !is_directory {
        let record = &info.records[*info.records_by_path.get(&git_relative_path)?];
        return Some(EntryChange {
            status: record.status,
            has_diff: !record.is_untracked,
        });
    }

    let prefix = if git_relative_path.is_empty() {
        String::new()
    } else {
        format!("{git_relative_path}/")
    };
    let mut statuses = BTreeSet::new();
    let mut has_diff = false;
    for record in info
        .records
        .iter()
        .filter(|record| record.path.starts_with(&prefix))
    {
        statuses.insert(record.status);
        has_diff = has_diff || !record.is_untracked;
    }
    summarize_statuses(&statuses).map(|status| EntryChange { status, has_diff })
}

/// Entries git reports as deleted directly inside a directory, as
/// `(name, is_directory)`. A directory whose files were all deleted no longer
/// exists on disk, so it is reported as a deleted directory.
pub fn deleted_entries(
    info: Option<&StatusInfo>,
    working_dir: &Path,
    directory_path: &str,
    existing_names: &HashSet<String>,
) -> Vec<(String, bool)> {
    let Some(info) = info else {
        return Vec::new();
    };
    let relative_dir = to_repo_relative_path(info, working_dir, directory_path);
    let prefix = if relative_dir.is_empty() {
        String::new()
    } else {
        format!("{relative_dir}/")
    };
    let mut deleted: Vec<(String, bool)> = Vec::new();
    for record in &info.records {
        if record.status != "deleted" {
            continue;
        }
        let Some(remainder) = record.path.strip_prefix(&prefix) else {
            continue;
        };
        let (name, is_directory) = match remainder.split_once('/') {
            Some((name, _)) => (name, true),
            None => (remainder, false),
        };
        if name.is_empty()
            || existing_names.contains(name)
            || deleted.iter().any(|(known, _)| known == name)
        {
            continue;
        }
        deleted.push((name.to_string(), is_directory));
    }
    deleted
}

/// Converts a repository relative path into one relative to the served
/// directory, `None` when it is outside of it.
pub fn to_served_path(repo_root: &Path, working_dir: &Path, git_path: &str) -> Option<String> {
    let absolute_path = repo_root.join(git_path);
    let served_path = paths::relative(working_dir, &absolute_path);
    if paths::is_outside(&served_path) {
        return None;
    }
    Some(if served_path.is_empty() {
        ".".to_string()
    } else {
        served_path
    })
}

pub struct BranchInfo {
    pub repo_root: PathBuf,
    pub branch: String,
    pub is_detached: bool,
    pub head: Option<String>,
    pub upstream: Option<String>,
    pub ahead: u64,
    pub behind: u64,
}

impl BranchInfo {
    pub fn to_object(&self) -> Object {
        object! {
            "repoRoot" => self.repo_root.to_string_lossy().into_owned(),
            "branch" => self.branch.clone(),
            "isDetached" => self.is_detached,
            "head" => self.head.clone(),
            "upstream" => self.upstream.clone(),
            "ahead" => self.ahead,
            "behind" => self.behind,
            "hasCommits" => self.head.is_some(),
        }
    }
}

fn trimmed(output: Option<String>) -> Option<String> {
    output
        .map(|text| text.trim().to_string())
        .filter(|text| !text.is_empty())
}

/// The current branch, head commit and upstream tracking state.
pub fn branch_info(working_dir: &Path) -> Option<BranchInfo> {
    let repo_root = repo_root(working_dir)?;

    // The symbolic ref resolves on a branch without commits too, where
    // rev-parse would fail and misreport the repository as detached.
    let branch = trimmed(run_git(
        &["symbolic-ref", "--short", "-q", "HEAD"],
        &repo_root,
    ));
    let head = trimmed(run_git(
        &["rev-parse", "--short", "--verify", "-q", "HEAD"],
        &repo_root,
    ));
    let upstream = trimmed(run_git(
        &[
            "rev-parse",
            "--abbrev-ref",
            "--symbolic-full-name",
            "@{upstream}",
        ],
        &repo_root,
    ));

    let (mut ahead, mut behind) = (0, 0);
    if let (Some(upstream), Some(_)) = (&upstream, &head)
        && let Some(counts) = run_git(
            &[
                "rev-list",
                "--left-right",
                "--count",
                &format!("{upstream}...HEAD"),
            ],
            &repo_root,
        )
    {
        let mut counts = counts.split_whitespace();
        behind = counts.next().and_then(|n| n.parse().ok()).unwrap_or(0);
        ahead = counts.next().and_then(|n| n.parse().ok()).unwrap_or(0);
    }

    let is_detached = branch.is_none();
    let branch = match (branch, &head) {
        (Some(branch), _) => branch,
        (None, Some(head)) => format!("detached @ {head}"),
        (None, None) => "detached".to_string(),
    };
    Some(BranchInfo {
        repo_root,
        branch,
        is_detached,
        head,
        upstream,
        ahead,
        behind,
    })
}

pub struct StatusOverview {
    pub staged: Vec<StatusRecord>,
    pub unstaged: Vec<StatusRecord>,
    pub untracked: Vec<StatusRecord>,
    pub change_count: usize,
}

/// Working tree changes grouped into staged, unstaged and untracked.
pub fn status_overview(working_dir: &Path) -> Option<StatusOverview> {
    let info = status_info(working_dir)?;
    let mut overview = StatusOverview {
        staged: Vec::new(),
        unstaged: Vec::new(),
        untracked: Vec::new(),
        change_count: info.records.len(),
    };
    for record in info.records {
        if record.is_untracked {
            overview.untracked.push(record);
            continue;
        }
        if record.is_staged {
            overview.staged.push(record.clone());
        }
        if record.is_unstaged {
            overview.unstaged.push(record);
        }
    }
    Some(overview)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_porcelain_output() {
        let records = parse_porcelain(
            " M src/a.rs\0R  new.rs\0old.rs\0?? notes.txt\0D  gone/x.rs\0AM b.rs\0",
        );
        type Summary<'a> = (&'a str, &'a str, Option<&'a str>, &'a str, bool, bool, bool);
        let summary: Vec<Summary> = records
            .iter()
            .map(|record| {
                (
                    record.status_code.as_str(),
                    record.path.as_str(),
                    record.original_path.as_deref(),
                    record.status,
                    record.is_staged,
                    record.is_unstaged,
                    record.is_untracked,
                )
            })
            .collect();
        assert_eq!(
            summary,
            vec![
                (" M", "src/a.rs", None, "modified", false, true, false),
                (
                    "R ",
                    "new.rs",
                    Some("old.rs"),
                    "renamed",
                    true,
                    false,
                    false
                ),
                ("??", "notes.txt", None, "added", false, false, true),
                ("D ", "gone/x.rs", None, "deleted", true, false, false),
                ("AM", "b.rs", None, "added", true, true, false),
            ]
        );
    }

    fn info(records: &str) -> StatusInfo {
        let records = parse_porcelain(records);
        let records_by_path = records
            .iter()
            .enumerate()
            .map(|(index, record)| (record.path.clone(), index))
            .collect();
        StatusInfo {
            repo_root: PathBuf::from("/repo"),
            records,
            records_by_path,
        }
    }

    #[test]
    fn resolves_entry_changes() {
        let info = info(" M src/a.rs\0?? src/new/b.rs\0D  src/gone/c.rs\0D  src/d.rs\0");
        let working_dir = Path::new("/repo/src");
        let file = entry_change(Some(&info), working_dir, "a.rs", false).unwrap();
        assert_eq!((file.status, file.has_diff), ("modified", true));
        let untracked = entry_change(Some(&info), working_dir, "new", true).unwrap();
        assert_eq!((untracked.status, untracked.has_diff), ("added", false));
        let root = entry_change(Some(&info), Path::new("/repo"), ".", true).unwrap();
        assert_eq!(root.status, "modified");
        assert!(entry_change(Some(&info), working_dir, "other.rs", false).is_none());

        let existing = HashSet::from(["a.rs".to_string()]);
        assert_eq!(
            deleted_entries(Some(&info), working_dir, ".", &existing),
            vec![("gone".to_string(), true), ("d.rs".to_string(), false)]
        );
    }

    #[test]
    fn maps_repository_paths_to_served_paths() {
        let root = Path::new("/repo");
        assert_eq!(
            to_served_path(root, Path::new("/repo/src"), "src/a.rs").as_deref(),
            Some("a.rs")
        );
        assert_eq!(
            to_served_path(root, Path::new("/repo/src"), "docs/a.md"),
            None
        );
        assert_eq!(
            to_served_path(root, Path::new("/repo/src"), "src").as_deref(),
            Some(".")
        );
    }
}
