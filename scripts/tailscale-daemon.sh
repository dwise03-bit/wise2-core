#!/usr/bin/env bash
# Start tailscaled on hosts without systemd (containers, some CI VMs).
set -euo pipefail

STATE_DIR="${TAILSCALE_STATE_DIR:-/var/lib/tailscale}"
RUN_DIR="${TAILSCALE_RUN_DIR:-/var/run/tailscale}"
SOCKET="${TAILSCALE_SOCKET:-$RUN_DIR/tailscaled.sock}"

mkdir -p "$STATE_DIR" "$RUN_DIR"

if [ -S "$SOCKET" ] && tailscale status >/dev/null 2>&1; then
  echo "tailscaled already running"
  exit 0
fi

if command -v systemctl >/dev/null 2>&1 && [ -d /run/systemd/system ]; then
  sudo systemctl start tailscaled
  exit 0
fi

nohup sudo tailscaled \
  --state="$STATE_DIR/tailscaled.state" \
  --socket="$SOCKET" \
  >/tmp/tailscaled.log 2>&1 &

for _ in $(seq 1 20); do
  if [ -S "$SOCKET" ]; then
    echo "tailscaled started (socket: $SOCKET)"
    exit 0
  fi
  sleep 0.5
done

echo "tailscaled failed to start; see /tmp/tailscaled.log" >&2
exit 1
