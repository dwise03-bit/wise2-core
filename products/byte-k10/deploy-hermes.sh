#!/usr/bin/env bash
#
# Deploy K10 firmware with local Hermes integration
# Uses WISE² Second Brain + Hermes for AI responses
#
# Usage:
#   ./deploy-hermes.sh              compile and flash via USB
#   ./deploy-hermes.sh --ota        upload via WiFi (no cable)
#   ./deploy-hermes.sh --monitor    flash and show serial output

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HERMES_HOST="${HERMES_HOST:-localhost:3012}"
ACTION="${1:-flash}"

echo "╔═════════════════════════════════════════════╗"
echo "║ WISE² K10 + Hermes Integration Deploy       ║"
echo "║ Target: $HERMES_HOST                         │"
echo "╚═════════════════════════════════════════════╝"
echo

# Verify Hermes is accessible
echo "[CHECK] Verifying Hermes availability at $HERMES_HOST..."
if timeout 2 bash -c "echo >/dev/tcp/${HERMES_HOST%:*}/${HERMES_HOST##*:}" 2>/dev/null; then
    echo "        OK - Hermes is accessible"
else
    echo "        WARNING - Could not reach $HERMES_HOST"
    echo "        Firmware will compile but AI Chat will be unavailable at runtime"
    echo "        Start Hermes on :3012 and try again, or check HERMES_HOST env var"
    read -p "        Continue anyway? (y/n) " -n 1 -r
    echo
    [[ ! $REPLY =~ ^[Yy]$ ]] && exit 1
fi

echo

# Export AI endpoint for build
export BYTE_AI_ENDPOINT="http://$HERMES_HOST/api/chat"

case "$ACTION" in
    flash)
        echo "[BUILD] Compiling firmware with Hermes integration..."
        cd "$SCRIPT_DIR"
        ./build.sh flash
        ;;
    ota)
        echo "[BUILD] Compiling firmware for OTA update..."
        cd "$SCRIPT_DIR"
        ./build.sh ota
        ;;
    monitor)
        echo "[BUILD] Compiling and flashing with serial monitor..."
        cd "$SCRIPT_DIR"
        ./build.sh monitor
        ;;
    *)
        echo "Usage: $0 [flash|ota|monitor]"
        exit 1
        ;;
esac

echo
echo "╔═════════════════════════════════════════════╗"
echo "║ Deployment Complete                        ║"
echo "║ K10 is now running with Hermes integration  ║"
echo "║ AI Chat app will connect to $HERMES_HOST     │"
echo "╚═════════════════════════════════════════════╝"
