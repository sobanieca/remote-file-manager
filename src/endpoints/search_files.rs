use crate::http::{Request, Response};
use crate::object;
use crate::search::file_index;
use crate::workspace;

const MAX_QUERY_LENGTH: usize = 200;
const RESULT_LIMIT: usize = 50;

pub fn handle(request: &Request) -> Response {
    let query: String = request
        .query("q")
        .unwrap_or_default()
        .chars()
        .take(MAX_QUERY_LENGTH)
        .collect();
    let result = file_index::search(&workspace::working_dir(), &query, RESULT_LIMIT);
    Response::json(
        200,
        object! {
            "ok" => true,
            "query" => query,
            "indexedCount" => result.indexed_count,
            "truncated" => result.truncated,
            "total" => result.total,
            "results" => result.results,
        },
    )
}
