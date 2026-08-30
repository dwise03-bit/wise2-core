#!/usr/bin/env bash
# Start WISE² Discord bot when gateway sessions are available.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${repo_root}/services/bot"

echo "Checking Discord gateway..."
if ! node "${repo_root}/scripts/discord-gateway-probe.js" 2>&1 | grep -v injected | grep -q '^READY$'; then
  echo "Gateway not ready yet (session limit or bad token)."
  echo "Run: bash scripts/start-discord-bot-when-ready.sh"
  exit 1
fi

pm2 delete wise2-bot 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save 2>/dev/null || true
sleep 8
pm2 logs wise2-bot --lines 10 --nostream 2>&1 | tail -10
echo "Test in Discord: /help  /comfyui-status  /generate-image"
