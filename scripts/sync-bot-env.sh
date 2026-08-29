#!/usr/bin/env bash
# Merge Discord env keys from repo production env into services/bot/.env
set -euo pipefail

force=false
[[ "${1:-}" == "--force-discord" ]] && force=true

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
bot_env="${repo_root}/services/bot/.env"
example="${repo_root}/services/bot/.env.example"

mkdir -p "$(dirname "$bot_env")"
[[ -f "$bot_env" ]] || cp "$example" "$bot_env"

sources=()
[[ -f "${repo_root}/.env.production" ]] && sources+=("${repo_root}/.env.production")
[[ -f "${repo_root}/.env" ]] && sources+=("${repo_root}/.env")

keys=(DISCORD_BOT_TOKEN DISCORD_CLIENT_ID DISCORD_CLIENT_SECRET DISCORD_GUILD_ID COMFYUI_API_URL)

is_placeholder() {
  local v="$1"
  [[ -z "$v" ]] && return 0
  [[ "$v" == *your_* ]] && return 0
  [[ "$v" == *placeholder* ]] && return 0
  [[ "$v" == *changeme* ]] && return 0
  [[ "$v" == *CONFIGURE* ]] && return 0
  [[ "$v" == "..." ]] && return 0
  return 1
}

get_val() {
  local key="$1" file="$2"
  grep -m1 "^${key}=" "$file" 2>/dev/null | cut -d= -f2- || true
}

for key in "${keys[@]}"; do
  current="$(get_val "$key" "$bot_env")"
  [[ "$force" != true ]] && ! is_placeholder "$current" && continue
  for src in "${sources[@]}"; do
    incoming="$(get_val "$key" "$src")"
    if ! is_placeholder "$incoming"; then
      grep -v "^${key}=" "$bot_env" > "${bot_env}.tmp" || true
      echo "${key}=${incoming}" >> "${bot_env}.tmp"
      mv "${bot_env}.tmp" "$bot_env"
      echo "  synced ${key}"
      break
    fi
  done
done

# WISE² defaults (public)
if is_placeholder "$(get_val DISCORD_CLIENT_ID "$bot_env")"; then
  grep -v "^DISCORD_CLIENT_ID=" "$bot_env" > "${bot_env}.tmp" || true
  echo "DISCORD_CLIENT_ID=1512638268225622147" >> "${bot_env}.tmp"
  mv "${bot_env}.tmp" "$bot_env"
  echo "  set DISCORD_CLIENT_ID"
fi
if is_placeholder "$(get_val DISCORD_GUILD_ID "$bot_env")"; then
  grep -v "^DISCORD_GUILD_ID=" "$bot_env" > "${bot_env}.tmp" || true
  echo "DISCORD_GUILD_ID=1512093487145680926" >> "${bot_env}.tmp"
  mv "${bot_env}.tmp" "$bot_env"
  echo "  set DISCORD_GUILD_ID"
fi

echo "Bot env: ${bot_env}"
