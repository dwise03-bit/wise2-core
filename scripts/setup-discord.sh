#!/usr/bin/env bash
# WISE² Discord setup — env, webhooks, bot start (Mac or VPS).
# Usage:
#   bash scripts/setup-discord.sh
#   bash scripts/setup-discord.sh --vps
#   DISCORD_BOT_TOKEN='...' bash scripts/setup-discord.sh
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
remote=false
vps_host="${VPS_SSH_USER:-dwise}@${VPS_TAILSCALE_IP:-100.68.145.5}"

# Known WISE² Discord app (public IDs)
DEFAULT_CLIENT_ID="${DISCORD_CLIENT_ID:-1512638268225622147}"
DEFAULT_GUILD_ID="${DISCORD_GUILD_ID:-1512093487145680926}"

for arg in "$@"; do
  case "$arg" in
    --vps) remote=true ;;
    -h|--help)
      echo "Usage: bash scripts/setup-discord.sh [--vps]"
      exit 0
      ;;
  esac
done

run_local() {
  cd "$repo_root"
  bash scripts/sync-bot-env.sh --force-discord 2>/dev/null || bash scripts/sync-bot-env.sh

  export DISCORD_CLIENT_ID="${DISCORD_CLIENT_ID:-$DEFAULT_CLIENT_ID}"
  export DISCORD_GUILD_ID="${DISCORD_GUILD_ID:-$DEFAULT_GUILD_ID}"

  if [[ -z "${DISCORD_BOT_TOKEN:-}" ]]; then
    if [[ -t 0 ]]; then
      echo ""
      echo "Discord Developer Portal → WISE² Bot → Reset Token"
      echo "https://discord.com/developers/applications/${DEFAULT_CLIENT_ID}/bot"
      echo ""
      read -rsp "Paste DISCORD_BOT_TOKEN: " DISCORD_BOT_TOKEN
      echo ""
      export DISCORD_BOT_TOKEN
    else
      echo "Non-interactive: using DISCORD_BOT_TOKEN from .env.production if present"
    fi
  fi

  if [[ -n "${DISCORD_BOT_TOKEN:-}" ]]; then
    DISCORD_BOT_TOKEN="$DISCORD_BOT_TOKEN" \
      DISCORD_CLIENT_ID="$DISCORD_CLIENT_ID" \
      DISCORD_GUILD_ID="$DISCORD_GUILD_ID" \
      bash scripts/set-discord-bot-token.sh
  fi

  echo ""
  echo "Invite bot (if not already in server):"
  echo "  https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&permissions=2147551232&scope=bot%20applications.commands"
  echo ""

  cd services/bot
  if [[ ! -d node_modules/discord.js ]]; then
    echo "Installing bot dependencies..."
    npm install --omit=dev
  fi

  echo "Creating channels + webhooks..."
  node create-webhooks.js || echo "  (webhook step skipped — fix token first)"

  if command -v pm2 >/dev/null 2>&1; then
    pm2 delete wise2-bot 2>/dev/null || true
    pm2 start ecosystem.config.cjs
    pm2 save 2>/dev/null || true
    sleep 5
    pm2 logs wise2-bot --lines 12 --nostream 2>/dev/null | tail -12 || true
  else
    echo "Start bot: cd services/bot && npm start"
  fi
}

if [[ "$remote" == true ]]; then
  echo "Deploying Discord setup to ${vps_host}..."
  rsync -avz \
    "${repo_root}/scripts/setup-discord.sh" \
    "${repo_root}/scripts/sync-bot-env.sh" \
    "${repo_root}/scripts/set-discord-bot-token.sh" \
    "${vps_host}:~/wise2-core/scripts/"

  rsync -avz \
    "${repo_root}/services/bot/load-env.js" \
    "${repo_root}/services/bot/ecosystem.config.cjs" \
    "${repo_root}/services/bot/index.js" \
    "${repo_root}/services/bot/create-webhooks.js" \
    "${vps_host}:~/wise2-core/services/bot/"

  ssh "${vps_host}" "chmod +x ~/wise2-core/scripts/*.sh && cd ~/wise2-core && bash scripts/setup-discord.sh"
else
  run_local
fi

echo ""
echo "Done. Test in Discord: /help  /status"
