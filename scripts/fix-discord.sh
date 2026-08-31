#!/usr/bin/env bash
# Fix WISE² Discord bot: stop duplicates, deploy commands, start when gateway allows.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CORRECT_GUILD="1512093487145680926"

echo "=== Fix WISE² Discord ==="

# Stop Mac bot
pm2 stop wise2-bot 2>/dev/null || true
pm2 delete wise2-bot 2>/dev/null || true

# Stop VPS bot (avoid dual connect / session burn)
ssh -o ConnectTimeout=8 dwise@100.68.145.5 \
  'pm2 stop wise2-bot 2>/dev/null; pm2 delete wise2-bot 2>/dev/null; echo VPS bot stopped' \
  2>/dev/null || echo "  (VPS unreachable — skip remote stop)"

# Ensure guild ID
for f in "${repo_root}/.env" "${repo_root}/services/bot/.env"; do
  [[ -f "$f" ]] || continue
  grep -v '^DISCORD_GUILD_ID=' "$f" > "${f}.tmp" || true
  echo "DISCORD_GUILD_ID=${CORRECT_GUILD}" >> "${f}.tmp"
  mv "${f}.tmp" "$f"
done

echo ""
echo "Deploying slash commands (REST, no gateway)..."
cd "${repo_root}/services/bot"
WISE2_DISCORD_DEPLOY_ONLY=1 node index.js 2>&1 | grep -v injected | tail -3

echo ""
echo "Starting bot when gateway session is available..."
bash "${repo_root}/scripts/start-discord-bot-when-ready.sh"
