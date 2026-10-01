#!/usr/bin/env bash
# Run on the installed Ubuntu system, as the desktop user.
set -Eeuo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ ${1:-} == --help ]]; then
  echo 'Usage: bash START-WISE2.sh [--no-ollama-model]'
  echo 'Installs WISE² workstation, Surface drivers, local dashboard and Agent-Reach.'
  echo 'Run in installed Ubuntu 24.04 amd64, not the temporary Try Ubuntu session.'
  exit 0
fi
[[ $(uname -s) == Linux && $EUID -ne 0 ]] || { echo 'Run as your desktop user in Ubuntu Linux.'; exit 1; }
. /etc/os-release
[[ $ID == ubuntu && $VERSION_ID == 24.04 && $(uname -m) == x86_64 ]] || { echo 'Requires Ubuntu 24.04 amd64.'; exit 1; }
if [[ $(findmnt -n -o FSTYPE /) == overlay ]]; then
  echo 'This is the temporary live session. Install Ubuntu, reboot into it, then run this setup.'
  echo 'Nothing has been installed. See START-HERE.txt for the installation sequence.'
  exit 1
fi
[[ -f "$HERE/dashboard/server.js" ]] || { echo 'Dashboard payload missing; recopy the complete wise2-branding folder.'; exit 1; }
mkdir -p "$HOME/.local/state/wise2"
exec > >(tee -a "$HOME/.local/state/wise2/install.log") 2>&1
trap 'echo "Setup stopped at line $LINENO. Fix the reported error and rerun; log: ~/.local/state/wise2/install.log"' ERR
sudo -v
bash "$HERE/wise2-setup.sh" "$@"
if [[ $(cat /sys/class/dmi/id/product_name) == 'Surface Laptop 4' ]]; then
  bash "$HERE/wise2-surface-kernel.sh"
fi
bash "$HERE/install-dashboard.sh"
bash "$HERE/install-agent-reach.sh"
bash "$HERE/install-shannon.sh"
echo 'WISE² setup finished. Reboot and complete Surface MOK enrollment if prompted.'
echo 'Then open WISE² Command Center from Applications. Hardware must be tested on the Surface.'
