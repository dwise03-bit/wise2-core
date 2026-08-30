#!/usr/bin/env bash
# Download ComfyUI renders from VPS to ./comfyui-output/
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=/dev/null
source "${repo_root}/scripts/gpu-env.sh"

prefix="${1:-wise2}"
dest="${repo_root}/comfyui-output"
mkdir -p "$dest"
remote="${VPS_SSH_USER:-dwise}@${VPS_TAILSCALE_IP}"

echo "Downloading ${prefix}*.png from ${remote} → ${dest}/"
ssh "$remote" "cd ~/.comfyui/ComfyUI/output && ls -1 ${prefix}*.png 2>/dev/null" | while read -r f; do
  [[ -n "$f" ]] || continue
  scp "${remote}:~/.comfyui/ComfyUI/output/${f}" "${dest}/"
  echo "  ✓ ${f}"
done
echo "Done."
