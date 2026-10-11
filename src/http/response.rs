use crate::json;
use std::fs::File;
use std::io::{self, Write};

pub type StreamWriter = Box<dyn FnOnce(&mut dyn Write) -> io::Result<()> + Send>;

pub enum Body {
    Empty,
    Bytes(Vec<u8>),
    Static(&'static [u8]),
    File {
        file: File,
        start: u64,
        length: u64,
    },
    /// Written with chunked transfer encoding, the length is not known upfront.
    Stream(StreamWriter),
}

pub struct Response {
    pub status: u16,
    pub headers: Vec<(String, String)>,
    pub body: Body,
}

impl Response {
    pub fn new(status: u16, body: Body) -> Response {
        Response {
            status,
            headers: Vec::new(),
            body,
        }
    }

    pub fn json(status: u16, object: json::Object) -> Response {
        let body = json::stringify(&json::Value::Object(object)).into_bytes();
        Response::new(status, Body::Bytes(body)).header("Content-Type", "application/json")
    }

    pub fn text(status: u16, text: &str) -> Response {
        Response::new(status, Body::Bytes(text.as_bytes().to_vec()))
            .header("Content-Type", "text/plain; charset=UTF-8")
    }

    pub fn redirect(location: &str) -> Response {
        Response::new(302, Body::Empty).header("Location", location)
    }

    pub fn not_found() -> Response {
        Response::text(404, "404 Not Found")
    }

    pub fn header(mut self, name: &str, value: impl Into<String>) -> Response {
        self.headers.push((name.to_string(), value.into()));
        self
    }
}

pub fn reason_phrase(status: u16) -> &'static str {
    match status {
        100 => "Continue",
        200 => "OK",
        206 => "Partial Content",
        302 => "Found",
        304 => "Not Modified",
        400 => "Bad Request",
        404 => "Not Found",
        405 => "Method Not Allowed",
        409 => "Conflict",
        413 => "Payload Too Large",
        416 => "Range Not Satisfiable",
        431 => "Request Header Fields Too Large",
        500 => "Internal Server Error",
        503 => "Service Unavailable",
        _ => "",
    }
}
