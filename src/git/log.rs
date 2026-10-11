use super::command::{is_valid_revision, literal_pathspec, repo_root, run_git};
use crate::date;
use crate::json::Object;
use crate::object;
use std::collections::HashMap;
use std::path::Path;

const FIELD_SEPARATOR: char = '\x00';
const RECORD_SEPARATOR: char = '\x1e';

/// Separators are requested as git escapes rather than literal bytes, because
/// a process argument cannot carry a NUL. Git expands them into the bytes
/// above.
const COMMIT_FORMAT: &str = "%H%x00%h%x00%an%x00%aE%x00%at%x00%s%x00%D%x00%P%x1e";

pub struct Commit {
    pub hash: String,
    pub short_hash: String,
    pub author: String,
    pub email: String,
    pub timestamp: i64,
    pub subject: String,
    pub refs: Vec<String>,
    pub parents: Vec<String>,
}

impl Commit {
    pub fn to_object(&self) -> Object {
        object! {
            "hash" => self.hash.clone(),
            "shortHash" => self.short_hash.clone(),
            "author" => self.author.clone(),
            "email" => self.email.clone(),
            "date" => date::iso_string(self.timestamp * 1000),
            "subject" => self.subject.clone(),
            "refs" => self.refs.clone(),
            "parents" => self.parents.clone(),
        }
    }
}

fn parse_commits(output: &str) -> Vec<Commit> {
    output
        .split(RECORD_SEPARATOR)
        .map(|record| record.strip_prefix('\n').unwrap_or(record))
        .filter(|record| !record.trim().is_empty())
        .map(|record| {
            let mut fields = record.split(FIELD_SEPARATOR);
            let mut next = || fields.next().unwrap_or_default().to_string();
            let (hash, short_hash, author, email, timestamp, subject, refs, parents) = (
                next(),
                next(),
                next(),
                next(),
                next(),
                next(),
                next(),
                next(),
            );
            Commit {
                hash,
                short_hash,
                author,
                email,
                timestamp: timestamp.trim().parse().unwrap_or(0),
                subject,
                refs: refs
                    .split(", ")
                    .filter(|name| !name.is_empty())
                    .map(str::to_string)
                    .collect(),
                parents: parents.split_whitespace().map(str::to_string).collect(),
            }
        })
        .collect()
}

pub struct CommitPage {
    pub commits: Vec<Commit>,
    pub has_more: bool,
}

/// A page of the commit history, optionally limited to a repository path.
pub fn commits(
    working_dir: &Path,
    limit: usize,
    skip: usize,
    path: Option<&str>,
) -> Option<CommitPage> {
    let repo_root = repo_root(working_dir)?;
    let limit = limit.clamp(1, 500);
    let max_count = format!("--max-count={}", limit + 1);
    let skip = format!("--skip={skip}");
    let pretty = format!("--pretty=format:{COMMIT_FORMAT}");
    let mut args = vec!["log", &max_count, &skip, &pretty];
    let pathspec;
    if let Some(path) = path.filter(|path| *path != ".") {
        pathspec = literal_pathspec(path);
        args.extend(["--", &pathspec]);
    }

    let Some(output) = run_git(&args, &repo_root) else {
        return Some(CommitPage {
            commits: Vec::new(),
            has_more: false,
        });
    };
    let mut commits = parse_commits(&output);
    let has_more = commits.len() > limit;
    commits.truncate(limit);
    Some(CommitPage { commits, has_more })
}

/// The commit a revision resolves to.
pub fn commit(working_dir: &Path, revision: &str) -> Option<Commit> {
    let repo_root = repo_root(working_dir)?;
    if !is_valid_revision(revision) {
        return None;
    }
    let output = run_git(
        &[
            "log",
            "--max-count=1",
            &format!("--pretty=format:{COMMIT_FORMAT}"),
            revision,
        ],
        &repo_root,
    )?;
    parse_commits(&output).into_iter().next()
}

pub struct ChangedFile {
    pub status_code: String,
    pub original_path: Option<String>,
    pub path: String,
    pub added: Option<u64>,
    pub deleted: Option<u64>,
}

impl ChangedFile {
    pub fn to_object(&self) -> Object {
        let status = match self.status_code.chars().next() {
            Some('A') => "added",
            Some('D') => "deleted",
            Some('R' | 'C') => "renamed",
            _ => "modified",
        };
        object! {
            "statusCode" => self.status_code.clone(),
            "originalPath" => self.original_path.clone(),
            "path" => self.path.clone(),
            "status" => status,
            "added" => self.added,
            "deleted" => self.deleted,
        }
    }
}

fn parse_name_status(output: &str) -> Vec<(String, Option<String>, String)> {
    let mut changes = Vec::new();
    let mut tokens = output.split('\0').filter(|token| !token.is_empty());
    while let Some(status_code) = tokens.next() {
        let mut next = || tokens.next().unwrap_or_default().to_string();
        if status_code.starts_with('R') || status_code.starts_with('C') {
            let original_path = next();
            changes.push((status_code.to_string(), Some(original_path), next()));
        } else {
            changes.push((status_code.to_string(), None, next()));
        }
    }
    changes
}

/// Records are "added\tdeleted\tpath", or "added\tdeleted\t" for renames
/// where the original and new path follow as two separate NUL terminated
/// tokens.
fn parse_numstat(output: &str) -> HashMap<String, (Option<u64>, Option<u64>)> {
    let mut stats = HashMap::new();
    let mut tokens = output.split('\0').filter(|token| !token.is_empty());
    while let Some(token) = tokens.next() {
        let mut fields = token.splitn(3, '\t');
        let added = fields.next().unwrap_or_default();
        let deleted = fields.next().unwrap_or_default();
        let path = fields.next().unwrap_or_default();
        let target_path = if path.is_empty() {
            tokens.next();
            tokens.next().unwrap_or_default()
        } else {
            path
        };
        stats.insert(
            target_path.to_string(),
            (added.parse().ok(), deleted.parse().ok()),
        );
    }
    stats
}

/// The files that differ between two revisions.
pub fn changed_files(
    working_dir: &Path,
    from_revision: &str,
    to_revision: &str,
) -> Option<Vec<ChangedFile>> {
    let repo_root = repo_root(working_dir)?;
    if !is_valid_revision(from_revision) || !is_valid_revision(to_revision) {
        return None;
    }
    let name_status = run_git(
        &[
            "diff",
            "--name-status",
            "-z",
            "-M",
            from_revision,
            to_revision,
        ],
        &repo_root,
    )?;
    let numstat = run_git(
        &["diff", "--numstat", "-z", "-M", from_revision, to_revision],
        &repo_root,
    )
    .unwrap_or_default();

    let stats = parse_numstat(&numstat);
    Some(
        parse_name_status(&name_status)
            .into_iter()
            .map(|(status_code, original_path, path)| {
                let (added, deleted) = stats.get(&path).copied().unwrap_or((None, None));
                ChangedFile {
                    status_code,
                    original_path,
                    path,
                    added,
                    deleted,
                }
            })
            .collect(),
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_commits() {
        let output = "abc\0ab\0Ada\0ada@x.io\x001700000000\0Fix it\0HEAD -> main, tag: v1\0p1 p2\x1e\n\
                      def\0de\0Bob\0bob@x.io\x001600000000\0Init\0\0\x1e";
        let commits = parse_commits(output);
        assert_eq!(commits.len(), 2);
        assert_eq!(commits[0].refs, ["HEAD -> main", "tag: v1"]);
        assert_eq!(commits[0].parents, ["p1", "p2"]);
        assert_eq!(
            crate::json::stringify(&commits[1].to_object().into()),
            r#"{"hash":"def","shortHash":"de","author":"Bob","email":"bob@x.io","date":"2020-09-13T12:26:40.000Z","subject":"Init","refs":[],"parents":[]}"#
        );
    }

    #[test]
    fn parses_name_status_and_numstat() {
        let changes = parse_name_status("M\0a.rs\0R100\0old.rs\0new.rs\0D\0gone.rs\0");
        assert_eq!(
            changes,
            vec![
                ("M".to_string(), None, "a.rs".to_string()),
                (
                    "R100".to_string(),
                    Some("old.rs".to_string()),
                    "new.rs".to_string()
                ),
                ("D".to_string(), None, "gone.rs".to_string()),
            ]
        );
        let stats = parse_numstat("3\t1\ta.rs\0-\t-\timg.png\x000\t0\t\0old.rs\0new.rs\0");
        assert_eq!(stats["a.rs"], (Some(3), Some(1)));
        assert_eq!(stats["img.png"], (None, None));
        assert_eq!(stats["new.rs"], (Some(0), Some(0)));
    }
}
