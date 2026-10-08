#!/usr/bin/env bash
set -Eeuo pipefail
ROLE="${1:-}"
case "$ROLE" in daniel|darrin|surface|vps) ;; *) echo "Usage: bash scripts/wise2-node-onboard.sh {daniel|darrin|surface|vps}"; exit 2;; esac
command -v ssh-keygen >/dev/null || { echo "Install openssh-client"; exit 1; }
mkdir -p "$HOME/.ssh" "$HOME/.config/wise2"
chmod 700 "$HOME/.ssh"
KEY="$HOME/.ssh/wise2_${ROLE}_ed25519"
if [[ ! -f "$KEY" ]]; then
  ssh-keygen -t ed25519 -a 100 -f "$KEY" -C "wise2-${ROLE}@$(hostname)" 
fi
chmod 600 "$KEY"
chmod 644 "$KEY.pub"
cat > "$HOME/.config/wise2/node.env" <<EOF
WISE2_NODE_ROLE=$ROLE
WISE2_REPO=dwise03-bit/wise2-core
WISE2_HIVE_URL=https://wise2.net/hive
EOF
echo "=== WISE2 NODE HANDOFF ==="
printf 'Role: %s | Host: %s\n' "$ROLE" "$(hostname)"
echo "Public key fingerprint:"
ssh-keygen -lf "$KEY.pub"
echo "Public key (safe to share with authorized administrator):"
cat "$KEY.pub"
echo "Next: admin verifies fingerprint and installs public key ONLY for the approved account."
echo "Never send private keys or copy someone else's private key."
echo "Tailscale:"; if command -v tailscale >/dev/null; then tailscale status | head -8 || true; else echo "not installed"; fi
echo "Git:"; git --version || true
echo "Finished local enrollment; access is NOT granted until public key is approved."
