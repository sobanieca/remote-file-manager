//! File classification by name: kinds used for icons, text/binary detection
//! and content types.

const IMAGE_EXTENSIONS: &[&str] = &[
    ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg", ".tiff", ".tif", ".ico", ".avif",
];

const BINARY_EXTENSIONS: &[&str] = &[
    ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".ico", ".tiff", ".webp", ".avif", ".mp3", ".mp4",
    ".avi", ".mov", ".mkv", ".webm", ".wmv", ".flv", ".m4v", ".wav", ".flac", ".ogg", ".aac",
    ".m4a", ".opus", ".wma", ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".zip",
    ".rar", ".7z", ".tar", ".gz", ".exe", ".bin", ".dll", ".so",
];

const EXTENSIONS_BY_KIND: &[(&str, &[&str])] = &[
    ("image", IMAGE_EXTENSIONS),
    (
        "video",
        &[
            ".mp4", ".avi", ".mov", ".mkv", ".webm", ".wmv", ".flv", ".m4v",
        ],
    ),
    (
        "audio",
        &[
            ".mp3", ".wav", ".flac", ".ogg", ".aac", ".m4a", ".opus", ".wma",
        ],
    ),
    (
        "archive",
        &[
            ".zip", ".rar", ".7z", ".tar", ".gz", ".bz2", ".xz", ".zst", ".tgz", ".jar",
        ],
    ),
    ("pdf", &[".pdf"]),
    (
        "document",
        &[".doc", ".docx", ".odt", ".rtf", ".ppt", ".pptx", ".odp"],
    ),
    ("spreadsheet", &[".xls", ".xlsx", ".ods", ".csv", ".tsv"]),
    (
        "code",
        &[
            ".js",
            ".mjs",
            ".cjs",
            ".jsx",
            ".ts",
            ".mts",
            ".cts",
            ".tsx",
            ".json",
            ".jsonc",
            ".html",
            ".htm",
            ".xml",
            ".vue",
            ".svelte",
            ".css",
            ".scss",
            ".sass",
            ".less",
            ".yml",
            ".yaml",
            ".toml",
            ".ini",
            ".cfg",
            ".conf",
            ".sh",
            ".bash",
            ".zsh",
            ".fish",
            ".ps1",
            ".py",
            ".go",
            ".rs",
            ".java",
            ".kt",
            ".swift",
            ".cs",
            ".c",
            ".h",
            ".cpp",
            ".cc",
            ".cxx",
            ".hpp",
            ".php",
            ".rb",
            ".pl",
            ".lua",
            ".r",
            ".sql",
            ".graphql",
            ".proto",
            ".tf",
            ".dockerfile",
        ],
    ),
    (
        "text",
        &[
            ".txt",
            ".md",
            ".markdown",
            ".rst",
            ".log",
            ".env",
            ".gitignore",
        ],
    ),
];

const KIND_BY_FILENAME: &[(&str, &str)] = &[
    ("dockerfile", "code"),
    ("containerfile", "code"),
    ("makefile", "code"),
    ("readme", "text"),
    ("license", "text"),
];

/// The lower-cased extension including the leading dot, `""` without one.
pub fn extension(filename: &str) -> String {
    match filename.rfind('.') {
        Some(index) => filename[index..].to_lowercase(),
        None => String::new(),
    }
}

pub fn is_markdown(filename: &str) -> bool {
    extension(filename) == ".md"
}

pub fn is_image(filename: &str) -> bool {
    IMAGE_EXTENSIONS.contains(&extension(filename).as_str())
}

/// Binary files are not editable or diffable.
pub fn is_binary(filename: &str) -> bool {
    BINARY_EXTENSIONS.contains(&extension(filename).as_str())
}

pub fn is_text(filename: &str) -> bool {
    !is_binary(filename)
}

pub fn is_executable_mode(mode: u32) -> bool {
    mode & 0o111 != 0
}

/// A broad kind such as "image", "code" or "file".
pub fn kind(filename: &str) -> &'static str {
    let lower_case_name = filename.to_lowercase();
    if let Some((_, kind)) = KIND_BY_FILENAME
        .iter()
        .find(|(name, _)| *name == lower_case_name)
    {
        return kind;
    }
    let extension = extension(&lower_case_name);
    EXTENSIONS_BY_KIND
        .iter()
        .find(|(_, extensions)| extensions.contains(&extension.as_str()))
        .map_or("file", |(kind, _)| kind)
}

const MIME_TYPES: &[(&str, &str)] = &[
    ("aac", "audio/aac"),
    ("avi", "video/x-msvideo"),
    ("avif", "image/avif"),
    ("bin", "application/octet-stream"),
    ("bmp", "image/bmp"),
    ("css", "text/css"),
    ("csv", "text/csv"),
    ("eot", "application/vnd.ms-fontobject"),
    ("flac", "audio/flac"),
    ("gif", "image/gif"),
    ("gz", "application/gzip"),
    ("htm", "text/html"),
    ("html", "text/html"),
    ("ico", "image/x-icon"),
    ("ics", "text/calendar"),
    ("jpeg", "image/jpeg"),
    ("jpg", "image/jpeg"),
    ("js", "text/javascript"),
    ("json", "application/json"),
    ("jsonld", "application/ld+json"),
    ("m4a", "audio/mp4"),
    ("map", "application/json"),
    ("md", "text/markdown"),
    ("mid", "audio/x-midi"),
    ("midi", "audio/x-midi"),
    ("mjs", "text/javascript"),
    ("mov", "video/quicktime"),
    ("mp3", "audio/mpeg"),
    ("mp4", "video/mp4"),
    ("mpeg", "video/mpeg"),
    ("oga", "audio/ogg"),
    ("ogg", "audio/ogg"),
    ("ogv", "video/ogg"),
    ("opus", "audio/opus"),
    ("otf", "font/otf"),
    ("pdf", "application/pdf"),
    ("png", "image/png"),
    ("rtf", "application/rtf"),
    ("svg", "image/svg+xml"),
    ("tar", "application/x-tar"),
    ("tif", "image/tiff"),
    ("tiff", "image/tiff"),
    ("ttf", "font/ttf"),
    ("txt", "text/plain"),
    ("wasm", "application/wasm"),
    ("wav", "audio/wav"),
    ("weba", "audio/webm"),
    ("webm", "video/webm"),
    ("webmanifest", "application/manifest+json"),
    ("webp", "image/webp"),
    ("woff", "font/woff"),
    ("woff2", "font/woff2"),
    ("xhtml", "application/xhtml+xml"),
    ("xml", "application/xml"),
    ("zip", "application/zip"),
];

/// The content type of a statically served file, `text/*` types in UTF-8.
pub fn static_content_type(filename: &str) -> String {
    let extension = extension(filename);
    let extension = extension.trim_start_matches('.');
    match MIME_TYPES.iter().find(|(known, _)| *known == extension) {
        Some((_, mime)) if mime.starts_with("text/") => format!("{mime}; charset=utf-8"),
        Some((_, mime)) => mime.to_string(),
        None => "application/octet-stream".to_string(),
    }
}

/// The content type of a file downloaded as an attachment.
pub fn download_content_type(filename: &str) -> &'static str {
    match extension(filename).as_str() {
        ".html" => "text/html",
        ".css" => "text/css",
        ".js" => "application/javascript",
        ".json" => "application/json",
        ".txt" => "text/plain",
        ".md" => "text/markdown",
        ".xml" => "application/xml",
        ".pdf" => "application/pdf",
        ".png" => "image/png",
        ".jpg" | ".jpeg" => "image/jpeg",
        ".gif" => "image/gif",
        ".svg" => "image/svg+xml",
        ".zip" => "application/zip",
        ".mp3" => "audio/mpeg",
        ".mp4" => "video/mp4",
        _ => "application/octet-stream",
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn classifies_files() {
        assert_eq!(kind("Dockerfile"), "code");
        assert_eq!(kind("photo.JPG"), "image");
        assert_eq!(kind("notes.md"), "text");
        assert_eq!(kind("archive.tar.gz"), "archive");
        assert_eq!(kind("unknown"), "file");
        assert!(is_markdown("README.MD"));
        assert!(is_binary("movie.mp4"));
        assert!(is_text("main.rs"));
        assert!(is_executable_mode(0o100755));
        assert!(!is_executable_mode(0o100644));
    }

    #[test]
    fn resolves_content_types() {
        assert_eq!(
            static_content_type("index.html"),
            "text/html; charset=utf-8"
        );
        assert_eq!(static_content_type("a.png"), "image/png");
        assert_eq!(static_content_type("a.unknown"), "application/octet-stream");
        assert_eq!(download_content_type("a.JPEG"), "image/jpeg");
    }
}
