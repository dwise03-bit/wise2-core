#!/usr/bin/env bash
# Build and deploy Command Center with PWA on the VPS. Run as dwise from repo root.
set -euo pipefail

REPO="${WISE2_REPO_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$REPO"

COMPOSE="${WISE2_COMPOSE_COMMAND:-compose.command-center.yml}"
NETWORK="${WISE2_DOCKER_NETWORK:-wise2-core_wise2}"

echo "Building Command Center..."
docker compose -f "$COMPOSE" build command-center 2>/dev/null \
  || docker-compose -f "$COMPOSE" build command-center 2>/dev/null \
  || docker build -f apps/command-center/Dockerfile \
       --build-arg NEXT_PUBLIC_API_URL=https://api.wise2.net \
       -t wise2-core-command-center:latest .

echo "Starting Command Center..."
docker compose -f "$COMPOSE" up -d command-center 2>/dev/null \
  || docker-compose -f "$COMPOSE" up -d command-center 2>/dev/null \
  || {
  docker stop wise2-command-center 2>/dev/null || true
  docker rm wise2-command-center 2>/dev/null || true
  docker run -d --name wise2-command-center --restart unless-stopped \
    --network "$NETWORK" -p 127.0.0.1:3004:3000 \
    -e NODE_ENV=production -e PORT=3000 -e HOSTNAME=0.0.0.0 \
    -e API_URL=http://api:3000/api -e API_INTERNAL_URL=http://api:3000/api \
    -e APP_URL=https://command.wise2.net \
    -e GOOGLE_CALLBACK_URL=https://command.wise2.net/api/auth/google/callback \
    ${GOOGLE_CLIENT_ID:+-e GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID"} \
    wise2-core-command-center:latest
}

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
