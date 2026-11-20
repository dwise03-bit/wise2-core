#!/usr/bin/env bash
# Run from an authorized WISE2 Tailscale-connected Linux host.
# Read-only connectivity diagnostics. Never automatically trusts a changed host key.
set -u
NODE="${1:-100.111.62.95}"
USER_NAME="${2:-dwise}"
echo "Checking Pocket Node 5: $NODE as $USER_NAME"
command -v tailscale >/dev/null && tailscale status || echo "tailscale CLI unavailable"
if command -v tailscale >/dev/null; then tailscale ping --c 2 "$NODE" || true; fi
echo "Checking TCP 22"
timeout 5 bash -c "echo >/dev/tcp/$NODE/22" && echo "SSH port reachable" || echo "SSH port not reachable"
echo "Existing known-host entries (do not delete automatically):"
ssh-keygen -F "$NODE" || true
echo "Remote key offered (UNTRUSTED until compared to trusted console fingerprint):"
ssh-keyscan -T 5 -t ed25519 "$NODE" 2>/dev/null | ssh-keygen -lf - || true
echo "If key changed, compare fingerprint with 'sudo ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub' on Pocket Node local/Raspberry Pi Connect console."
echo "Only after independent verification, remove the stale host entry manually with ssh-keygen -R $NODE"
echo "Then connect: ssh -o StrictHostKeyChecking=ask $USER_NAME@$NODE"
