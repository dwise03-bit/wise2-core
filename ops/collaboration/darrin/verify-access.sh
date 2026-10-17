#!/usr/bin/env bash
set -euo pipefail

echo "WISE2 Darrin access verification"
echo "GitHub SSH:"
ssh -o BatchMode=yes -T git@github.com 2>&1 || true

echo
echo "GitHub CLI identity:"
gh auth status

echo
echo "Tailscale:"
tailscale status

echo
echo "Canonical repositories:"
for repo in wise2-core wise2.net wise2-dashboard Wise2-hardware; do
  if [ -d "$HOME/wise2/$repo/.git" ]; then
    git -C "$HOME/wise2/$repo" remote -v | head -2
    git -C "$HOME/wise2/$repo" status --short --branch
  else
    echo "MISSING: $HOME/wise2/$repo"
  fi
done

echo
echo "No deployment is authorized by this script. Production remains GREEN-gated."
