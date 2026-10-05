#!/usr/bin/env bash
# =============================================================================
# WISE² control-bridge client (Surface side) — READ-ONLY probe + honest status.
# Disabled until config is enabled AND a device Bearer token exists.
# Never prints the token or signing key. No production writes.
#
# Usage:
#   bridge-client.sh status           # human-readable
#   bridge-client.sh status --json    # machine-readable (Command Center)
# States: CONFIGURED / REACHABLE / AUTHENTICATED — READY iff all true.
# =============================================================================
set -euo pipefail

CONF="${BRIDGE_CONF:-/opt/wise2/bridge/config/bridge.conf}"

# Defaults (overridden by conf)
BRIDGE_ENABLED=false
BRIDGE_BASE_URL=""
BRIDGE_PATH_PREFIX="/v1/control"
BRIDGE_HEALTH_PATH="/health"
BRIDGE_STATUS_PATH="/status"
BRIDGE_SERVICES_PATH="/docker/services"
BRIDGE_DEVICE_ID="wise2-surface"
BRIDGE_TOKEN_FILE="/opt/wise2/bridge/credentials/control-token"
BRIDGE_SIGNING_KEY_FILE="/opt/wise2/bridge/credentials/signing-key"
BRIDGE_ALLOW_WRITES=false
BRIDGE_TIMEOUT=4
# shellcheck disable=SC1090
[ -f "$CONF" ] && source "$CONF"

configured=false; reachable=false; authenticated=false
detail_configured=""; detail_reachable=""; detail_auth=""

# CONFIGURED: enabled + base url set + Bearer file present & non-empty.
if [ "${BRIDGE_ENABLED,,}" = "true" ] && [ -n "$BRIDGE_BASE_URL" ]; then
  if [ -s "$BRIDGE_TOKEN_FILE" ]; then
    configured=true; detail_configured="enabled, endpoint + bearer present"
  else
    detail_configured="enabled but bearer file missing/empty"
  fi
else
  detail_configured="disabled or endpoint not set (expected until production connection exists)"
fi

base="${BRIDGE_BASE_URL%/}${BRIDGE_PATH_PREFIX}"

_get() { # _get <path> [bearer]
  local url="$base$1" auth="${2:-}"
  if [ -n "$auth" ]; then
    curl -sS -m "$BRIDGE_TIMEOUT" -o /dev/null -w '%{http_code}' \
      -H "Authorization: Bearer $auth" "$url" 2>/dev/null || echo 000
  else
    curl -sS -m "$BRIDGE_TIMEOUT" -o /dev/null -w '%{http_code}' "$url" 2>/dev/null || echo 000
  fi
}

if [ "$configured" = true ]; then
  # REACHABLE: unauthenticated health returns 200
  code=$(_get "$BRIDGE_HEALTH_PATH")
  if [ "$code" = "200" ]; then reachable=true; detail_reachable="health 200"
  else detail_reachable="health HTTP $code"; fi

  if [ "$reachable" = true ]; then
    tok="$(cat "$BRIDGE_TOKEN_FILE" 2>/dev/null)"
    # AUTHENTICATED: an authenticated read returns 200 with the device bearer
    acode=$(_get "$BRIDGE_STATUS_PATH" "$tok")
    if [ "$acode" = "200" ]; then authenticated=true; detail_auth="status 200"
    else detail_auth="status HTTP $acode"; fi
    unset tok
  fi
fi

ready=false
[ "$configured" = true ] && [ "$reachable" = true ] && [ "$authenticated" = true ] && ready=true

# Report, never leak secret material.
mode="read-only"
[ "${BRIDGE_ALLOW_WRITES,,}" = "true" ] && mode="writes-allowed"

if [ "${1:-status}" = "status" ] && [ "${2:-}" = "--json" ]; then
  printf '{"device":"%s","configured":%s,"reachable":%s,"authenticated":%s,"ready":%s,"mode":"%s","note":"%s"}\n' \
    "$BRIDGE_DEVICE_ID" "$configured" "$reachable" "$authenticated" "$ready" "$mode" "$detail_configured"
else
  yn(){ [ "$1" = true ] && echo "yes" || echo "NO"; }
  echo "WISE² Control-Bridge (device: $BRIDGE_DEVICE_ID, mode: $mode)"
  echo "  CONFIGURED       : $(yn $configured)   ($detail_configured)"
  echo "  REACHABLE        : $(yn $reachable)   (${detail_reachable:-not checked})"
  echo "  AUTHENTICATED    : $(yn $authenticated)   (${detail_auth:-not checked})"
  echo "  ----"
  if [ "$ready" = true ]; then echo "  STATUS: READY"; else echo "  STATUS: NOT READY (CONTROL-BRIDGE-CONNECTION-PENDING)"; fi
fi
