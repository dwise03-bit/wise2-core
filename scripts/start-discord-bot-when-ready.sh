#!/usr/bin/env bash
# Wait for Discord gateway session reset (one probe, then sleep — no login spam).
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
probe="${repo_root}/scripts/discord-gateway-probe.js"

echo "Checking Discord gateway (single probe)..."
out="$(node "$probe" 2>&1)" || true
echo "$out" | grep -v injected || true

if echo "$out" | grep -q '^READY$'; then
  echo "Gateway available now."
  bash "${repo_root}/scripts/start-discord-bot.sh"
  exit 0
fi

reset_at="$(echo "$out" | sed -n 's/^RESET_AT=//p' | head -1)"
if [[ -z "$reset_at" ]]; then
  echo "Gateway check failed — fix token or invite bot, then retry."
  echo "  bash scripts/set-discord-bot-token.sh"
  exit 1
fi

# Sleep until reset + 15s buffer (macOS + Linux date)
reset_epoch="$(node -e "process.stdout.write(String(Math.floor(new Date('${reset_at}').getTime()/1000)))")"
wait_until=$((reset_epoch + 15))
now_epoch="$(date +%s)"
wait_secs=$((wait_until - now_epoch))
if (( wait_secs > 0 )); then
  mins=$(( (wait_secs + 59) / 60 ))
  echo "Session limit — waiting ~${mins} min until ${reset_at} (+15s buffer)..."
  sleep "$wait_secs"
fi

echo "Retrying gateway after reset..."
out="$(node "$probe" 2>&1)" || true
echo "$out" | grep -v injected || true

if echo "$out" | grep -q '^READY$'; then
  bash "${repo_root}/scripts/start-discord-bot.sh"
else
  echo "Still blocked after reset — wait 2 min and run: bash scripts/start-discord-bot.sh"
  exit 1
fi
