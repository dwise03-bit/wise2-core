#!/usr/bin/env bash
set -uo pipefail
# WISE² single-server read-only audit. No secrets, restarts, or modifications.
OUT="${1:-$HOME/wise2-audit-$(date -u +%Y%m%dT%H%M%SZ).txt}"
{
echo "WISE2 SINGLE SERVER AUDIT UTC $(date -u -Is)"
echo "HOST $(hostname)"
echo "KERNEL $(uname -sr)"
echo "UPTIME"; uptime
echo "DISKS"; df -hT
echo "MEMORY"; free -h
echo "TAILSCALE"; if command -v tailscale >/dev/null; then tailscale status 2>&1 | sed -E 's/([[:alnum:]_.+-]+)@([[:alnum:].-]+)/[redacted-email]/g'; else echo "not installed"; fi
echo "SERVICES"; for s in nginx docker postfix dovecot redis-server postgresql; do printf '%s ' "$s"; systemctl is-active "$s" 2>/dev/null || true; done
echo "CONTAINERS"; if command -v docker >/dev/null; then docker ps --format '{{.Names}} | {{.Status}} | {{.Ports}}' 2>&1 || true; else echo "docker unavailable"; fi
echo "LISTENING PORTS"; ss -lnt 2>&1 | head -80
echo "WEB HEALTH"; for u in https://wise2.net https://ai.wise2.net https://cloud.wise2.net https://trading.wise2.net; do printf '%s ' "$u"; curl -sS -L -o /dev/null -w '%{http_code} %{time_total}s\n' --connect-timeout 4 --max-time 12 "$u" 2>&1 || true; done
echo "LOCAL OLLAMA"; curl -sS -o /dev/null -w '%{http_code}\n' --connect-timeout 2 --max-time 5 http://127.0.0.1:11434/api/tags || true
echo "HERMES PROCESS"; pgrep -af '[h]ermes' | cut -c1-180 || true
echo "NGINX CONFIG TEST"; if command -v nginx >/dev/null; then nginx -t 2>&1 | head -15; fi
echo "GIT REPOS"; find /opt /srv /var/www "$HOME" -maxdepth 3 -type d -name .git -print 2>/dev/null | head -100
echo "AUDIT COMPLETE: statuses are observations, not deployment verification"
} > "$OUT" 2>&1
echo "Saved $OUT"
