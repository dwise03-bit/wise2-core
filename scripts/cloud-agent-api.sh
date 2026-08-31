#!/usr/bin/env bash
set -euo pipefail

cd /workspace

export COREPACK_ENABLE_DOWNLOAD_PROMPT=0

# Development defaults for the WISE2 platform API. These point at the local
# Postgres/Redis stack started by cloud-agent-start.sh. JWT_SECRET is a
# throwaway development value, not a production secret.
export DATABASE_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/wise2_core}"
export REDIS_URL="${REDIS_URL:-redis://:password@localhost:6379}"
export JWT_SECRET="${JWT_SECRET:-dev-secret-key-change-in-production}"
export PORT="${PORT:-3001}"
export NODE_ENV="${NODE_ENV:-development}"

# Wait for Postgres to accept TCP connections before booting the API so the
# first start after a fresh boot does not crash on an unavailable database.
for _ in $(seq 1 60); do
  if (echo >/dev/tcp/localhost/5432) >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

exec pnpm --filter @wise2/platform-api dev
