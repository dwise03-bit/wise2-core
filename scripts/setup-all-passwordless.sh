#!/bin/bash
# WISE² Complete Passwordless Setup
# Runs all passwordless access setup in correct order
# Usage: bash scripts/setup-all-passwordless.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   WISE² Complete Passwordless Access Setup             ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

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

# Get current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

log "Project root: $PROJECT_ROOT"
log "Script directory: $SCRIPT_DIR"
echo ""

# Step 1: Basic passwordless access (SSH keys + sudo)
echo -e "${YELLOW}Step 1: Setting up SSH keys and passwordless sudo...${NC}"
if [ -f "$SCRIPT_DIR/setup-passwordless-access.sh" ]; then
    bash "$SCRIPT_DIR/setup-passwordless-access.sh"
else
    error "Script not found: $SCRIPT_DIR/setup-passwordless-access.sh"
fi

echo ""
echo -e "${YELLOW}Step 2: Generating Surface remote control setup...${NC}"
if [ -f "$SCRIPT_DIR/setup-surface-remote.sh" ]; then
    bash "$SCRIPT_DIR/setup-surface-remote.sh"
else
    warn "Surface setup script not found at $SCRIPT_DIR/setup-surface-remote.sh"
fi

echo ""
echo -e "${YELLOW}Step 3: Verifying passwordless access...${NC}"

# Test local SSH connection
DWISE_USER="dwise"
DWISE_HOME="/home/$DWISE_USER"
SSH_DIR="$DWISE_HOME/.ssh"

# Check SSH keys exist
for key in "$SSH_DIR/id_surface_ed25519" "$SSH_DIR/id_mac_bridge" "$SSH_DIR/id_claude_automation"; do
    if [ -f "$key" ]; then
        log "SSH key found: $(basename $key)"
    else
        warn "SSH key not found: $key"
    fi
done

# Check sudoers configuration
SUDOERS_FILE="/etc/sudoers.d/wise2-$DWISE_USER"
if [ -f "$SUDOERS_FILE" ]; then
    log "Sudoers configuration found"
    if sudo -l -U "$DWISE_USER" 2>/dev/null | grep -q "NOPASSWD"; then
        log "Passwordless sudo is configured"
    else
        warn "Passwordless sudo may not be properly configured"
    fi
else
    warn "Sudoers file not found at $SUDOERS_FILE"
fi

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   Passwordless Setup Complete!                         ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}What's Configured:${NC}"
echo "  ✓ SSH keys for Surface, Mac Bridge, and Claude Automation"
echo "  ✓ SSH authorized_keys setup"
echo "  ✓ Passwordless sudo for dwise user"
echo "  ✓ SSH config for easy access"
echo "  ✓ Surface remote setup instructions"
echo "  ✓ Permission guard updated for SSH key auth"
echo ""

echo -e "${YELLOW}Next Steps:${NC}"
echo ""
echo "1. Copy Surface key to Surface device:"
echo "   cat ~/.ssh/id_surface_ed25519.pub > surface-key.pub"
echo "   (transfer to Surface, add to ~/.ssh/authorized_keys)"
echo ""
echo "2. Test SSH connection:"
echo "   ssh $DWISE_USER@$(hostname) 'echo SSH works!'"
echo ""
echo "3. On Mac, install the bridge:"
echo "   bash scripts/setup-mac-bridge.sh"
echo ""
echo "4. Verify passwordless operations:"
echo "   sudo systemctl status ssh (should not prompt for password)"
echo "   ssh-add ~/.ssh/id_claude_automation (verify agent)"
echo ""

echo -e "${YELLOW}Documentation:${NC}"
echo "  • Surface setup: ~/wise2-surface-setup-instructions.md"
echo "  • Mac bridge: infra/mac-bridge/com.wise2.desktopcommander.remote.plist"
echo "  • SSH config: ~/.ssh/config"
echo ""

log "All systems ready for passwordless operation!"
