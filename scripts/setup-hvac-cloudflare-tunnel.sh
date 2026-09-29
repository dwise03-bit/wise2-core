#!/usr/bin/env bash
set -euo pipefail

# WISE² HVAC Field Tech — Cloudflare Tunnel setup
# Public URL: https://hvac.wise2.net/field-tech
# Local app:  http://127.0.0.1:3024/wise-hvac-demo/field-tech
#
# Auth options (pick one):
#   1. Interactive: cloudflared tunnel login
#   2. Token: export CLOUDFLARE_TUNNEL_TOKEN='...' then run this script
#   3. IONOS DNS: after tunnel create, add CNAME hvac -> <id>.cfargotunnel.com

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CONFIG_SRC="$ROOT_DIR/infra/cloudflare/hvac/config.yml"
CONFIG_DST="$HOME/.cloudflared/config.yml"
TUNNEL_NAME="wise2-hvac"
HOSTNAME="hvac.wise2.net"

log() { printf '[hvac-tunnel] %s\n' "$*"; }

if ! command -v cloudflared >/dev/null 2>&1; then
  log "Installing cloudflared via Homebrew..."
  brew install cloudflared
fi

mkdir -p "$HOME/.cloudflared"

if [[ -n "${CLOUDFLARE_TUNNEL_TOKEN:-}" ]]; then
  log "Using CLOUDFLARE_TUNNEL_TOKEN for non-interactive tunnel run"
  cloudflared tunnel --config "$CONFIG_SRC" run --token "$CLOUDFLARE_TUNNEL_TOKEN"
  exit 0
fi

if [[ ! -f "$HOME/.cloudflared/cert.pem" ]]; then
  log "Cloudflare login required. Complete the browser prompt..."
  cloudflared tunnel login
fi

if ! cloudflared tunnel list 2>/dev/null | grep -q "$TUNNEL_NAME"; then
  log "Creating tunnel: $TUNNEL_NAME"
  cloudflared tunnel create "$TUNNEL_NAME"
fi

TUNNEL_ID="$(cloudflared tunnel list 2>/dev/null | awk -v name="$TUNNEL_NAME" '$2 == name { print $1; exit }')"
if [[ -z "$TUNNEL_ID" ]]; then
  log "ERROR: Could not resolve tunnel id for $TUNNEL_NAME"
  exit 1
fi

CREDS_FILE="$HOME/.cloudflared/${TUNNEL_ID}.json"
if [[ ! -f "$CREDS_FILE" ]]; then
  log "ERROR: Missing credentials file: $CREDS_FILE"
  exit 1
fi

log "Installing config -> $CONFIG_DST"
sed "s|credentials-file: .*|credentials-file: $CREDS_FILE|" "$CONFIG_SRC" > "$CONFIG_DST"

log "Routing DNS: $HOSTNAME"
cloudflared tunnel route dns "$TUNNEL_NAME" "$HOSTNAME" || true

log "Optional: add Cloudflare redirect /field-tech -> /wise-hvac-demo/field-tech in Zero Trust dashboard"
log "  Rules -> Redirect Rules -> Create: if hostname equals $HOSTNAME and path equals /field-tech"
log "  then redirect to https://$HOSTNAME/wise-hvac-demo/field-tech (302)"

log "Installing launchd service..."
cloudflared service install 2>/dev/null || true
launchctl kickstart -k "gui/$(id -u)/com.cloudflare.cloudflared" 2>/dev/null \
  || brew services restart cloudflared 2>/dev/null \
  || cloudflared tunnel --config "$CONFIG_DST" run "$TUNNEL_NAME"

log "Done. Verify:"
log "  curl -I http://127.0.0.1:3024/health"
log "  curl -IL https://$HOSTNAME/field-tech"
