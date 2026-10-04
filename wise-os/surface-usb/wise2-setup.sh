#!/usr/bin/env bash
# WISE² workstation foundation on Ubuntu 24.04 LTS
# Run as your normal user (not root):  bash wise2-setup.sh [--wallpaper /path/to.png] [--no-ollama-model]
set -euo pipefail

if [[ $EUID -eq 0 ]]; then echo "Run as your normal user; sudo is used where needed."; exit 1; fi
. /etc/os-release
if [[ "${VERSION_ID}" != "24.04" ]]; then echo "Expected Ubuntu 24.04, found ${VERSION_ID}."; exit 1; fi

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WALLPAPER="$SOURCE_DIR/wise2-wallpaper-2256x1504.png"; PULL_MODEL=1; NODE_MAJOR="${NODE_MAJOR:-24}"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --wallpaper) [[ $# -ge 2 && -f "$2" ]] || { echo "--wallpaper needs an existing image"; exit 1; }; WALLPAPER="$2"; shift 2;;
    --no-ollama-model) PULL_MODEL=0; shift;;
    *) echo "Unknown option $1"; exit 1;;
  esac
done

LOG="$HOME/wise2-setup.log"; exec > >(tee -a "$LOG") 2>&1
step() { printf '\n== %s ==\n' "$*"; }
USER_NAME="$(id -un)"

step "Base packages"
sudo apt-get update
sudo apt-get install -y git curl ca-certificates gnupg apt-transport-https \
  python3 python3-venv python3-pip build-essential unzip jq rsync gnome-terminal xdg-utils

step "Directory layout and permissions"
sudo groupadd -f wise2
sudo usermod -aG wise2 "$USER_NAME"
sudo mkdir -p /opt/wise2/{core,imp,command-center,agents,models,edge,deploy,recovery,branding} \
              /etc/wise2 \
              /var/lib/wise2/{projects,clients,memory,backups}
sudo chown -R root:wise2 /opt/wise2 /var/lib/wise2 /etc/wise2
sudo chmod 2775 /opt/wise2 /opt/wise2/*
sudo chmod 2770 /var/lib/wise2 /var/lib/wise2/projects /var/lib/wise2/clients /var/lib/wise2/memory
sudo chmod 2750 /var/lib/wise2/backups
sudo chmod 0750 /etc/wise2
printf 'WISE² workstation foundation on Ubuntu 24.04 LTS\ninstalled=%s\n' "$(date -Is)" | sudo tee /etc/wise2/release >/dev/null

step "Node.js ${NODE_MAJOR}.x (NodeSource)"
if ! command -v node >/dev/null; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | sudo -E bash -
  sudo apt-get install -y nodejs
fi
node --version; npm --version

step "Docker Engine + Compose (official Docker apt repo)"
if ! command -v docker >/dev/null; then
  sudo install -m 0755 -d /etc/apt/keyrings
  sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  sudo chmod a+r /etc/apt/keyrings/docker.asc
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${UBUNTU_CODENAME} stable" \
    | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
  sudo apt-get update
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi
sudo systemctl enable --now docker
sudo docker run --rm hello-world >/dev/null && echo "Docker OK"
echo "NOTE: your user was NOT added to the 'docker' group. That group is root-equivalent; use 'sudo docker' or add yourself deliberately."

step "Tailscale (official installer)"
command -v tailscale >/dev/null || curl -fsSL https://tailscale.com/install.sh | sh
echo "Sign in yourself later with:  sudo tailscale up"

step "VS Code (Microsoft apt repo)"
if ! command -v code >/dev/null; then
  curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | sudo gpg --dearmor -o /etc/apt/keyrings/microsoft.gpg
  echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/microsoft.gpg] https://packages.microsoft.com/repos/code stable main" \
    | sudo tee /etc/apt/sources.list.d/vscode.list >/dev/null
  sudo apt-get update
  sudo apt-get install -y code
fi

step "Ollama (official installer; listens on localhost only by default)"
command -v ollama >/dev/null || curl -fsSL https://ollama.com/install.sh | sh
MEM_GB=$(awk '/MemTotal/ {printf "%d", $2/1024/1024}' /proc/meminfo)
if   (( MEM_GB >= 14 )); then MODEL="llama3.1:8b"
elif (( MEM_GB >= 7 ));  then MODEL="llama3.2:3b"
else MODEL="llama3.2:1b"; fi
echo "Detected ${MEM_GB} GB RAM -> model ${MODEL}"
if (( PULL_MODEL )); then
  FREE_GB=$(df --output=avail -BG / | tail -1 | tr -dc '0-9')
  if (( FREE_GB >= 20 )); then ollama pull "$MODEL"; else echo "Skipping model pull: only ${FREE_GB} GB free."; fi
fi
echo "$MODEL" | sudo tee /etc/wise2/default-model >/dev/null

step "Branding and launchers"
if [[ -n "$WALLPAPER" && -f "$WALLPAPER" ]]; then
  sudo install -m 0664 -g wise2 "$WALLPAPER" /opt/wise2/branding/wallpaper.png
  gsettings set org.gnome.desktop.background picture-uri      "file:///opt/wise2/branding/wallpaper.png" || true
  gsettings set org.gnome.desktop.background picture-uri-dark "file:///opt/wise2/branding/wallpaper.png" || true
  gsettings set org.gnome.desktop.background picture-options  "zoom" || true
  gsettings set org.gnome.desktop.interface color-scheme      "prefer-dark" || true
fi
APPS="$HOME/.local/share/applications"; mkdir -p "$APPS"
cat > "$APPS/wise2-workspace.desktop" <<EOF
[Desktop Entry]
Type=Application
Name=WISE² Workspace
Comment=Open /opt/wise2 in VS Code
Exec=code /opt/wise2
Icon=code
Categories=Development;
EOF
cat > "$APPS/wise2-terminal.desktop" <<EOF
[Desktop Entry]
Type=Application
Name=WISE² Terminal
Exec=gnome-terminal --working-directory=/opt/wise2
Icon=utilities-terminal
Categories=System;
EOF
cat > "$APPS/wise2-imp-ollama.desktop" <<EOF
[Desktop Entry]
Type=Application
Name=WISE² Ollama Chat
Exec=gnome-terminal -- ollama run ${MODEL}
Icon=utilities-terminal
Categories=Development;
EOF

step "Verification"
for c in git curl python3 node npm docker tailscale code ollama; do
  printf '%-10s %s\n' "$c" "$(command -v $c || echo MISSING)"
done
docker compose version || true
python3 -m venv "$(mktemp -d /tmp/wise2-venv-test.XXXXXX)" && echo "venv OK"
ls -ld /opt/wise2 /etc/wise2 /var/lib/wise2

cat <<'DONE'

WISE² workstation foundation on Ubuntu 24.04 LTS — setup finished.
Owner actions still needed:
  1. Log out and back in (activates the 'wise2' group).
  2. Sign in to Tailscale:   sudo tailscale up
  3. Sign in to VS Code / other accounts as desired.
Not installed or run by this script: linux-surface kernel.
Shannon (AI pentester, Keygraph, AGPLv3) is installed separately by install-shannon.sh, wired to local Ollama. Launch: wise2-shannon
Log: ~/wise2-setup.log
DONE
