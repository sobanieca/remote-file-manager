use crate::file_kinds;
use crate::http::{Body, Request, Response};
use crate::paths;
use crate::workspace;
use std::fs::File;
use std::io::ErrorKind;

fn image_content_type(extension: &str) -> Option<&'static str> {
    Some(match extension {
        ".svg" => "image/svg+xml",
        ".jpg" | ".jpeg" => "image/jpeg",
        ".png" => "image/png",
        ".gif" => "image/gif",
        ".bmp" => "image/bmp",
        ".webp" => "image/webp",
        ".tiff" | ".tif" => "image/tiff",
        ".ico" => "image/x-icon",
        ".avif" => "image/avif",
        _ => return None,
    })
}

pub fn handle(request: &Request) -> Response {
    let Some(path) = request.query_value("path") else {
        return Response::text(400, "Path parameter is required");
    };
    let Some(path) = paths::normalize(&path) else {
        return Response::text(400, "Invalid path");
    };
    let target = workspace::resolve(&path);
    let metadata = match std::fs::metadata(&target) {
        Ok(metadata) => metadata,
        Err(err) if err.kind() == ErrorKind::NotFound => {
            return Response::text(404, "File not found");
        }
        Err(err) => return Response::text(500, &format!("Error reading file: {err}")),
    };
    if !metadata.is_file() {
        return Response::text(400, "Path is not a file");
    }
    let Some(content_type) = image_content_type(&file_kinds::extension(&path)) else {
        return Response::text(400, "Unsupported image format");
    };
    match File::open(&target) {
        Ok(file) => Response::new(
            200,
            Body::File {
                file,
                start: 0,
                length: metadata.len(),
            },
        )
        .header("Content-Type", content_type)
        .header("Cache-Control", "public, max-age=3600"),
        Err(err) => Response::text(500, &format!("Error reading file: {err}")),
    }
}
