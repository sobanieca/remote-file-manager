//! Embeds the imp build of `ui/` (`ui/dist`) into the binary as `UI_ASSETS`.
//! Run `cargo build-ui` (or `imp build --env prod` in `ui/`) before building.

use std::fs;
use std::path::{Path, PathBuf};

const IMP_OUTPUT_MARKER: &str = ".imp-output";

fn collect(dir: &Path, files: &mut Vec<PathBuf>) {
    let Ok(entries) = fs::read_dir(dir) else {
        return;
    };
    for entry in entries.flatten() {
        let path = entry.path();
        if entry.file_name() == IMP_OUTPUT_MARKER {
            continue;
        }
        if path.is_dir() {
            collect(&path, files);
        } else if path.is_file() {
            files.push(path);
        }
    }
}

fn main() {
    let manifest = PathBuf::from(std::env::var("CARGO_MANIFEST_DIR").unwrap());
    let dist = manifest.join("ui").join("dist");
    println!("cargo:rerun-if-changed=ui/dist");
    let mut files = Vec::new();
    collect(&dist, &mut files);
    files.sort();
    if !files.iter().any(|file| file == &dist.join("index.html")) {
        println!(
            "cargo:warning=No UI build in ui/dist - run `cargo build-ui` to embed the user interface"
        );
    }
    let mut code = String::from("pub const UI_ASSETS: &[(&str, &[u8])] = &[\n");
    for file in &files {
        println!("cargo:rerun-if-changed={}", file.display());
        let relative = file
            .strip_prefix(&dist)
            .unwrap()
            .to_string_lossy()
            .replace('\\', "/");
        code.push_str(&format!(
            "    ({relative:?}, include_bytes!({:?})),\n",
            file.display().to_string()
        ));
    }
    code.push_str("];\n");
    let out = PathBuf::from(std::env::var("OUT_DIR").unwrap()).join("ui_assets.rs");
    fs::write(out, code).unwrap();
}
