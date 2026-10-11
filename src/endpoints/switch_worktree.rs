use super::{json_error, respond};
use crate::git::worktree::resolve_worktree_directory;
use crate::http::{Request, Response};
use crate::object;
use crate::paths;
use crate::workspace;
use std::io::Write;

/// The explorer reopens the directory the user was looking at, as long as
/// the selected worktree has it too.
fn resolve_explorer_path(requested_path: Option<&str>) -> String {
    match requested_path.and_then(paths::normalize) {
        Some(path) if workspace::resolve(&path).is_dir() => path,
        _ => ".".to_string(),
    }
}

pub fn handle(request: &Request) -> Response {
    respond(switch(request))
}

fn switch(request: &Request) -> Result<Response, String> {
    let body = request.json()?;
    let requested_path = body.get_str("path").unwrap_or_default();
    if requested_path.is_empty() {
        return Ok(json_error(400, "Worktree path is required"));
    }

    let resolved = match resolve_worktree_directory(&workspace::working_dir(), requested_path) {
        Ok(resolved) => resolved,
        Err(message) => return Ok(json_error(400, message)),
    };
    workspace::set_working_dir(resolved.directory.clone());
    let _ = writeln!(
        std::io::stdout(),
        "Switched to worktree: {}",
        resolved.directory.display()
    );

    Ok(Response::json(
        200,
        object! {
            "ok" => true,
            "directory" => resolved.directory.to_string_lossy().into_owned(),
            "path" => resolve_explorer_path(body.get_str("currentPath")),
            "message" => format!("Switched to {}", resolved.worktree.label()),
        },
    ))
}
