#!/usr/bin/env bash
# Deploy blackhail.store nginx + rebuild website with BLAKKHAIL storefront support.
set -euo pipefail

REPO_ROOT="${REPO_ROOT:-/home/dwise/wise2-core}"
NGINX_AVAILABLE="/etc/nginx/sites-available/blackhail.store.conf"
NGINX_ENABLED="/etc/nginx/sites-enabled/blackhail.store.conf"
COMPOSE_FILE="${REPO_ROOT}/docker-compose.prod.yml"

echo "==> Syncing nginx config"
sudo cp "${REPO_ROOT}/infrastructure/nginx/blakkhail.store.conf" "${NGINX_AVAILABLE}"
sudo ln -sf "${NGINX_AVAILABLE}" "${NGINX_ENABLED}"

echo "==> Building website image"
cd "${REPO_ROOT}"
docker compose -f "${COMPOSE_FILE}" build website

echo "==> Restarting website container"
docker compose -f "${COMPOSE_FILE}" up -d website

echo "==> Testing nginx config"
sudo nginx -t
sudo systemctl reload nginx

echo "==> Smoke tests"
curl -fsSI "https://blackhail.store/sencere" | head -5
curl -fsS "https://blackhail.store/sencere" | grep -q "We Build Legacies" && echo "OK: /sencere storefront"
curl -fsSI "https://blackhail.store" | grep -q "301\|302\|307\|308" && echo "OK: root redirects to /sencere"
curl -fsS "https://blackhail.store/products/chain-gang-black" | grep -q "Chain Gang" && echo "OK: product route"

echo "Done. Visit https://blackhail.store"
