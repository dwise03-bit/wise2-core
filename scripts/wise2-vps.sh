#!/usr/bin/env bash
set -euo pipefail
cfg="${WISE2_AGENT_CONFIG:-$HOME/.config/wise2/agents.env}"
[[ -f "$cfg" ]] && source "$cfg"
host="${WISE2_VPS_HOST:-dwise@100.68.145.5}"
repo="${WISE2_REPO:-/home/dwise/wise2-core}"
case "${1:-check}" in
  check) ssh -o BatchMode=yes -o ConnectTimeout=8 "$host" "cd '$repo' && git status --short && git branch --show-current && git rev-parse --short HEAD" ;;
  status) ssh -o BatchMode=yes -o ConnectTimeout=8 "$host" "docker ps --format '{{.Names}} {{.Status}}' | head -30" ;;
  *) echo "Usage: $0 [check|status]" >&2; exit 2;;
esac
