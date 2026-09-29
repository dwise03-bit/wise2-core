#!/usr/bin/env bash
set -euo pipefail

# Finish hvac.wise2.net HTTPS after DNS A record exists.
# Prerequisite: hvac.wise2.net A -> 173.208.147.165 (IONOS)

VPS_HOST="${VPS_HOST:-dwise@173.208.147.165}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

log() { printf '[hvac-dns-ssl] %s\n' "$*"; }

log "Checking DNS for hvac.wise2.net..."
IP="$(dig +short hvac.wise2.net A @ns1059.ui-dns.com | head -1)"
if [[ "$IP" != "173.208.147.165" ]]; then
  log "ERROR: hvac.wise2.net must resolve to 173.208.147.165 (got: ${IP:-none})"
  log "Add in IONOS: Type A, Host hvac, Points to 173.208.147.165"
  exit 1
fi

log "DNS OK. Issuing certificate and enabling HTTPS nginx..."
scp "$REPO_ROOT/infrastructure/nginx/hvac.wise2.net.conf" "$VPS_HOST:/tmp/hvac.wise2.net.conf"
ssh "$VPS_HOST" bash -s <<'REMOTE'
set -euo pipefail
sudo certbot certonly --webroot -w /var/www/html -d hvac.wise2.net \
  --non-interactive --agree-tos -m dwise03@gmail.com || \
sudo certbot certonly --nginx -d hvac.wise2.net \
  --non-interactive --agree-tos -m dwise03@gmail.com

sudo rm -f /etc/nginx/sites-enabled/hvac.wise2.net.bootstrap.conf
sudo cp /tmp/hvac.wise2.net.conf /etc/nginx/sites-available/hvac.wise2.net.conf
sudo ln -sf /etc/nginx/sites-available/hvac.wise2.net.conf /etc/nginx/sites-enabled/hvac.wise2.net.conf
sudo nginx -t
sudo systemctl reload nginx
REMOTE

log "Verify:"
log "  curl -IL https://hvac.wise2.net/field-tech"
