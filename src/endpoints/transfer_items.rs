//! Copying and moving entries into a directory.

use super::{count_of, exists, remove_path};
use crate::http::Response;
use crate::json::Value;
use crate::object;
use crate::paths;
use crate::search::file_index;
use crate::workspace;
use std::fs::{self, File, FileTimes};
use std::io::{self, ErrorKind};
use std::path::Path;

fn preserve_times(source: &fs::Metadata, destination: &Path) -> io::Result<()> {
    let mut times = FileTimes::new();
    if let Ok(modified) = source.modified() {
        times = times.set_modified(modified);
    }
    if let Ok(accessed) = source.accessed() {
        times = times.set_accessed(accessed);
    }
    File::open(destination)?.set_times(times)
}

/// Copies files, directories and symbolic links recursively (`@std/fs`
/// `copy`), keeping timestamps.
fn copy_path(source: &Path, destination: &Path) -> io::Result<()> {
    let metadata = source.symlink_metadata()?;
    if metadata.is_symlink() {
        std::os::unix::fs::symlink(fs::read_link(source)?, destination)
    } else if metadata.is_dir() {
        fs::create_dir(destination)?;
        for entry in fs::read_dir(source)? {
            let entry = entry?;
            copy_path(&entry.path(), &destination.join(entry.file_name()))?;
        }
        fs::set_permissions(destination, metadata.permissions())?;
        let _ = preserve_times(&metadata, destination);
        Ok(())
    } else {
        fs::copy(source, destination)?;
        let _ = preserve_times(&metadata, destination);
        Ok(())
    }
}

fn move_path(source: &Path, destination: &Path) -> io::Result<()> {
    match fs::rename(source, destination) {
        // Renaming across mount points is not supported, copy and remove.
        Err(err) if err.kind() == ErrorKind::CrossesDevices => {
            if exists(destination) {
                remove_path(destination, true)?;
            }
            copy_path(source, destination)?;
            remove_path(source, true)
        }
        result => result,
    }
}

fn is_inside(candidate_path: &str, directory_path: &str) -> bool {
    candidate_path == directory_path || candidate_path.starts_with(&format!("{directory_path}/"))
}

/// Copies or moves entries into a target directory and reports per item.
pub fn transfer_items(
    raw_paths: &[Value],
    target_path: Option<&str>,
    is_move: bool,
    overwrite: bool,
) -> Response {
    let Some(target) = target_path.and_then(paths::normalize) else {
        return Response::json(
            400,
            object! { "ok" => false, "message" => "Invalid target path" },
        );
    };
    match fs::metadata(workspace::resolve(&target)) {
        Ok(metadata) if metadata.is_dir() => {}
        Ok(_) => {
            return Response::json(
                200,
                object! { "ok" => false, "message" => "Target is not a directory" },
            );
        }
        Err(_) => {
            return Response::json(
                200,
                object! { "ok" => false, "message" => "Target directory does not exist" },
            );
        }
    }

    let mut conflicts: Vec<String> = Vec::new();
    let mut errors: Vec<Value> = Vec::new();
    let mut processed = 0;
    let error = |path: &str, message: &str| -> Value {
        object! { "path" => path, "message" => message }.into()
    };

    for raw_path in raw_paths {
        let source_path = raw_path
            .as_str()
            .and_then(paths::normalize)
            .filter(|path| path != ".");
        let Some(source_path) = source_path else {
            errors.push(error(&raw_path.to_js_string(), "Invalid path"));
            continue;
        };
        let name = paths::basename(&source_path).to_string();
        let destination_path = paths::combine(&target, &name);

        if destination_path == source_path {
            errors.push(error(&name, "Source and target are the same"));
            continue;
        }
        if is_inside(&destination_path, &source_path) {
            errors.push(error(&name, "Cannot place a folder inside itself"));
            continue;
        }

        let source = workspace::resolve(&source_path);
        let destination = workspace::resolve(&destination_path);
        let result = (|| {
            if exists(&destination) {
                if !overwrite {
                    return Ok(false);
                }
                remove_path(&destination, true)?;
            }
            if is_move {
                move_path(&source, &destination)?;
            } else {
                copy_path(&source, &destination)?;
            }
            Ok::<bool, io::Error>(true)
        })();
        match result {
            Ok(true) => processed += 1,
            Ok(false) => conflicts.push(name),
            Err(err) => errors.push(error(&name, &err.to_string())),
        }
    }

    file_index::invalidate();
    let verb = if is_move { "Moved" } else { "Copied" };
    let mut message_parts = Vec::new();
    if processed > 0 {
        message_parts.push(format!("{verb} {}", count_of(processed, "item")));
    }
    if !conflicts.is_empty() {
        message_parts.push(format!("{} already exist", conflicts.len()));
    }
    if !errors.is_empty() {
        message_parts.push(format!("{} failed", errors.len()));
    }
    let message = if message_parts.is_empty() {
        "Nothing to do".to_string()
    } else {
        message_parts.join(", ")
    };

    Response::json(
        200,
        object! {
            "ok" => errors.is_empty(),
            "processed" => processed,
            "conflicts" => conflicts,
            "errors" => errors,
            "message" => message,
        },
    )
}
