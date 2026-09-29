#!/usr/bin/env bash
set -euo pipefail

bridge_dir="$(cd "$(dirname "$0")/.." && pwd)"
repo_dir="$(cd "$bridge_dir/../.." && pwd)"
node_bin="$(command -v node)"
unit_dir="$HOME/.config/systemd/user"
env_dir="$HOME/.config/wise2"
env_file="$env_dir/reaper-bridge.env"
unit_file="$unit_dir/wise2-reaper-bridge.service"
reaper_resource_dir="${REAPER_RESOURCE_DIR:-$HOME/.config/REAPER}"

command -v systemctl >/dev/null || { echo 'systemd is required' >&2; exit 1; }
command -v openssl >/dev/null || { echo 'openssl is required' >&2; exit 1; }

if [[ ! -f "$env_file" ]]; then
  mkdir -p "$env_dir"
  umask 077
  printf 'WISE2_REAPER_BRIDGE_TOKEN=%s\nWISE2_REAPER_BRIDGE_HOST=127.0.0.1\nWISE2_REAPER_BRIDGE_PORT=8787\n' "$(openssl rand -hex 32)" > "$env_file"
fi

pnpm --dir "$bridge_dir" build
mkdir -p "$unit_dir"
cp "$repo_dir/services/reaper-bridge/systemd/wise2-reaper-bridge.service" "$unit_file"
mkdir -p "$reaper_resource_dir/Scripts"
cp "$bridge_dir/scripts/wise2_bridge.lua" "$reaper_resource_dir/Scripts/wise2_bridge.lua"
chmod 600 "$env_file"
systemctl --user daemon-reload
systemctl --user enable --now wise2-reaper-bridge.service

echo "Installed WISE² Linux bridge: $unit_file"
echo "ReaScript installed: $reaper_resource_dir/Scripts/wise2_bridge.lua"
echo 'Bridge is localhost-only at http://127.0.0.1:8787'
