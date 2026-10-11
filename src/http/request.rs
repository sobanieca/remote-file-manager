use super::form_data::FormData;
use super::url;
use crate::json;

pub struct Request {
    pub method: String,
    /// The decoded path, e.g. `/docs/a b.md`.
    pub path: String,
    /// The query string without the leading `?`.
    pub raw_query: String,
    pub version: String,
    /// Header names are lower case.
    pub headers: Vec<(String, String)>,
    pub body: Vec<u8>,
}

impl Request {
    pub fn new(method: &str, target: &str, version: &str) -> Request {
        let (raw_path, raw_query) = target.split_once('?').unwrap_or((target, ""));
        Request {
            method: method.to_string(),
            path: url::decode_path(raw_path),
            raw_query: raw_query.to_string(),
            version: version.to_string(),
            headers: Vec::new(),
            body: Vec::new(),
        }
    }

    pub fn header(&self, name: &str) -> Option<&str> {
        self.headers
            .iter()
            .find(|(key, _)| key == name)
            .map(|(_, value)| value.as_str())
    }

    /// The first value of a query parameter, `Some("")` for `?name`.
    pub fn query(&self, name: &str) -> Option<String> {
        url::parse_form(&self.raw_query)
            .into_iter()
            .find(|(key, _)| key == name)
            .map(|(_, value)| value)
    }

    /// A query parameter that is present and not empty.
    pub fn query_value(&self, name: &str) -> Option<String> {
        self.query(name).filter(|value| !value.is_empty())
    }

    pub fn keep_alive(&self) -> bool {
        let connection = self.header("connection").unwrap_or_default();
        let has_token = |token: &str| {
            connection
                .split(',')
                .any(|part| part.trim().eq_ignore_ascii_case(token))
        };
        if self.version == "HTTP/1.0" {
            has_token("keep-alive")
        } else {
            !has_token("close")
        }
    }

    /// The body parsed as a JSON object.
    pub fn json(&self) -> Result<json::Object, String> {
        let text = std::str::from_utf8(&self.body).map_err(|err| err.to_string())?;
        match json::parse(text)? {
            json::Value::Object(object) => Ok(object),
            _ => Err("Expected a JSON object".to_string()),
        }
    }

    pub fn form_data(&self) -> Result<FormData, String> {
        FormData::parse(self.header("content-type").unwrap_or_default(), &self.body)
    }
}
