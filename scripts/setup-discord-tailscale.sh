#!/usr/bin/env bash
# Discord setup on gpu-nmls-1 via Tailscale (100.68.145.5).
# Usage:
#   bash scripts/setup-discord-tailscale.sh
#   DISCORD_BOT_TOKEN='...' bash scripts/setup-discord-tailscale.sh
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
host="${VPS_TAILSCALE_IP:-100.68.145.5}"
user="${VPS_SSH_USER:-dwise}"
target="${user}@${host}"

echo "WISE² Discord setup via Tailscale → ${target}"

rsync -avz \
  "${repo_root}/scripts/setup-discord.sh" \
  "${repo_root}/scripts/sync-bot-env.sh" \
  "${repo_root}/scripts/set-discord-bot-token.sh" \
  "${target}:~/wise2-core/scripts/"

rsync -avz \
  "${repo_root}/services/bot/load-env.js" \
  "${repo_root}/services/bot/ecosystem.config.cjs" \
  "${repo_root}/services/bot/index.js" \
  "${repo_root}/services/bot/create-webhooks.js" \
  "${target}:~/wise2-core/services/bot/"

if [[ -n "${DISCORD_BOT_TOKEN:-}" ]]; then
  echo "Applying token from environment..."
  ssh "${target}" "DISCORD_BOT_TOKEN='${DISCORD_BOT_TOKEN}' bash ~/wise2-core/scripts/set-discord-bot-token.sh"
fi

ssh "${target}" bash <<'REMOTE'
set -euo pipefail
cd ~/wise2-core
chmod +x scripts/*.sh
bash scripts/sync-bot-env.sh --force-discord

cd services/bot
npm install --omit=dev --silent 2>/dev/null || npm install --omit=dev

# Stop crash loop if token still bad
if ! node -e "
require('./load-env');
const { Client, GatewayIntentBits } = require('discord.js');
const t = process.env.DISCORD_BOT_TOKEN || '';
if (!t) process.exit(2);
const c = new Client({ intents: [GatewayIntentBits.Guilds] });
c.login(t).then(() => { c.destroy(); process.exit(0); }).catch(() => process.exit(1));
" 2>/dev/null; then
  echo "DISCORD_BOT_TOKEN invalid — reset at Developer Portal:"
  echo "  https://discord.com/developers/applications/1512638268225622147/bot"
  echo "Then: DISCORD_BOT_TOKEN='...' bash scripts/setup-discord-tailscale.sh"
  pm2 stop wise2-bot 2>/dev/null || true
  exit 1
fi

echo "Token OK — creating webhooks..."
node create-webhooks.js

pm2 delete wise2-bot 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
sleep 6
pm2 logs wise2-bot --lines 15 --nostream 2>/dev/null | tail -15
pm2 status wise2-bot | tail -3
REMOTE

echo ""
echo "Invite: https://discord.com/oauth2/authorize?client_id=1512638268225622147&permissions=2147551232&scope=bot%20applications.commands"
echo "Test in Discord: /help  /status"
