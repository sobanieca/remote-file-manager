use crate::git::{log, status};
use crate::http::{Request, Response};
use crate::json::Value;
use crate::object;
use crate::paths;
use crate::workspace;

const PAGE_SIZE: usize = 40;

/// `parseInt(value, 10)`: leading digits after optional whitespace and sign.
pub fn parse_int(value: &str) -> Option<i64> {
    let value = value.trim_start();
    let (sign, digits) = match value.strip_prefix('-') {
        Some(rest) => (-1, rest),
        None => (1, value.strip_prefix('+').unwrap_or(value)),
    };
    let end = digits
        .find(|c: char| !c.is_ascii_digit())
        .unwrap_or(digits.len());
    digits[..end]
        .parse::<i64>()
        .ok()
        .map(|number| sign * number)
}

pub fn handle(request: &Request) -> Response {
    let working_dir = workspace::working_dir();
    let Some(branch_info) = status::branch_info(&working_dir) else {
        return Response::json(200, object! { "ok" => true, "repository" => Value::Null });
    };

    let served_path = request
        .query_value("path")
        .and_then(|path| paths::normalize(&path));
    let skip = request
        .query("skip")
        .and_then(|skip| parse_int(&skip))
        .unwrap_or(0)
        .max(0) as usize;

    let git_path = served_path
        .as_deref()
        .filter(|path| *path != ".")
        .map(|path| {
            paths::relative(
                &branch_info.repo_root,
                &workspace::resolve_in(&working_dir, path),
            )
        })
        .filter(|relative| !paths::is_outside(relative));

    let page = log::commits(&working_dir, PAGE_SIZE, skip, git_path.as_deref());
    let (commits, has_more): (Vec<Value>, bool) = match page {
        Some(page) => (
            page.commits
                .iter()
                .map(|commit| commit.to_object().into())
                .collect(),
            page.has_more,
        ),
        None => (Vec::new(), false),
    };

    Response::json(
        200,
        object! {
            "ok" => true,
            "repository" => branch_info.to_object(),
            "scopePath" => if git_path.is_some() { served_path } else { None },
            "commits" => commits,
            "hasMore" => has_more,
        },
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_integers_like_parse_int() {
        assert_eq!(parse_int("40"), Some(40));
        assert_eq!(parse_int(" 12abc"), Some(12));
        assert_eq!(parse_int("-3"), Some(-3));
        assert_eq!(parse_int("abc"), None);
        assert_eq!(parse_int(""), None);
    }
}
