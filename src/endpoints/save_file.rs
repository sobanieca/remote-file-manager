use super::{json_error, respond};
use crate::http::{Request, Response};
use crate::object;
use crate::paths;
use crate::workspace;

pub fn handle(request: &Request) -> Response {
    respond(save(request))
}

fn save(request: &Request) -> Result<Response, String> {
    let body = request.json()?;
    let file_path =
        paths::normalize(body.get_str("path").unwrap_or_default()).filter(|path| path != ".");
    let Some(file_path) = file_path else {
        return Ok(json_error(400, "Invalid path"));
    };
    let Some(content) = body.get_str("content") else {
        return Ok(json_error(400, "Missing content"));
    };

    let mut content = content.replace("\r\n", "\n");
    let target = workspace::resolve(&file_path);
    if let Ok(original) = std::fs::read(&target)
        && original.ends_with(b"\n")
        && !content.ends_with('\n')
    {
        content.push('\n');
    }
    std::fs::write(&target, content).map_err(|err| err.to_string())?;

    Ok(Response::json(
        200,
        object! { "ok" => true, "message" => "File saved" },
    ))
}
