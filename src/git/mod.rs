//! Git integration. Every query runs the `git` executable and returns `None`
//! when git is missing, the directory is not a repository or the command
//! fails.

pub mod command;
pub mod diff;
pub mod diff_parser;
pub mod log;
pub mod status;
pub mod worktree;
