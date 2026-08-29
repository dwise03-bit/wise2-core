#!/usr/bin/env bash
set -euo pipefail

JSON=false
if [[ "${1:-}" == "--json" ]]; then
  JSON=true
fi

check_url() {
  local name="$1"
  local url="$2"
  if curl -fsS --max-time 8 "$url" >/dev/null 2>&1; then
    [[ "$JSON" == true ]] && printf '"%s":{"status":"healthy","url":"%s"}' "$name" "$url" || printf "%-22s healthy %s\n" "$name" "$url"
  else
    [[ "$JSON" == true ]] && printf '"%s":{"status":"down","url":"%s"}' "$name" "$url" || printf "%-22s down    %s\n" "$name" "$url"
  fi
}

if [[ "$JSON" == true ]]; then
  printf '{"timestamp":"%s",' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  printf '"disk":%s,' "$(df -Pk / | awk 'NR==2 {printf "{\"capacity\":\"%s\",\"availableKb\":%s}", $5, $4}')"
  printf '"memory":%s,' "$(vm_stat 2>/dev/null | awk '/Pages free/ {gsub("\\.","",$3); printf "{\"freePages\":%s}", $3}' || printf '{}')"
  if docker compose -f docker-compose.production.yml ps --format json >/tmp/wise2-compose-health.json 2>/dev/null; then
    printf '"compose":{"status":"healthy"},'
  else
    printf '"compose":{"status":"down"},'
  fi
  check_url "controlBridge" "http://127.0.0.1:3099/v1/control/health"; printf ','
  check_url "wise2" "https://wise2.net"; printf ','
  check_url "api" "http://127.0.0.1:3010/api/health"; printf ','
  check_url "ollama" "http://127.0.0.1:11434/api/tags"; printf ','
  check_url "hermes" "${WISE2_HERMES_URL:-http://127.0.0.1:3012/api/health}"
  printf '}\n'
else
  echo "WISE2 local health $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  df -h /
  command -v free >/dev/null 2>&1 && free -h || vm_stat | head -8
  docker compose -f docker-compose.production.yml ps || true
  check_url "control-bridge" "http://127.0.0.1:3099/v1/control/health"
  check_url "wise2.net" "https://wise2.net"
  check_url "api" "http://127.0.0.1:3010/api/health"
  check_url "ollama" "http://127.0.0.1:11434/api/tags"
  check_url "hermes" "${WISE2_HERMES_URL:-http://127.0.0.1:3012/api/health}"
fi
