#!/usr/bin/env bash
#
# setup-mac-local-models.sh — Local model stack for WISE² on macOS
#
# Installs/starts Ollama, pulls coding models, wires them into wise2-core
# (.env.local -> OLLAMA_API_URL), and verifies a real chat round-trip.
#
# Idempotent: safe to re-run. Existing .env.local keys are read before rewrite.
#
# Usage:
#   ./scripts/setup-mac-local-models.sh
#   WISE2_LOCAL_MODELS="qwen2.5-coder:7b llama3.1:8b" ./scripts/setup-mac-local-models.sh
#   WISE2_DEFAULT_MODEL=qwen2.5-coder:1.5b ./scripts/setup-mac-local-models.sh
#
set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$REPO_ROOT/.env.local"
OLLAMA_URL="${OLLAMA_API_URL:-http://localhost:11434}"

# Models to pull. Override with WISE2_LOCAL_MODELS="a:tag b:tag".
# Defaults are coder-tuned and sized for a 16-32GB Mac.
MODELS=${WISE2_LOCAL_MODELS:-"qwen2.5-coder:7b qwen2.5-coder:1.5b"}
DEFAULT_MODEL="${WISE2_DEFAULT_MODEL:-$(echo "$MODELS" | awk '{print $1}')}"

bold() { printf '\033[1m%s\033[0m\n' "$*"; }
ok()   { printf '  \033[32m✓\033[0m %s\n' "$*"; }
warn() { printf '  \033[33m!\033[0m %s\n' "$*"; }
fail() { printf '  \033[31m✗\033[0m %s\n' "$*"; }

# ---------------------------------------------------------------- 1. platform
bold "1/6  Platform check"
if [[ "$(uname -s)" != "Darwin" ]]; then
  fail "This script is macOS-only (uname reports $(uname -s))."
  exit 1
fi
ARCH="$(uname -m)"
ok "macOS $(sw_vers -productVersion) on $ARCH"
if [[ "$ARCH" == "arm64" ]]; then
  RAM_GB=$(( $(sysctl -n hw.memsize) / 1073741824 ))
  ok "Apple Silicon, ${RAM_GB}GB unified memory (Ollama uses the Metal backend)"
  if (( RAM_GB < 16 )); then
    warn "Under 16GB — stick to :1.5b/:3b models; a 7b will swap and crawl."
  fi
else
  warn "Intel Mac — CPU-only inference. Expect slow generation; prefer :1.5b models."
fi

# ----------------------------------------------------------------- 2. install
bold "2/6  Ollama install"
if command -v ollama >/dev/null 2>&1; then
  ok "ollama present: $(ollama --version 2>/dev/null | head -1)"
elif [[ -x /Applications/Ollama.app/Contents/Resources/ollama ]]; then
  ok "Ollama.app present but CLI not on PATH"
  warn "Add to your shell profile: export PATH=\"/Applications/Ollama.app/Contents/Resources:\$PATH\""
  export PATH="/Applications/Ollama.app/Contents/Resources:$PATH"
else
  if ! command -v brew >/dev/null 2>&1; then
    fail "Homebrew not found. Install it first: https://brew.sh"
    exit 1
  fi
  echo "  installing via Homebrew..."
  brew install ollama || { fail "brew install ollama failed"; exit 1; }
  ok "installed"
fi

# ------------------------------------------------------------------- 3. serve
bold "3/6  Ollama server"
server_up() { curl -fsS --max-time 3 "$OLLAMA_URL/api/tags" >/dev/null 2>&1; }

if server_up; then
  ok "already responding at $OLLAMA_URL"
else
  if command -v brew >/dev/null 2>&1 && brew list --formula 2>/dev/null | grep -qx ollama; then
    echo "  starting via brew services (survives reboot)..."
    brew services start ollama >/dev/null 2>&1
  elif [[ -d /Applications/Ollama.app ]]; then
    echo "  launching Ollama.app..."
    open -a Ollama
  else
    echo "  starting 'ollama serve' in background..."
    nohup ollama serve >/tmp/ollama-serve.log 2>&1 &
  fi

  for _ in $(seq 1 30); do
    server_up && break
    sleep 1
  done

  if server_up; then
    ok "responding at $OLLAMA_URL"
  else
    fail "server did not come up within 30s. Check: tail /tmp/ollama-serve.log"
    exit 1
  fi
fi

# ------------------------------------------------------------------ 4. models
bold "4/6  Models"
# Space-delimited so membership is a bash pattern match. Do NOT pipe into
# `grep -q` here: it exits early, upstream takes SIGPIPE, and `pipefail`
# then reports failure even on a match.
INSTALLED=" $(ollama list 2>/dev/null | tail -n +2 | awk '{print $1}' | tr '\n' ' ') "
PULL_FAILED=""

for m in $MODELS; do
  if [[ "$INSTALLED" == *" $m "* ]]; then
    ok "$m (already local)"
    continue
  fi
  echo "  pulling $m ..."
  if ollama pull "$m"; then
    ok "$m"
  else
    fail "$m could not be pulled — verify the tag at https://ollama.com/library"
    PULL_FAILED="$PULL_FAILED $m"
  fi
done

if [[ -n "$PULL_FAILED" ]]; then
  warn "Failed:$PULL_FAILED"
  warn "Re-run with a corrected list: WISE2_LOCAL_MODELS=\"<tag>\" $0"
fi

# --------------------------------------------------------------- 5. wise2 env
bold "5/6  wise2-core wiring"
# packages/ai reads OLLAMA_API_URL (config.ts -> PROVIDER_KEYS.ollama).
set_env() {
  local key="$1" val="$2"
  touch "$ENV_FILE"
  if grep -q "^${key}=" "$ENV_FILE" 2>/dev/null; then
    local current
    current="$(grep "^${key}=" "$ENV_FILE" | head -1 | cut -d= -f2-)"
    if [[ "$current" == "$val" ]]; then
      ok "$key already = $val"
      return
    fi
    # macOS sed requires the empty -i argument
    sed -i '' "s|^${key}=.*|${key}=${val}|" "$ENV_FILE"
    ok "$key updated: $current -> $val"
  else
    printf '%s=%s\n' "$key" "$val" >> "$ENV_FILE"
    ok "$key added"
  fi
}

set_env "OLLAMA_API_URL" "$OLLAMA_URL"
set_env "OLLAMA_MODEL" "$DEFAULT_MODEL"
ok "written to $ENV_FILE"

if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  warn "Docker is running. Containers reach host Ollama at http://host.docker.internal:11434"
  warn "— services/ollama-docker-bridge.js is a Linux-only workaround; not needed here."
fi

# ------------------------------------------------------------------ 6. verify
bold "6/6  End-to-end verification"
INSTALLED_NOW=" $(ollama list 2>/dev/null | tail -n +2 | awk '{print $1}' | tr '\n' ' ') "
if [[ "$INSTALLED_NOW" != *" $DEFAULT_MODEL "* ]]; then
  warn "Default model $DEFAULT_MODEL is not installed — skipping chat test."
  exit 1
fi

RESPONSE="$(curl -fsS --max-time 120 "$OLLAMA_URL/api/chat" \
  -H 'Content-Type: application/json' \
  -d "{\"model\":\"$DEFAULT_MODEL\",\"stream\":false,\"messages\":[{\"role\":\"user\",\"content\":\"Reply with exactly: WISE2 OK\"}]}" 2>/dev/null)"

if [[ -z "$RESPONSE" ]]; then
  fail "No response from $OLLAMA_URL/api/chat"
  exit 1
fi

REPLY="$(echo "$RESPONSE" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("message",{}).get("content","").strip())' 2>/dev/null)"
if [[ -n "$REPLY" ]]; then
  ok "$DEFAULT_MODEL replied: $REPLY"
else
  fail "Malformed response: $(echo "$RESPONSE" | head -c 200)"
  exit 1
fi

echo
bold "Done."
echo "  Endpoint : $OLLAMA_URL"
echo "  Default  : $DEFAULT_MODEL"
echo "  Installed: $(ollama list | tail -n +2 | awk '{print $1}' | tr '\n' ' ')"
echo
echo "  In wise2:  import { aiManager } from '@wise2/ai'"
echo "             await aiManager.chat([{role:'user',content:'hi'}], 'ollama-qwen-coder')"
