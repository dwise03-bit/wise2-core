#!/usr/bin/env bash
# Verify Tailscale mesh connectivity for WISE² devices.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SSH_USER="${WISE2_SSH_USER:-dwise}"
SSH_OPTS=(-o BatchMode=yes -o ConnectTimeout=8 -o StrictHostKeyChecking=accept-new)

pass=0
fail=0
warn=0

check() {
  local name="$1"
  local host="$2"
  local mode="${3:-ping}"

  printf "%-28s " "$name"
  case "$mode" in
    ping)
      if tailscale ping -c 1 -timeout 5s "$host" >/dev/null 2>&1; then
        echo "OK (ping)"
        pass=$((pass + 1))
      else
        echo "FAIL (ping)"
        fail=$((fail + 1))
      fi
      ;;
    ssh)
      if ssh "${SSH_OPTS[@]}" "${SSH_USER}@${host}" 'echo ok' 2>/dev/null | grep -q ok; then
        echo "OK (ssh)"
        pass=$((pass +  1))
      else
        echo "FAIL (ssh)"
        fail=$((fail + 1))
      fi
      ;;
    dns)
      if getent hosts "$host" >/dev/null 2>&1; then
        echo "OK (dns)"
        pass=$((pass + 1))
      else
        echo "WARN (dns)"
        warn=$((warn + 1))
      fi
      ;;
  esac
}

echo "=== WISE² Tailscale verification ==="
echo ""

if ! command -v tailscale >/dev/null 2>&1; then
  echo "Tailscale CLI not installed. Run: bash scripts/tailscale-setup.sh"
  exit 1
fi

if ! tailscale status >/dev/null 2>&1; then
  echo "Not logged in. Run: bash scripts/tailscale-setup.sh"
  exit 1
fi

echo "--- Local node ---"
tailscale status --self 2>/dev/null || tailscale ip -4
echo ""

echo "--- MagicDNS ---"
check "VPS gpu-nmls-1" "gpu-nmls-1.tail44396d.ts.net" dns
check "MacBook" "daniels-macbook-pro.tail44396d.ts.net" dns
check "iPhone" "iphone175.tail44396d.ts.net" dns
check "Android" "motorola-razr-2025-xt2553v.tail44396d.ts.net" dns
check "BYTE MINI" "big-byte.tail44396d.ts.net" dns
check "Router" "gl-mt3600be.tail44396d.ts.net" dns
echo ""

echo "--- Mesh ping (requires tailnet membership) ---"
check "VPS gpu-nmls-1" "gpu-nmls-1.tail44396d.ts.net" ping
check "MacBook" "daniels-macbook-pro.tail44396d.ts.net" ping
check "BYTE MINI" "big-byte.tail44396d.ts.net" ping
echo ""

echo "--- SSH (requires keys in authorized_keys) ---"
check "VPS SSH" "gpu-nmls-1.tail44396d.ts.net" ssh
echo ""

echo "--- VPS services (via SSH tunnel check) ---"
if ssh "${SSH_OPTS[@]}" "${SSH_USER}@gpu-nmls-1.tail44396d.ts.net" \
  'curl -sf http://127.0.0.1:3010/api/health >/dev/null && curl -sf -o /dev/null -w "%{http_code}" http://127.0.0.1:3004/login | grep -q 200' 2>/dev/null; then
  echo "VPS services                    OK (api + command-center)"
  pass=$((pass + 1))
else
  echo "VPS services                    SKIP (ssh or services unavailable)"
  warn=$((warn + 1))
fi

echo ""
echo "Summary: $pass passed, $fail failed, $warn skipped/warn"
echo "Registry: config/tailscale/network.yaml"

if [ "$fail" -gt 0 ]; then
  exit 1
fi
