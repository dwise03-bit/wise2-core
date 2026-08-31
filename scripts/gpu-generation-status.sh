#!/usr/bin/env bash
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=/dev/null
source "${repo_root}/scripts/gpu-env.sh"

echo "WISE² GPU Generation Status"
echo "==========================="
echo "Host: gpu-nmls-1 (${VPS_TAILSCALE_IP})"
echo ""

check() {
  local name="$1" url="$2"
  if curl -sf --max-time 8 "$url" >/dev/null; then
    echo "✓ ${name}  ${url}"
  else
    echo "✗ ${name}  ${url}"
  fi
}

check "ComfyUI" "${COMFYUI_API_URL}/system_stats"
check "MusicGen" "${MUSICGEN_API_URL}/health"
echo ""
ssh -o ConnectTimeout=6 "${VPS_SSH_USER}@${VPS_TAILSCALE_IP}" \
  'nvidia-smi --query-gpu=name,memory.used,memory.total,utilization.gpu --format=csv,noheader 2>/dev/null' \
  || echo "(nvidia-smi unavailable)"
echo ""
echo "Env: COMFYUI_API_URL=${COMFYUI_API_URL}"
