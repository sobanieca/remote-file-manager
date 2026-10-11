use super::json_error;
use crate::git::diff_parser::{DiffFile, parse_diff};
use crate::git::{diff, log, status};
use crate::http::{Request, Response};
use crate::json::{Object, Value};
use crate::object;
use crate::paths;
use crate::workspace;
use std::path::Path;

struct DiffRequest {
    diff_text: Option<String>,
    /// Commit diffs report repository paths, which are mapped back onto the
    /// served directory.
    is_repository_relative: bool,
    title: String,
    subtitle: Option<&'static str>,
    commit: Option<Object>,
    back: &'static str,
    file_path: Option<String>,
}

fn resolve_diff_request(request: &Request, working_dir: &Path) -> Option<DiffRequest> {
    if let Some(revision) = request.query_value("commit") {
        let commit = log::commit(working_dir, &revision);
        return Some(DiffRequest {
            diff_text: diff::commit_diff(working_dir, &revision),
            is_repository_relative: true,
            title: commit
                .as_ref()
                .map_or_else(|| "Commit".to_string(), |commit| commit.subject.clone()),
            subtitle: None,
            commit: commit.map(|commit| commit.to_object()),
            back: "history",
            file_path: None,
        });
    }
    if request.query("staged").is_some() {
        return Some(DiffRequest {
            diff_text: diff::working_tree_diff(working_dir, true),
            is_repository_relative: false,
            title: "Staged changes".to_string(),
            subtitle: Some("Differences between the index and HEAD"),
            commit: None,
            back: "status",
            file_path: None,
        });
    }
    if request.query("all").is_some() {
        return Some(DiffRequest {
            diff_text: diff::working_tree_diff(working_dir, false),
            is_repository_relative: false,
            title: "Working tree changes".to_string(),
            subtitle: Some("All uncommitted changes"),
            commit: None,
            back: "status",
            file_path: None,
        });
    }

    let file_path = paths::normalize(&request.query("path").unwrap_or_default())?;
    let mode = request.query("mode");
    let mode = mode.as_deref();
    Some(DiffRequest {
        diff_text: diff::file_diff(working_dir, &file_path, mode),
        is_repository_relative: false,
        title: file_path.clone(),
        subtitle: Some(match mode {
            Some("staged") => "Staged changes, index against HEAD",
            Some("unstaged") => "Unstaged changes, working tree against the index",
            _ => "Uncommitted changes",
        }),
        commit: None,
        back: match mode {
            Some("staged" | "unstaged") => "status",
            _ => "files",
        },
        file_path: Some(file_path),
    })
}

/// Parsed diff files with the path the explorer can open, `null` for
/// deleted files and files outside the served directory.
pub fn describe_files(diff_text: &str, repo_root: Option<&Path>, working_dir: &Path) -> Vec<Value> {
    parse_diff(diff_text)
        .iter()
        .map(|file: &DiffFile| {
            let served_path = if file.status == "deleted" {
                None
            } else {
                match repo_root {
                    Some(repo_root) => status::to_served_path(repo_root, working_dir, &file.path),
                    None => Some(file.path.clone()),
                }
            };
            let mut described = file.to_object();
            described.insert("servedPath", served_path);
            described.into()
        })
        .collect()
}

pub fn handle(request: &Request) -> Response {
    let working_dir = workspace::working_dir();
    let Some(branch_info) = status::branch_info(&working_dir) else {
        return Response::json(200, object! { "ok" => true, "repository" => Value::Null });
    };
    let Some(diff_request) = resolve_diff_request(request, &working_dir) else {
        return json_error(400, "Nothing to diff");
    };
    let Some(diff_text) = &diff_request.diff_text else {
        return json_error(404, "Unable to read this diff");
    };
    let repo_root = diff_request
        .is_repository_relative
        .then_some(branch_info.repo_root.as_path());

    Response::json(
        200,
        object! {
            "ok" => true,
            "repository" => branch_info.to_object(),
            "title" => diff_request.title.clone(),
            "subtitle" => diff_request.subtitle,
            "commit" => diff_request.commit.clone(),
            "back" => diff_request.back,
            "filePath" => diff_request.file_path.clone(),
            "files" => describe_files(diff_text, repo_root, &working_dir),
        },
    )
}
