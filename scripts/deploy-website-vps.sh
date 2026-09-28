#!/usr/bin/env bash
# Production deploy for the public WISE² website on the WISE² VPS.
# Runs on 173.208.147.165 after GitHub Actions syncs the repository.
set -euo pipefail

ROOT="/home/dwise/wise2-core"
cd "$ROOT"

ENV_FILE=".env.production"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ROOT/$ENV_FILE is missing"
  exit 1
fi

echo "==> Building WISE² website"
CACHE_BUST="$(date +%s)" docker compose --env-file "$ENV_FILE" -f docker-compose.prod.yml build --pull website

echo "==> Restarting website container"
docker compose --env-file "$ENV_FILE" -f docker-compose.prod.yml up -d --no-deps website

echo "==> Waiting for local website health"
for i in {1..18}; do
  code="$(curl -sS -o /dev/null -w '%{http_code}' http://127.0.0.1:3001/travel || true)"
  if [[ "$code" == "200" ]]; then
    echo "Local /travel health check passed"
    break
  fi
  if [[ "$i" == "18" ]]; then
    echo "ERROR: local website did not become healthy"
    docker compose --env-file "$ENV_FILE" -f docker-compose.prod.yml logs --tail=150 website
    exit 1
  fi
  sleep 5
done

echo "==> Cleaning dangling build layers"
docker image prune -f >/dev/null 2>&1 || true

echo "==> WISE² website deployment complete"
