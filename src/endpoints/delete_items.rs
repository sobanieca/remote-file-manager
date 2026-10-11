use super::{count_of, json_error, remove_path, respond};
use crate::http::{Request, Response};
use crate::json::Value;
use crate::object;
use crate::paths;
use crate::search::file_index;
use crate::workspace;
use std::io::{self, ErrorKind};

fn is_not_empty_error(err: &io::Error) -> bool {
    err.kind() == ErrorKind::DirectoryNotEmpty || err.raw_os_error() == Some(17)
}

pub fn handle(request: &Request) -> Response {
    respond(delete(request))
}

fn delete(request: &Request) -> Result<Response, String> {
    let body = request.json()?;
    let paths_to_delete = match body.get("paths") {
        Some(Value::Array(items)) => items.clone(),
        _ => Vec::new(),
    };
    let is_recursive = body.is_true("recursive");
    if paths_to_delete.is_empty() {
        return Ok(json_error(400, "No items selected"));
    }

    let mut errors: Vec<Value> = Vec::new();
    let mut not_empty: Vec<String> = Vec::new();
    let mut deleted = 0;

    for raw_path in &paths_to_delete {
        let path = raw_path
            .as_str()
            .and_then(paths::normalize)
            .filter(|path| path != ".");
        let Some(path) = path else {
            errors.push(
                object! { "path" => raw_path.to_js_string(), "message" => "Invalid path" }.into(),
            );
            continue;
        };
        match remove_path(&workspace::resolve(&path), is_recursive) {
            Ok(()) => deleted += 1,
            Err(err) if is_not_empty_error(&err) => {
                not_empty.push(paths::basename(&path).to_string());
            }
            Err(err) => errors.push(
                object! { "path" => paths::basename(&path), "message" => err.to_string() }.into(),
            ),
        }
    }

    file_index::invalidate();
    let mut message_parts = Vec::new();
    if deleted > 0 {
        message_parts.push(format!("Deleted {}", count_of(deleted, "item")));
    }
    if !not_empty.is_empty() {
        message_parts.push(format!("{} folder(s) not empty", not_empty.len()));
    }
    if !errors.is_empty() {
        message_parts.push(format!("{} failed", errors.len()));
    }
    let message = if message_parts.is_empty() {
        "Nothing to delete".to_string()
    } else {
        message_parts.join(", ")
    };

    Ok(Response::json(
        200,
        object! {
            "ok" => errors.is_empty() && not_empty.is_empty(),
            "deleted" => deleted,
            "notEmpty" => not_empty,
            "errors" => errors,
            "message" => message,
        },
    ))
}
