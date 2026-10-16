#!/bin/bash
##############################################################################
# WISE² Desktop Commander Universal Installer
# Installs @wonderwhy-er/desktop-commander across Mac, Linux, Raspberry Pi
# Configures for centralized device management
##############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Detect OS
detect_os() {
    case "$(uname -s)" in
        Darwin*)
            OS="macos"
            INSTALL_CMD="brew"
            ;;
        Linux*)
            OS="linux"
            if command -v apt-get &> /dev/null; then
                INSTALL_CMD="apt"
            elif command -v yum &> /dev/null; then
                INSTALL_CMD="yum"
            fi
            ;;
        *)
            echo -e "${RED}Unsupported OS$(NC)"
            exit 1
            ;;
    esac
    echo -e "${BLUE}Detected OS: $OS${NC}"
}

# Check Node.js
check_nodejs() {
    if ! command -v node &> /dev/null; then
        echo -e "${YELLOW}Node.js not found. Installing...${NC}"
        if [ "$OS" = "macos" ]; then
            brew install node
        elif [ "$INSTALL_CMD" = "apt" ]; then
            sudo apt-get update
            sudo apt-get install -y nodejs npm
        elif [ "$INSTALL_CMD" = "yum" ]; then
            sudo yum install -y nodejs npm
        fi
    fi
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js $NODE_VERSION${NC}"
}

# Check npm
check_npm() {
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}npm not found${NC}"
        exit 1
    fi
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓ npm $NPM_VERSION${NC}"
}

# Install desktop-commander globally
install_desktop_commander() {
    echo -e "${BLUE}Installing @wonderwhy-er/desktop-commander globally...${NC}"
    npm install -g @wonderwhy-er/desktop-commander
    echo -e "${GREEN}✓ desktop-commander installed${NC}"
}

# Verify installation
verify_installation() {
    if command -v desktop-commander &> /dev/null || npx @wonderwhy-er/desktop-commander --version &> /dev/null; then
        VERSION=$(npx @wonderwhy-er/desktop-commander --version 2>/dev/null || echo "unknown")
        echo -e "${GREEN}✓ Verification passed: $VERSION${NC}"
        return 0
    else
        echo -e "${RED}✗ Installation verification failed${NC}"
        return 1
    fi
}

# Create WISE² config directory
setup_wise2_config() {
    CONFIG_DIR="$HOME/.wise2/desktop-commander"
    mkdir -p "$CONFIG_DIR"
    echo -e "${BLUE}Created config directory: $CONFIG_DIR${NC}"
    
    # Copy default config if it doesn't exist
    if [ ! -f "$CONFIG_DIR/config.json" ]; then
        cat > "$CONFIG_DIR/config.json" << 'EOF'
{
  "device": {
    "name": "$(hostname)",
    "environment": "production",
    "region": "nmls",
    "fleet": "wise2-core"
  },
  "remote": {
    "api_endpoint": "https://wise2.net/api/devices",
    "auth_header": "X-Device-Token",
    "heartbeat_interval": 30000
  },
  "features": {
    "remote_control": true,
    "file_sync": true,
    "command_execution": true,
    "metrics_reporting": true
  },
  "security": {
    "require_tls": true,
    "validate_certificates": true,
    "allowed_commands": ["status", "logs", "restart", "update"]
  }
}
EOF
        echo -e "${GREEN}✓ Created default config at $CONFIG_DIR/config.json${NC}"
    fi
}

# Add systemd service (Linux only)
setup_systemd_service() {
    if [ "$OS" = "linux" ]; then
        echo -e "${BLUE}Setting up systemd service...${NC}"
        
        SERVICE_FILE="/tmp/wise2-desktop-commander.service"
        cat > "$SERVICE_FILE" << 'EOF'
[Unit]
Description=WISE² Desktop Commander Remote Management
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=dwise
ExecStart=/usr/local/bin/desktop-commander remote
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=wise2-dc

[Install]
WantedBy=multi-user.target
EOF
        
        echo -e "${YELLOW}Systemd service template created at $SERVICE_FILE${NC}"
        echo -e "${YELLOW}To install: sudo cp $SERVICE_FILE /etc/systemd/system/${NC}"
        echo -e "${YELLOW}Then: sudo systemctl daemon-reload && sudo systemctl enable wise2-desktop-commander${NC}"
    fi
}

# Setup launchd service (macOS only)
setup_launchd_service() {
    if [ "$OS" = "macos" ]; then
        echo -e "${BLUE}Setting up launchd service...${NC}"
        
        PLIST_FILE="$HOME/Library/LaunchAgents/net.wise2.desktop-commander.plist"
        mkdir -p "$(dirname "$PLIST_FILE")"
        
        cat > "$PLIST_FILE" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>net.wise2.desktop-commander</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/desktop-commander</string>
        <string>remote</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <dict>
        <key>SuccessfulExit</key>
        <false/>
    </dict>
    <key>StandardOutPath</key>
    <string>/var/log/wise2-dc.log</string>
    <key>StandardErrorPath</key>
    <string>/var/log/wise2-dc.err</string>
</dict>
</plist>
EOF
        
        echo -e "${GREEN}✓ Created launchd plist at $PLIST_FILE${NC}"
        echo -e "${YELLOW}To enable: launchctl load $PLIST_FILE${NC}"
    fi
}

# Test remote connection
test_remote_connection() {
    echo -e "${BLUE}Testing remote connection...${NC}"
    
    if npx @wonderwhy-er/desktop-commander remote status &>/dev/null; then
        echo -e "${GREEN}✓ Remote connection successful${NC}"
    else
        echo -e "${YELLOW}⚠ Remote connection test inconclusive (may need API endpoint)${NC}"
    fi
}

# Print installation summary
print_summary() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    echo -e "${GREEN}WISE² Desktop Commander Installation Complete${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    echo ""
    echo "Device Information:"
    echo "  Hostname: $(hostname)"
    echo "  OS: $OS"
    echo "  Node: $(node -v)"
    echo "  npm: $(npm -v)"
    echo ""
    echo "Configuration:"
    echo "  Config Dir: $HOME/.wise2/desktop-commander"
    echo "  Config File: $HOME/.wise2/desktop-commander/config.json"
    echo ""
    echo "Next Steps:"
    echo "  1. Edit ~/.wise2/desktop-commander/config.json with your API endpoint"
    echo "  2. Set X-Device-Token environment variable or config value"
    echo "  3. Enable the service (see above)"
    echo "  4. Start remote management: npx desktop-commander remote"
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
}

##############################################################################
# Main Execution
##############################################################################
main() {
    echo -e "${BLUE}Starting WISE² Desktop Commander Installation...${NC}"
    echo ""
    
    detect_os
    check_nodejs
    check_npm
    install_desktop_commander
    verify_installation || exit 1
    setup_wise2_config
    setup_systemd_service
    setup_launchd_service
    test_remote_connection
    print_summary
}

main "$@"
