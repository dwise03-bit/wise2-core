#!/usr/bin/env bash
set -euo pipefail

SERVER="${DEPLOY_SERVER:-dwise@173.208.147.165}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519}"
REPO_ROOT="${REPO_ROOT:-/home/dwise/wise2-core}"
LOCAL_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP_PORT=3026
PM2_NAME="lexis-inks"
SSH_OPTS=(-o BatchMode=yes -o ConnectTimeout=15)
[[ -f "$SSH_KEY" ]] && SSH_OPTS+=(-i "$SSH_KEY")

rsync -az -e "ssh ${SSH_OPTS[*]}" --exclude node_modules --exclude .next \
  "${LOCAL_ROOT}/apps/lexis-inks-demo/" "${SERVER}:${REPO_ROOT}/apps/lexis-inks-demo/"
rsync -az -e "ssh ${SSH_OPTS[*]}" \
  "${LOCAL_ROOT}/infrastructure/nginx/lexis-inks.wise2.net.snippet.conf" \
  "${SERVER}:${REPO_ROOT}/infrastructure/nginx/"

ssh "${SSH_OPTS[@]}" "$SERVER" bash -s <<EOF
set -euo pipefail
cd "${REPO_ROOT}/apps/lexis-inks-demo"
npm install
npm run build
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static
pm2 delete ${PM2_NAME} 2>/dev/null || true
PORT=${APP_PORT} HOSTNAME=0.0.0.0 pm2 start .next/standalone/server.js --name ${PM2_NAME} --cwd "${REPO_ROOT}/apps/lexis-inks-demo"
pm2 save
sudo cp "${REPO_ROOT}/infrastructure/nginx/lexis-inks.wise2.net.snippet.conf" /tmp/lexis-inks-nginx.snippet
if ! sudo grep -q "lexis-inks" /etc/nginx/sites-enabled/wise2.net; then
  sudo sed -i '/# CJAYS beta APK/r /tmp/lexis-inks-nginx.snippet' /etc/nginx/sites-enabled/wise2.net
fi
sudo nginx -t
sudo systemctl reload nginx
sleep 2
curl -fsS http://127.0.0.1:${APP_PORT}/lexis-inks/ >/dev/null
EOF

curl -fsSI https://wise2.net/lexis-inks/ | head -5
echo "Live: https://wise2.net/lexis-inks/"
