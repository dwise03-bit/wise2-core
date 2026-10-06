#!/usr/bin/env bash
# wise2-postfix-setup.sh
#
# Idempotent setup for the WISE2 VPS postfix SMTP relay used by the api
# container for transactional email (password reset, verify-email, etc.).
#
# Fixes three historical issues that silently broke outbound mail:
#   1. smtpd_recipient_restrictions was empty -> smtpd fatal-exits on
#      every connection ("specify at least one working instance of: reject,
#      defer, defer_if_permit, check_relay_domains or *_unauth_destination").
#   2. A typo'd parameter `inet_post_insert_commands` sat where
#      smtpd_recipient_restrictions should have been.
#   3. mynetworks_style defaulted to "host" at compatibility_level >= 2, so
#      docker bridge subnets (172.17.0.0/16, 172.22.0.0/16, ...) were not in
#      mynetworks and permit_mynetworks rejected the api container.
#
# Also opens UFW on port 25 for the docker bridge subnets so container ->
# host:25 traffic reaches postfix at all.
#
# Safe to re-run. Backs up main.cf before any edit.
# Usage: sudo bash scripts/wise2-postfix-setup.sh

set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "This script must run as root (use sudo)." >&2
  exit 1
fi

if ! command -v postconf >/dev/null 2>&1; then
  echo "postfix is not installed on this host." >&2
  exit 1
fi

MAIN_CF=/etc/postfix/main.cf
STAMP=$(date +%Y%m%d-%H%M%S)
CHANGED=0

echo "[1/4] Backing up ${MAIN_CF} -> ${MAIN_CF}.bak.${STAMP}"
cp -a "$MAIN_CF" "${MAIN_CF}.bak.${STAMP}"

if grep -q '^inet_post_insert_commands = ' "$MAIN_CF"; then
  echo "[2/4] Removing bogus 'inet_post_insert_commands' line"
  sed -i '/^inet_post_insert_commands = /d' "$MAIN_CF"
  CHANGED=1
else
  echo "[2/4] No bogus 'inet_post_insert_commands' line (ok)"
fi

apply() {
  local key=$1 value=$2
  local current
  current=$(postconf -h "$key" 2>/dev/null || true)
  if [[ "$current" != "$value" ]]; then
    echo "  set ${key} = ${value}"
    postconf -e "${key} = ${value}"
    CHANGED=1
  else
    echo "  ok  ${key} already = ${value}"
  fi
}

echo "[3/4] Applying postfix settings"
apply smtpd_recipient_restrictions "permit_mynetworks, permit_sasl_authenticated, reject_unauth_destination"
apply compatibility_level "2"
apply mynetworks_style "subnet"

if command -v ufw >/dev/null 2>&1 && ufw status 2>/dev/null | grep -q "Status: active"; then
  echo "[4/4] Allowing docker bridge subnets -> smtp on ufw"
  for subnet in 172.17.0.0/16 172.22.0.0/16 172.23.0.0/16 172.24.0.0/16 172.25.0.0/16 172.26.0.0/16; do
    if ufw status | grep -q "25/tcp.*${subnet}"; then
      echo "  ok  25/tcp from ${subnet} already allowed"
    else
      echo "  add 25/tcp from ${subnet}"
      ufw allow from "$subnet" to any port 25 proto tcp comment "WISE2 docker->postfix smtp" >/dev/null
      CHANGED=1
    fi
  done
else
  echo "[4/4] ufw not installed or inactive; skipping firewall rules"
fi

echo ""
echo "Running postfix check..."
postfix check

if [[ $CHANGED -eq 1 ]]; then
  echo "Reloading postfix..."
  systemctl reload postfix
  echo ""
  echo "Done. Changes applied."
else
  echo ""
  echo "Done. No changes required."
fi

echo ""
echo "Current mynetworks docker-bridge entries:"
postconf mynetworks | tr ' ' '\n' | grep -E '^172\.(17|22|23|24|25|26)\.0\.0/16$' || echo "  (none — docker bridges not in mynetworks)"
