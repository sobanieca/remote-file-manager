//! Percent encoding with the semantics of `encodeURIComponent` and
//! `decodeURIComponent`.

fn hex_value(byte: u8) -> Option<u8> {
    match byte {
        b'0'..=b'9' => Some(byte - b'0'),
        b'a'..=b'f' => Some(byte - b'a' + 10),
        b'A'..=b'F' => Some(byte - b'A' + 10),
        _ => None,
    }
}

fn decode_bytes(input: &str, plus_as_space: bool) -> Option<Vec<u8>> {
    let bytes = input.as_bytes();
    let mut out = Vec::with_capacity(bytes.len());
    let mut index = 0;
    while index < bytes.len() {
        match bytes[index] {
            b'%' => {
                let high = bytes.get(index + 1).copied().and_then(hex_value)?;
                let low = bytes.get(index + 2).copied().and_then(hex_value)?;
                out.push(high << 4 | low);
                index += 3;
            }
            b'+' if plus_as_space => {
                out.push(b' ');
                index += 1;
            }
            byte => {
                out.push(byte);
                index += 1;
            }
        }
    }
    Some(out)
}

/// `decodeURIComponent`: `None` for malformed escapes or invalid UTF-8.
pub fn decode_component(input: &str) -> Option<String> {
    String::from_utf8(decode_bytes(input, false)?).ok()
}

/// Decodes a path, keeping it as is when it is malformed.
pub fn decode_path(input: &str) -> String {
    decode_component(input).unwrap_or_else(|| input.to_string())
}

/// Decodes a query string or `application/x-www-form-urlencoded` component.
pub fn decode_form_component(input: &str) -> String {
    match decode_bytes(input, true) {
        Some(bytes) => String::from_utf8_lossy(&bytes).into_owned(),
        None => input.replace('+', " "),
    }
}

/// Splits `a=1&b=2` into decoded pairs.
pub fn parse_form(input: &str) -> Vec<(String, String)> {
    input
        .split('&')
        .filter(|pair| !pair.is_empty())
        .map(|pair| {
            let (name, value) = pair.split_once('=').unwrap_or((pair, ""));
            (decode_form_component(name), decode_form_component(value))
        })
        .collect()
}

/// `encodeURIComponent`.
pub fn encode_component(input: &str) -> String {
    let mut out = String::with_capacity(input.len());
    for byte in input.bytes() {
        if byte.is_ascii_alphanumeric() || b"-_.!~*'()".contains(&byte) {
            out.push(byte as char);
        } else {
            out.push_str(&format!("%{byte:02X}"));
        }
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn encodes_like_encode_uri_component() {
        assert_eq!(encode_component("a b/c#d?é"), "a%20b%2Fc%23d%3F%C3%A9");
        assert_eq!(encode_component("(x)!*'~._-"), "(x)!*'~._-");
    }

    #[test]
    fn decodes_components() {
        assert_eq!(decode_component("a%20b%2Fc%23").as_deref(), Some("a b/c#"));
        assert_eq!(decode_component("100%"), None);
        assert_eq!(decode_component("%C3"), None);
        assert_eq!(decode_path("100%"), "100%");
        assert_eq!(decode_form_component("a+b%2B"), "a b+");
    }

    #[test]
    fn parses_forms() {
        assert_eq!(
            parse_form("paths=a%2Fb&paths=c+d&empty="),
            vec![
                ("paths".to_string(), "a/b".to_string()),
                ("paths".to_string(), "c d".to_string()),
                ("empty".to_string(), String::new()),
            ]
        );
    }
}
