//! The served directory as static files, with `index.html` for directories
//! and single byte ranges for media seeking.

use crate::file_kinds;
use crate::http::{Body, Request, Response};
use crate::paths;
use crate::workspace;
use std::fs::File;

/// Parses `bytes=start-end`, `bytes=start-` and `bytes=-suffix`. `Err` when
/// the range cannot be satisfied, `Ok(None)` when the header is ignored.
fn parse_range(header: &str, total: u64) -> Result<Option<(u64, u64)>, ()> {
    let Some(spec) = header.trim().strip_prefix("bytes=") else {
        return Ok(None);
    };
    if spec.contains(',') {
        return Ok(None);
    }
    let Some((start, end)) = spec.split_once('-') else {
        return Ok(None);
    };
    let (start, end) = (start.trim(), end.trim());
    let range = if start.is_empty() {
        let suffix: u64 = end.parse().map_err(|_| ())?;
        if suffix == 0 {
            return Err(());
        }
        (total.saturating_sub(suffix), total.saturating_sub(1))
    } else {
        let start: u64 = start.parse().map_err(|_| ())?;
        let end = if end.is_empty() {
            total.saturating_sub(1)
        } else {
            end.parse::<u64>()
                .map_err(|_| ())?
                .min(total.saturating_sub(1))
        };
        (start, end)
    };
    if total == 0 || range.0 > range.1 || range.0 >= total {
        return Err(());
    }
    Ok(Some(range))
}

pub fn handle(request: &Request) -> Response {
    if request.method != "GET" && request.method != "HEAD" {
        return Response::not_found();
    }
    let relative = request.path.trim_start_matches('/');
    let path = if relative.is_empty() {
        Some(".".to_string())
    } else {
        paths::normalize(relative)
    };
    let Some(path) = path else {
        return Response::not_found();
    };
    let mut target = workspace::resolve(&path);
    if target.is_dir() {
        target.push("index.html");
    }
    let Ok(file) = File::open(&target) else {
        return Response::not_found();
    };
    let Ok(metadata) = file.metadata() else {
        return Response::not_found();
    };
    if !metadata.is_file() {
        return Response::not_found();
    }

    let total = metadata.len();
    let content_type = file_kinds::static_content_type(&target.to_string_lossy());
    let range = match request
        .header("range")
        .map(|header| parse_range(header, total))
    {
        Some(Err(())) => {
            return Response::text(416, "Range Not Satisfiable")
                .header("Content-Range", format!("bytes */{total}"));
        }
        Some(Ok(range)) => range,
        None => None,
    };
    match range {
        Some((start, end)) => Response::new(
            206,
            Body::File {
                file,
                start,
                length: end - start + 1,
            },
        )
        .header("Content-Type", content_type)
        .header("Accept-Ranges", "bytes")
        .header("Content-Range", format!("bytes {start}-{end}/{total}")),
        None => Response::new(
            200,
            Body::File {
                file,
                start: 0,
                length: total,
            },
        )
        .header("Content-Type", content_type)
        .header("Accept-Ranges", "bytes"),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_ranges() {
        assert_eq!(parse_range("bytes=0-99", 1000), Ok(Some((0, 99))));
        assert_eq!(parse_range("bytes=900-", 1000), Ok(Some((900, 999))));
        assert_eq!(parse_range("bytes=-100", 1000), Ok(Some((900, 999))));
        assert_eq!(parse_range("bytes=0-5000", 1000), Ok(Some((0, 999))));
        assert_eq!(parse_range("bytes=1000-", 1000), Err(()));
        assert_eq!(parse_range("bytes=0-1,5-6", 1000), Ok(None));
        assert_eq!(parse_range("items=0-1", 1000), Ok(None));
    }
}
