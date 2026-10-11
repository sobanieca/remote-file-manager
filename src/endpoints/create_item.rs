use super::{is_valid_name, json_error, respond};
use crate::http::{Request, Response};
use crate::object;
use crate::paths;
use crate::search::file_index;
use crate::workspace;
use std::fs::OpenOptions;
use std::io::ErrorKind;

pub fn handle(request: &Request) -> Response {
    respond(create(request))
}

fn create(request: &Request) -> Result<Response, String> {
    let body = request.json()?;
    let name = body.get_str("name").unwrap_or_default().trim().to_string();
    let is_directory = body.get_str("type") != Some("file");

    if !is_valid_name(&name) {
        return Ok(json_error(400, "Invalid name"));
    }
    let Some(directory_path) = paths::normalize(body.get_str("path").unwrap_or(".")) else {
        return Ok(json_error(400, "Invalid path"));
    };

    let new_item_path = paths::combine(&directory_path, &name);
    let target = workspace::resolve(&new_item_path);
    let result = if is_directory {
        std::fs::create_dir(&target)
    } else {
        OpenOptions::new()
            .write(true)
            .create_new(true)
            .open(&target)
            .map(drop)
    };
    match result {
        Ok(()) => {}
        Err(err) if err.kind() == ErrorKind::AlreadyExists => {
            return Ok(json_error(409, format!("\"{name}\" already exists")));
        }
        Err(err) => return Err(err.to_string()),
    }

    file_index::invalidate();
    let kind = if is_directory { "Folder" } else { "File" };
    Ok(Response::json(
        200,
        object! {
            "ok" => true,
            "path" => new_item_path,
            "message" => format!("{kind} \"{name}\" created"),
        },
    ))
}
