#!/bin/bash
# WISE² Mac Bridge Launchd Setup
# Installs and configures the Mac remote control bridge as a background service
# Run as: bash scripts/setup-mac-bridge.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   WISE² Mac Bridge Launchd Setup                       ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}✗ This script must run on macOS${NC}"
    exit 1
fi

log() {
    echo -e "${GREEN}✓${NC} $1"
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

# Check Node.js installation
if ! command -v node &> /dev/null; then
    error "Node.js is not installed. Install via Homebrew: brew install node"
fi

log "Node.js found: $(node --version)"

# Set paths
PLIST_SOURCE="infra/mac-bridge/com.wise2.desktopcommander.remote.plist"
PLIST_DEST="$HOME/Library/LaunchAgents/com.wise2.desktopcommander.remote.plist"
BRIDGE_SCRIPT="packages/api/bin/desktop-commander-remote.js"
BRIDGE_LOG_DIR="$HOME/.wise2"

# Verify source files exist
[ -f "$PLIST_SOURCE" ] || error "Plist not found at $PLIST_SOURCE"
[ -f "$BRIDGE_SCRIPT" ] || error "Bridge script not found at $BRIDGE_SCRIPT"

# Create log directory
log "Creating log directory at $BRIDGE_LOG_DIR..."
mkdir -p "$BRIDGE_LOG_DIR"

# Stop existing service if running
if [ -f "$PLIST_DEST" ]; then
    warn "Stopping existing Mac Bridge service..."
    launchctl unload "$PLIST_DEST" 2>/dev/null || true
    sleep 2
fi

# Copy plist to LaunchAgents
log "Installing launchd plist..."
cp "$PLIST_SOURCE" "$PLIST_DEST"
chmod 644 "$PLIST_DEST"

# Load the service
log "Loading Mac Bridge service..."
launchctl load "$PLIST_DEST"

sleep 2

# Verify service is running
if launchctl list | grep -q "com.wise2.desktopcommander.remote"; then
    log "Mac Bridge service loaded successfully"
else
    error "Failed to load Mac Bridge service"
fi

# Check if bridge is responsive
log "Waiting for bridge to start..."
sleep 3

if curl -s http://localhost:9999/health > /dev/null 2>&1; then
    log "Bridge health check passed"
    HEALTH=$(curl -s http://localhost:9999/health | jq -r '.status' 2>/dev/null || echo "unknown")
    log "Bridge status: $HEALTH"
else
    warn "Bridge not responding yet (it may still be starting)"
fi

# Display status
echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   Setup Complete                                       ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}Mac Bridge Configuration:${NC}"
echo "  Plist: $PLIST_DEST"
echo "  Logs: $BRIDGE_LOG_DIR/bridge.log"
echo "  Port: 9999"
echo "  Status: $(launchctl list com.wise2.desktopcommander.remote 2>/dev/null | grep -oE 'PID = [0-9]+' || echo 'Not running')"
echo ""

echo -e "${YELLOW}Useful Commands:${NC}"
echo "  • Check status:    launchctl list com.wise2.desktopcommander.remote"
echo "  • View logs:       tail -f $BRIDGE_LOG_DIR/bridge.log"
echo "  • Reload service:  launchctl unload $PLIST_DEST && launchctl load $PLIST_DEST"
echo "  • Health check:    curl http://localhost:9999/health | jq"
echo ""

log "Mac Bridge setup complete!"
