use super::transfer_items::transfer_items;
use super::{json_error, respond};
use crate::http::{Request, Response};
use crate::json::Value;

pub fn handle(request: &Request) -> Response {
    respond(request.json().map(|body| {
        let paths = match body.get("paths") {
            Some(Value::Array(items)) => items.as_slice(),
            _ => &[],
        };
        if paths.is_empty() {
            return json_error(400, "No items selected");
        }
        transfer_items(
            paths,
            body.get_str("targetPath"),
            true,
            body.is_true("overwrite"),
        )
    }))
}
