//! Test harness: starts the compiled `rfm` in a temporary directory with an
//! isolated home and talks to it over plain HTTP/1.1.

#![allow(dead_code)]

use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Output, Stdio};
use std::sync::atomic::{AtomicUsize, Ordering};
use std::time::{Duration, Instant};

/// A fresh, empty directory in the system temporary directory, outside of
/// any git repository.
pub fn temp_dir(name: &str) -> PathBuf {
    static COUNTER: AtomicUsize = AtomicUsize::new(0);
    let dir = std::env::temp_dir().join("rfm-tests").join(format!(
        "{name}-{}-{}",
        std::process::id(),
        COUNTER.fetch_add(1, Ordering::Relaxed)
    ));
    if dir.exists() {
        std::fs::remove_dir_all(&dir).expect("failed to clear temp dir");
    }
    std::fs::create_dir_all(&dir).expect("failed to create temp dir");
    dir.canonicalize().expect("temp dir path")
}

pub fn write(dir: &Path, path: &str, content: &str) {
    let target = dir.join(path);
    std::fs::create_dir_all(target.parent().expect("parent")).expect("create parent");
    std::fs::write(target, content).expect("write file");
}

pub fn rfm_command(cwd: &Path, home: &Path) -> Command {
    let mut command = Command::new(env!("CARGO_BIN_EXE_rfm"));
    command
        .current_dir(cwd)
        .env("HOME", home)
        .env("XDG_CONFIG_HOME", home.join(".config"))
        .env("XDG_CACHE_HOME", home.join(".cache"))
        .env("RFM_NO_UPDATE_CHECK", "1")
        .env("NO_COLOR", "1")
        .stdin(Stdio::null());
    command
}

pub fn run_rfm(cwd: &Path, home: &Path, args: &[&str]) -> Output {
    rfm_command(cwd, home)
        .args(args)
        .output()
        .expect("failed to run rfm")
}

pub fn git(dir: &Path, args: &[&str]) -> String {
    let output = Command::new("git")
        .args(args)
        .current_dir(dir)
        .env("GIT_AUTHOR_NAME", "Ada")
        .env("GIT_AUTHOR_EMAIL", "ada@example.com")
        .env("GIT_COMMITTER_NAME", "Ada")
        .env("GIT_COMMITTER_EMAIL", "ada@example.com")
        .env("GIT_CONFIG_NOSYSTEM", "1")
        .env("HOME", dir)
        .output()
        .expect("failed to run git");
    assert!(
        output.status.success(),
        "git {args:?} failed: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    String::from_utf8_lossy(&output.stdout).into_owned()
}

pub fn init_repository(dir: &Path) {
    git(dir, &["init", "--quiet", "--initial-branch=main"]);
    git(dir, &["config", "commit.gpgsign", "false"]);
}

pub struct Server {
    child: Child,
    pub port: u16,
    pub home: PathBuf,
}

impl Drop for Server {
    fn drop(&mut self) {
        let _ = self.child.kill();
        let _ = self.child.wait();
    }
}

fn free_port() -> u16 {
    TcpListener::bind("127.0.0.1:0")
        .and_then(|listener| listener.local_addr())
        .map(|address| address.port())
        .expect("no free port")
}

impl Server {
    /// Serves `dir` on a free port.
    pub fn start(dir: &Path) -> Server {
        let home = temp_dir("home");
        let port = free_port();
        let child = rfm_command(dir, &home)
            .args(["--port", &port.to_string()])
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .spawn()
            .expect("failed to start rfm");
        let server = Server { child, port, home };
        let deadline = Instant::now() + Duration::from_secs(10);
        while TcpStream::connect(("127.0.0.1", port)).is_err() {
            assert!(Instant::now() < deadline, "rfm did not start");
            std::thread::sleep(Duration::from_millis(20));
        }
        server
    }

    pub fn request(
        &self,
        method: &str,
        target: &str,
        headers: &[(&str, &str)],
        body: &[u8],
    ) -> Response {
        let mut stream = TcpStream::connect(("127.0.0.1", self.port)).expect("connect");
        stream
            .set_read_timeout(Some(Duration::from_secs(30)))
            .expect("timeout");
        let mut head = format!(
            "{method} {target} HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\nContent-Length: {}\r\n",
            body.len()
        );
        for (name, value) in headers {
            head.push_str(&format!("{name}: {value}\r\n"));
        }
        head.push_str("\r\n");
        stream.write_all(head.as_bytes()).expect("write head");
        stream.write_all(body).expect("write body");
        let mut raw = Vec::new();
        stream.read_to_end(&mut raw).expect("read response");
        Response::parse(&raw)
    }

    pub fn get(&self, target: &str) -> Response {
        self.request("GET", target, &[], b"")
    }

    pub fn post_json(&self, target: &str, body: &str) -> Response {
        self.request(
            "POST",
            target,
            &[("Content-Type", "application/json")],
            body.as_bytes(),
        )
    }

    /// Posts `multipart/form-data` with `(name, filename, content)` parts.
    pub fn post_multipart(&self, target: &str, parts: &[(&str, Option<&str>, &[u8])]) -> Response {
        let boundary = "----rfm-test-boundary";
        let mut body = Vec::new();
        for (name, filename, content) in parts {
            body.extend(format!("--{boundary}\r\n").as_bytes());
            match filename {
                Some(filename) => body.extend(
                    format!(
                        "Content-Disposition: form-data; name=\"{name}\"; filename=\"{filename}\"\r\n\
                         Content-Type: application/octet-stream\r\n\r\n"
                    )
                    .as_bytes(),
                ),
                None => body.extend(
                    format!("Content-Disposition: form-data; name=\"{name}\"\r\n\r\n").as_bytes(),
                ),
            }
            body.extend(*content);
            body.extend(b"\r\n");
        }
        body.extend(format!("--{boundary}--\r\n").as_bytes());
        let content_type = format!("multipart/form-data; boundary={boundary}");
        self.request("POST", target, &[("Content-Type", &content_type)], &body)
    }
}

pub struct Response {
    pub status: u16,
    pub headers: Vec<(String, String)>,
    pub body: Vec<u8>,
}

fn find(haystack: &[u8], needle: &[u8]) -> Option<usize> {
    haystack
        .windows(needle.len())
        .position(|window| window == needle)
}

impl Response {
    fn parse(raw: &[u8]) -> Response {
        let head_end = find(raw, b"\r\n\r\n").expect("response head");
        let head = String::from_utf8_lossy(&raw[..head_end]);
        let mut lines = head.split("\r\n");
        let status = lines
            .next()
            .and_then(|line| line.split(' ').nth(1))
            .and_then(|code| code.parse().ok())
            .expect("status");
        let headers: Vec<(String, String)> = lines
            .filter_map(|line| line.split_once(':'))
            .map(|(name, value)| (name.trim().to_ascii_lowercase(), value.trim().to_string()))
            .collect();
        let mut body = raw[head_end + 4..].to_vec();
        let is_chunked = headers
            .iter()
            .any(|(name, value)| name == "transfer-encoding" && value == "chunked");
        if is_chunked {
            let mut decoded = Vec::new();
            let mut rest = body.as_slice();
            loop {
                let line_end = find(rest, b"\r\n").expect("chunk size");
                let size = usize::from_str_radix(
                    std::str::from_utf8(&rest[..line_end]).expect("size"),
                    16,
                )
                .expect("hex size");
                rest = &rest[line_end + 2..];
                if size == 0 {
                    break;
                }
                decoded.extend(&rest[..size]);
                rest = &rest[size + 2..];
            }
            body = decoded;
        }
        Response {
            status,
            headers,
            body,
        }
    }

    pub fn header(&self, name: &str) -> Option<&str> {
        self.headers
            .iter()
            .find(|(key, _)| key == name)
            .map(|(_, value)| value.as_str())
    }

    pub fn text(&self) -> String {
        String::from_utf8_lossy(&self.body).into_owned()
    }
}

fn u16_at(bytes: &[u8], offset: usize) -> usize {
    u16::from_le_bytes([bytes[offset], bytes[offset + 1]]) as usize
}

fn u32_at(bytes: &[u8], offset: usize) -> u32 {
    u32::from_le_bytes(bytes[offset..offset + 4].try_into().expect("u32"))
}

/// Entries of a ZIP archive as `(name, content)`, CRCs verified.
pub fn unzip(archive: &[u8]) -> Vec<(String, Vec<u8>)> {
    let end = archive.len() - 22;
    assert_eq!(
        u32_at(archive, end),
        0x0605_4b50,
        "end of central directory"
    );
    let count = u16_at(archive, end + 10);
    let mut offset = u32_at(archive, end + 16) as usize;
    let mut entries = Vec::new();
    for _ in 0..count {
        assert_eq!(u32_at(archive, offset), 0x0201_4b50, "central header");
        let crc = u32_at(archive, offset + 16);
        let compressed_size = u32_at(archive, offset + 20) as usize;
        let name_length = u16_at(archive, offset + 28);
        let extra_length = u16_at(archive, offset + 30);
        let comment_length = u16_at(archive, offset + 32);
        let local = u32_at(archive, offset + 42) as usize;
        let name = String::from_utf8(archive[offset + 46..offset + 46 + name_length].to_vec())
            .expect("utf-8 name");
        let data = local + 30 + u16_at(archive, local + 26) + u16_at(archive, local + 28);
        let mut content = Vec::new();
        flate2::read::DeflateDecoder::new(&archive[data..data + compressed_size])
            .read_to_end(&mut content)
            .expect("inflate");
        let mut check = flate2::Crc::new();
        check.update(&content);
        assert_eq!(check.sum(), crc, "crc of {name}");
        entries.push((name, content));
        offset += 46 + name_length + extra_length + comment_length;
    }
    entries
}
