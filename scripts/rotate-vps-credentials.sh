#!/usr/bin/env bash
# Rotate credentials after Git secret exposure. Run ON the VPS as dwise.
# Does not print secret values. Requires explicit confirmation.
set -euo pipefail

REPO="${WISE2_REPO_DIR:-$HOME/wise2-core}"
ENV_FILE="${WISE2_ENV_FILE:-$HOME/.env.production}"
COMPOSE_FILE="${WISE2_COMPOSE_FILE:-docker-compose.prod.yml}"

echo "WISE² credential rotation"
echo "Repo: $REPO"
echo "Env:  $ENV_FILE"
echo ""
echo "This will generate new DB, Redis, JWT, and Grafana passwords and update $ENV_FILE."
echo "Discord webhooks must still be revoked manually in Discord and regenerated."
read -r -p "Type ROTATE to continue: " confirm
if [[ "$confirm" != "ROTATE" ]]; then
  echo "Aborted."
  exit 1
fi

read -r -p "Type ROTATE again to confirm: " confirm2
if [[ "$confirm2" != "ROTATE" ]]; then
  echo "Aborted."
  exit 1
fi

cd "$REPO"

NEW_DB="$(openssl rand -base64 32)"
NEW_REDIS="$(openssl rand -base64 32)"
NEW_JWT="$(openssl rand -base64 48)"
NEW_GRAFANA="$(openssl rand -base64 24)"

backup="${ENV_FILE}.bak.$(date +%Y%m%d%H%M%S)"
if [[ -f "$ENV_FILE" ]]; then
  cp "$ENV_FILE" "$backup"
  echo "Backed up env to $backup"
fi

touch "$ENV_FILE"
chmod 600 "$ENV_FILE"

upsert() {
  local key="$1"
  local value="$2"
  if grep -q "^${key}=" "$ENV_FILE" 2>/dev/null; then
    sed -i "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
  else
    echo "${key}=${value}" >> "$ENV_FILE"
  fi
}

upsert DATABASE_PASSWORD "$NEW_DB"
upsert DB_PASSWORD "$NEW_DB"
upsert POSTGRES_APP_PASSWORD "$NEW_DB"
upsert REDIS_PASSWORD "$NEW_REDIS"
upsert JWT_SECRET "$NEW_JWT"
upsert GRAFANA_PASSWORD "$NEW_GRAFANA"

export DATABASE_PASSWORD="$NEW_DB"
export REDIS_PASSWORD="$NEW_REDIS"
export JWT_SECRET="$NEW_JWT"

echo "Updated $ENV_FILE (values not printed)."

if command -v docker >/dev/null 2>&1; then
  docker compose -f "$COMPOSE_FILE" up -d --force-recreate api postgres redis 2>/dev/null \
    || docker-compose -f "$COMPOSE_FILE" up -d --force-recreate api postgres redis
  echo "Recreated api, postgres, redis containers."
fi

echo ""
echo "Next steps:"
echo "  1. Revoke old Discord webhooks in Discord channel settings"
echo "  2. cd $REPO && node services/bot/create-webhooks.js  (saves to services/bot/.env.webhooks)"
echo "  3. bash scripts/deploy-command-center.sh"
echo "  4. curl -s https://api.wise2.net/api/health"
