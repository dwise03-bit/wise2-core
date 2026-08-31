#!/usr/bin/env bash
# Build the WISE Imp web service locally and publish it on the VPS.
set -euo pipefail

SERVER="${DEPLOY_SERVER:-dwise@173.208.147.165}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519}"
REMOTE_APP_DIR="${REMOTE_APP_DIR:-/home/dwise/wise2-apps/wise-imp}"
REPO_ROOT="${REPO_ROOT:-/home/dwise/wise2-core}"
LOCAL_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> WISE Imp Desktop service deploy"
echo "    URL: https://wise2.net/imp/"
echo ""

SSH_OPTS=(-o BatchMode=yes -o ConnectTimeout=15)
if [[ -f "$SSH_KEY" ]]; then
  SSH_OPTS+=(-i "$SSH_KEY")
fi

echo "==> Building web service..."
cd "${LOCAL_ROOT}/apps/wise-imp-desktop"
IMP_BASE=/imp/ node node_modules/vite/bin/vite.js build

echo "==> Syncing to server..."
ssh "${SSH_OPTS[@]}" "$SERVER" "mkdir -p ${REMOTE_APP_DIR}/downloads"
rsync -az --delete \
  -e "ssh ${SSH_OPTS[*]}" \
  "${LOCAL_ROOT}/apps/wise-imp-desktop/dist/" \
  "${SERVER}:${REMOTE_APP_DIR}/"

rsync -az -e "ssh ${SSH_OPTS[*]}" \
  "${LOCAL_ROOT}/infrastructure/nginx/wise-imp.wise2.net.snippet.conf" \
  "${SERVER}:${REPO_ROOT}/infrastructure/nginx/wise-imp.wise2.net.snippet.conf"

echo "==> Wiring nginx..."
ssh "${SSH_OPTS[@]}" "$SERVER" bash -s <<EOF
set -euo pipefail
sudo mkdir -p /var/www/html/wise-imp
sudo rsync -a --delete "${REMOTE_APP_DIR}/" /var/www/html/wise-imp/
sudo chown -R www-data:www-data /var/www/html/wise-imp

SNIPPET="${REPO_ROOT}/infrastructure/nginx/wise-imp.wise2.net.snippet.conf"
NGINX_SITE=/etc/nginx/sites-enabled/wise2.net
if sudo grep -q "alias /home/dwise/wise2-apps/wise-imp/" "\$NGINX_SITE"; then
  sudo sed -i 's|alias /home/dwise/wise2-apps/wise-imp/;|alias /var/www/html/wise-imp/;|' "\$NGINX_SITE"
fi
if ! sudo grep -q "location ^~ /imp/" "\$NGINX_SITE" 2>/dev/null; then
  sudo cp "\$SNIPPET" /tmp/wise-imp-nginx.snippet
  if sudo grep -q "# CJAYS beta APK" "\$NGINX_SITE"; then
    sudo sed -i '/# CJAYS beta APK/r /tmp/wise-imp-nginx.snippet' "\$NGINX_SITE"
  else
    echo "WARN: add \$SNIPPET to \$NGINX_SITE by hand"
  fi
fi
sudo /usr/sbin/nginx -t && sudo systemctl reload nginx
for i in 1 2 3 4 5 6; do
  if curl -fsS "https://127.0.0.1/imp/health.json" -H "Host: wise2.net" -k | grep -q '"status":"ok"'; then
    echo "Health check passed"
    exit 0
  fi
  sleep 1
done
echo "Health check failed"
exit 1
EOF

echo ""
echo "Live:   https://wise2.net/imp/"
echo "Health: https://wise2.net/imp/health.json"
