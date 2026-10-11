use super::request::Request;
use super::response::{Body, Response, reason_phrase};
use std::io::{self, BufRead, BufReader, BufWriter, Read, Write};
use std::net::{TcpListener, TcpStream};
use std::panic::AssertUnwindSafe;
use std::time::Duration;

const IDLE_TIMEOUT: Duration = Duration::from_secs(120);
const MAX_LINE_LENGTH: u64 = 64 * 1024;
const MAX_HEADER_COUNT: usize = 200;
const STREAM_BUFFER_SIZE: usize = 64 * 1024;

pub type Handler = fn(&Request) -> Response;

/// Serves every connection on its own thread.
pub fn serve(listener: TcpListener, handler: Handler) {
    for stream in listener.incoming().flatten() {
        std::thread::spawn(move || handle_connection(stream, handler));
    }
}

enum ReadError {
    Closed,
    Bad(u16, &'static str),
}

impl From<io::Error> for ReadError {
    fn from(_: io::Error) -> Self {
        ReadError::Closed
    }
}

fn handle_connection(stream: TcpStream, handler: Handler) {
    let _ = stream.set_read_timeout(Some(IDLE_TIMEOUT));
    let _ = stream.set_nodelay(true);
    let Ok(mut writer) = stream.try_clone() else {
        return;
    };
    let mut reader = BufReader::new(stream);
    loop {
        let request = match read_request(&mut reader, &mut writer) {
            Ok(request) => request,
            Err(ReadError::Closed) => return,
            Err(ReadError::Bad(status, message)) => {
                let response = Response::text(status, message);
                let _ = write_response(&mut writer, response, false, false);
                return;
            }
        };
        let keep_alive = request.keep_alive();
        let is_head = request.method == "HEAD";
        let response = std::panic::catch_unwind(AssertUnwindSafe(|| handler(&request)))
            .unwrap_or_else(|_| Response::text(500, "Internal Server Error"));
        if write_response(&mut writer, response, is_head, keep_alive).is_err() || !keep_alive {
            return;
        }
    }
}

fn read_line(reader: &mut impl BufRead) -> Result<String, ReadError> {
    let mut line = Vec::new();
    reader
        .by_ref()
        .take(MAX_LINE_LENGTH)
        .read_until(b'\n', &mut line)?;
    if line.is_empty() {
        return Err(ReadError::Closed);
    }
    if line.last() != Some(&b'\n') {
        return Err(ReadError::Bad(431, "Request header is too long"));
    }
    line.pop();
    if line.last() == Some(&b'\r') {
        line.pop();
    }
    Ok(String::from_utf8_lossy(&line).into_owned())
}

fn read_request(
    reader: &mut BufReader<TcpStream>,
    writer: &mut TcpStream,
) -> Result<Request, ReadError> {
    let mut request_line = read_line(reader)?;
    while request_line.is_empty() {
        request_line = read_line(reader)?;
    }
    let mut parts = request_line.split_whitespace();
    let (Some(method), Some(target), Some(version)) = (parts.next(), parts.next(), parts.next())
    else {
        return Err(ReadError::Bad(400, "Bad Request"));
    };
    if !version.starts_with("HTTP/1.") {
        return Err(ReadError::Bad(400, "Unsupported HTTP version"));
    }
    let target = match target.find("://") {
        Some(scheme_end) => {
            let rest = &target[scheme_end + 3..];
            rest.find('/').map_or("/", |index| &rest[index..])
        }
        None => target,
    };
    let mut request = Request::new(method, target, version);

    loop {
        let line = read_line(reader)?;
        if line.is_empty() {
            break;
        }
        if request.headers.len() >= MAX_HEADER_COUNT {
            return Err(ReadError::Bad(431, "Too many request headers"));
        }
        let Some((name, value)) = line.split_once(':') else {
            return Err(ReadError::Bad(400, "Malformed request header"));
        };
        request
            .headers
            .push((name.trim().to_ascii_lowercase(), value.trim().to_string()));
    }

    if request
        .header("expect")
        .is_some_and(|expect| expect.eq_ignore_ascii_case("100-continue"))
    {
        writer.write_all(b"HTTP/1.1 100 Continue\r\n\r\n")?;
    }

    let is_chunked = request
        .header("transfer-encoding")
        .is_some_and(|encoding| encoding.to_ascii_lowercase().contains("chunked"));
    if is_chunked {
        request.body = read_chunked_body(reader)?;
    } else if let Some(length) = request.header("content-length") {
        let length: u64 = length
            .parse()
            .map_err(|_| ReadError::Bad(400, "Invalid Content-Length"))?;
        let mut body = Vec::new();
        reader.by_ref().take(length).read_to_end(&mut body)?;
        if body.len() as u64 != length {
            return Err(ReadError::Closed);
        }
        request.body = body;
    }
    Ok(request)
}

fn read_chunked_body(reader: &mut BufReader<TcpStream>) -> Result<Vec<u8>, ReadError> {
    let mut body = Vec::new();
    loop {
        let size_line = read_line(reader)?;
        let size = size_line.split(';').next().unwrap_or_default().trim();
        let size =
            u64::from_str_radix(size, 16).map_err(|_| ReadError::Bad(400, "Invalid chunk size"))?;
        if size == 0 {
            while !read_line(reader)?.is_empty() {}
            return Ok(body);
        }
        let start = body.len();
        reader.by_ref().take(size).read_to_end(&mut body)?;
        if (body.len() - start) as u64 != size {
            return Err(ReadError::Closed);
        }
        read_line(reader)?;
    }
}

struct ChunkedWriter<'a> {
    inner: &'a mut dyn Write,
}

impl Write for ChunkedWriter<'_> {
    fn write(&mut self, buf: &[u8]) -> io::Result<usize> {
        if buf.is_empty() {
            return Ok(0);
        }
        write!(self.inner, "{:x}\r\n", buf.len())?;
        self.inner.write_all(buf)?;
        self.inner.write_all(b"\r\n")?;
        Ok(buf.len())
    }

    fn flush(&mut self) -> io::Result<()> {
        self.inner.flush()
    }
}

fn write_response(
    writer: &mut TcpStream,
    response: Response,
    is_head: bool,
    keep_alive: bool,
) -> io::Result<()> {
    let mut head = format!(
        "HTTP/1.1 {} {}\r\n",
        response.status,
        reason_phrase(response.status)
    );
    for (name, value) in &response.headers {
        head.push_str(&format!("{name}: {value}\r\n"));
    }
    let has_header = |name: &str| {
        response
            .headers
            .iter()
            .any(|(key, _)| key.eq_ignore_ascii_case(name))
    };
    let length = match &response.body {
        Body::Empty => Some(0),
        Body::Bytes(bytes) => Some(bytes.len() as u64),
        Body::Static(bytes) => Some(bytes.len() as u64),
        Body::File { length, .. } => Some(*length),
        Body::Stream(_) => None,
    };
    match length {
        Some(length) if !has_header("content-length") => {
            head.push_str(&format!("Content-Length: {length}\r\n"));
        }
        Some(_) => {}
        None => head.push_str("Transfer-Encoding: chunked\r\n"),
    }
    head.push_str(if keep_alive {
        "Connection: keep-alive\r\n\r\n"
    } else {
        "Connection: close\r\n\r\n"
    });

    let mut out = BufWriter::with_capacity(STREAM_BUFFER_SIZE, writer);
    out.write_all(head.as_bytes())?;
    if !is_head {
        match response.body {
            Body::Empty => {}
            Body::Bytes(bytes) => out.write_all(&bytes)?,
            Body::Static(bytes) => out.write_all(bytes)?,
            Body::File {
                mut file,
                start,
                length,
            } => {
                use std::io::Seek;
                file.seek(io::SeekFrom::Start(start))?;
                let copied = io::copy(&mut file.take(length), &mut out)?;
                if copied != length {
                    return Err(io::Error::new(
                        io::ErrorKind::UnexpectedEof,
                        "file is shorter than announced",
                    ));
                }
            }
            Body::Stream(stream) => {
                {
                    let mut chunked = BufWriter::with_capacity(
                        STREAM_BUFFER_SIZE,
                        ChunkedWriter { inner: &mut out },
                    );
                    stream(&mut chunked)?;
                    chunked.flush()?;
                }
                out.write_all(b"0\r\n\r\n")?;
            }
        }
    }
    out.flush()
}
