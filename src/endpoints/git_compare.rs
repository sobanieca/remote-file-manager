use super::git_diff::describe_files;
use super::json_error;
use crate::git::{diff, log, status};
use crate::http::{Request, Response};
use crate::json::Value;
use crate::object;
use crate::workspace;

pub fn handle(request: &Request) -> Response {
    let working_dir = workspace::working_dir();
    let Some(branch_info) = status::branch_info(&working_dir) else {
        return Response::json(200, object! { "ok" => true, "repository" => Value::Null });
    };
    let (Some(from_revision), Some(to_revision)) =
        (request.query_value("from"), request.query_value("to"))
    else {
        return json_error(400, "Select two commits to compare");
    };

    let Some(diff_text) = diff::revision_diff(&working_dir, &from_revision, &to_revision) else {
        return json_error(
            404,
            "Could not compare those revisions. They may not exist in this repository.",
        );
    };
    let commit_object =
        |revision: &str| log::commit(&working_dir, revision).map(|commit| commit.to_object());
    let changes: Vec<Value> = log::changed_files(&working_dir, &from_revision, &to_revision)
        .unwrap_or_default()
        .iter()
        .map(|change| change.to_object().into())
        .collect();

    Response::json(
        200,
        object! {
            "ok" => true,
            "repository" => branch_info.to_object(),
            "from" => object! { "revision" => from_revision.clone(), "commit" => commit_object(&from_revision) },
            "to" => object! { "revision" => to_revision.clone(), "commit" => commit_object(&to_revision) },
            "changes" => changes,
            "files" => describe_files(&diff_text, Some(&branch_info.repo_root), &working_dir),
        },
    )
}
