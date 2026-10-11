//! A small HTTP/1.1 server built on `std::net`: keep-alive connections, one
//! thread per connection, `Content-Length` and chunked bodies, and responses
//! from memory, files (with ranges) or streams.

mod form_data;
mod request;
mod response;
mod server;
pub mod url;

pub use request::Request;
pub use response::{Body, Response};
pub use server::serve;
