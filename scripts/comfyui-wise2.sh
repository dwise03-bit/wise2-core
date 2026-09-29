#!/usr/bin/env bash
# WISE² ComfyUI launcher — status, generate, download, UI tunnel.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=/dev/null
source "${repo_root}/scripts/gpu-env.sh"

cmd="${1:-status}"
shift || true

case "$cmd" in
  status)
    bash "${repo_root}/scripts/gpu-generation-status.sh"
    ;;
  ui)
    echo "ComfyUI → http://localhost:8188 (Tailscale tunnel)"
    ssh -N -L 8188:127.0.0.1:8188 "${VPS_SSH_USER:-dwise}@${VPS_TAILSCALE_IP}"
    ;;
  generate)
    prompt="${*:-WISE² command center, cinematic}"
    COMFYUI_API_URL="${COMFYUI_API_URL}" python3 "${repo_root}/scripts/comfyui-generate.py" "$prompt"
    ;;
  download)
    bash "${repo_root}/scripts/comfyui-download.sh" "${1:-wise2}"
    ;;
  ls)
    ssh "${VPS_SSH_USER:-dwise}@${VPS_TAILSCALE_IP}" \
      'ls -lt ~/.comfyui/ComfyUI/output/*.png 2>/dev/null | head -15'
    ;;
  campaign)
    COMFYUI_API_URL="${COMFYUI_API_URL}" python3 "${repo_root}/scripts/piff-city-generator.py"
    ;;
  zordon)
    COMFYUI_API_URL="${COMFYUI_API_URL}" python3 "${repo_root}/scripts/zordon-generator.py" "$@"
    ;;
  *)
    echo "Usage: bash scripts/comfyui-wise2.sh {status|ui|generate|download|ls|campaign|zordon}"
    exit 1
    ;;
esac
