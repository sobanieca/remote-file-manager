//! Routes requests to the API endpoints, the user interface and the served
//! files.

use crate::endpoints::{self, ui_app};
use crate::http::{Request, Response, url};

type Endpoint = fn(&Request) -> Response;

fn get_endpoint(path: &str) -> Option<Endpoint> {
    Some(match path {
        "/api/entries" => endpoints::list_entries::handle,
        "/api/file" => endpoints::read_file::handle,
        "/api/search" => endpoints::search_files::handle,
        "/api/thumbnail" => endpoints::thumbnail::handle,
        "/api/download-item" => endpoints::download_item::handle,
        "/api/git/summary" => endpoints::git_summary::handle,
        "/api/git/status" => endpoints::git_overview::handle,
        "/api/git/log" => endpoints::git_log::handle,
        "/api/git/diff" => endpoints::git_diff::handle,
        "/api/git/compare" => endpoints::git_compare::handle,
        _ => return None,
    })
}

fn post_endpoint(path: &str) -> Option<Endpoint> {
    Some(match path {
        "/api/download-items" => endpoints::download_items::handle,
        "/api/save-file" => endpoints::save_file::handle,
        "/api/create-item" => endpoints::create_item::handle,
        "/api/rename-item" => endpoints::rename_item::handle,
        "/api/delete-items" => endpoints::delete_items::handle,
        "/api/copy-items" => endpoints::copy_items::handle,
        "/api/move-items" => endpoints::move_items::handle,
        "/api/upload-files" => endpoints::upload_files::handle,
        "/api/paste-content" => endpoints::paste_content::handle,
        "/api/git/switch-worktree" => endpoints::switch_worktree::handle,
        _ => return None,
    })
}

pub fn handle(request: &Request) -> Response {
    let path = request.path.as_str();
    let endpoint = match request.method.as_str() {
        "GET" | "HEAD" if ui_app::matches(path) => Some(ui_app::handle as Endpoint),
        "GET" | "HEAD" => get_endpoint(path),
        "POST" => post_endpoint(path),
        _ => None,
    };
    if let Some(endpoint) = endpoint {
        return endpoint(request);
    }
    if path.ends_with(".md") {
        let file_path = url::encode_component(&path[1..]);
        return Response::redirect(&format!("{}/#/view?path={file_path}", ui_app::UI_PREFIX));
    }
    endpoints::static_files::handle(request)
}
