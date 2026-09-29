#!/usr/bin/env bash
# Set DISCORD_BOT_TOKEN (+ optional CLIENT_ID / GUILD_ID) on this host.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
prod_env="${repo_root}/.env.production"
bot_env="${repo_root}/services/bot/.env"

upsert() {
  local file="$1" key="$2" val="$3"
  touch "$file"
  grep -v "^${key}=" "$file" > "${file}.tmp" 2>/dev/null || true
  printf '%s=%s\n' "$key" "$val" >> "${file}.tmp"
  mv "${file}.tmp" "$file"
}

if [[ -n "${DISCORD_TOKEN_FILE:-}" && -f "${DISCORD_TOKEN_FILE}" ]]; then
  DISCORD_BOT_TOKEN="$(tr -d '\r\n' < "${DISCORD_TOKEN_FILE}")"
elif [[ -z "${DISCORD_BOT_TOKEN:-}" ]]; then
  echo "Paste DISCORD_BOT_TOKEN:"
  read -rs DISCORD_BOT_TOKEN
  echo ""
fi

token="$(echo "$DISCORD_BOT_TOKEN" | tr -d '\r\n' | sed -e 's/^["'\'']//' -e 's/["'\'']$//')"
[[ -n "$token" ]] || { echo "No token."; exit 1; }

upsert "$prod_env" "DISCORD_BOT_TOKEN" "$token"
upsert "$prod_env" "DISCORD_CLIENT_ID" "${DISCORD_CLIENT_ID:-1512638268225622147}"
upsert "$prod_env" "DISCORD_GUILD_ID" "${DISCORD_GUILD_ID:-1512093487145680926}"
local_env="${repo_root}/.env"
upsert "$local_env" "DISCORD_BOT_TOKEN" "$token"
upsert "$local_env" "DISCORD_CLIENT_ID" "${DISCORD_CLIENT_ID:-1512638268225622147}"
upsert "$local_env" "DISCORD_GUILD_ID" "${DISCORD_GUILD_ID:-1512093487145680926}"

bash "${repo_root}/scripts/sync-bot-env.sh" --force-discord
echo "Discord env updated."

if command -v pm2 >/dev/null 2>&1; then
  cd "${repo_root}/services/bot"
  pm2 restart wise2-bot --update-env 2>/dev/null || pm2 start ecosystem.config.cjs
  pm2 save 2>/dev/null || true
fi

[[ -n "${DISCORD_TOKEN_FILE:-}" && -f "${DISCORD_TOKEN_FILE}" ]] && rm -f "${DISCORD_TOKEN_FILE}"
