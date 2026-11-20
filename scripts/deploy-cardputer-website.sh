#!/usr/bin/env bash
# Website-only deploy for the current WISE² server. No database/API recreation.
set -Eeuo pipefail
ROOT=/home/dwise/wise2-core
COMPOSE=docker-compose.stable.yml
IMAGE=wise2-core-website:latest
cd "$ROOT"
command -v docker >/dev/null
docker compose version >/dev/null
test -f "$COMPOSE"
test -f apps/website/Dockerfile
test -f apps/website/app/cardputer/page.tsx
test -z "$(git status --porcelain)" || { echo "STOP: dirty checkout"; exit 1; }
git fetch origin main
test "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)" || { echo "STOP: checkout is not at origin/main; run git pull --ff-only origin main first"; exit 1; }
docker compose -f "$COMPOSE" config --services | grep -qx website
docker image inspect "$IMAGE" >/dev/null
PREVIOUS="wise2-core-website:pre-cardputer-$(date +%Y%m%d%H%M%S)"
docker tag "$IMAGE" "$PREVIOUS"
echo "Backup image: $PREVIOUS"
docker build -f apps/website/Dockerfile -t "$IMAGE" --build-arg NEXT_PUBLIC_SITE_URL=https://wise2.net --build-arg NEXT_PUBLIC_API_URL=https://api.wise2.net --build-arg NEXT_PUBLIC_DASHBOARD_URL=https://wise2.net .
docker compose -f "$COMPOSE" up -d --no-deps --force-recreate website
echo "Checking local website route..."
ok=0
for i in $(seq 1 15); do
  if curl -fsS --max-time 5 http://127.0.0.1:3001/cardputer | grep -q 'CARDPUTER'; then ok=1; break; fi
  sleep 3
done
if [ "$ok" -ne 1 ]; then
  echo "FAILED: restoring previous website image $PREVIOUS"
  docker tag "$PREVIOUS" "$IMAGE"
  docker compose -f "$COMPOSE" up -d --no-deps --force-recreate website
  exit 1
fi
echo "Local route OK. Checking public route..."
curl -fsS --max-time 20 https://wise2.net/cardputer | grep -q 'CARDPUTER' || { echo "Public route not verified; inspect proxy/CDN"; exit 1; }
echo "PASS: /cardputer available locally and publicly"
