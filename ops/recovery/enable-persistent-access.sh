#!/usr/bin/env bash
# WISE2 persistent remote management for Ubuntu / Raspberry Pi OS
# Run locally on each trusted Linux machine with sudo.
set -Eeuo pipefail
if [[ $EUID -ne 0 ]]; then echo "Run with sudo"; exit 1; fi
command -v systemctl >/dev/null || { echo "systemd required"; exit 1; }
for svc in tailscaled ssh; do
  if ! systemctl list-unit-files "$svc.service" --no-legend 2>/dev/null | grep -q "^$svc.service"; then
    echo "Missing $svc.service. Install and configure manually; no automatic installation performed."
    exit 1
  fi
done
echo "Before:"
systemctl is-enabled tailscaled ssh || true
systemctl is-active tailscaled ssh || true
systemctl enable tailscaled.service ssh.service
systemctl start tailscaled.service ssh.service
echo "After:"
systemctl is-enabled tailscaled ssh
systemctl is-active tailscaled ssh
echo "Tailscale:"
tailscale version
tailscale status || true
echo "SSH:"
ss -ltn | grep -E '(:22[[:space:]]|:22$)' || true
echo "IMPORTANT: This does not change ACLs, disable key expiry, authorize devices, or alter SSH host keys."
