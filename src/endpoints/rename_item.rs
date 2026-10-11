use super::{exists, is_valid_name, json_error, respond};
use crate::http::{Request, Response};
use crate::object;
use crate::paths;
use crate::search::file_index;
use crate::workspace;

pub fn handle(request: &Request) -> Response {
    respond(rename(request))
}

fn rename(request: &Request) -> Result<Response, String> {
    let body = request.json()?;
    let new_name = body
        .get_str("newName")
        .unwrap_or_default()
        .trim()
        .to_string();
    if !is_valid_name(&new_name) {
        return Ok(json_error(400, "Invalid name"));
    }

    let current_path =
        paths::normalize(body.get_str("path").unwrap_or_default()).filter(|path| path != ".");
    let Some(current_path) = current_path else {
        return Ok(json_error(400, "Invalid path"));
    };
    let Some(new_path) = paths::normalize(&paths::join(paths::dirname(&current_path), &new_name))
    else {
        return Ok(json_error(400, "Invalid target path"));
    };
    if new_path == current_path {
        return Ok(Response::json(
            200,
            object! { "ok" => true, "path" => new_path, "message" => "Name unchanged" },
        ));
    }

    let target = workspace::resolve(&new_path);
    if exists(&target) {
        return Ok(json_error(409, format!("\"{new_name}\" already exists")));
    }

    file_index::invalidate();
    std::fs::rename(workspace::resolve(&current_path), &target).map_err(|err| err.to_string())?;

    Ok(Response::json(
        200,
        object! {
            "ok" => true,
            "path" => new_path,
            "message" => format!("Renamed to \"{new_name}\""),
        },
    ))
}
