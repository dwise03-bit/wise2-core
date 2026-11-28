# WISE² Rust Messaging
Initial loopback-only gateway scaffold for #280. No message transport or encryption implemented yet.
Run cargo test and cargo run from this directory. GET http://127.0.0.1:8097/healthz.
Next: integrate a Matrix homeserver and client SDK, device verification, authenticated sessions, and isolated Telnyx bridge. Never decrypt private rooms for Hermes without explicit user authorization. Do not expose this scaffold publicly.
