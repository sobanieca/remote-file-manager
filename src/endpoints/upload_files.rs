use super::{count_of, json_error, respond};
use crate::http::{Request, Response};
use crate::object;
use crate::paths;
use crate::search::file_index;
use crate::workspace;
use std::collections::HashSet;

fn is_safe_relative_path(relative_path: &str) -> bool {
    !relative_path
        .split('/')
        .any(|segment| segment == ".." || segment.is_empty() || segment.contains('\0'))
}

pub fn handle(request: &Request) -> Response {
    respond(upload(request))
}

fn upload(request: &Request) -> Result<Response, String> {
    let form = request.form_data()?;
    let target_path = form.text("path").unwrap_or_else(|| ".".to_string());
    let Some(directory_path) = paths::normalize(&target_path) else {
        return Ok(json_error(400, "Invalid path"));
    };

    let files: Vec<_> = form
        .get_all("files")
        .filter(|field| field.filename.as_ref().is_some_and(|name| !name.is_empty()))
        .collect();
    if files.is_empty() {
        return Ok(json_error(400, "No files were selected"));
    }

    let mut created_directories: HashSet<String> = HashSet::new();
    let mut uploaded_count = 0;
    let mut failed_count: usize = 0;

    for file in files {
        let file_name = file.filename.as_deref().unwrap_or_default();
        let relative_path = file_name.replace('\\', "/");
        if !is_safe_relative_path(&relative_path) {
            failed_count += 1;
            continue;
        }

        if relative_path.contains('/') {
            let full_directory = paths::join(&directory_path, paths::dirname(&relative_path));
            if !created_directories.contains(&full_directory) {
                if let Err(err) = std::fs::create_dir_all(workspace::resolve(&full_directory)) {
                    eprintln!("Error uploading {file_name}: {err}");
                    failed_count += 1;
                    continue;
                }
                created_directories.insert(full_directory);
            }
        }
        let destination = paths::join(&directory_path, &relative_path);
        match std::fs::write(workspace::resolve(&destination), &file.data) {
            Ok(()) => uploaded_count += 1,
            Err(err) => {
                eprintln!("Error uploading {file_name}: {err}");
                failed_count += 1;
            }
        }
    }

    file_index::invalidate();
    let folder_count = created_directories.len();
    let mut message_parts = vec![format!("Uploaded {}", count_of(uploaded_count, "file"))];
    if folder_count > 0 {
        message_parts.push(count_of(folder_count, "folder"));
    }
    if failed_count > 0 {
        message_parts.push(format!("{failed_count} failed"));
    }

    Ok(Response::json(
        200,
        object! {
            "ok" => failed_count == 0,
            "uploadedCount" => uploaded_count,
            "folderCount" => folder_count,
            "failedCount" => failed_count,
            "message" => message_parts.join(", "),
        },
    ))
}
