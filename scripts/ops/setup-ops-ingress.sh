#!/usr/bin/env bash
# WISE² — expose the control bridge to the tailnet without opening a public port.
#
# Run ON the target host, as a user who can sudo:
#   bash scripts/ops/setup-ops-ingress.sh
#
# What it does: points `tailscale serve` at the bridge's localhost port, so the bridge
# keeps binding 127.0.0.1 and the tailnet provides TLS plus device identity. It opens
# nothing to the public internet — `tailscale funnel` is deliberately NOT used.
set -euo pipefail

BRIDGE_PORT="${WISE2_CONTROL_PORT:-3099}"

command -v tailscale >/dev/null || { echo "tailscale is not installed on this host" >&2; exit 1; }

if ! tailscale status >/dev/null 2>&1; then
  echo "This host is not connected to the tailnet. Run: sudo tailscale up" >&2
  exit 1
fi

DNS_NAME="$(tailscale status --json | python3 -c 'import json,sys; print(json.load(sys.stdin)["Self"]["DNSName"].rstrip("."))')"

if ! curl -sf --max-time 5 "http://127.0.0.1:${BRIDGE_PORT}/v1/control/health" >/dev/null; then
  echo "No control bridge answering on 127.0.0.1:${BRIDGE_PORT}." >&2
  echo "Start it first:  docker compose -f docker-compose.production.yml up -d control-bridge" >&2
  exit 1
fi

echo "Publishing 127.0.0.1:${BRIDGE_PORT} to the tailnet as https://${DNS_NAME}"
sudo tailscale serve --bg --https=443 "http://127.0.0.1:${BRIDGE_PORT}"

echo
echo "Verify from the MacBook:"
echo "  curl -s https://${DNS_NAME}/v1/control/health"
echo
echo "Then set this target's baseUrl in ~/.wise2/targets.json:"
echo "  \"baseUrl\": \"https://${DNS_NAME}\""
echo
echo "To undo:  sudo tailscale serve --https=443 off"
