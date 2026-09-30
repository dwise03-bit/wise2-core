#!/bin/bash
set -euo pipefail
GATE="$(cd "$(dirname "$0")/.." && pwd)/green-gate.sh"
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
cat > "$tmp/green.env" <<'E'
GITHUB_SHA=abc
NODE_SHA=abc
DIRTY_COUNT=0
TAILSCALE_OK=1
PUBLIC_UNSAFE_COUNT=0
E
cat > "$tmp/red.env" <<'E'
GITHUB_SHA=abc
NODE_SHA=abc
DIRTY_COUNT=2
TAILSCALE_OK=1
PUBLIC_UNSAFE_COUNT=1
E
bash "$GATE" "$tmp/green.env" | grep -q '^GREEN$'
if bash "$GATE" "$tmp/red.env" >/dev/null 2>&1; then echo 'expected RED failure'; exit 1; fi
echo PASS
