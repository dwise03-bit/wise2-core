#!/usr/bin/env bash
# Build and deploy Command Center with PWA on the VPS. Run as dwise from repo root.
set -euo pipefail

REPO="${WISE2_REPO_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$REPO"

COMPOSE="${WISE2_COMPOSE_COMMAND:-compose.command-center.yml}"

echo "Building Command Center..."
docker compose -f "$COMPOSE" build command-center 2>/dev/null \
  || docker-compose -f "$COMPOSE" build command-center

echo "Starting Command Center..."
docker compose -f "$COMPOSE" up -d command-center 2>/dev/null \
  || docker-compose -f "$COMPOSE" up -d command-center

echo "Health check (localhost:3004)..."
sleep 3
code="$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3004/login || echo '000')"
echo "HTTP $code on /login"

if [[ "$code" == "200" ]]; then
  echo "Command Center is up. PWA manifest: http://127.0.0.1:3004/manifest.webmanifest"
else
  echo "Warning: unexpected status. Check: docker compose -f $COMPOSE logs command-center"
  exit 1
fi
