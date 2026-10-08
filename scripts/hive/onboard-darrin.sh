#!/usr/bin/env bash
# WISE² Darrin SSH onboarding. Run locally on Darrin's Mac/Linux computer.
set -euo pipefail
VPS_HOST="${WISE2_VPS_HOST:-173.208.147.165}"
VPS_USER="darrin"
ADMIN_TARGET="${WISE2_ADMIN_TARGET:-}"
KEY="${WISE2_SSH_KEY:-$HOME/.ssh/wise2_darrin_ed25519}"
mkdir -p "$HOME/.ssh"
chmod 700 "$HOME/.ssh"
if [[ ! -f "$KEY" ]]; then
  if [[ -e "$KEY.pub" ]]; then echo "Public key exists but private key missing: $KEY"; exit 1; fi
  ssh-keygen -t ed25519 -a 64 -f "$KEY" -C "darrin-wise2" 
fi
chmod 600 "$KEY"
echo "WISE² public key fingerprint:"
ssh-keygen -lf "$KEY.pub"
echo "Checking Darrin SSH access..."
if ssh -o BatchMode=yes -o ConnectTimeout=8 -o IdentitiesOnly=yes -i "$KEY" "$VPS_USER@$VPS_HOST" 'id -un' 2>/dev/null; then
  echo "SSH login verified."
else
  echo "SSH login not yet authorized."
  if [[ -n "$ADMIN_TARGET" ]]; then
    echo "An existing administrator SSH login will be used to install ONLY the public key."
    read -r -p "Authorize public key using $ADMIN_TARGET? [y/N] " ans
    if [[ "$ans" == "y" || "$ans" == "Y" ]]; then
      cat "$KEY.pub" | ssh "$ADMIN_TARGET" 'sudo -n /usr/bin/env bash -c '\''set -e; id darrin >/dev/null; install -d -m 700 -o darrin -g darrin /home/darrin/.ssh; touch /home/darrin/.ssh/authorized_keys; chown darrin:darrin /home/darrin/.ssh/authorized_keys; chmod 600 /home/darrin/.ssh/authorized_keys; IFS= read -r key; case "$key" in ssh-ed25519\ *) ;; *) exit 2;; esac; grep -qxF "$key" /home/darrin/.ssh/authorized_keys || printf "%s\\n" "$key" >> /home/darrin/.ssh/authorized_keys'\''
    fi
  fi
  if ! ssh -o BatchMode=yes -o ConnectTimeout=8 -o IdentitiesOnly=yes -i "$KEY" "$VPS_USER@$VPS_HOST" 'id -un'; then
    echo "Access pending. Administrator must add the printed public key. Private key must never be shared."
    exit 2
  fi
fi
if [[ -d "$HOME/wise2-core/.git" ]]; then
  echo "Existing checkout found. Fetching without modifying local files."
  git -C "$HOME/wise2-core" fetch origin
  git -C "$HOME/wise2-core" status --short
else
  if [[ -e "$HOME/wise2-core" ]]; then echo "Path exists and is not a Git checkout; refusing to overwrite."; exit 3; fi
  git clone https://github.com/dwise03-bit/wise2-core.git "$HOME/wise2-core"
fi
echo "WISE² onboarding complete. Read docs/hive/DARRIN_MASTER_ONBOARDING.md"
