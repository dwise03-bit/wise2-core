#!/bin/bash
# Rename Tailscale devices with dwise- prefix
# Run this script on each device to rename it

# Usage: ./rename-tailscale-devices.sh <new-name>
# Example: ./rename-tailscale-devices.sh dwise-pi

if [ -z "$1" ]; then
  echo "Usage: $0 <new-hostname>"
  echo ""
  echo "Device names to use:"
  echo "  dwise-pi              (Raspberry Pi 3B+)"
  echo "  dwise-pi-2            (alternative Pi)"
  echo "  dwise-vps             (VPS server)"
  echo "  dwise-gpu-1           (GPU machine 1)"
  echo "  dwise-gpu-2           (GPU machine 2)"
  echo "  dwise-gpu-build       (GPU build server)"
  echo "  dwise-router          (GL.iNet router)"
  echo "  dwise-iphone-pro      (iPhone 15 Pro Max)"
  echo "  dwise-iphone-2        (iPhone secondary)"
  echo "  dwise-iphone-3        (iPhone tertiary)"
  echo "  dwise-ipad            (iPad 9th gen)"
  echo "  dwise-android         (Android phone)"
  echo "  dwise-mbp             (MacBook Pro old)"
  echo "  dwise-cloud           (Cloud agent)"
  exit 1
fi

tailscale set --hostname="$1"
echo "✅ Device renamed to: $1"
tailscale status | head -1
