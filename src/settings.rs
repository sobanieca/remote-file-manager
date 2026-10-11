//! Settings remembered between runs, stored in
//! `$XDG_CONFIG_HOME/rfm/settings.json` (default `~/.config/rfm`).

use crate::json::{self, Object, Value};
use std::path::PathBuf;

pub fn home_dir() -> Option<PathBuf> {
    std::env::var_os("HOME")
        .filter(|home| !home.is_empty())
        .map(PathBuf::from)
}

fn settings_file() -> Option<PathBuf> {
    let base = std::env::var_os("XDG_CONFIG_HOME")
        .filter(|dir| !dir.is_empty())
        .map(PathBuf::from)
        .or_else(|| home_dir().map(|home| home.join(".config")))?;
    Some(base.join("rfm").join("settings.json"))
}

fn read_settings() -> Object {
    settings_file()
        .and_then(|path| std::fs::read_to_string(path).ok())
        .and_then(|text| json::parse(&text).ok())
        .and_then(|value| match value {
            Value::Object(object) => Some(object),
            _ => None,
        })
        .unwrap_or_default()
}

fn write_settings(settings: &Object) -> Result<(), String> {
    let path =
        settings_file().ok_or_else(|| "No home directory to store settings in".to_string())?;
    if let Some(dir) = path.parent() {
        std::fs::create_dir_all(dir).map_err(|err| format!("{}: {err}", dir.display()))?;
    }
    let text = json::stringify(&Value::Object(settings.clone()));
    std::fs::write(&path, format!("{text}\n")).map_err(|err| format!("{}: {err}", path.display()))
}

pub fn saved_port() -> Option<u16> {
    match read_settings().get("port") {
        Some(Value::Number(port)) if *port >= 1.0 && *port <= 65535.0 => Some(*port as u16),
        _ => None,
    }
}

pub fn save_port(port: Option<u16>) -> Result<(), String> {
    let mut settings = read_settings();
    settings.insert("port", port.map(u32::from));
    write_settings(&settings)
}
