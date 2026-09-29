#!/usr/bin/env bash
# Run WISE² Discord bot on your Mac.
# Usage:
#   bash scripts/setup-discord-mac.sh
#   bash scripts/setup-discord-mac.sh --start
#   DISCORD_BOT_TOKEN='...' bash scripts/setup-discord-mac.sh --start
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
start=false

for arg in "$@"; do
  case "$arg" in
    --start) start=true ;;
    -h|--help)
      echo "Usage: bash scripts/setup-discord-mac.sh [--start]"
      exit 0
      ;;
  esac
done

echo "WISE² Discord on Mac"
bash "${repo_root}/scripts/sync-bot-env.sh" --force-discord

if [[ -n "${DISCORD_BOT_TOKEN:-}" ]]; then
  DISCORD_BOT_TOKEN="$DISCORD_BOT_TOKEN" bash "${repo_root}/scripts/set-discord-bot-token.sh"
fi

open "https://discord.com/developers/applications/1512638268225622147/bot" 2>/dev/null || true
open -a Discord 2>/dev/null || true

cd "${repo_root}/services/bot"
[[ -d node_modules/discord.js ]] || npm install --omit=dev

echo "Testing login..."
if ! node -e "
require('./load-env');
const t = process.env.DISCORD_BOT_TOKEN || '';
if (!t) process.exit(2);
const { Client, GatewayIntentBits } = require('discord.js');
const c = new Client({ intents: [GatewayIntentBits.Guilds] });
c.login(t).then(() => c.destroy()).catch(() => process.exit(1));
" 2>/dev/null; then
  echo ""
  echo "Need a fresh bot token from the Developer Portal (opened on Mac)."
  echo ""
  echo "  1. Discord app or browser → Developer Portal → Bot → Reset Token"
  echo "  2. Run:"
  echo "     DISCORD_BOT_TOKEN='paste_token' bash scripts/setup-discord-mac.sh --start"
  echo ""
  exit 1
fi

echo "Login OK. Creating webhooks..."
node create-webhooks.js || true

if [[ "$start" == true ]]; then
  echo "Bot running on Mac — test /help in Discord (Ctrl+C to stop)"
  npm start
else
  echo "Ready. Start: bash scripts/setup-discord-mac.sh --start"
fi
