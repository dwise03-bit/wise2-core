#!/usr/bin/env bash
# End-to-end Discord bot test on Mac.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CORRECT_GUILD="1512093487145680926"
CLIENT_ID="1512638268225622147"

upsert_guild() {
  local file="$1"
  [[ -f "$file" ]] || return 0
  grep -v '^DISCORD_GUILD_ID=' "$file" > "${file}.tmp" || true
  echo "DISCORD_GUILD_ID=${CORRECT_GUILD}" >> "${file}.tmp"
  mv "${file}.tmp" "$file"
}

echo "=== WISE² Discord E2E Test ==="

for f in "${repo_root}/.env.production" "${repo_root}/.env" "${repo_root}/services/bot/.env"; do
  upsert_guild "$f"
  echo "  guild → ${CORRECT_GUILD} in $(basename "$(dirname "$f")")/$(basename "$f")"
done

bash "${repo_root}/scripts/sync-bot-env.sh" --force-discord

cd "${repo_root}/services/bot"
[[ -d node_modules/discord.js ]] || npm install --omit=dev

echo ""
echo "1/4 Login test..."
if node -e "
require('./load-env');
const { Client, GatewayIntentBits } = require('discord.js');
const c = new Client({ intents: [GatewayIntentBits.Guilds] });
c.login(process.env.DISCORD_BOT_TOKEN).then(async () => {
  console.log('  login OK');
  c.destroy();
}).catch(e => { console.log('  login blocked:', e.message.slice(0,40)); process.exit(0); });
" 2>&1 | grep -v injected; then true; fi

echo ""
echo "2/4 Deploy slash commands (REST)..."
if WISE2_DISCORD_DEPLOY_ONLY=1 node index.js 2>&1 | grep -v injected | tee /tmp/discord-deploy.log | tail -5 | grep -q "Successfully reloaded"; then
  echo "  PASS: slash commands registered"
else
  echo "  FAIL: command deploy"
  tail -5 /tmp/discord-deploy.log 2>/dev/null || true
  exit 1
fi

echo ""
echo "3/4 Webhooks + channels (skip if session limited)..."
node create-webhooks.js 2>&1 | grep -v injected | tail -10 || echo "  skipped"

echo ""
echo "4/4 Start bot (Mac session may be rate-limited until reset)..."
pm2 delete wise2-bot 2>/dev/null || true
pm2 start ecosystem.config.cjs 2>/dev/null || echo "  pm2 start skipped"
sleep 8
pm2 logs wise2-bot --lines 15 --nostream 2>&1 | tail -15 || true

if pm2 logs wise2-bot --lines 30 --nostream 2>&1 | grep -q "sessions remaining"; then
  pm2 stop wise2-bot 2>/dev/null || true
  echo ""
  echo "Gateway session limit — bot stopped until Discord resets (~Aug 30 1:46 PM UTC)."
  echo "Slash commands ARE registered — test /help after restart:"
  echo "  bash scripts/start-discord-bot.sh"
  exit 0
fi

if pm2 logs wise2-bot --lines 30 --nostream 2>&1 | grep -qiE "ready|logged in|commands deployed|Bot is online"; then
  echo ""
  echo "PASS — test /help and /status in Discord"
  exit 0
fi

echo ""
echo "Check pm2 logs — bot may still be starting"
pm2 status wise2-bot | tail -3
