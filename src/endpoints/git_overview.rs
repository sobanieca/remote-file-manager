use crate::file_kinds;
use crate::git::status::{self, StatusRecord};
use crate::git::{log, worktree};
use crate::http::{Request, Response};
use crate::json::{Object, Value};
use crate::object;
use crate::paths;
use crate::search::file_index::locale_compare;
use crate::workspace;
use std::path::Path;

const STATUS_ORDER: [&str; 4] = ["added", "modified", "renamed", "deleted"];

fn describe_change(record: &StatusRecord, repo_root: &Path, working_dir: &Path) -> Object {
    let served_path = status::to_served_path(repo_root, working_dir, &record.path);
    // Untracked files have no committed version to compare against, and
    // binary files have no textual diff to render.
    let can_diff =
        served_path.is_some() && !record.is_untracked && !file_kinds::is_binary(&record.path);
    let original_display_path = record.original_path.as_ref().map(|original| {
        status::to_served_path(repo_root, working_dir, original).unwrap_or_else(|| original.clone())
    });
    let status_code = match record.status_code.trim() {
        "" => record.status[..1].to_uppercase(),
        code => code.to_string(),
    };
    object! {
        "path" => record.path.clone(),
        "servedPath" => served_path.clone(),
        "displayPath" => served_path.clone().unwrap_or_else(|| record.path.clone()),
        "originalDisplayPath" => original_display_path,
        "status" => record.status,
        "statusCode" => status_code,
        "canDiff" => can_diff,
        "canOpen" => served_path.is_some() && record.status != "deleted",
    }
}

fn describe_changes(
    mut records: Vec<StatusRecord>,
    repo_root: &Path,
    working_dir: &Path,
) -> Vec<Value> {
    let order = |status: &str| STATUS_ORDER.iter().position(|known| *known == status);
    records.sort_by(|first, second| {
        order(first.status)
            .cmp(&order(second.status))
            .then_with(|| locale_compare(&first.path, &second.path))
    });
    records
        .iter()
        .map(|record| describe_change(record, repo_root, working_dir).into())
        .collect()
}

pub fn handle(_request: &Request) -> Response {
    let working_dir = workspace::working_dir();
    let Some(branch_info) = status::branch_info(&working_dir) else {
        return Response::json(200, object! { "ok" => true, "repository" => Value::Null });
    };
    let repo_root = branch_info.repo_root.clone();
    let overview = status::status_overview(&working_dir);
    let recent_commits: Vec<Value> = log::commits(&working_dir, 5, 0, None)
        .map(|page| {
            page.commits
                .iter()
                .map(|commit| commit.to_object().into())
                .collect()
        })
        .unwrap_or_default();
    let (change_count, staged, unstaged, untracked) = match overview {
        Some(overview) => (
            overview.change_count,
            overview.staged,
            overview.unstaged,
            overview.untracked,
        ),
        None => (0, Vec::new(), Vec::new(), Vec::new()),
    };

    Response::json(
        200,
        object! {
            "ok" => true,
            "repository" => branch_info.to_object(),
            "scopePath" => paths::relative(&repo_root, &working_dir),
            "changeCount" => change_count,
            "staged" => describe_changes(staged, &repo_root, &working_dir),
            "unstaged" => describe_changes(unstaged, &repo_root, &working_dir),
            "untracked" => describe_changes(untracked, &repo_root, &working_dir),
            "recentCommits" => recent_commits,
            "worktrees" => worktree::worktree_objects(&working_dir),
        },
    )
}
