use super::file_entries::describe_path;
use super::json_error;
use crate::http::{Request, Response};
use crate::object;
use crate::paths;
use crate::workspace;

const MAX_TEXT_BYTES: u64 = 5_000_000;

pub fn handle(request: &Request) -> Response {
    let file_path =
        paths::normalize(&request.query("path").unwrap_or_default()).filter(|path| path != ".");
    let Some(file_path) = file_path else {
        return json_error(400, "Invalid file path");
    };
    let Ok(entry) = describe_path(&file_path) else {
        return json_error(404, "File not found");
    };
    if entry.is_directory {
        return Response::json(
            400,
            object! {
                "ok" => false,
                "isDirectory" => true,
                "path" => file_path,
                "message" => "Is a directory",
            },
        );
    }

    let is_too_large = entry.size.unwrap_or(0) > MAX_TEXT_BYTES;
    let content = (entry.is_text() && !is_too_large)
        .then(|| std::fs::read(workspace::resolve(&file_path)).ok())
        .flatten()
        .map(|bytes| String::from_utf8_lossy(&bytes).into_owned());

    Response::json(
        200,
        object! {
            "ok" => true,
            "entry" => entry.to_object(),
            "content" => content,
            "isTooLarge" => is_too_large,
        },
    )
}
