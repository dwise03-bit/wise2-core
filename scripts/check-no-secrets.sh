#!/usr/bin/env bash
# Scan tracked files for likely secret patterns. Exits non-zero if matches found.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PATTERN='BEGIN (OPENSSH|RSA|EC|DSA) PRIVATE KEY|AKIA[0-9A-Z]{16}|sk_live_[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}|xox[baprs]-'

EXCLUDES=(
  --glob '!.git/**'
  --glob '!**/node_modules/**'
  --glob '!**/*.md'
  --glob '!**/*.txt'
  --glob '!*.example'
  --glob '!**/GOOGLE_VOICE_INTEGRATION.md'
  --glob '!**/google-voice-provider.test.ts'
  --glob '!**/redact.test.ts'
  --glob '!scripts/check-no-secrets.sh'
)

# Real Discord webhook URLs (numeric id + token) in any tracked file
WEBHOOK_PATTERN='discord\.com/api/webhooks/[0-9]+/[A-Za-z0-9_-]{20,}'

if rg -n "${EXCLUDES[@]}" "$WEBHOOK_PATTERN" . >/tmp/wise2-webhook-scan.txt 2>/dev/null; then
  echo "Discord webhook URLs detected:"
  sed -E 's/webhooks\/[0-9]+\/[^[:space:]"'"'"'`]+/webhooks\/ID\/[REDACTED]/g' /tmp/wise2-webhook-scan.txt | head -20
  exit 1
fi

if rg -n "${EXCLUDES[@]}" "$PATTERN" . >/tmp/wise2-secret-scan.txt 2>/dev/null; then
  echo "Potential secrets detected (values redacted in output):"
  sed 's/=.*$/=[REDACTED]/' /tmp/wise2-secret-scan.txt | sed 's/webhooks\/[0-9]*\/[^[:space:]]*/webhooks\/ID\/[REDACTED]/g' | head -50
  echo "..."
  echo "Run credential rotation if any matches are real secrets."
  exit 1
fi

echo "No secret patterns detected in tracked source."
