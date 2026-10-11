use super::command::{repo_root, run_git};
use crate::json::Object;
use crate::object;
use crate::paths;
use std::path::{Path, PathBuf};

#[derive(Clone, Default)]
pub struct Worktree {
    pub path: String,
    pub head: Option<String>,
    pub branch: Option<String>,
    pub is_detached: bool,
    pub is_bare: bool,
    pub is_locked: bool,
    pub lock_reason: String,
    pub is_prunable: bool,
    pub prune_reason: String,
    pub real_path: String,
    pub is_current: bool,
}

impl Worktree {
    fn short_head(&self) -> Option<String> {
        self.head
            .as_ref()
            .map(|head| head.chars().take(7).collect())
    }

    pub fn label(&self) -> String {
        match (&self.branch, self.short_head()) {
            (Some(branch), _) => branch.clone(),
            (None, Some(short_head)) => format!("detached @ {short_head}"),
            (None, None) => "detached".to_string(),
        }
    }

    pub fn to_object(&self) -> Object {
        object! {
            "path" => self.path.clone(),
            "head" => self.head.clone(),
            "branch" => self.branch.clone(),
            "isDetached" => self.is_detached,
            "isBare" => self.is_bare,
            "isLocked" => self.is_locked,
            "lockReason" => self.lock_reason.clone(),
            "isPrunable" => self.is_prunable,
            "pruneReason" => self.prune_reason.clone(),
            "realPath" => self.real_path.clone(),
            "shortHead" => self.short_head(),
            "label" => self.label(),
            "isCurrent" => self.is_current,
        }
    }
}

fn parse_worktree_list(output: &str) -> Vec<Worktree> {
    let mut worktrees = Vec::new();
    let mut current: Option<Worktree> = None;
    for line in output.split('\n') {
        if line.is_empty() {
            worktrees.extend(current.take());
            continue;
        }
        let (key, value) = line.split_once(' ').unwrap_or((line, ""));
        if key == "worktree" {
            worktrees.extend(current.take());
            current = Some(Worktree {
                path: value.to_string(),
                ..Worktree::default()
            });
            continue;
        }
        let Some(worktree) = current.as_mut() else {
            continue;
        };
        match key {
            "HEAD" => worktree.head = Some(value.to_string()),
            "branch" => {
                worktree.branch = Some(
                    value
                        .strip_prefix("refs/heads/")
                        .unwrap_or(value)
                        .to_string(),
                )
            }
            "detached" => worktree.is_detached = true,
            "bare" => worktree.is_bare = true,
            "locked" => {
                worktree.is_locked = true;
                worktree.lock_reason = value.to_string();
            }
            "prunable" => {
                worktree.is_prunable = true;
                worktree.prune_reason = value.to_string();
            }
            _ => {}
        }
    }
    worktrees.extend(current);
    worktrees
}

fn to_real_path(path: &Path) -> PathBuf {
    std::fs::canonicalize(path).unwrap_or_else(|_| path.to_path_buf())
}

/// Every worktree of the repository containing a directory, bare ones aside.
pub fn list_worktrees(working_dir: &Path) -> Option<Vec<Worktree>> {
    let repo_root = repo_root(working_dir)?;
    let output = run_git(&["worktree", "list", "--porcelain"], &repo_root)?;
    let current_root = to_real_path(&repo_root);
    Some(
        parse_worktree_list(&output)
            .into_iter()
            .filter(|worktree| !worktree.is_bare)
            .map(|mut worktree| {
                let real_path = to_real_path(Path::new(&worktree.path));
                worktree.is_current = real_path == current_root;
                worktree.real_path = real_path.to_string_lossy().into_owned();
                worktree
            })
            .collect(),
    )
}

pub fn worktree_objects(working_dir: &Path) -> Vec<Object> {
    list_worktrees(working_dir)
        .unwrap_or_default()
        .iter()
        .map(Worktree::to_object)
        .collect()
}

pub struct ResolvedWorktree {
    pub directory: PathBuf,
    pub worktree: Worktree,
}

/// The directory to serve after switching to a worktree. The sub directory
/// that is served now is kept when the worktree has it.
pub fn resolve_worktree_directory(
    working_dir: &Path,
    requested_path: &str,
) -> Result<ResolvedWorktree, String> {
    let worktrees =
        list_worktrees(working_dir).ok_or_else(|| "Not inside a git repository".to_string())?;
    let worktree = worktrees
        .into_iter()
        .find(|candidate| candidate.path == requested_path)
        .ok_or_else(|| "Unknown worktree".to_string())?;
    let worktree_path = PathBuf::from(&worktree.path);
    if !worktree_path.is_dir() {
        return Err("Worktree directory is missing".to_string());
    }

    if let Some(repo_root) = repo_root(working_dir) {
        let scope = paths::relative(&repo_root, working_dir);
        if !scope.is_empty() && !paths::is_outside(&scope) {
            let scoped_directory = worktree_path.join(&scope);
            if scoped_directory.is_dir() {
                return Ok(ResolvedWorktree {
                    directory: scoped_directory,
                    worktree,
                });
            }
        }
    }
    Ok(ResolvedWorktree {
        directory: worktree_path,
        worktree,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_worktree_list() {
        let output = "worktree /repo\nHEAD 0123456789abcdef\nbranch refs/heads/main\n\n\
                      worktree /repo-wt\nHEAD fedcba9876543210\ndetached\nlocked moving\n\n\
                      worktree /bare\nbare\n\n";
        let worktrees = parse_worktree_list(output);
        assert_eq!(worktrees.len(), 3);
        assert_eq!(worktrees[0].branch.as_deref(), Some("main"));
        assert_eq!(worktrees[0].label(), "main");
        assert!(worktrees[1].is_detached);
        assert!(worktrees[1].is_locked);
        assert_eq!(worktrees[1].lock_reason, "moving");
        assert_eq!(worktrees[1].label(), "detached @ fedcba9");
        assert!(worktrees[2].is_bare);
    }
}
