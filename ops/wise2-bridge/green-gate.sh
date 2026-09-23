#!/bin/bash
set -euo pipefail
state="${1:?state env file required}"
set -a; . "$state"; set +a
fail=0
[ "${GITHUB_SHA:-}" = "${NODE_SHA:-}" ] || fail=1
[ "${DIRTY_COUNT:-1}" -eq 0 ] || fail=1
[ "${TAILSCALE_OK:-0}" -eq 1 ] || fail=1
[ "${PUBLIC_UNSAFE_COUNT:-1}" -eq 0 ] || fail=1
if [ "$fail" -eq 0 ]; then echo GREEN; exit 0; fi
echo RED
exit 1
