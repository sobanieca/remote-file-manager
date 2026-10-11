use super::{json_error, respond};
use crate::http::{Request, Response};
use crate::object;
use crate::paths;
use crate::search::file_index;
use crate::workspace;
use std::io::ErrorKind;

pub fn handle(request: &Request) -> Response {
    respond(paste(request))
}

fn paste(request: &Request) -> Result<Response, String> {
    let form = request.form_data()?;
    let requested_path = form.text("path").unwrap_or_else(|| ".".to_string());
    let (Some(name), Some(file)) = (form.text("filename"), form.get("file")) else {
        return Ok(json_error(400, "Missing filename or data"));
    };

    let Some(directory_path) = paths::normalize(&requested_path) else {
        return Ok(json_error(400, "Invalid path"));
    };
    if name.contains('/') || name.contains('\\') || name.contains("..") || name.contains('\0') {
        return Ok(json_error(400, "Invalid file name"));
    }

    let destination_path = paths::combine(&directory_path, &name);
    let destination = workspace::resolve(&destination_path);
    match destination.symlink_metadata() {
        Ok(_) => return Ok(json_error(409, format!("\"{name}\" already exists"))),
        Err(err) if err.kind() == ErrorKind::NotFound => {}
        Err(err) => return Err(err.to_string()),
    }
    std::fs::write(&destination, &file.data).map_err(|err| {
        eprintln!("Error saving pasted content: {err}");
        err.to_string()
    })?;

    file_index::invalidate();
    Ok(Response::json(
        200,
        object! {
            "ok" => true,
            "path" => destination_path,
            "message" => format!("Saved \"{name}\""),
        },
    ))
}
