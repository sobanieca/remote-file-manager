//! Parses unified diffs produced by git into files, hunks and lines.

use crate::json::{Object, Value};
use crate::object;

pub enum DiffLine {
    Added {
        content: String,
        new_line: u64,
    },
    Removed {
        content: String,
        old_line: u64,
    },
    Context {
        content: String,
        old_line: u64,
        new_line: u64,
    },
    Note {
        content: String,
    },
}

impl DiffLine {
    fn to_object(&self) -> Object {
        match self {
            DiffLine::Added { content, new_line } => object! {
                "type" => "added",
                "content" => content.clone(),
                "newLineNumber" => *new_line,
            },
            DiffLine::Removed { content, old_line } => object! {
                "type" => "removed",
                "content" => content.clone(),
                "oldLineNumber" => *old_line,
            },
            DiffLine::Context {
                content,
                old_line,
                new_line,
            } => object! {
                "type" => "context",
                "content" => content.clone(),
                "oldLineNumber" => *old_line,
                "newLineNumber" => *new_line,
            },
            DiffLine::Note { content } => object! {
                "type" => "note",
                "content" => content.clone(),
            },
        }
    }
}

pub struct Hunk {
    pub range: String,
    pub heading: String,
    pub lines: Vec<DiffLine>,
}

pub struct DiffFile {
    pub path: String,
    pub original_path: Option<String>,
    pub status: &'static str,
    pub is_binary: bool,
    pub hunks: Vec<Hunk>,
    pub added: u64,
    pub removed: u64,
}

impl DiffFile {
    fn new(path: &str) -> DiffFile {
        DiffFile {
            path: path.to_string(),
            original_path: None,
            status: "modified",
            is_binary: false,
            hunks: Vec::new(),
            added: 0,
            removed: 0,
        }
    }

    pub fn to_object(&self) -> Object {
        let hunks: Vec<Value> = self
            .hunks
            .iter()
            .map(|hunk| {
                let lines: Vec<Value> = hunk
                    .lines
                    .iter()
                    .map(|line| line.to_object().into())
                    .collect();
                object! {
                    "range" => hunk.range.clone(),
                    "heading" => hunk.heading.clone(),
                    "lines" => lines,
                }
                .into()
            })
            .collect();
        object! {
            "path" => self.path.clone(),
            "originalPath" => self.original_path.clone(),
            "status" => self.status,
            "isBinary" => self.is_binary,
            "hunks" => hunks,
            "added" => self.added,
            "removed" => self.removed,
        }
    }
}

struct HunkHeader {
    range: String,
    old_line: u64,
    new_line: u64,
    heading: String,
}

fn take_digits(text: &str) -> Option<(&str, &str)> {
    let end = text
        .find(|c: char| !c.is_ascii_digit())
        .unwrap_or(text.len());
    (end > 0).then(|| text.split_at(end))
}

/// `-start[,count] +start[,count]`, returning the starts and the rest.
fn parse_range(text: &str) -> Option<(u64, u64, &str)> {
    let rest = text.strip_prefix('-')?;
    let (old_start, mut rest) = take_digits(rest)?;
    if let Some(count) = rest.strip_prefix(',') {
        rest = take_digits(count)?.1;
    }
    let rest = rest.strip_prefix(" +")?;
    let (new_start, mut rest) = take_digits(rest)?;
    if let Some(count) = rest.strip_prefix(',') {
        rest = take_digits(count)?.1;
    }
    Some((old_start.parse().ok()?, new_start.parse().ok()?, rest))
}

/// `@@ -1,2 +1,3 @@ heading` (or `@@@` for combined diffs).
fn parse_hunk_header(line: &str) -> Option<HunkHeader> {
    let opening = line.find(|c: char| c != '@').filter(|&count| count >= 2)?;
    let after_opening = line[opening..].strip_prefix(' ')?;
    let (old_line, new_line, rest) = parse_range(after_opening)?;
    let range = &after_opening[..after_opening.len() - rest.len()];
    let rest = rest.strip_prefix(' ')?;
    let closing = rest.find(|c: char| c != '@').unwrap_or(rest.len());
    if closing < 2 {
        return None;
    }
    Some(HunkHeader {
        range: range.to_string(),
        old_line,
        new_line,
        heading: rest[closing..].trim().to_string(),
    })
}

/// `diff --git a/<original> b/<target>`, splitting at the last ` b/` that
/// leaves a target.
fn parse_git_header_paths(line: &str) -> Option<(String, String)> {
    let rest = line.strip_prefix("diff --git a/")?;
    rest.match_indices(" b/")
        .map(|(index, _)| index)
        .filter(|&index| index > 0 && index + 3 < rest.len())
        .last()
        .map(|index| (rest[..index].to_string(), rest[index + 3..].to_string()))
}

pub fn parse_diff(diff_text: &str) -> Vec<DiffFile> {
    let mut files: Vec<DiffFile> = Vec::new();
    let mut has_hunk = false;
    let mut old_line = 0;
    let mut new_line = 0;

    let text = diff_text.strip_suffix('\n').unwrap_or(diff_text);
    for line in text.split('\n') {
        if let Some((original, target)) = parse_git_header_paths(line) {
            let mut file = DiffFile::new(&target);
            if original != target {
                file.original_path = Some(original);
            }
            files.push(file);
            has_hunk = false;
            continue;
        }
        let Some(file) = files.last_mut() else {
            continue;
        };
        if line.starts_with("new file mode") {
            file.status = "added";
            continue;
        }
        if line.starts_with("deleted file mode") {
            file.status = "deleted";
            continue;
        }
        if let Some(original) = line.strip_prefix("rename from ") {
            file.status = "renamed";
            file.original_path = Some(original.to_string());
            continue;
        }
        if let Some(target) = line.strip_prefix("rename to ") {
            file.status = "renamed";
            file.path = target.to_string();
            continue;
        }
        if line.starts_with("Binary files ") || line.starts_with("GIT binary ") {
            file.is_binary = true;
            continue;
        }
        if line.starts_with("--- ") || line.starts_with("+++ ") {
            let path = &line[4..];
            if path != "/dev/null" && line.starts_with("+++ ") {
                let stripped = path
                    .strip_prefix("a/")
                    .or_else(|| path.strip_prefix("b/"))
                    .unwrap_or(path);
                file.path = stripped.to_string();
            }
            continue;
        }
        if let Some(header) = parse_hunk_header(line) {
            file.hunks.push(Hunk {
                range: header.range,
                heading: header.heading,
                lines: Vec::new(),
            });
            has_hunk = true;
            old_line = header.old_line;
            new_line = header.new_line;
            continue;
        }
        if !has_hunk {
            continue;
        }
        let Some(hunk) = file.hunks.last_mut() else {
            continue;
        };
        if line.starts_with('\\') {
            hunk.lines.push(DiffLine::Note {
                content: line.get(2..).unwrap_or_default().to_string(),
            });
            continue;
        }
        let mut chars = line.chars();
        let marker = chars.next();
        let content = chars.as_str().to_string();
        match marker {
            Some('+') => {
                hunk.lines.push(DiffLine::Added { content, new_line });
                new_line += 1;
                file.added += 1;
            }
            Some('-') => {
                hunk.lines.push(DiffLine::Removed { content, old_line });
                old_line += 1;
                file.removed += 1;
            }
            Some(' ') | None => {
                hunk.lines.push(DiffLine::Context {
                    content,
                    old_line,
                    new_line,
                });
                old_line += 1;
                new_line += 1;
            }
            _ => {}
        }
    }
    files
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::json::stringify;

    #[test]
    fn parses_hunk_headers() {
        let header = parse_hunk_header("@@ -1,4 +1,5 @@ fn main() {").unwrap();
        assert_eq!(header.range, "-1,4 +1,5");
        assert_eq!((header.old_line, header.new_line), (1, 1));
        assert_eq!(header.heading, "fn main() {");
        let header = parse_hunk_header("@@ -0,0 +1 @@").unwrap();
        assert_eq!(header.range, "-0,0 +1");
        assert_eq!(header.heading, "");
        assert!(parse_hunk_header("@@ nope @@").is_none());
    }

    #[test]
    fn parses_header_paths() {
        assert_eq!(
            parse_git_header_paths("diff --git a/x b/y b/x b/y"),
            Some(("x b/y b/x".to_string(), "y".to_string()))
        );
        assert_eq!(
            parse_git_header_paths("diff --git a/src/a b/c.rs b/src/a b/c.rs"),
            Some(("src/a b/c.rs b/src/a".to_string(), "c.rs".to_string()))
        );
    }

    #[test]
    fn parses_diffs() {
        let diff = "diff --git a/src/a.rs b/src/a.rs\n\
                    index 1..2 100644\n\
                    --- a/src/a.rs\n\
                    +++ b/src/a.rs\n\
                    @@ -1,3 +1,3 @@ fn a()\n \
                    keep\n\
                    -old\n\
                    +new\n\
                    \\ No newline at end of file\n\
                    diff --git a/old.txt b/new.txt\n\
                    similarity index 100%\n\
                    rename from old.txt\n\
                    rename to new.txt\n\
                    diff --git a/img.png b/img.png\n\
                    new file mode 100644\n\
                    Binary files /dev/null and b/img.png differ\n";
        let files = parse_diff(diff);
        assert_eq!(files.len(), 3);
        assert_eq!(
            stringify(&files[0].to_object().into()),
            r#"{"path":"src/a.rs","originalPath":null,"status":"modified","isBinary":false,"hunks":[{"range":"-1,3 +1,3","heading":"fn a()","lines":[{"type":"context","content":"keep","oldLineNumber":1,"newLineNumber":1},{"type":"removed","content":"old","oldLineNumber":2},{"type":"added","content":"new","newLineNumber":2},{"type":"note","content":"No newline at end of file"}]}],"added":1,"removed":1}"#
        );
        assert_eq!(files[1].status, "renamed");
        assert_eq!(files[1].original_path.as_deref(), Some("old.txt"));
        assert_eq!(files[1].path, "new.txt");
        assert_eq!(files[2].status, "added");
        assert!(files[2].is_binary);
    }
}
