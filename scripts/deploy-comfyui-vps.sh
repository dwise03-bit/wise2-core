#!/usr/bin/env bash
# Deploy ComfyUI tooling + Discord bot integration to gpu-nmls-1 via Tailscale.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=/dev/null
source "${repo_root}/scripts/gpu-env.sh"
remote="${VPS_SSH_USER:-dwise}@${VPS_TAILSCALE_IP}"

echo "Deploying WISE² GPU + Discord integration → ${remote}"

rsync -avz \
  "${repo_root}/scripts/comfyui_client.py" \
  "${repo_root}/scripts/comfyui-generate.py" \
  "${repo_root}/scripts/comfyui-wise2.sh" \
  "${repo_root}/scripts/comfyui-download.sh" \
  "${repo_root}/scripts/gpu-env.sh" \
  "${repo_root}/scripts/gpu-generation-status.sh" \
  "${repo_root}/scripts/sync-bot-env.sh" \
  "${repo_root}/scripts/setup-discord-tailscale.sh" \
  "${repo_root}/scripts/piff-city-generator.py" \
  "${remote}:~/wise2-core/scripts/"

rsync -avz \
  "${repo_root}/services/bot/index.js" \
  "${repo_root}/services/bot/load-env.js" \
  "${repo_root}/services/bot/ecosystem.config.cjs" \
  "${remote}:~/wise2-core/services/bot/"

rsync -avz \
  "${repo_root}/services/bot/lib/" \
  "${remote}:~/wise2-core/services/bot/lib/"

ssh "${remote}" bash <<'REMOTE'
set -euo pipefail
cd ~/wise2-core
chmod +x scripts/*.sh scripts/comfyui-generate.py 2>/dev/null || true
bash scripts/sync-bot-env.sh --force-discord
# VPS bot talks to local ComfyUI
grep -v '^COMFYUI_API_URL=' services/bot/.env > services/bot/.env.tmp || true
echo 'COMFYUI_API_URL=http://127.0.0.1:8188' >> services/bot/.env.tmp
mv services/bot/.env.tmp services/bot/.env
curl -sf http://127.0.0.1:8188/system_stats >/dev/null && echo "✓ ComfyUI online" || echo "✗ ComfyUI offline"
cd services/bot
npm install --omit=dev --silent 2>/dev/null || npm install --omit=dev
WISE2_DISCORD_DEPLOY_ONLY=1 node index.js 2>&1 | tail -2 || true
pm2 delete wise2-bot 2>/dev/null || true
COMFYUI_API_URL=http://127.0.0.1:8188 pm2 start ecosystem.config.cjs --update-env
pm2 save
REMOTE

echo "Done. Test: bash scripts/comfyui-wise2.sh status"
