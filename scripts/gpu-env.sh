#!/usr/bin/env bash
# GPU generation env — source from scripts and agent sessions.
export VPS_TAILSCALE_IP="${VPS_TAILSCALE_IP:-100.68.145.5}"
export VPS_SSH_USER="${VPS_SSH_USER:-dwise}"
export COMFYUI_API_URL="${COMFYUI_API_URL:-http://${VPS_TAILSCALE_IP}:8188}"
export MUSICGEN_API_URL="${MUSICGEN_API_URL:-http://${VPS_TAILSCALE_IP}:4900}"
