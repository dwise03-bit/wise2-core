#!/usr/bin/env bash
# Deploy Cherry Count™ demo to wise2.net/cherry-count via PM2 (no Docker build)
set -euo pipefail

SERVER="${DEPLOY_SERVER:-dwise@173.208.147.165}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519}"
REPO_ROOT="${REPO_ROOT:-/home/dwise/wise2-core}"
LOCAL_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP_PORT=3025
PM2_NAME="cherry-count"

echo "==> Cherry Count™ PM2 Deployment"
echo "    Server: ${SERVER}"
echo "    URL:    https://wise2.net/cherry-count"
echo ""

SSH_OPTS=(-o BatchMode=yes -o ConnectTimeout=15)
if [[ -f "$SSH_KEY" ]]; then
  SSH_OPTS+=(-i "$SSH_KEY")
fi

echo "==> Syncing files..."
rsync -az \
  -e "ssh ${SSH_OPTS[*]}" \
  --exclude node_modules --exclude .next \
  "${LOCAL_ROOT}/apps/cherry-count/" \
  "${SERVER}:${REPO_ROOT}/apps/cherry-count/"

rsync -az \
  -e "ssh ${SSH_OPTS[*]}" \
  "${LOCAL_ROOT}/nginx.conf" \
  "${LOCAL_ROOT}/pnpm-lock.yaml" \
  "${LOCAL_ROOT}/package.json" \
  "${LOCAL_ROOT}/pnpm-workspace.yaml" \
  "${SERVER}:${REPO_ROOT}/"

echo "==> Building and starting on server..."
ssh "${SSH_OPTS[@]}" "$SERVER" bash -s <<EOF
set -euo pipefail
cd "${REPO_ROOT}"

export NEXT_PUBLIC_API_URL="https://api.wise2.net/api"
export API_URL="https://api.wise2.net/api"

echo "-- Installing dependencies..."
corepack enable 2>/dev/null || true
corepack prepare pnpm@8.15.9 --activate 2>/dev/null || npm install -g pnpm@8.15.9
pnpm install --filter @wise2/cherry-count... --frozen-lockfile 2>/dev/null || pnpm install --filter @wise2/cherry-count...

echo "-- Building app..."
cd apps/cherry-count
NEXT_PUBLIC_API_URL="https://api.wise2.net/api" pnpm build

STANDALONE_DIR="${REPO_ROOT}/apps/cherry-count/.next/standalone/apps/cherry-count"
cp -r .next/static "\${STANDALONE_DIR}/.next/static"
cp -r public "\${STANDALONE_DIR}/public" 2>/dev/null || mkdir -p "\${STANDALONE_DIR}/public"

echo "-- Restarting PM2..."
pm2 delete ${PM2_NAME} 2>/dev/null || true
PORT=${APP_PORT} HOSTNAME=0.0.0.0 pm2 start "\${STANDALONE_DIR}/server.js" \
  --name ${PM2_NAME} \
  --cwd "\${STANDALONE_DIR}"

pm2 save

echo "-- Health check..."
sleep 3
curl -fsS "http://127.0.0.1:${APP_PORT}/cherry-count/api/health" | grep -q '"status":"ok"'

echo "-- Reloading nginx..."
if command -v nginx >/dev/null 2>&1; then
  sudo cp "${REPO_ROOT}/nginx.conf" /etc/nginx/nginx.conf 2>/dev/null || true
  sudo nginx -t && sudo systemctl reload nginx
fi
EOF

echo ""
echo "✅ Cherry Count demo live at https://wise2.net/cherry-count"
