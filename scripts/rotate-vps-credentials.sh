#!/usr/bin/env bash
# Production-safe credential rotation for live VPS (existing Postgres volume).
# Updates passwords inside Postgres/Redis, then refreshes compose services.
# Does not print secret values. Requires typing ROTATE twice.
set -euo pipefail

REPO="${WISE2_REPO_DIR:-$HOME/wise2-core}"
ENV_FILE="${WISE2_ENV_FILE:-$REPO/.env.production}"
COMPOSE_FILE="${WISE2_COMPOSE_FILE:-docker-compose.prod.yml}"
PG_CONTAINER="${WISE2_PG_CONTAINER:-}"
REDIS_CONTAINER="${WISE2_REDIS_CONTAINER:-}"

echo "WISE² production credential rotation"
echo "Env:    $ENV_FILE"
echo "Compose: $COMPOSE_FILE"
echo ""
read -r -p "Type ROTATE to continue: " confirm
[[ "$confirm" == "ROTATE" ]] || { echo "Aborted."; exit 1; }
read -r -p "Type ROTATE again to confirm: " confirm2
[[ "$confirm2" == "ROTATE" ]] || { echo "Aborted."; exit 1; }

cd "$REPO"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE" >&2
  exit 1
fi

backup="${ENV_FILE}.bak.$(date +%Y%m%d%H%M%S)"
cp "$ENV_FILE" "$backup"
echo "Backed up to $backup"

# Read current postgres password from env file (no shell source — avoids injection)
OLD_PG="$(grep -m1 '^POSTGRES_PASSWORD=' "$ENV_FILE" | cut -d= -f2- || true)"
OLD_JWT="$(grep -m1 '^JWT_SECRET=' "$ENV_FILE" | cut -d= -f2- || grep -m1 '^AUTH_SECRET=' "$ENV_FILE" | cut -d= -f2- || true)"

if [[ -z "$PG_CONTAINER" ]]; then
  PG_CONTAINER="$(docker ps --format '{{.Names}}' | grep -E 'wise2-db|postgres' | grep -v langfuse | grep -v glitchtip | grep -v infisical | head -1 || true)"
fi
if [[ -z "$REDIS_CONTAINER" ]]; then
  REDIS_CONTAINER="$(docker ps --format '{{.Names}}' | grep -E 'wise2-redis' | grep -v glitchtip | grep -v infisical | head -1 || true)"
fi

if [[ -z "$PG_CONTAINER" || -z "$REDIS_CONTAINER" ]]; then
  echo "Could not detect postgres/redis containers." >&2
  exit 1
fi

# Current redis password from container command
OLD_REDIS="$(docker inspect "$REDIS_CONTAINER" --format '{{join .Config.Cmd " "}}' | sed -n 's/.*requirepass \([^ ]*\).*/\1/p')"
if [[ -z "$OLD_REDIS" ]]; then
  OLD_REDIS="$(grep -m1 '^REDIS_PASSWORD=' "$ENV_FILE" | cut -d= -f2- || true)"
fi

NEW_PG="$(openssl rand -hex 32)"
NEW_REDIS="$(openssl rand -hex 32)"
NEW_JWT="$(openssl rand -hex 48)"

PG_USER="$(grep -m1 '^POSTGRES_USER=' "$ENV_FILE" | cut -d= -f2- || echo wise2)"
PG_DB="$(grep -m1 '^POSTGRES_DB=' "$ENV_FILE" | cut -d= -f2- || echo wise2_prod)"

echo "Rotating Postgres user inside $PG_CONTAINER..."
docker exec -e PGPASSWORD="$OLD_PG" "$PG_CONTAINER" \
  psql -U "$PG_USER" -d "$PG_DB" -v ON_ERROR_STOP=1 \
  -c "ALTER USER ${PG_USER} WITH PASSWORD '${NEW_PG}';"

echo "Rotating Redis password in $REDIS_CONTAINER..."
docker exec "$REDIS_CONTAINER" redis-cli -a "$OLD_REDIS" CONFIG SET requirepass "$NEW_REDIS" >/dev/null
docker exec "$REDIS_CONTAINER" redis-cli -a "$NEW_REDIS" PING >/dev/null

upsert() {
  local key="$1" val="$2"
  if grep -q "^${key}=" "$ENV_FILE"; then
    sed -i "s|^${key}=.*|${key}=${val}|" "$ENV_FILE"
  else
    echo "${key}=${val}" >> "$ENV_FILE"
  fi
}

upsert POSTGRES_PASSWORD "$NEW_PG"
upsert DATABASE_PASSWORD "$NEW_PG"
upsert DB_PASSWORD "$NEW_PG"
upsert REDIS_PASSWORD "$NEW_REDIS"
upsert JWT_SECRET "$NEW_JWT"
grep -q '^AUTH_SECRET=' "$ENV_FILE" && upsert AUTH_SECRET "$NEW_JWT"

# Rebuild DATABASE_URL and REDIS_URL if present
if grep -q '^DATABASE_URL=' "$ENV_FILE"; then
  upsert DATABASE_URL "postgresql://${PG_USER}:${NEW_PG}@postgres:5432/${PG_DB}"
fi
if grep -q '^REDIS_URL=' "$ENV_FILE"; then
  upsert REDIS_URL "redis://:${NEW_REDIS}@redis:6379/0"
fi

chmod 600 "$ENV_FILE"
echo "Updated $ENV_FILE (values not printed)."

export DATABASE_PASSWORD="$NEW_PG"
export REDIS_PASSWORD="$NEW_REDIS"
export JWT_SECRET="$NEW_JWT"

echo "Recreating api and redis containers..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --force-recreate api redis

sleep 10
if curl -sf http://127.0.0.1:3010/api/health >/dev/null; then
  echo "API health: OK"
else
  echo "API health: FAILED — check docker logs wise2-api" >&2
  exit 1
fi

echo ""
echo "Rotation complete. All users must re-login (JWT rotated)."
echo "Manual: revoke old Discord webhooks and regenerate via services/bot/create-webhooks.js"
