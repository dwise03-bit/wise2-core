#!/usr/bin/env bash
# Build Fergie's Table locally, rsync to VPS, run next start under PM2.
set -euo pipefail

SERVER="${DEPLOY_SERVER:-dwise@173.208.147.165}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519}"
REMOTE_APP_DIR="${REMOTE_APP_DIR:-/home/dwise/wise2-apps/fergies-table}"
REPO_ROOT="${REPO_ROOT:-/home/dwise/wise2-core}"
LOCAL_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP_PORT=3021
PM2_NAME="fergies-table"

echo "==> Fergie's Table deploy"
echo "    URL: https://wise2.net/fergies-table"
echo ""

SSH_OPTS=(-o BatchMode=yes -o ConnectTimeout=15)
if [[ -f "$SSH_KEY" ]]; then
  SSH_OPTS+=(-i "$SSH_KEY")
fi

echo "==> Building locally..."
cd "${LOCAL_ROOT}/apps/fergies-table"
export NEXT_PUBLIC_SITE_URL="https://wise2.net"
pnpm build

echo "==> Packaging release..."
RELEASE_DIR="${LOCAL_ROOT}/apps/fergies-table/.deploy/release"
rm -rf "${RELEASE_DIR}"
mkdir -p "${RELEASE_DIR}"
cp next.config.js "${RELEASE_DIR}/"
cp -r .next public "${RELEASE_DIR}/"
cat > "${RELEASE_DIR}/package.json" <<'EOF'
{
  "name": "@wise2/fergies-table",
  "private": true,
  "scripts": {
    "start": "next start -p 3021"
  },
  "dependencies": {
    "lucide-react": "^0.408.0",
    "next": "14.2.35",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "recharts": "^2.10.0"
  }
}
EOF

echo "==> Syncing to server..."
ssh "${SSH_OPTS[@]}" "$SERVER" "mkdir -p ${REMOTE_APP_DIR}"
rsync -az --delete \
  -e "ssh ${SSH_OPTS[*]}" \
  "${RELEASE_DIR}/" \
  "${SERVER}:${REMOTE_APP_DIR}/"

rsync -az -e "ssh ${SSH_OPTS[*]}" \
  "${LOCAL_ROOT}/infrastructure/nginx/fergies-table.wise2.net.snippet.conf" \
  "${SERVER}:${REPO_ROOT}/infrastructure/nginx/fergies-table.wise2.net.snippet.conf"

echo "==> Installing deps + starting PM2..."
ssh "${SSH_OPTS[@]}" "$SERVER" bash -s <<EOF
set -euo pipefail
cd "${REMOTE_APP_DIR}"

echo "-- npm install (production)..."
npm install --omit=dev --no-audit --no-fund 2>&1 | tail -8

pm2 delete ${PM2_NAME} 2>/dev/null || true
PORT=${APP_PORT} HOSTNAME=0.0.0.0 NODE_ENV=production \
  NEXT_PUBLIC_SITE_URL="https://wise2.net" \
  pm2 start node_modules/next/dist/bin/next \
  --name ${PM2_NAME} \
  --cwd "${REMOTE_APP_DIR}" \
  --max-memory-restart 512M \
  -- start -p ${APP_PORT}
pm2 save

sleep 4
curl -fsS "http://127.0.0.1:${APP_PORT}/fergies-table/api/health" | grep -q '"status":"ok"'
echo "Health check passed"

SNIPPET="${REPO_ROOT}/infrastructure/nginx/fergies-table.wise2.net.snippet.conf"
if ! sudo grep -q "fergies-table" /etc/nginx/sites-enabled/wise2.net 2>/dev/null; then
  sudo cp "\$SNIPPET" /tmp/fergies-table-nginx.snippet
  if sudo grep -q "# CJAYS beta APK" /etc/nginx/sites-enabled/wise2.net 2>/dev/null; then
    sudo sed -i '/# CJAYS beta APK/r /tmp/fergies-table-nginx.snippet' /etc/nginx/sites-enabled/wise2.net
  else
    echo "WARN: add \$SNIPPET to /etc/nginx/sites-enabled/wise2.net by hand"
  fi
fi
sudo /usr/sbin/nginx -t && sudo systemctl reload nginx
EOF

echo ""
echo "Live: https://wise2.net/fergies-table"
echo "Command: https://wise2.net/fergies-table/business"
echo "Health: https://wise2.net/fergies-table/api/health"
