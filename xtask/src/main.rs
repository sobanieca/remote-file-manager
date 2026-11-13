//! Development tasks, run through the cargo aliases in `.cargo/config.toml`:
//!
//! - `cargo verify`: formatting, lints and tests (run before committing)
//! - `cargo build-ui`: builds `ui/` with imp into `ui/dist`, which `build.rs`
//!   embeds into the server
//! - `cargo dev`: builds the UI and serves `test/`

use std::path::{Path, PathBuf};
use std::process::{Command, ExitCode};

fn root() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .expect("workspace root")
        .to_path_buf()
}

fn is_package_variable_of_xtask(name: &str) -> bool {
    name.starts_with("CARGO_PKG_")
        || name.starts_with("CARGO_MANIFEST_")
        || matches!(
            name,
            "CARGO_CRATE_NAME" | "CARGO_BIN_NAME" | "CARGO_PRIMARY_PACKAGE"
        )
}

fn cargo(args: &[&str], cwd: &Path) -> bool {
    println!("> cargo {}", args.join(" "));
    let cargo = std::env::var("CARGO").unwrap_or_else(|_| "cargo".to_string());
    let mut command = Command::new(cargo);
    for (name, _) in std::env::vars_os() {
        if name.to_str().is_some_and(is_package_variable_of_xtask) {
            command.env_remove(name);
        }
    }
    command
        .args(args)
        .current_dir(cwd)
        .status()
        .is_ok_and(|status| status.success())
}

fn imp_build() -> bool {
    println!("> imp build --env prod");
    match Command::new("imp")
        .args(["build", "--env", "prod"])
        .current_dir(root().join("ui"))
        .status()
    {
        Ok(status) => status.success(),
        Err(err) => {
            eprintln!("Failed to run imp: {err}");
            false
        }
    }
}

fn main() -> ExitCode {
    let task = std::env::args().nth(1).unwrap_or_default();
    let root = root();
    let ok = match task.as_str() {
        "verify" => {
            cargo(&["fmt", "--all", "--check"], &root)
                && cargo(
                    &[
                        "clippy",
                        "--workspace",
                        "--all-targets",
                        "--",
                        "-D",
                        "warnings",
                    ],
                    &root,
                )
                && cargo(&["test", "--workspace"], &root)
        }
        "build-ui" => imp_build(),
        "dev" => imp_build() && cargo(&["run", "--quiet", "--package", "rfm"], &root.join("test")),
        _ => {
            eprintln!("Usage: cargo xtask <verify|build-ui|dev>");
            false
        }
    };
    if ok {
        ExitCode::SUCCESS
    } else {
        ExitCode::FAILURE
    }
}
