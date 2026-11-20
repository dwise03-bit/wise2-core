#!/usr/bin/env bash
# WISE2 Pocket Node 5 - read-only inventory. No writes or formatting.
set -u
echo "=== WISE2 Pocket Node 5 USB Audit ==="
date -Is
hostname
uname -a
echo "=== Tailscale ==="
if command -v tailscale >/dev/null; then tailscale status || true; tailscale ip -4 || true; else echo "Tailscale not installed"; fi
echo "=== SSH service ==="
systemctl is-active ssh 2>/dev/null || true
echo "=== Block devices (READ ONLY) ==="
lsblk -e7 -o NAME,PATH,SIZE,TYPE,TRAN,RM,FSTYPE,LABEL,MOUNTPOINTS,MODEL,SERIAL
echo "=== Mounts ==="
findmnt -rn -o SOURCE,TARGET,FSTYPE | head -80
echo "=== USB devices ==="
if command -v lsusb >/dev/null; then lsusb; else echo "lsusb unavailable"; fi
echo "=== Disk space ==="
df -hT
echo "Audit complete. Do not flash or format until USB identity and backups are confirmed."
