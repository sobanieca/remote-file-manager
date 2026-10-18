mod app;
mod colors;
mod date;
mod endpoints;
mod file_kinds;
mod git;
mod http;
mod json;
mod paths;
mod search;
mod settings;
mod ui_assets;
mod update;
mod workspace;
mod zip;

use std::net::TcpListener;

pub const VERSION: &str = env!("CARGO_PKG_VERSION");
const DEFAULT_PORT: u16 = 4000;
const HELP_TEXT: &str = include_str!("help.txt");

/// `--port=N`, `--port N` or `-p N`. Invalid values fall back to the default.
fn requested_port(args: &[String]) -> Option<u16> {
    let mut port = None;
    let mut index = 0;
    while index < args.len() {
        let arg = &args[index];
        let value = if let Some(value) = arg.strip_prefix("--port=") {
            Some(value.to_string())
        } else if arg == "--port" || arg == "-p" {
            match args.get(index + 1) {
                Some(next) if !next.starts_with('-') => {
                    index += 1;
                    Some(next.clone())
                }
                _ => None,
            }
        } else {
            None
        };
        if let Some(value) = value {
            let parsed = endpoints::git_log::parse_int(&value)
                .and_then(|number| u16::try_from(number).ok())
                .filter(|number| *number > 0);
            port = Some(parsed.unwrap_or(DEFAULT_PORT));
        }
        index += 1;
    }
    port
}

fn resolve_port(args: &[String]) -> u16 {
    let Some(port) = requested_port(args) else {
        return match settings::saved_port().filter(|port| *port != DEFAULT_PORT) {
            Some(saved) => {
                println!("Using saved port: {saved}");
                saved
            }
            None => DEFAULT_PORT,
        };
    };
    let saved = if port == DEFAULT_PORT {
        settings::save_port(None).map(|()| "Default port used, removed saved port".to_string())
    } else {
        settings::save_port(Some(port)).map(|()| format!("Port {port} saved for future sessions"))
    };
    match saved {
        Ok(message) => println!("{message}"),
        Err(err) => eprintln!("Failed to save the port: {err}"),
    }
    port
}

fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();
    match args.first().map(String::as_str) {
        Some("update") => {
            if let Err(message) = update::execute() {
                eprintln!("{}", colors::red(&message));
                std::process::exit(1);
            }
            return;
        }
        Some("-v" | "-V" | "--version") => {
            println!("rfm {VERSION}");
            return;
        }
        Some("-h" | "--help" | "help") => {
            print!("{HELP_TEXT}");
            return;
        }
        _ => {}
    }

    println!(
        "{}",
        colors::bold(&format!("Remote File Manager v{VERSION}"))
    );
    let port = resolve_port(&args);
    let listener = match TcpListener::bind(("127.0.0.1", port)) {
        Ok(listener) => listener,
        Err(err) => {
            eprintln!(
                "{}",
                colors::red(&format!("Failed to listen on port {port}: {err}"))
            );
            std::process::exit(1);
        }
    };
    let working_dir = workspace::working_dir();
    println!("Remote File Manager server running at http://localhost:{port}");
    println!("Use --port or -p to change port (current: {port})");
    println!("Serving files from: {}", working_dir.display());
    println!(
        "File Explorer available at: http://localhost:{port}{}",
        endpoints::ui_app::UI_PREFIX
    );

    update::check_in_background();
    http::serve(listener, app::handle);
}

#[cfg(test)]
mod tests {
    use super::*;

    fn args(values: &[&str]) -> Vec<String> {
        values.iter().map(|value| value.to_string()).collect()
    }

    #[test]
    fn parses_port_arguments() {
        assert_eq!(requested_port(&args(&[])), None);
        assert_eq!(requested_port(&args(&["-p", "3000"])), Some(3000));
        assert_eq!(requested_port(&args(&["--port", "3001"])), Some(3001));
        assert_eq!(requested_port(&args(&["--port=3002"])), Some(3002));
        assert_eq!(requested_port(&args(&["--port=abc"])), Some(DEFAULT_PORT));
        assert_eq!(requested_port(&args(&["-p", "-x"])), None);
    }
}
