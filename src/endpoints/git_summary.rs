use crate::git::{status, worktree};
use crate::http::{Request, Response};
use crate::json::Value;
use crate::object;
use crate::workspace;

pub fn handle(_request: &Request) -> Response {
    let working_dir = workspace::working_dir();
    let Some(branch_info) = status::branch_info(&working_dir) else {
        return Response::json(200, object! { "ok" => true, "repository" => Value::Null });
    };
    let change_count = status::status_info(&working_dir).map_or(0, |info| info.records.len());

    let mut repository = branch_info.to_object();
    repository.insert("changeCount", change_count);
    repository.insert("worktrees", worktree::worktree_objects(&working_dir));
    Response::json(200, object! { "ok" => true, "repository" => repository })
}
