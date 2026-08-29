#!/usr/bin/env bash
# Build Cherry Count locally, deploy .next bundle, run via next start on server
set -euo pipefail

SERVER="${DEPLOY_SERVER:-dwise@173.208.147.165}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519}"
REMOTE_APP_DIR="${REMOTE_APP_DIR:-/home/dwise/wise2-apps/cherry-count}"
REPO_ROOT="${REPO_ROOT:-/home/dwise/wise2-core}"
LOCAL_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP_PORT=3025
PM2_NAME="cherry-count"

echo "==> Cherry Count™ Deploy"
echo "    URL: https://wise2.net/cherry-count"
echo ""

SSH_OPTS=(-o BatchMode=yes -o ConnectTimeout=15)
if [[ -f "$SSH_KEY" ]]; then
  SSH_OPTS+=(-i "$SSH_KEY")
fi

echo "==> Building locally..."
cd "${LOCAL_ROOT}/apps/cherry-count"
export NEXT_PUBLIC_API_URL="https://api.wise2.net/api"
export NEXT_PUBLIC_SITE_URL="https://wise2.net"

# Pull public OAuth client IDs from server env when available (no secrets)
OAUTH_ENV=$(ssh "${SSH_OPTS[@]}" "$SERVER" "grep -E '^(GOOGLE_CLIENT_ID|DISCORD_CLIENT_ID)=' ${REPO_ROOT}/.env.production 2>/dev/null || true" || true)
while IFS= read -r line; do
  [[ -z "$line" ]] && continue
  export "$line"
done <<< "$OAUTH_ENV"

export NEXT_PUBLIC_GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID:-}"
export NEXT_PUBLIC_DISCORD_CLIENT_ID="${DISCORD_CLIENT_ID:-}"
pnpm build

echo "==> Packaging release..."
RELEASE_DIR="${LOCAL_ROOT}/apps/cherry-count/.deploy/release"
rm -rf "${RELEASE_DIR}"
mkdir -p "${RELEASE_DIR}"
cp package.json next.config.js "${RELEASE_DIR}/"
cp -r .next public "${RELEASE_DIR}/"

echo "==> Syncing to server..."
ssh "${SSH_OPTS[@]}" "$SERVER" "mkdir -p ${REMOTE_APP_DIR}"
rsync -az --delete \
  -e "ssh ${SSH_OPTS[*]}" \
  "${RELEASE_DIR}/" \
  "${SERVER}:${REMOTE_APP_DIR}/"

rsync -az -e "ssh ${SSH_OPTS[*]}" \
  "${LOCAL_ROOT}/infrastructure/nginx/cherry-count.wise2.net.snippet.conf" \
  "${SERVER}:${REPO_ROOT}/infrastructure/nginx/cherry-count.wise2.net.snippet.conf" 2>/dev/null || true

echo "==> Syncing API + provision script..."
rsync -az -e "ssh ${SSH_OPTS[*]}" \
  "${LOCAL_ROOT}/packages/api/src/cherry-count/" \
  "${SERVER}:${REPO_ROOT}/packages/api/src/cherry-count/"
rsync -az -e "ssh ${SSH_OPTS[*]}" \
  "${LOCAL_ROOT}/scripts/provision-cherry-count.ts" \
  "${SERVER}:${REPO_ROOT}/scripts/provision-cherry-count.ts"

echo "==> Installing deps + starting PM2..."
OWNER_EMAIL="${OWNER_EMAIL:-dwise03@gmail.com}"
ssh "${SSH_OPTS[@]}" "$SERVER" "OWNER_EMAIL=${OWNER_EMAIL}" bash -s <<EOF
set -euo pipefail
cd "${REMOTE_APP_DIR}"

echo "-- npm install (production)..."
npm install --omit=dev --no-audit --no-fund 2>&1 | tail -5

pm2 delete ${PM2_NAME} 2>/dev/null || true
PORT=${APP_PORT} HOSTNAME=0.0.0.0 NODE_ENV=production \
  API_URL="https://api.wise2.net/api" \
  NEXT_PUBLIC_API_URL="https://api.wise2.net/api" \
  NEXT_PUBLIC_SITE_URL="https://wise2.net" \
  GOOGLE_CLIENT_ID="\$(grep '^GOOGLE_CLIENT_ID=' ${REPO_ROOT}/.env.production 2>/dev/null | cut -d= -f2- | tr -d '\"')" \
  DISCORD_CLIENT_ID="\$(grep '^DISCORD_CLIENT_ID=' ${REPO_ROOT}/.env.production 2>/dev/null | cut -d= -f2- | tr -d '\"')" \
  pm2 start node_modules/next/dist/bin/next \
  --name ${PM2_NAME} \
  --cwd "${REMOTE_APP_DIR}" \
  --max-memory-restart 512M \
  -- start -p ${APP_PORT}
pm2 save

sleep 4
curl -fsS "http://127.0.0.1:${APP_PORT}/cherry-count/api/health" | grep -q '"status":"ok"'
echo "Health check passed"

# Ensure nginx route exists (patch wise2.net once)
if ! sudo grep -q "cherry-count" /etc/nginx/sites-enabled/wise2.net 2>/dev/null; then
  sudo cp "${REPO_ROOT}/infrastructure/nginx/cherry-count.wise2.net.snippet.conf" /tmp/cherry-count-nginx.snippet
  sudo sed -i '/# CJAYS beta APK/r /tmp/cherry-count-nginx.snippet' /etc/nginx/sites-enabled/wise2.net
fi
sudo /usr/sbin/nginx -t && sudo systemctl reload nginx

# Apply Cherry Count migration + provision tenant if repo is present
if [[ -d "${REPO_ROOT}/packages/db" ]]; then
  echo "-- Prisma migrate (cherry count tables)..."
  cd "${REPO_ROOT}"
  set -a && source .env.production 2>/dev/null && set +a || true
  pnpm exec prisma migrate deploy --schema packages/db/prisma/schema.prisma 2>&1 | tail -8 || true

  if [[ -n "\${OWNER_EMAIL:-}" ]]; then
    echo "-- Provisioning Cherry Count tenant for \${OWNER_EMAIL}..."
    OWNER_EMAIL="\${OWNER_EMAIL}" pnpm exec tsx scripts/provision-cherry-count.ts 2>&1 | tail -12 || true
  fi

  echo "-- Rebuilding API (cherry-count endpoints)..."
  docker compose -f docker-compose.prod.yml build api 2>&1 | tail -5
  docker compose -f docker-compose.prod.yml up -d api 2>&1 | tail -3
fi
EOF

echo ""
echo "✅ Live: https://wise2.net/cherry-count"
echo "   Deck: https://wise2.net/cherry-count/presentation"
