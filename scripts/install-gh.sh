#!/usr/bin/env bash
# Install GitHub CLI (gh) from the official cli.github.com apt repo.
# Idempotent and verified. Run with: sudo bash /opt/wise2/scripts/install-gh.sh
set -euo pipefail

KEYRING=/etc/apt/keyrings/githubcli-archive-keyring.gpg
LIST=/etc/apt/sources.list.d/github-cli.list
URL=https://cli.github.com/packages/githubcli-archive-keyring.gpg

if [ "$(id -u)" -ne 0 ]; then echo "Run as root: sudo bash $0"; exit 1; fi

if command -v gh >/dev/null 2>&1; then
  echo "gh already installed: $(gh --version | head -1)"; exit 0
fi

echo "[1/5] keyrings dir"; install -d -m 0755 /etc/apt/keyrings

echo "[2/5] download keyring to temp + verify it is a real GPG keyring"
tmp="$(mktemp)"
if command -v curl >/dev/null 2>&1; then curl -fsSL "$URL" -o "$tmp"; else wget -qO "$tmp" "$URL"; fi
# must be binary GPG, not an HTML error page
if head -c 1 "$tmp" | grep -q '<'; then echo "ERROR: downloaded an HTML page, not a key. Aborting."; rm -f "$tmp"; exit 1; fi
if command -v gpg >/dev/null 2>&1; then
  gpg --show-keys "$tmp" >/dev/null 2>&1 || { echo "ERROR: not a valid GPG key. Aborting."; rm -f "$tmp"; exit 1; }
fi
install -m 0644 "$tmp" "$KEYRING"; rm -f "$tmp"
echo "      keyring installed: $KEYRING"

echo "[3/5] apt source"
arch="$(dpkg --print-architecture)"
echo "deb [arch=$arch signed-by=$KEYRING] https://cli.github.com/packages stable main" > "$LIST"
echo "      $LIST"

echo "[4/5] apt-get update"
apt-get update

echo "[5/5] apt-get install gh"
apt-get install -y gh

echo "DONE: $(gh --version | head -1)"
