#!/bin/bash
##############################################################################
# WISE² Fleet Desktop Commander Deploy
# Single command to install/update desktop-commander across all WISE² devices
# Usage: ./deploy-fleet.sh [install|update|status|rollback]
##############################################################################

set -e

# Configuration
DEVICES=(
    "danielwise@danielwise-mac.local:Mac"
    "dwise@173.208.147.165:gpu-nmls"
    "dwise@192.168.8.136:wise-pi3"
)

INSTALLER_URL="https://wise2.net/install-desktop-commander.sh"
LOG_DIR="$HOME/.wise2/fleet-deploy"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Setup
mkdir -p "$LOG_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$LOG_DIR/deploy_$TIMESTAMP.log"

log() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✓ $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}✗ $1${NC}" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}⚠ $1${NC}" | tee -a "$LOG_FILE"
}

##############################################################################
# Deploy Functions
##############################################################################

deploy_to_device() {
    local host=$1
    local name=$2
    local action=$3

    log "Deploying to $name ($host)..."

    case $action in
        install)
            ssh "$host" << 'EOF'
curl -fsSL https://wise2.net/install-desktop-commander.sh | bash
if [ "$(uname)" = "Darwin" ]; then
    launchctl load ~/Library/LaunchAgents/net.wise2.desktop-commander.plist
else
    sudo systemctl enable wise2-desktop-commander
    sudo systemctl start wise2-desktop-commander
fi
EOF
            ;;
        update)
            ssh "$host" << 'EOF'
npm install -g @wonderwhy-er/desktop-commander
if [ "$(uname)" = "Darwin" ]; then
    launchctl stop net.wise2.desktop-commander
    sleep 2
    launchctl start net.wise2.desktop-commander
else
    sudo systemctl restart wise2-desktop-commander
fi
EOF
            ;;
        status)
            ssh "$host" << 'EOF'
echo "=== Service Status ==="
if [ "$(uname)" = "Darwin" ]; then
    launchctl list | grep desktop-commander || echo "Not running"
else
    sudo systemctl status wise2-desktop-commander --no-pager
fi

echo ""
echo "=== Version ==="
npx @wonderwhy-er/desktop-commander --version

echo ""
echo "=== Config ==="
cat ~/.wise2/desktop-commander/config.json 2>/dev/null | jq '.device' || echo "Config not found"

echo ""
echo "=== Recent Logs ==="
if [ "$(uname)" = "Darwin" ]; then
    tail -5 /var/log/wise2-dc.log 2>/dev/null || echo "No logs yet"
else
    sudo journalctl -u wise2-desktop-commander -n 5 --no-pager 2>/dev/null || echo "No logs yet"
fi
EOF
            ;;
        rollback)
            ssh "$host" << 'EOF'
echo "Available versions:"
npm view @wonderwhy-er/desktop-commander versions --json | tail -10

read -p "Enter version to rollback to: " version
npm install -g @wonderwhy-er/desktop-commander@$version

if [ "$(uname)" = "Darwin" ]; then
    launchctl restart net.wise2.desktop-commander
else
    sudo systemctl restart wise2-desktop-commander
fi
EOF
            ;;
    esac

    if [ $? -eq 0 ]; then
        success "Deployment to $name complete"
        return 0
    else
        error "Deployment to $name failed"
        return 1
    fi
}

##############################################################################
# Main Actions
##############################################################################

action="${1:-install}"
failed_devices=()

case $action in
    install)
        log "Installing desktop-commander on all WISE² devices..."
        for device in "${DEVICES[@]}"; do
            host=$(echo "$device" | cut -d: -f1)
            name=$(echo "$device" | cut -d: -f2)
            deploy_to_device "$host" "$name" "install" || failed_devices+=("$name")
        done
        ;;
    update)
        log "Updating desktop-commander on all WISE² devices..."
        for device in "${DEVICES[@]}"; do
            host=$(echo "$device" | cut -d: -f1)
            name=$(echo "$device" | cut -d: -f2)
            deploy_to_device "$host" "$name" "update" || failed_devices+=("$name")
        done
        ;;
    status)
        log "Checking status on all WISE² devices..."
        for device in "${DEVICES[@]}"; do
            host=$(echo "$device" | cut -d: -f1)
            name=$(echo "$device" | cut -d: -f2)
            deploy_to_device "$host" "$name" "status"
        done
        ;;
    rollback)
        log "Interactive rollback on all WISE² devices..."
        for device in "${DEVICES[@]}"; do
            host=$(echo "$device" | cut -d: -f1)
            name=$(echo "$device" | cut -d: -f2)
            deploy_to_device "$host" "$name" "rollback" || failed_devices+=("$name")
        done
        ;;
    *)
        echo "Usage: $0 {install|update|status|rollback}"
        exit 1
        ;;
esac

##############################################################################
# Summary
##############################################################################

echo ""
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}Deployment Complete${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""
echo "Log: $LOG_FILE"

if [ ${#failed_devices[@]} -eq 0 ]; then
    success "All devices deployed successfully"
    exit 0
else
    error "Failed devices: ${failed_devices[*]}"
    exit 1
fi
