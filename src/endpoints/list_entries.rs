use super::file_entries::read_directory_entries;
use super::{json_error, respond};
use crate::http::{Request, Response};
use crate::object;
use crate::paths;
use crate::workspace;

pub fn handle(request: &Request) -> Response {
    let query_path = request
        .query_value("path")
        .unwrap_or_else(|| ".".to_string());
    let Some(directory_path) = paths::normalize(&query_path) else {
        return json_error(400, "Invalid path");
    };
    let Ok(metadata) = std::fs::metadata(workspace::resolve(&directory_path)) else {
        return json_error(404, "Directory not found");
    };
    if !metadata.is_dir() {
        return Response::json(
            400,
            object! {
                "ok" => false,
                "isFile" => true,
                "path" => directory_path,
                "message" => "Not a directory",
            },
        );
    }

    respond(
        read_directory_entries(&directory_path)
            .map(|listing| {
                Response::json(
                    200,
                    object! {
                        "ok" => true,
                        "path" => directory_path.clone(),
                        "entries" => listing.entries,
                        "totalSize" => listing.total_size,
                    },
                )
            })
            .map_err(|err| format!("Error reading directory: {err}")),
    )
}
