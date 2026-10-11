//! ANSI colors, disabled when `NO_COLOR` is set.

use std::sync::OnceLock;

fn enabled() -> bool {
    static ENABLED: OnceLock<bool> = OnceLock::new();
    *ENABLED.get_or_init(|| std::env::var_os("NO_COLOR").is_none_or(|v| v.is_empty()))
}

fn run(s: &str, open: &str, close: &str) -> String {
    if enabled() {
        format!("\x1b[{open}m{s}\x1b[{close}m")
    } else {
        s.to_string()
    }
}

pub fn bold(s: &str) -> String {
    run(s, "1", "22")
}

pub fn red(s: &str) -> String {
    run(s, "31", "39")
}

pub fn yellow(s: &str) -> String {
    run(s, "33", "39")
}

/// Removes ANSI escape sequences (`ESC [ ... letter`).
pub fn strip_ansi(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    let mut chars = s.chars().peekable();
    while let Some(c) = chars.next() {
        if c == '\x1b' && chars.peek() == Some(&'[') {
            chars.next();
            for next in chars.by_ref() {
                if next.is_ascii_alphabetic() {
                    break;
                }
            }
            continue;
        }
        out.push(c);
    }
    out
}
