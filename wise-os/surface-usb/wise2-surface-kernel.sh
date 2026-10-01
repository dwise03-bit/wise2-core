#!/usr/bin/env bash
# linux-surface kernel/drivers for Surface Laptop 4 (Intel) on Ubuntu 24.04
# Follows https://github.com/linux-surface/linux-surface/wiki/Installation-and-Setup
# Run as your normal user:  bash wise2-surface-kernel.sh
set -euo pipefail

if [[ $EUID -eq 0 ]]; then echo "Run as your normal user; sudo is used where needed."; exit 1; fi
. /etc/os-release
[[ "${VERSION_ID}" == "24.04" ]] || { echo "Expected Ubuntu 24.04, found ${VERSION_ID}."; exit 1; }

MODEL="$(cat /sys/class/dmi/id/product_name 2>/dev/null || true)"
echo "Detected model: ${MODEL}"
if [[ "$MODEL" != *"Surface"* ]]; then echo "Not a Surface; aborting."; exit 1; fi

echo "Running kernel before: $(uname -r)"

sudo apt-get update
sudo apt-get install -y curl ca-certificates gnupg mokutil
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://raw.githubusercontent.com/linux-surface/linux-surface/master/pkg/keys/surface.asc \
  | gpg --dearmor | sudo tee /etc/apt/keyrings/linux-surface.gpg >/dev/null
gpg --show-keys --with-fingerprint /etc/apt/keyrings/linux-surface.gpg || true
echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/linux-surface.gpg] https://pkg.surfacelinux.com/debian release main" \
  | sudo tee /etc/apt/sources.list.d/linux-surface.list >/dev/null

sudo apt-get update
# Installs alongside the stock Ubuntu kernel; nothing is removed.
sudo apt-get install -y linux-image-surface linux-headers-surface libwacom-surface iptsd
sudo update-grub

SB="$(mokutil --sb-state 2>/dev/null || echo unknown)"
echo "Secure Boot state: ${SB}"
if grep -qi "SecureBoot enabled" <<<"$SB"; then
  sudo apt-get install -y linux-surface-secureboot-mok
  cat <<'MOK'
Secure Boot is ON: on next reboot a blue MOK screen appears.
Choose "Enroll MOK" -> Continue -> Yes, and enter: surface
MOK
else
  echo "Secure Boot is not enabled; MOK enrollment skipped."
fi

cat <<'DONE'

Done. Next:
  1. Reboot. Hold Shift (or Esc) at the GRUB screen if you want to pick a kernel.
  2. Confirm:  uname -r   (should contain "surface")
  3. The stock Ubuntu kernel remains under GRUB > Advanced options as your recovery fallback.
DONE
