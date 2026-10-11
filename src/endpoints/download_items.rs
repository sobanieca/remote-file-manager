use super::attachment;
use crate::http::{Body, Request, Response};
use crate::paths;
use crate::workspace;
use crate::zip::ZipWriter;
use std::fs::File;
use std::io::{self, Write};
use std::os::unix::fs::PermissionsExt;
use std::path::Path;

type Zip<'a> = ZipWriter<&'a mut dyn Write>;

/// The name of the entry itself, the served directory's name for the root.
fn entry_name(path: &str) -> String {
    if path == "." {
        workspace::working_dir()
            .file_name()
            .map(|name| name.to_string_lossy().into_owned())
            .unwrap_or_else(|| "download".to_string())
    } else {
        paths::basename(path).to_string()
    }
}

pub fn archive_name(path: &str) -> String {
    format!("{}.zip", entry_name(path))
}

/// Unreadable files are skipped, write failures end the archive.
fn add_file(zip: &mut Zip, source: &Path, name: &str) -> io::Result<()> {
    let opened = File::open(source).and_then(|file| Ok((file.metadata()?, file)));
    let (metadata, file) = match opened {
        Ok(opened) => opened,
        Err(err) => {
            eprintln!("Skipping {} in archive: {err}", source.display());
            return Ok(());
        }
    };
    zip.add_file(
        name,
        file,
        metadata.len(),
        metadata.modified().unwrap_or(std::time::UNIX_EPOCH),
        metadata.permissions().mode(),
    )
}

/// Adds every file below a directory. Symbolic links to files are archived
/// with the content they point to, links to directories are not followed.
fn add_directory(zip: &mut Zip, directory: &Path, prefix: &str) -> io::Result<()> {
    let entries = std::fs::read_dir(directory).and_then(|read_dir| read_dir.collect());
    let mut entries: Vec<std::fs::DirEntry> = match entries {
        Ok(entries) => entries,
        Err(err) => {
            eprintln!("Skipping {} in archive: {err}", directory.display());
            return Ok(());
        }
    };
    entries.sort_by_key(|entry| entry.file_name());
    for entry in entries {
        let name = paths::combine(prefix, &entry.file_name().to_string_lossy());
        let path = entry.path();
        if entry.file_type().is_ok_and(|file_type| file_type.is_dir()) {
            add_directory(zip, &path, &name)?;
        } else if path.is_file() {
            add_file(zip, &path, &name)?;
        }
    }
    Ok(())
}

/// Streams a ZIP archive. With `keep_names` every path is stored under its
/// own name, otherwise the content of the single directory is at the top.
pub fn stream_archive(archive_paths: Vec<String>, file_name: &str, keep_names: bool) -> Response {
    Response::new(
        200,
        Body::Stream(Box::new(move |out: &mut dyn Write| {
            let mut zip = ZipWriter::new(out);
            for path in &archive_paths {
                let source = workspace::resolve(path);
                if !source.is_dir() {
                    add_file(&mut zip, &source, &entry_name(path))?;
                } else if keep_names {
                    add_directory(&mut zip, &source, &entry_name(path))?;
                } else {
                    add_directory(&mut zip, &source, ".")?;
                }
            }
            zip.finish().map(drop)
        })),
    )
    .header("Content-Type", "application/zip")
    .header("Content-Disposition", attachment(file_name))
}

pub fn handle(request: &Request) -> Response {
    let form = match request.form_data() {
        Ok(form) => form,
        Err(err) => {
            eprintln!("Bulk download error: {err}");
            return Response::text(500, "Error creating ZIP archive");
        }
    };
    let requested: Vec<String> = form.get_all("paths").map(|field| field.text()).collect();
    if requested.is_empty() {
        return Response::text(400, "No items selected");
    }

    let archive_paths: Vec<String> = requested
        .iter()
        .filter_map(|path| paths::normalize(path))
        .filter(|path| workspace::resolve(path).exists())
        .collect();
    let file_name = match archive_paths.as_slice() {
        [] => return Response::text(400, "Nothing could be added to the archive"),
        [only] => archive_name(only),
        _ => "download.zip".to_string(),
    };
    stream_archive(archive_paths, &file_name, true)
}
