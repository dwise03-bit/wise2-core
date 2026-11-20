#!/usr/bin/env bash
# WISE² Commander: read-only preflight. No secrets, no mutations.
set -u
echo "WISE2_COMMANDER_AUDIT_BEGIN"
printf 'timestamp='; date -u +%FT%TZ
printf 'host='; hostname
printf 'user='; id -un
printf 'kernel='; uname -sr
printf 'disk='; df -h / | tail -1
printf 'memory='; free -h | sed -n '2p'
for tool in docker git ssh tailscale curl ffmpeg yt-dlp python3; do
  if command -v "$tool" >/dev/null 2>&1; then echo "tool:$tool=present"; else echo "tool:$tool=missing"; fi
done
for svc in ssh tailscaled; do
  if command -v systemctl >/dev/null 2>&1; then
    echo "service:$svc=$(systemctl is-active "$svc" 2>/dev/null || true)"
  fi
done
if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  echo "docker:accessible"
  docker ps --format 'container={{.Names}} status={{.Status}}' | head -60
else
  echo "docker:not-accessible"
fi
if command -v ss >/dev/null 2>&1; then
  ss -lnt | awk 'NR==1 || /:(3012|3015|9999|11434)[[:space:]]/'
fi
echo "WISE2_COMMANDER_AUDIT_END"
