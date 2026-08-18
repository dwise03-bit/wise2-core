#!/usr/bin/env bash
#
# Deploy K10 firmware with custom API endpoint
#
# Usage:
#   ./deploy-with-api.sh http://localhost:8000/chat
#   ./deploy-with-api.sh https://api.example.com/v1/chat
#   ./deploy-with-api.sh --key sk-xyz https://api.example.com/chat
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_KEY=""
API_ENDPOINT=""
ACTION="flash"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        --key)
            API_KEY="$2"
            shift 2
            ;;
        --ota)
            ACTION="ota"
            shift
            ;;
        --monitor)
            ACTION="monitor"
            shift
            ;;
        http://*)
            API_ENDPOINT="$1"
            shift
            ;;
        https://*)
            API_ENDPOINT="$1"
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo
            echo "Usage: $0 [OPTIONS] <endpoint>"
            echo "  endpoint     API URL (http or https)"
            echo "  --key KEY    API authentication key"
            echo "  --ota        Use WiFi OTA instead of USB"
            echo "  --monitor    Show serial output after upload"
            exit 1
            ;;
    esac
done

if [[ -z "$API_ENDPOINT" ]]; then
    echo "Error: API endpoint required"
    echo "Usage: $0 [--key API_KEY] <endpoint>"
    exit 1
fi

echo "╔════════════════════════════════════════════╗"
echo "║ WISE² K10 + Custom API Deployment          ║"
echo "║ Endpoint: $API_ENDPOINT"
if [[ -n "$API_KEY" ]]; then
    echo "║ Auth: Configured"
fi
echo "╚════════════════════════════════════════════╝"
echo

# Verify API is accessible (best effort)
ENDPOINT_HOST="${API_ENDPOINT#*://}"
ENDPOINT_HOST="${ENDPOINT_HOST%%/*}"
echo "[CHECK] Testing API connectivity..."
if timeout 3 bash -c "curl -s -I '$API_ENDPOINT' > /dev/null 2>&1" || timeout 3 nc -zv "$ENDPOINT_HOST" 2>/dev/null; then
    echo "        OK - API is accessible"
else
    echo "        WARNING - Could not verify API access"
    echo "        Firmware will compile but may fail at runtime if endpoint is unavailable"
fi

echo

# Export configuration
export BYTE_AI_ENDPOINT="$API_ENDPOINT"
if [[ -n "$API_KEY" ]]; then
    export BYTE_AI_KEY="$API_KEY"
fi

case "$ACTION" in
    flash)
        echo "[BUILD] Compiling firmware with API integration..."
        cd "$SCRIPT_DIR"
        ./build.sh flash
        ;;
    ota)
        echo "[BUILD] Compiling for OTA update..."
        cd "$SCRIPT_DIR"
        ./build.sh ota
        ;;
    monitor)
        echo "[BUILD] Compiling and flashing with serial monitor..."
        cd "$SCRIPT_DIR"
        ./build.sh monitor
        ;;
esac

echo
echo "╔════════════════════════════════════════════╗"
echo "║ Deployment Complete                       ║"
echo "║ K10 AI Chat is now configured for:         ║"
echo "║ $API_ENDPOINT"
echo "╚════════════════════════════════════════════╝"
