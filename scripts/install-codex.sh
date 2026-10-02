#!/usr/bin/env bash
# Install the official OpenAI Codex CLI (scoped package @openai/codex).
# Run with: sudo bash /opt/wise2/scripts/install-codex.sh
# NOTE: the UNSCOPED npm package "codex" is an unrelated 2012 tool — never install it.
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then echo "Run as root: sudo bash $0"; exit 1; fi

if command -v codex >/dev/null 2>&1; then
  echo "codex already installed: $(codex --version 2>&1 | head -1) @ $(command -v codex)"; exit 0
fi

if ! command -v npm >/dev/null 2>&1; then echo "ERROR: npm not found"; exit 1; fi
echo "[1/2] npm install -g @openai/codex  (official scoped package)"
npm install -g @openai/codex

echo "[2/2] verify"
if command -v codex >/dev/null 2>&1; then
  echo "DONE: codex $(codex --version 2>&1 | head -1) @ $(command -v codex)"
  echo "Next (interactive, you): run 'codex login' to authenticate with OpenAI."
  echo "Shannon's AI backend (SHANNON_AI_MODEL=openai-codex:gpt-5.6-sol) depends on this."
else
  echo "ERROR: codex not on PATH after install. Check 'npm root -g' and PATH."; exit 1
fi
