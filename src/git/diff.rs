use super::command::{has_commits, is_valid_revision, literal_pathspec, repo_root, run_git};
use crate::paths;
use crate::workspace;
use std::path::Path;

const DIFF_BASE_ARGS: [&str; 3] = ["--no-color", "--no-ext-diff", "-M"];

/// Working tree diffs run in the served directory so that they cover the
/// same files as the status page and report paths the explorer can open.
fn working_tree_diff_args() -> Vec<&'static str> {
    let mut args = vec!["diff"];
    args.extend(DIFF_BASE_ARGS);
    args.push("--relative");
    args
}

/// The diff of a single file. `mode` "staged" compares the index with HEAD,
/// "unstaged" the working tree with the index, anything else the working tree
/// with HEAD.
pub fn file_diff(working_dir: &Path, entry_path: &str, mode: Option<&str>) -> Option<String> {
    let repo_root = repo_root(working_dir)?;
    let absolute_path = workspace::resolve_in(working_dir, entry_path);
    if paths::is_outside(&paths::relative(&repo_root, &absolute_path)) {
        return None;
    }

    let pathspec = literal_pathspec(entry_path);
    let mut args = working_tree_diff_args();
    if mode != Some("unstaged") {
        if mode == Some("staged") {
            args.push("--cached");
        }
        if has_commits(&repo_root) {
            args.push("HEAD");
        }
    }
    args.extend(["--", &pathspec]);
    run_git(&args, working_dir)
}

/// All uncommitted changes, or only the staged ones.
pub fn working_tree_diff(working_dir: &Path, staged_only: bool) -> Option<String> {
    let repo_root = repo_root(working_dir)?;
    let mut args = working_tree_diff_args();
    if staged_only {
        args.push("--cached");
    }
    if has_commits(&repo_root) {
        args.push("HEAD");
    }
    run_git(&args, working_dir)
}

/// The diff between two revisions.
pub fn revision_diff(working_dir: &Path, from_revision: &str, to_revision: &str) -> Option<String> {
    let repo_root = repo_root(working_dir)?;
    if !is_valid_revision(from_revision) || !is_valid_revision(to_revision) {
        return None;
    }
    let mut args = vec!["diff"];
    args.extend(DIFF_BASE_ARGS);
    args.extend([from_revision, to_revision]);
    run_git(&args, &repo_root)
}

/// The diff introduced by a single commit.
pub fn commit_diff(working_dir: &Path, revision: &str) -> Option<String> {
    let repo_root = repo_root(working_dir)?;
    if !is_valid_revision(revision) {
        return None;
    }
    // Merge commits are shown against their first parent, which older git
    // versions cannot express, so the plain form remains as a fallback.
    let mut first_parent_args = vec!["show"];
    first_parent_args.extend(DIFF_BASE_ARGS);
    first_parent_args.extend(["--format=", "--diff-merges=first-parent", revision]);
    run_git(&first_parent_args, &repo_root).or_else(|| {
        let mut args = vec!["show"];
        args.extend(DIFF_BASE_ARGS);
        args.extend(["--format=", revision]);
        run_git(&args, &repo_root)
    })
}
