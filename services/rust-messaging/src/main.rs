use axum::{routing::get, Json, Router};
use serde_json::{json, Value};

async fn health() -> Json<Value> {
    Json(json!({"service":"wise2-messaging","status":"ok","messaging_ready":false}))
}

fn app() -> Router {
    Router::new().route("/healthz", get(health))
}

#[tokio::main]
async fn main() -> std::io::Result<()> {
    let listener = tokio::net::TcpListener::bind("127.0.0.1:8097").await?;
    axum::serve(listener, app()).await
}

#[cfg(test)]
mod tests {
    use super::*;
    #[tokio::test]
    async fn health_does_not_claim_messaging_ready() {
        assert_eq!(health().await.0["messaging_ready"], false);
    }
}
