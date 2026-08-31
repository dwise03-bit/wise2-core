#!/usr/bin/env bash
set -euo pipefail

# Finish cloud.wise2.net (+ optional my.wise2.net) HTTPS after DNS A records exist.
# Prerequisite: cloud.wise2.net A -> 173.208.147.165 (IONOS)

VPS_HOST="${VPS_HOST:-dwise@173.208.147.165}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

log() { printf '[cloud-dns-ssl] %s\n' "$*"; }

log "Checking DNS for cloud.wise2.net..."
IP="$(dig +short cloud.wise2.net A @ns1059.ui-dns.com | head -1)"
if [[ "$IP" != "173.208.147.165" ]]; then
  log "ERROR: cloud.wise2.net must resolve to 173.208.147.165 (got: ${IP:-none})"
  log "Add in IONOS: Type A, Host cloud, Points to 173.208.147.165"
  log "Optional: Type A, Host my, Points to 173.208.147.165"
  exit 1
fi

log "DNS OK. Issuing certificate and enabling HTTPS nginx..."
scp "$REPO_ROOT/infrastructure/nginx/cloud.wise2.net.conf" "$VPS_HOST:/tmp/cloud.wise2.net.conf"
ssh "$VPS_HOST" bash -s <<'REMOTE'
set -euo pipefail
sudo certbot certonly --webroot -w /var/www/html -d cloud.wise2.net \
  --non-interactive --agree-tos -m dwise03@gmail.com || \
sudo certbot certonly --nginx -d cloud.wise2.net \
  --non-interactive --agree-tos -m dwise03@gmail.com

sudo cp /tmp/cloud.wise2.net.conf /etc/nginx/sites-available/cloud.wise2.net.conf
sudo sed -i 's|/etc/letsencrypt/live/wise2.net-0001/|/etc/letsencrypt/live/cloud.wise2.net/|g' /etc/nginx/sites-available/cloud.wise2.net.conf
sudo ln -sf /etc/nginx/sites-available/cloud.wise2.net.conf /etc/nginx/sites-enabled/cloud.wise2.net.conf
sudo nginx -t
sudo systemctl reload nginx
REMOTE

log "Verify:"
log "  curl -IL https://cloud.wise2.net/cloud"
log "  curl -sS https://api.wise2.net/api/v1/cloud/launch-status"
