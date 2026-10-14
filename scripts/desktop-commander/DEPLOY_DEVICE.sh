#!/bin/bash
##############################################################################
# WISE² Fleet Deployment - Direct Command
# Run this on each device to deploy desktop-commander
##############################################################################

set -e

REPO_URL="https://github.com/dwise03-bit/wise2-core"
INSTALLER_URL="$REPO_URL/raw/main/scripts/desktop-commander/install-desktop-commander.sh"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  WISE² Desktop Commander - Device Setup                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

##############################################################################
# For macOS (run on danielwise Mac)
##############################################################################

deploy_macos() {
    echo "→ macOS Deployment"
    echo ""

    # Install Node.js if missing
    if ! command -v node &> /dev/null; then
        echo "  Installing Node.js via Homebrew..."
        brew install node
    fi

    echo "  Installing desktop-commander..."
    npm install -g @wonderwhy-er/desktop-commander 2>/dev/null || {
        # Fallback: use npx directly
        echo "  Using npx fallback..."
        npx @wonderwhy-er/desktop-commander --version
    }

    echo "  Setting up config..."
    CONFIG_DIR="$HOME/.wise2/desktop-commander"
    mkdir -p "$CONFIG_DIR"

    cat > "$CONFIG_DIR/config.json" << 'EOCFG'
{
  "device": {
    "name": "macbook-danielwise",
    "environment": "production",
    "region": "mac-local",
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
EOCFG

    echo "  Creating launchd service..."
    mkdir -p ~/Library/LaunchAgents
    cat > ~/Library/LaunchAgents/net.wise2.desktop-commander.plist << 'EOLPLIST'
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
EOLPLIST

    echo "  Loading service..."
    launchctl load ~/Library/LaunchAgents/net.wise2.desktop-commander.plist 2>/dev/null || echo "  (Service load pending)"

    echo "✓ macOS setup complete"
    echo ""
}

##############################################################################
# For Linux (VPS or Pi - run on each)
##############################################################################

deploy_linux() {
    echo "→ Linux Deployment"
    echo ""

    # Install Node.js if missing
    if ! command -v node &> /dev/null; then
        echo "  Installing Node.js..."
        if command -v apt-get &> /dev/null; then
            sudo apt-get update
            sudo apt-get install -y nodejs npm
        elif command -v yum &> /dev/null; then
            sudo yum install -y nodejs npm
        fi
    fi

    echo "  Installing desktop-commander..."
    npm install -g @wonderwhy-er/desktop-commander 2>/dev/null || {
        echo "  Using npx fallback..."
        npx @wonderwhy-er/desktop-commander --version
    }

    echo "  Setting up config..."
    CONFIG_DIR="$HOME/.wise2/desktop-commander"
    mkdir -p "$CONFIG_DIR"

    # Detect hostname for config
    HOSTNAME=$(hostname)
    cat > "$CONFIG_DIR/config.json" << EOCFG
{
  "device": {
    "name": "$HOSTNAME",
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
  },
  "logging": {
    "level": "info",
    "format": "json",
    "output": "/var/log/wise2-dc.log"
  }
}
EOCFG

    echo "  Creating systemd service..."
    sudo tee /etc/systemd/system/wise2-desktop-commander.service > /dev/null << 'EOSVC'
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
EOSVC

    echo "  Enabling service..."
    sudo systemctl daemon-reload
    sudo systemctl enable wise2-desktop-commander
    sudo systemctl start wise2-desktop-commander

    echo "✓ Linux setup complete"
    echo ""
}

##############################################################################
# Main
##############################################################################

if [ "$(uname)" = "Darwin" ]; then
    deploy_macos
else
    deploy_linux
fi

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Setup Complete                                           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Configuration: ~/.wise2/desktop-commander/config.json"
echo "Logs:"
if [ "$(uname)" = "Darwin" ]; then
    echo "  tail -f /var/log/wise2-dc.log"
    echo ""
    echo "Service status:"
    echo "  launchctl list | grep desktop-commander"
else
    echo "  sudo journalctl -u wise2-desktop-commander -f"
    echo ""
    echo "Service status:"
    echo "  sudo systemctl status wise2-desktop-commander"
fi
echo ""
