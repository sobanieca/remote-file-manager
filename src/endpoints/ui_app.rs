//! The user interface built from `ui/`, embedded into the binary.

use crate::http::{Body, Request, Response};
use crate::ui_assets::UI_ASSETS;

pub const UI_PREFIX: &str = "/file-explorer";

const IMMUTABLE_CACHE: &str = "public, max-age=31536000, immutable";

pub fn matches(path: &str) -> bool {
    path == UI_PREFIX
        || path
            .strip_prefix(UI_PREFIX)
            .is_some_and(|rest| rest.starts_with('/'))
}

fn content_type(asset_path: &str) -> &'static str {
    let extension = asset_path
        .rsplit_once('.')
        .map_or("", |(_, extension)| extension);
    match extension {
        "html" => "text/html; charset=utf-8",
        "js" => "text/javascript; charset=utf-8",
        "css" => "text/css; charset=utf-8",
        "json" => "application/json",
        "webmanifest" => "application/manifest+json",
        "svg" => "image/svg+xml",
        "png" => "image/png",
        "ico" => "image/x-icon",
        "txt" => "text/plain; charset=utf-8",
        _ => "application/octet-stream",
    }
}

fn asset(asset_path: &str) -> Option<&'static [u8]> {
    UI_ASSETS
        .iter()
        .find(|(path, _)| *path == asset_path)
        .map(|(_, content)| *content)
}

fn asset_response(asset_path: &str, content: &'static [u8]) -> Response {
    let cache_control = if asset_path.starts_with("chunks/") {
        IMMUTABLE_CACHE
    } else {
        "no-cache"
    };
    Response::new(200, Body::Static(content))
        .header("Content-Type", content_type(asset_path))
        .header("Cache-Control", cache_control)
}

pub fn handle(request: &Request) -> Response {
    let asset_path = request.path[UI_PREFIX.len()..].trim_start_matches('/');
    if !asset_path.is_empty() {
        return match asset(asset_path) {
            Some(content) => asset_response(asset_path, content),
            None => Response::text(404, "Not found"),
        };
    }
    let Some(index) = asset("index.html") else {
        return Response::text(
            503,
            "The user interface is not built. Run `cargo build-ui` first.",
        );
    };
    // The app routes in the URL fragment, so a link from an older version
    // that carries its state in the query string is moved into the fragment.
    if !request.raw_query.is_empty() {
        return Response::redirect(&format!("{UI_PREFIX}/#/?{}", request.raw_query));
    }
    asset_response("index.html", index)
}
