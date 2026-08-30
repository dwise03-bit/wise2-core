#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="$ROOT/apps/wise-hvac-demo"
ENV_FILE="$APP_DIR/.env.production.local"

echo "Building WISE² HVAC Field Tech..."
pnpm --filter @wise2/wise-hvac-demo build

if [[ -f "$ROOT/.env.prod" ]]; then
  echo "Syncing Google OAuth vars from repo .env.prod into PM2 env file..."
  mkdir -p "$(dirname "$ENV_FILE")"
  touch "$ENV_FILE"
  for key in GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET WISE2_API_URL NEXT_PUBLIC_HVAC_URL; do
    value="$(grep -E "^${key}=" "$ROOT/.env.prod" | tail -1 | cut -d= -f2- || true)"
    if [[ -n "$value" ]]; then
      if grep -q "^${key}=" "$ENV_FILE"; then
        sed -i '' "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
      else
        echo "${key}=${value}" >> "$ENV_FILE"
      fi
    fi
  done
fi

if command -v pm2 >/dev/null 2>&1; then
  echo "Restarting PM2 app wise-hvac-demo..."
  cd "$APP_DIR"
  if pm2 describe wise-hvac-demo >/dev/null 2>&1; then
    pm2 restart ecosystem.config.cjs --update-env
  else
    pm2 start ecosystem.config.cjs
  fi
  pm2 save || true
else
  echo "PM2 not found; build complete. Start manually with: pnpm --filter @wise2/wise-hvac-demo start"
fi

echo "Running OAuth smoke test..."
chmod +x "$ROOT/scripts/smoke-hvac-oauth.sh"
"$ROOT/scripts/smoke-hvac-oauth.sh"
