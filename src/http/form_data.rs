//! `multipart/form-data` and `application/x-www-form-urlencoded` bodies.

use super::url;

pub struct FormField {
    pub name: String,
    pub filename: Option<String>,
    pub data: Vec<u8>,
}

impl FormField {
    pub fn text(&self) -> String {
        String::from_utf8_lossy(&self.data).into_owned()
    }
}

pub struct FormData {
    fields: Vec<FormField>,
}

impl FormData {
    pub fn parse(content_type: &str, body: &[u8]) -> Result<FormData, String> {
        let essence = content_type
            .split(';')
            .next()
            .unwrap_or_default()
            .trim()
            .to_ascii_lowercase();
        match essence.as_str() {
            "multipart/form-data" => {
                let boundary = parameter(content_type, "boundary")
                    .filter(|boundary| !boundary.is_empty())
                    .ok_or_else(|| "Missing boundary in multipart/form-data".to_string())?;
                parse_multipart(body, &boundary).map(|fields| FormData { fields })
            }
            "application/x-www-form-urlencoded" => {
                let fields = url::parse_form(&String::from_utf8_lossy(body))
                    .into_iter()
                    .map(|(name, value)| FormField {
                        name,
                        filename: None,
                        data: value.into_bytes(),
                    })
                    .collect();
                Ok(FormData { fields })
            }
            _ => Err(
                "Content-Type is not multipart/form-data or application/x-www-form-urlencoded"
                    .to_string(),
            ),
        }
    }

    pub fn get(&self, name: &str) -> Option<&FormField> {
        self.fields.iter().find(|field| field.name == name)
    }

    pub fn get_all<'a>(&'a self, name: &'a str) -> impl Iterator<Item = &'a FormField> + 'a {
        self.fields.iter().filter(move |field| field.name == name)
    }

    /// `formData.get(name)` as a non-empty string.
    pub fn text(&self, name: &str) -> Option<String> {
        self.get(name)
            .map(FormField::text)
            .filter(|text| !text.is_empty())
    }
}

/// Splits `a; b="c; d"; e=f` at semicolons outside quotes.
fn split_parameters(header: &str) -> Vec<&str> {
    let mut parts = Vec::new();
    let mut start = 0;
    let mut quoted = false;
    let mut escaped = false;
    for (index, c) in header.char_indices() {
        match c {
            _ if escaped => escaped = false,
            '\\' if quoted => escaped = true,
            '"' => quoted = !quoted,
            ';' if !quoted => {
                parts.push(&header[start..index]);
                start = index + 1;
            }
            _ => {}
        }
    }
    parts.push(&header[start..]);
    parts
}

fn unquote(value: &str) -> String {
    let value = value.trim();
    let Some(inner) = value
        .strip_prefix('"')
        .and_then(|rest| rest.strip_suffix('"'))
    else {
        return value.to_string();
    };
    let mut out = String::with_capacity(inner.len());
    let mut chars = inner.chars();
    while let Some(c) = chars.next() {
        if c == '\\' {
            if let Some(next) = chars.next() {
                out.push(next);
            }
        } else {
            out.push(c);
        }
    }
    out
}

fn parameter(header: &str, name: &str) -> Option<String> {
    split_parameters(header)
        .into_iter()
        .skip(1)
        .find_map(|part| {
            let (key, value) = part.split_once('=')?;
            key.trim()
                .eq_ignore_ascii_case(name)
                .then(|| unquote(value))
        })
}

/// Browsers escape `"`, CR and LF in field and file names.
fn decode_name(name: &str) -> String {
    name.replace("%22", "\"")
        .replace("%0D", "\r")
        .replace("%0A", "\n")
}

fn find(haystack: &[u8], needle: &[u8], from: usize) -> Option<usize> {
    let first = *needle.first()?;
    let mut index = from;
    while index + needle.len() <= haystack.len() {
        let offset = haystack[index..].iter().position(|&byte| byte == first)?;
        index += offset;
        if haystack.get(index..index + needle.len()) == Some(needle) {
            return Some(index);
        }
        index += 1;
    }
    None
}

fn parse_multipart(body: &[u8], boundary: &str) -> Result<Vec<FormField>, String> {
    let malformed = || "Malformed multipart/form-data body".to_string();
    let delimiter = format!("--{boundary}");
    let delimiter = delimiter.as_bytes();
    let separator = [b"\r\n".as_slice(), delimiter].concat();

    let mut position = find(body, delimiter, 0).ok_or_else(malformed)? + delimiter.len();
    let mut fields = Vec::new();
    loop {
        if body[position..].starts_with(b"--") {
            return Ok(fields);
        }
        while matches!(body.get(position), Some(b' ' | b'\t')) {
            position += 1;
        }
        if !body[position..].starts_with(b"\r\n") {
            return Err(malformed());
        }
        position += 2;

        let headers_end = find(body, b"\r\n\r\n", position).ok_or_else(malformed)?;
        let headers = String::from_utf8_lossy(&body[position..headers_end]);
        let content_start = headers_end + 4;
        let content_end = find(body, &separator, content_start).ok_or_else(malformed)?;

        let disposition = headers
            .split("\r\n")
            .find_map(|line| {
                let (name, value) = line.split_once(':')?;
                name.trim()
                    .eq_ignore_ascii_case("content-disposition")
                    .then(|| value.trim().to_string())
            })
            .unwrap_or_default();
        if let Some(name) = parameter(&disposition, "name") {
            fields.push(FormField {
                name: decode_name(&name),
                filename: parameter(&disposition, "filename").map(|name| decode_name(&name)),
                data: body[content_start..content_end].to_vec(),
            });
        }
        position = content_end + separator.len();
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_multipart_bodies() {
        let body = b"--XyZ\r\n\
            Content-Disposition: form-data; name=\"path\"\r\n\r\n\
            docs\r\n\
            --XyZ\r\n\
            Content-Disposition: form-data; name=\"files\"; filename=\"a; %22b%22/c.txt\"\r\n\
            Content-Type: text/plain\r\n\r\n\
            line 1\r\nline 2\r\n\
            --XyZ--\r\n";
        let form = FormData::parse("multipart/form-data; boundary=XyZ", body).unwrap();
        assert_eq!(form.text("path").as_deref(), Some("docs"));
        let file = form.get("files").unwrap();
        assert_eq!(file.filename.as_deref(), Some("a; \"b\"/c.txt"));
        assert_eq!(file.data, b"line 1\r\nline 2");
        assert_eq!(form.get_all("files").count(), 1);
    }

    #[test]
    fn parses_urlencoded_bodies() {
        let form =
            FormData::parse("application/x-www-form-urlencoded", b"paths=a%2Fb&paths=c").unwrap();
        let paths: Vec<String> = form.get_all("paths").map(FormField::text).collect();
        assert_eq!(paths, ["a/b", "c"]);
    }

    #[test]
    fn rejects_other_content_types() {
        assert!(FormData::parse("application/json", b"{}").is_err());
        assert!(FormData::parse("multipart/form-data; boundary=x", b"garbage").is_err());
    }
}
