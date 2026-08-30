#!/usr/bin/env bash
# Unified WISE² Tailscale setup — VPS, Pi, Mac, Linux cloud agents, Termux.
# Auth: set TS_AUTHKEY (recommended) or complete browser login when prompted.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NETWORK_FILE="$ROOT/config/tailscale/network.yaml"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}$*${NC}"; }
ok() { echo -e "${GREEN}✓ $*${NC}"; }
warn() { echo -e "${YELLOW}$*${NC}"; }
fail() { echo -e "${RED}✗ $*${NC}" >&2; exit 1; }

# Hostname for this node (override per device)
HOSTNAME="${WISE2_TAILSCALE_HOSTNAME:-}"
case "$(hostname -s 2>/dev/null || hostname)" in
  gpu-nmls*|gpu-nmls-1*) HOSTNAME="${HOSTNAME:-gpu-nmls-1}" ;;
  daniels-macbook*) HOSTNAME="${HOSTNAME:-daniels-macbook-pro}" ;;
  big-byte*) HOSTNAME="${HOSTNAME:-big-byte}" ;;
  *) HOSTNAME="${HOSTNAME:-wise2-$(hostname -s | tr '[:upper:]' '[:lower:]' | tr -cd 'a-z0-9-')}" ;;
esac

log "=== WISE² Tailscale setup ==="
log "Target hostname: $HOSTNAME"

# 1. Install
if ! command -v tailscale >/dev/null 2>&1; then
  log "Installing Tailscale..."
  curl -fsSL https://tailscale.com/install.sh | sh
fi
ok "Tailscale $(tailscale version 2>/dev/null | head -1)"

# 2. Daemon
bash "$ROOT/scripts/tailscale-daemon.sh"

# 3. Authenticate
UP_ARGS=(--hostname="$HOSTNAME" --accept-routes --accept-dns=true)

if [ -n "${TS_AUTHKEY:-}" ]; then
  UP_ARGS+=(--auth-key="$TS_AUTHKEY")
  if [ "${TS_AUTHKEY_EPHEMERAL:-}" = "true" ]; then
    UP_ARGS+=(--advertise-tags=tag:ephemeral)
  fi
  ok "Using TS_AUTHKEY from environment"
else
  warn "TS_AUTHKEY not set — browser or console login required"
  warn "Create a reusable key at: https://login.tailscale.com/admin/settings/keys"
fi

if [ "${WISE2_TAILSCALE_SSH:-}" = "1" ]; then
  UP_ARGS+=(--ssh)
  ok "Tailscale SSH enabled"
fi

if tailscale status 2>/dev/null | grep -q "$HOSTNAME"; then
  ok "Already connected as $HOSTNAME"
else
  log "Joining tailnet..."
  sudo tailscale up "${UP_ARGS[@]}"
fi

# 4. Status
TS_IP="$(tailscale ip -4 2>/dev/null || true)"
FQDN="${HOSTNAME}.tail44396d.ts.net"

echo ""
ok "Connected"
echo "  Tailscale IPv4: ${TS_IP:-unknown}"
echo "  MagicDNS:       $FQDN"
echo ""
tailscale status 2>/dev/null || true

# 5. SSH key hint
if [ ! -f "$HOME/.ssh/id_ed25519.pub" ]; then
  warn "No SSH public key found. Generate one:"
  echo "  ssh-keygen -t ed25519 -C 'wise2-$HOSTNAME' -f ~/.ssh/id_ed25519 -N ''"
else
  echo ""
  log "SSH public key (add to gpu-nmls-1 ~/.ssh/authorized_keys for dwise):"
  cat "$HOME/.ssh/id_ed25519.pub"
fi

echo ""
log "Next: bash scripts/tailscale-verify.sh"
log "SSH config template: config/tailscale/ssh-config.example"
