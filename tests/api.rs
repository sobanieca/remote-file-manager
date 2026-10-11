//! End-to-end tests of the HTTP API, the user interface and static files,
//! running the compiled `rfm` in temporary directories.

mod support;

#[allow(dead_code)]
#[path = "../src/json.rs"]
mod json;

use json::Value;
use support::{Server, git, init_repository, temp_dir, unzip, write};

fn parse(response: &support::Response) -> Value {
    json::parse(&response.text())
        .unwrap_or_else(|err| panic!("invalid JSON ({err}): {}", response.text()))
}

/// Looks up `a.b.0.c` in a JSON value.
fn at<'a>(value: &'a Value, path: &str) -> &'a Value {
    path.split('.').fold(value, |value, key| match value {
        Value::Object(object) => object
            .get(key)
            .unwrap_or_else(|| panic!("missing {key} in {path}")),
        Value::Array(items) => &items[key.parse::<usize>().expect("index")],
        _ => panic!("{path} is not a container"),
    })
}

fn str_at<'a>(value: &'a Value, path: &str) -> &'a str {
    at(value, path)
        .as_str()
        .unwrap_or_else(|| panic!("{path} is not a string"))
}

fn names(value: &Value, path: &str) -> Vec<String> {
    match at(value, path) {
        Value::Array(items) => items
            .iter()
            .map(|item| str_at(item, "name").to_string())
            .collect(),
        _ => panic!("{path} is not an array"),
    }
}

fn get_json(server: &Server, target: &str) -> (u16, Value) {
    let response = server.get(target);
    (response.status, parse(&response))
}

fn post_json(server: &Server, target: &str, body: &str) -> (u16, Value) {
    let response = server.post_json(target, body);
    (response.status, parse(&response))
}

fn sample_directory() -> std::path::PathBuf {
    let dir = temp_dir("sample");
    write(&dir, "README.md", "# Sample\n");
    write(&dir, "page.html", "<h1>Page</h1>");
    write(&dir, "file10.txt", "ten");
    write(&dir, "file2.txt", "two");
    write(&dir, "docs/guide.md", "# Guide\n");
    write(&dir, "docs/index.html", "<p>docs</p>");
    write(&dir, "media/clip.mp4", "0123456789");
    dir
}

#[test]
fn serves_the_user_interface() {
    let dir = sample_directory();
    let server = Server::start(&dir);

    let index = server.get("/file-explorer");
    assert_eq!(index.status, 200);
    assert_eq!(
        index.header("content-type"),
        Some("text/html; charset=utf-8")
    );
    assert_eq!(index.header("cache-control"), Some("no-cache"));
    assert!(index.text().contains("<html"));
    assert_eq!(server.get("/file-explorer/").status, 200);

    let favicon = server.get("/file-explorer/favicon.svg");
    assert_eq!(favicon.status, 200);
    assert_eq!(favicon.header("content-type"), Some("image/svg+xml"));

    let missing = server.get("/file-explorer/missing.js");
    assert_eq!(
        (missing.status, missing.text().as_str()),
        (404, "Not found")
    );

    let legacy = server.get("/file-explorer?path=docs");
    assert_eq!(legacy.status, 302);
    assert_eq!(
        legacy.header("location"),
        Some("/file-explorer/#/?path=docs")
    );

    let head = server.request("HEAD", "/file-explorer", &[], b"");
    assert_eq!(head.status, 200);
    assert!(head.body.is_empty());
}

#[test]
fn serves_static_files() {
    let dir = sample_directory();
    let server = Server::start(&dir);

    let page = server.get("/page.html");
    assert_eq!(page.status, 200);
    assert_eq!(
        page.header("content-type"),
        Some("text/html; charset=utf-8")
    );
    assert_eq!(page.text(), "<h1>Page</h1>");

    let docs = server.get("/docs");
    assert_eq!((docs.status, docs.text().as_str()), (200, "<p>docs</p>"));

    let markdown = server.get("/docs/guide.md");
    assert_eq!(markdown.status, 302);
    assert_eq!(
        markdown.header("location"),
        Some("/file-explorer/#/view?path=docs%2Fguide.md")
    );

    let range = server.request("GET", "/media/clip.mp4", &[("Range", "bytes=2-5")], b"");
    assert_eq!(range.status, 206);
    assert_eq!(range.header("content-range"), Some("bytes 2-5/10"));
    assert_eq!(range.header("content-type"), Some("video/mp4"));
    assert_eq!(range.text(), "2345");
    let unsatisfiable = server.request("GET", "/media/clip.mp4", &[("Range", "bytes=20-")], b"");
    assert_eq!(unsatisfiable.status, 416);

    assert_eq!(server.get("/missing.txt").status, 404);
    assert_eq!(server.get("/../outside.txt").status, 404);
    assert_eq!(server.get("/%2e%2e/outside.txt").status, 404);
}

#[test]
fn lists_and_reads_files() {
    let dir = sample_directory();
    std::os::unix::fs::symlink("docs", dir.join("docs-link")).unwrap();
    std::os::unix::fs::symlink("missing", dir.join("broken-link")).unwrap();
    let server = Server::start(&dir);

    let (status, listing) = get_json(&server, "/api/entries");
    assert_eq!(status, 200);
    assert_eq!(str_at(&listing, "path"), ".");
    assert_eq!(
        names(&listing, "entries"),
        [
            "docs",
            "docs-link",
            "media",
            "broken-link",
            "file2.txt",
            "file10.txt",
            "page.html",
            "README.md"
        ]
    );
    let readme = at(&listing, "entries.7");
    assert_eq!(str_at(readme, "kind"), "text");
    assert_eq!(at(readme, "isMarkdown"), &Value::Bool(true));
    assert_eq!(at(readme, "isText"), &Value::Bool(true));
    assert_eq!(at(readme, "size"), &Value::Number(9.0));
    assert!(str_at(readme, "modifiedAt").ends_with('Z'));
    assert_eq!(at(readme, "gitStatus"), &Value::Null);
    let link = at(&listing, "entries.1");
    assert_eq!(at(link, "isSymlink"), &Value::Bool(true));
    assert_eq!(at(link, "isDirectory"), &Value::Bool(true));
    assert_eq!(str_at(link, "kind"), "folder");
    assert_eq!(at(&listing, "entries.3.isBroken"), &Value::Bool(true));
    assert_eq!(at(&listing, "totalSize"), &Value::Number(28.0));

    let (status, docs) = get_json(&server, "/api/entries?path=docs");
    assert_eq!(status, 200);
    assert_eq!(str_at(&docs, "entries.0.path"), "docs/guide.md");

    let (status, not_directory) = get_json(&server, "/api/entries?path=README.md");
    assert_eq!(status, 400);
    assert_eq!(at(&not_directory, "isFile"), &Value::Bool(true));
    assert_eq!(get_json(&server, "/api/entries?path=nope").0, 404);
    assert_eq!(get_json(&server, "/api/entries?path=..").0, 400);
    assert_eq!(get_json(&server, "/api/entries?path=%2Fetc").0, 400);

    let (status, file) = get_json(&server, "/api/file?path=docs%2Fguide.md");
    assert_eq!(status, 200);
    assert_eq!(str_at(&file, "content"), "# Guide\n");
    assert_eq!(str_at(&file, "entry.name"), "guide.md");
    assert_eq!(at(&file, "isTooLarge"), &Value::Bool(false));

    let (_, video) = get_json(&server, "/api/file?path=media/clip.mp4");
    assert_eq!(at(&video, "content"), &Value::Null);
    assert_eq!(str_at(&video, "entry.kind"), "video");

    let (status, directory) = get_json(&server, "/api/file?path=docs");
    assert_eq!(status, 400);
    assert_eq!(at(&directory, "isDirectory"), &Value::Bool(true));
    assert_eq!(get_json(&server, "/api/file?path=missing.txt").0, 404);
    assert_eq!(get_json(&server, "/api/file?path=/etc/passwd").0, 400);
}

#[test]
fn manages_files() {
    let dir = sample_directory();
    let server = Server::start(&dir);

    let (status, created) = post_json(
        &server,
        "/api/create-item",
        r#"{"path":"docs","name":" notes.txt ","type":"file"}"#,
    );
    assert_eq!(status, 200);
    assert_eq!(str_at(&created, "path"), "docs/notes.txt");
    assert_eq!(str_at(&created, "message"), "File \"notes.txt\" created");
    assert!(dir.join("docs/notes.txt").is_file());

    let (status, folder) = post_json(
        &server,
        "/api/create-item",
        r#"{"path":".","name":"archive","type":"directory"}"#,
    );
    assert_eq!(status, 200);
    assert_eq!(str_at(&folder, "message"), "Folder \"archive\" created");
    assert!(dir.join("archive").is_dir());

    let (status, conflict) = post_json(&server, "/api/create-item", r#"{"name":"archive"}"#);
    assert_eq!(status, 409);
    assert_eq!(str_at(&conflict, "message"), "\"archive\" already exists");
    assert_eq!(
        post_json(&server, "/api/create-item", r#"{"name":"../x"}"#).0,
        400
    );

    let (status, saved) = post_json(
        &server,
        "/api/save-file",
        r##"{"path":"README.md","content":"# Changed\r\nline"}"##,
    );
    assert_eq!(status, 200);
    assert_eq!(str_at(&saved, "message"), "File saved");
    assert_eq!(
        std::fs::read_to_string(dir.join("README.md")).unwrap(),
        "# Changed\nline\n"
    );
    assert_eq!(
        post_json(&server, "/api/save-file", r#"{"path":"README.md"}"#).0,
        400
    );

    let (status, renamed) = post_json(
        &server,
        "/api/rename-item",
        r#"{"path":"docs/notes.txt","newName":"todo.txt"}"#,
    );
    assert_eq!(status, 200);
    assert_eq!(str_at(&renamed, "path"), "docs/todo.txt");
    assert!(dir.join("docs/todo.txt").is_file());
    let (status, taken) = post_json(
        &server,
        "/api/rename-item",
        r#"{"path":"docs/todo.txt","newName":"guide.md"}"#,
    );
    assert_eq!(status, 409);
    assert_eq!(str_at(&taken, "message"), "\"guide.md\" already exists");

    let (status, copied) = post_json(
        &server,
        "/api/copy-items",
        r#"{"paths":["docs","file2.txt","nope.txt",5],"targetPath":"archive"}"#,
    );
    assert_eq!(status, 200);
    assert_eq!(str_at(&copied, "message"), "Copied 2 items, 2 failed");
    assert_eq!(str_at(&copied, "errors.1.path"), "5");
    assert_eq!(
        std::fs::read_to_string(dir.join("archive/docs/guide.md")).unwrap(),
        "# Guide\n"
    );
    let (_, conflicts) = post_json(
        &server,
        "/api/copy-items",
        r#"{"paths":["file2.txt"],"targetPath":"archive"}"#,
    );
    assert_eq!(str_at(&conflicts, "message"), "1 already exist");
    assert_eq!(str_at(&conflicts, "conflicts.0"), "file2.txt");
    let (_, into_itself) = post_json(
        &server,
        "/api/copy-items",
        r#"{"paths":["archive"],"targetPath":"archive/docs"}"#,
    );
    assert_eq!(
        str_at(&into_itself, "errors.0.message"),
        "Cannot place a folder inside itself"
    );
    assert_eq!(
        post_json(
            &server,
            "/api/copy-items",
            r#"{"paths":["x"],"targetPath":"../up"}"#
        )
        .0,
        400
    );

    let (status, moved) = post_json(
        &server,
        "/api/move-items",
        r#"{"paths":["file10.txt"],"targetPath":"archive"}"#,
    );
    assert_eq!(status, 200);
    assert_eq!(str_at(&moved, "message"), "Moved 1 item");
    assert!(!dir.join("file10.txt").exists());
    assert!(dir.join("archive/file10.txt").is_file());
    let (_, overwritten) = post_json(
        &server,
        "/api/move-items",
        r#"{"paths":["file2.txt"],"targetPath":"archive","overwrite":true}"#,
    );
    assert_eq!(str_at(&overwritten, "message"), "Moved 1 item");

    let (_, not_empty) = post_json(&server, "/api/delete-items", r#"{"paths":["archive"]}"#);
    assert_eq!(at(&not_empty, "ok"), &Value::Bool(false));
    assert_eq!(str_at(&not_empty, "notEmpty.0"), "archive");
    assert_eq!(str_at(&not_empty, "message"), "1 folder(s) not empty");
    let (_, deleted) = post_json(
        &server,
        "/api/delete-items",
        r#"{"paths":["archive","page.html"],"recursive":true}"#,
    );
    assert_eq!(str_at(&deleted, "message"), "Deleted 2 items");
    assert!(!dir.join("archive").exists());
    assert_eq!(
        post_json(&server, "/api/delete-items", r#"{"paths":[]}"#).0,
        400
    );

    let invalid = server.post_json("/api/save-file", "{nope");
    assert_eq!(invalid.status, 500);
    assert_eq!(at(&parse(&invalid), "ok"), &Value::Bool(false));
}

#[test]
fn uploads_and_pastes_files() {
    let dir = sample_directory();
    let server = Server::start(&dir);

    let response = server.post_multipart(
        "/api/upload-files",
        &[
            ("path", None, b"docs"),
            ("files", Some("photos/2024/a.png"), b"png-bytes"),
            ("files", Some("b.txt"), b"line\r\n"),
            ("files", Some("../escape.txt"), b"nope"),
        ],
    );
    assert_eq!(response.status, 200);
    let uploaded = parse(&response);
    assert_eq!(
        str_at(&uploaded, "message"),
        "Uploaded 2 files, 1 folder, 1 failed"
    );
    assert_eq!(at(&uploaded, "ok"), &Value::Bool(false));
    assert_eq!(
        std::fs::read(dir.join("docs/photos/2024/a.png")).unwrap(),
        b"png-bytes"
    );
    assert_eq!(std::fs::read(dir.join("docs/b.txt")).unwrap(), b"line\r\n");
    assert!(!dir.join("escape.txt").exists());

    let none = server.post_multipart("/api/upload-files", &[("path", None, b".")]);
    assert_eq!(none.status, 400);

    let pasted = server.post_multipart(
        "/api/paste-content",
        &[
            ("path", None, b"docs"),
            ("filename", None, b"shot.png"),
            ("file", Some("shot.png"), b"\x89PNG"),
        ],
    );
    assert_eq!(pasted.status, 200);
    assert_eq!(str_at(&parse(&pasted), "path"), "docs/shot.png");
    assert_eq!(
        std::fs::read(dir.join("docs/shot.png")).unwrap(),
        b"\x89PNG"
    );
    let again = server.post_multipart(
        "/api/paste-content",
        &[
            ("path", None, b"docs"),
            ("filename", None, b"shot.png"),
            ("file", Some("shot.png"), b"x"),
        ],
    );
    assert_eq!(again.status, 409);
    let invalid = server.post_multipart(
        "/api/paste-content",
        &[("filename", None, b"../x.png"), ("file", Some("x"), b"x")],
    );
    assert_eq!(invalid.status, 400);
}

#[test]
fn downloads_files_and_archives() {
    let dir = sample_directory();
    let server = Server::start(&dir);

    let file = server.get("/api/download-item?path=docs%2Fguide.md&type=file");
    assert_eq!(file.status, 200);
    assert_eq!(file.header("content-type"), Some("text/markdown"));
    assert_eq!(
        file.header("content-disposition"),
        Some("attachment; filename=\"guide.md\"")
    );
    assert_eq!(file.text(), "# Guide\n");

    let folder = server.get("/api/download-item?path=docs&type=directory");
    assert_eq!(folder.status, 200);
    assert_eq!(folder.header("content-type"), Some("application/zip"));
    assert_eq!(
        folder.header("content-disposition"),
        Some("attachment; filename=\"docs.zip\"")
    );
    let entries = unzip(&folder.body);
    let entry_names: Vec<&str> = entries.iter().map(|(name, _)| name.as_str()).collect();
    assert_eq!(entry_names, ["guide.md", "index.html"]);
    assert_eq!(entries[0].1, b"# Guide\n");

    assert_eq!(
        server.get("/api/download-item?path=docs&type=x").status,
        400
    );
    assert_eq!(
        server.get("/api/download-item?path=nope&type=file").status,
        404
    );
    assert_eq!(server.get("/api/download-item?type=file").status, 400);

    let bulk = server.request(
        "POST",
        "/api/download-items",
        &[("Content-Type", "application/x-www-form-urlencoded")],
        b"paths=docs&paths=README.md&paths=..%2Fx",
    );
    assert_eq!(bulk.status, 200);
    assert_eq!(
        bulk.header("content-disposition"),
        Some("attachment; filename=\"download.zip\"")
    );
    let entry_names: Vec<String> = unzip(&bulk.body)
        .into_iter()
        .map(|(name, _)| name)
        .collect();
    assert_eq!(
        entry_names,
        ["docs/guide.md", "docs/index.html", "README.md"]
    );

    let single = server.request(
        "POST",
        "/api/download-items",
        &[("Content-Type", "application/x-www-form-urlencoded")],
        b"paths=media",
    );
    assert_eq!(
        single.header("content-disposition"),
        Some("attachment; filename=\"media.zip\"")
    );
    assert_eq!(unzip(&single.body)[0].0, "media/clip.mp4");

    let nothing = server.request(
        "POST",
        "/api/download-items",
        &[("Content-Type", "application/x-www-form-urlencoded")],
        b"paths=missing",
    );
    assert_eq!(nothing.status, 400);
}

#[test]
fn serves_thumbnails() {
    let dir = sample_directory();
    write(&dir, "icon.svg", "<svg/>");
    write(&dir, "photo.webp", "webp");
    let server = Server::start(&dir);

    let svg = server.get("/api/thumbnail?path=icon.svg");
    assert_eq!(svg.status, 200);
    assert_eq!(svg.header("content-type"), Some("image/svg+xml"));
    assert_eq!(svg.header("cache-control"), Some("public, max-age=3600"));
    assert_eq!(
        server
            .get("/api/thumbnail?path=photo.webp")
            .header("content-type"),
        Some("image/webp")
    );
    assert_eq!(server.get("/api/thumbnail?path=README.md").status, 400);
    assert_eq!(server.get("/api/thumbnail?path=docs").status, 400);
    assert_eq!(server.get("/api/thumbnail?path=nope.png").status, 404);
    assert_eq!(server.get("/api/thumbnail").status, 400);
}

#[test]
fn searches_files() {
    let dir = sample_directory();
    write(&dir, ".git/config", "ignored");
    let server = Server::start(&dir);

    let (status, result) = get_json(&server, "/api/search?q=guide");
    assert_eq!(status, 200);
    assert_eq!(str_at(&result, "query"), "guide");
    assert_eq!(at(&result, "total"), &Value::Number(1.0));
    assert_eq!(at(&result, "indexedCount"), &Value::Number(9.0));
    assert_eq!(at(&result, "truncated"), &Value::Bool(false));
    assert_eq!(str_at(&result, "results.0.path"), "docs/guide.md");
    assert_eq!(str_at(&result, "results.0.kind"), "text");
    assert_eq!(at(&result, "results.0.isMarkdown"), &Value::Bool(true));
    assert_eq!(
        at(&result, "results.0.positions"),
        &Value::Array((5..10).map(|n| Value::Number(n as f64)).collect())
    );

    let (_, empty) = get_json(&server, "/api/search?q=");
    assert_eq!(at(&empty, "total"), &Value::Number(0.0));
    let (_, missing) = get_json(&server, "/api/search?q=config");
    assert_eq!(at(&missing, "total"), &Value::Number(0.0));

    post_json(
        &server,
        "/api/create-item",
        r#"{"path":"docs","name":"guidelines.txt","type":"file"}"#,
    );
    let (_, refreshed) = get_json(&server, "/api/search?q=guide");
    assert_eq!(at(&refreshed, "total"), &Value::Number(2.0));
}

#[test]
fn reports_no_repository_outside_git() {
    let dir = sample_directory();
    let server = Server::start(&dir);
    for target in [
        "/api/git/summary",
        "/api/git/status",
        "/api/git/log",
        "/api/git/diff?all",
        "/api/git/compare?from=a&to=b",
    ] {
        let (status, body) = get_json(&server, target);
        assert_eq!(status, 200, "{target}");
        assert_eq!(at(&body, "repository"), &Value::Null, "{target}");
    }
}

#[test]
fn integrates_with_git() {
    let repo = temp_dir("repo");
    init_repository(&repo);
    write(&repo, "src/main.rs", "fn main() {}\n");
    write(&repo, "src/old.rs", "old\n");
    write(&repo, "src/gone/a.rs", "a\n");
    write(&repo, "docs/readme.md", "# Docs\n");
    git(&repo, &["add", "."]);
    git(&repo, &["commit", "--quiet", "-m", "Initial commit"]);
    let first = git(&repo, &["rev-parse", "HEAD"]).trim().to_string();
    write(&repo, "src/main.rs", "fn main() {\n    run();\n}\n");
    git(&repo, &["commit", "--quiet", "-am", "Run things"]);
    let second = git(&repo, &["rev-parse", "HEAD"]).trim().to_string();

    write(
        &repo,
        "src/main.rs",
        "fn main() {\n    run();\n    stop();\n}\n",
    );
    write(&repo, "src/new.rs", "new\n");
    git(&repo, &["mv", "src/old.rs", "src/renamed.rs"]);
    git(&repo, &["rm", "--quiet", "-r", "src/gone"]);
    write(&repo, "docs/readme.md", "# Docs changed\n");

    let server = Server::start(&repo.join("src"));

    let (_, summary) = get_json(&server, "/api/git/summary");
    assert_eq!(str_at(&summary, "repository.branch"), "main");
    assert_eq!(at(&summary, "repository.isDetached"), &Value::Bool(false));
    assert_eq!(at(&summary, "repository.hasCommits"), &Value::Bool(true));
    assert_eq!(at(&summary, "repository.changeCount"), &Value::Number(4.0));
    assert_eq!(
        at(&summary, "repository.worktrees.0.isCurrent"),
        &Value::Bool(true)
    );
    assert_eq!(str_at(&summary, "repository.worktrees.0.label"), "main");

    let (_, status) = get_json(&server, "/api/git/status");
    assert_eq!(str_at(&status, "scopePath"), "src");
    assert_eq!(at(&status, "changeCount"), &Value::Number(4.0));
    let staged: Vec<(&str, &str)> = match at(&status, "staged") {
        Value::Array(items) => items
            .iter()
            .map(|item| (str_at(item, "displayPath"), str_at(item, "statusCode")))
            .collect(),
        _ => panic!("staged"),
    };
    assert_eq!(staged, [("renamed.rs", "R"), ("gone/a.rs", "D")]);
    assert_eq!(str_at(&status, "unstaged.0.servedPath"), "main.rs");
    assert_eq!(at(&status, "unstaged.0.canDiff"), &Value::Bool(true));
    assert_eq!(str_at(&status, "untracked.0.path"), "src/new.rs");
    assert_eq!(at(&status, "untracked.0.canDiff"), &Value::Bool(false));
    assert_eq!(str_at(&status, "recentCommits.0.subject"), "Run things");
    assert_eq!(str_at(&status, "staged.0.originalDisplayPath"), "old.rs");

    let (_, listing) = get_json(&server, "/api/entries");
    let entries: Vec<(&str, &Value, bool)> = match at(&listing, "entries") {
        Value::Array(items) => items
            .iter()
            .map(|item| {
                (
                    str_at(item, "name"),
                    at(item, "gitStatus"),
                    at(item, "isDeleted") == &Value::Bool(true),
                )
            })
            .collect(),
        _ => panic!("entries"),
    };
    assert_eq!(
        entries,
        [
            ("gone", &Value::from("deleted"), true),
            ("main.rs", &Value::from("modified"), false),
            ("new.rs", &Value::from("added"), false),
            ("renamed.rs", &Value::from("renamed"), false),
        ]
    );

    let (_, file_diff) = get_json(&server, "/api/git/diff?path=main.rs");
    assert_eq!(str_at(&file_diff, "title"), "main.rs");
    assert_eq!(str_at(&file_diff, "back"), "files");
    assert_eq!(str_at(&file_diff, "files.0.servedPath"), "main.rs");
    assert_eq!(at(&file_diff, "files.0.added"), &Value::Number(1.0));
    assert_eq!(at(&file_diff, "files.0.removed"), &Value::Number(0.0));
    assert_eq!(
        str_at(&file_diff, "files.0.hunks.0.lines.2.content"),
        "    stop();"
    );

    let (_, unstaged) = get_json(&server, "/api/git/diff?path=main.rs&mode=unstaged");
    assert_eq!(str_at(&unstaged, "back"), "status");
    let (_, staged_diff) = get_json(&server, "/api/git/diff?staged");
    assert_eq!(str_at(&staged_diff, "title"), "Staged changes");
    assert_eq!(str_at(&staged_diff, "files.0.path"), "gone/a.rs");
    assert_eq!(at(&staged_diff, "files.0.servedPath"), &Value::Null);
    let (_, all) = get_json(&server, "/api/git/diff?all");
    assert_eq!(str_at(&all, "subtitle"), "All uncommitted changes");

    let (_, commit_diff) = get_json(&server, &format!("/api/git/diff?commit={second}"));
    assert_eq!(str_at(&commit_diff, "title"), "Run things");
    assert_eq!(str_at(&commit_diff, "commit.author"), "Ada");
    assert_eq!(str_at(&commit_diff, "files.0.path"), "src/main.rs");
    assert_eq!(str_at(&commit_diff, "files.0.servedPath"), "main.rs");
    assert_eq!(
        get_json(&server, "/api/git/diff?commit=--output%3D%2Ftmp%2Fx").0,
        404
    );
    assert_eq!(get_json(&server, "/api/git/diff").0, 400);

    let (_, history) = get_json(&server, "/api/git/log");
    assert_eq!(str_at(&history, "commits.0.hash"), second);
    assert_eq!(str_at(&history, "commits.1.hash"), first);
    assert_eq!(at(&history, "hasMore"), &Value::Bool(false));
    assert_eq!(at(&history, "scopePath"), &Value::Null);
    let (_, file_history) = get_json(&server, "/api/git/log?path=main.rs&skip=1");
    assert_eq!(str_at(&file_history, "scopePath"), "main.rs");
    assert_eq!(str_at(&file_history, "commits.0.subject"), "Initial commit");

    let (_, compare) = get_json(
        &server,
        &format!("/api/git/compare?from={first}&to={second}"),
    );
    assert_eq!(str_at(&compare, "from.commit.subject"), "Initial commit");
    assert_eq!(str_at(&compare, "changes.0.status"), "modified");
    assert_eq!(at(&compare, "changes.0.added"), &Value::Number(3.0));
    assert_eq!(str_at(&compare, "files.0.servedPath"), "main.rs");
    assert_eq!(get_json(&server, "/api/git/compare?from=a").0, 400);
    assert_eq!(
        get_json(&server, "/api/git/compare?from=nope&to=HEAD").0,
        404
    );
}

#[test]
fn switches_worktrees() {
    let repo = temp_dir("worktree-repo");
    init_repository(&repo);
    write(&repo, "src/lib.rs", "lib\n");
    git(&repo, &["add", "."]);
    git(&repo, &["commit", "--quiet", "-m", "Initial commit"]);
    let other = repo.with_file_name(format!(
        "{}-feature",
        repo.file_name().unwrap().to_string_lossy()
    ));
    let other_path = other.to_string_lossy().into_owned();
    git(
        &repo,
        &["worktree", "add", "--quiet", "-b", "feature", &other_path],
    );
    write(&other, "src/feature.rs", "feature\n");

    let server = Server::start(&repo.join("src"));
    let (_, summary) = get_json(&server, "/api/git/summary");
    assert_eq!(str_at(&summary, "repository.worktrees.1.label"), "feature");

    let body = format!(
        r#"{{"path":"{}","currentPath":"."}}"#,
        other_path.replace('\\', "\\\\")
    );
    let (status, switched) = post_json(&server, "/api/git/switch-worktree", &body);
    assert_eq!(status, 200, "{switched:?}");
    assert_eq!(str_at(&switched, "message"), "Switched to feature");
    assert_eq!(
        str_at(&switched, "directory"),
        other.join("src").to_string_lossy()
    );
    let (_, listing) = get_json(&server, "/api/entries");
    assert_eq!(names(&listing, "entries"), ["feature.rs", "lib.rs"]);
    assert_eq!(server.get("/feature.rs").text(), "feature\n");

    let (status, unknown) = post_json(
        &server,
        "/api/git/switch-worktree",
        r#"{"path":"/nowhere"}"#,
    );
    assert_eq!(status, 400);
    assert_eq!(str_at(&unknown, "message"), "Unknown worktree");
}

#[test]
fn remembers_the_port_and_prints_the_version() {
    let dir = temp_dir("cli");
    let home = temp_dir("cli-home");

    let version = support::run_rfm(&dir, &home, &["--version"]);
    assert_eq!(
        String::from_utf8_lossy(&version.stdout).trim(),
        format!("rfm {}", env!("CARGO_PKG_VERSION"))
    );
    let help = support::run_rfm(&dir, &home, &["--help"]);
    assert!(String::from_utf8_lossy(&help.stdout).contains("--port"));

    let server = Server::start(&dir);
    let settings = std::fs::read_to_string(server.home.join(".config/rfm/settings.json")).unwrap();
    assert_eq!(settings.trim(), format!("{{\"port\":{}}}", server.port));
}
