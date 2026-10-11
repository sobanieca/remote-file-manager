use super::attachment;
use super::download_items::{archive_name, stream_archive};
use crate::file_kinds;
use crate::http::{Body, Request, Response};
use crate::paths;
use crate::workspace;
use std::fs::File;

pub fn handle(request: &Request) -> Response {
    let Some(path) = request
        .query_value("path")
        .as_deref()
        .and_then(paths::normalize)
    else {
        return Response::text(400, "Invalid path");
    };
    let target = workspace::resolve(&path);
    let Ok(metadata) = std::fs::metadata(&target) else {
        return Response::text(404, "File or directory not found");
    };

    match request.query("type").as_deref() {
        Some("file") => {
            let Ok(file) = File::open(&target) else {
                return Response::text(500, "Error downloading file");
            };
            let file_name = paths::basename(&path);
            Response::new(
                200,
                Body::File {
                    file,
                    start: 0,
                    length: metadata.len(),
                },
            )
            .header("Content-Type", file_kinds::download_content_type(file_name))
            .header("Content-Disposition", attachment(file_name))
        }
        Some("directory") => stream_archive(vec![path.clone()], &archive_name(&path), false),
        _ => Response::text(400, "Invalid type specified"),
    }
}
