#!/bin/bash

#
# WISE² - Phase 1: MacBook Pro M4 Setup
#
# This script automates the complete Hermes + Photon + WISE² IMP
# installation on your MacBook.
#
# Usage: bash deploy/01-mac-setup.sh
#
# What it does:
# 1. Checks prerequisites
# 2. Installs Hermes (if not present)
# 3. Sets up Photon for iMessage
# 4. Configures WISE² IMP
# 5. Creates LaunchAgent for auto-start
# 6. Runs verification tests
#

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║  WISE² Phase 1: MacBook Pro M4 Setup                        ║"
echo "║                                                              ║"
echo "║  This will install Hermes + Photon + WISE² IMP             ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check OS
if [[ "$OSTYPE" != "darwin"* ]]; then
  echo "❌ Error: This script must run on macOS"
  exit 1
fi

echo "✅ Running on macOS"

# Check prerequisites
echo ""
echo "Checking prerequisites..."

if ! command -v brew &> /dev/null; then
  echo "❌ Homebrew not installed. Install from https://brew.sh"
  exit 1
fi
echo "✅ Homebrew installed"

if ! command -v node &> /dev/null; then
  echo "Installing Node.js..."
  brew install node
fi
echo "✅ Node.js: $(node --version)"

if ! command -v git &> /dev/null; then
  echo "Installing Git..."
  brew install git
fi
echo "✅ Git: $(git --version)"

# Install Hermes
echo ""
echo "Installing Hermes..."

if ! command -v hermes &> /dev/null; then
  echo "Hermes not found. Installing..."

  # Download Hermes (this URL is a placeholder - use actual Hermes installer)
  echo "Note: Using official Hermes installer from hermes.io"
  echo "If Hermes is not available via Homebrew, download from: https://hermes.io/install"

  # Attempt Homebrew installation
  if brew tap hermes-ai/tap 2>/dev/null; then
    brew install hermes-ai/tap/hermes
  else
    echo "⚠️  Could not install Hermes via Homebrew"
    echo "Please install manually from: https://hermes.io/install"
    echo "Then re-run this script"
    exit 1
  fi
else
  echo "✅ Hermes already installed"
fi

echo "✅ Hermes: $(hermes --version)"

# Setup Photon for iMessage
echo ""
echo "Setting up Photon (iMessage Gateway)..."

read -p "Enter your iPhone number (E.164 format, e.g., +1-555-0123): " PHONE_NUMBER

if [[ ! "$PHONE_NUMBER" =~ ^\+[0-9\-]+$ ]]; then
  echo "❌ Invalid phone format"
  exit 1
fi

echo "Setting up Photon with phone: $PHONE_NUMBER"

# This requires interactive authentication
hermes photon setup --phone "$PHONE_NUMBER" || {
  echo "⚠️  Photon setup needs manual completion"
  echo "Run: hermes photon setup --phone $PHONE_NUMBER"
  echo "Then authorize on your iPhone"
}

# Create WISE² configuration
echo ""
echo "Creating WISE² IMP configuration..."

mkdir -p ~/.wise2

cat > ~/.wise2/config.json << EOF
{
  "owner_phone": "$PHONE_NUMBER",
  "owner_name": "MacBook Pro M4",
  "authorized_senders": [
    {
      "e164_number": "$PHONE_NUMBER",
      "name": "Owner",
      "role": "owner",
      "id": "owner_primary"
    }
  ],
  "nodes": {
    "mac": {
      "enabled": true,
      "role": "interactive-primary",
      "capabilities": ["hermes", "claude-code", "codex", "local-ollama", "imessage"]
    },
    "vps": {
      "enabled": false,
      "role": "always-on-remote"
    }
  },
  "environment": "production"
}
EOF

echo "✅ Configuration created at ~/.wise2/config.json"

# Create LaunchAgent for auto-start
echo ""
echo "Creating LaunchAgent for auto-start..."

mkdir -p ~/Library/LaunchAgents

cat > ~/Library/LaunchAgents/com.wise2.hermes.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.wise2.hermes</string>

    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/hermes</string>
        <string>gateway</string>
        <string>start</string>
    </array>

    <key>RunAtLoad</key>
    <true/>

    <key>KeepAlive</key>
    <dict>
        <key>SuccessfulExit</key>
        <false/>
    </dict>

    <key>StandardOutPath</key>
    <string>/var/log/wise2-hermes.log</string>

    <key>StandardErrorPath</key>
    <string>/var/log/wise2-hermes.err</string>
</dict>
</plist>
EOF

chmod 644 ~/Library/LaunchAgents/com.wise2.hermes.plist

echo "✅ LaunchAgent created"

# Load LaunchAgent
echo ""
echo "Loading LaunchAgent..."

launchctl load ~/Library/LaunchAgents/com.wise2.hermes.plist || {
  echo "⚠️  Could not load LaunchAgent"
  echo "Try: launchctl load ~/Library/LaunchAgents/com.wise2.hermes.plist"
}

# Test Hermes
echo ""
echo "Testing Hermes..."

sleep 2

if hermes gateway status &>/dev/null; then
  echo "✅ Hermes gateway is running"
else
  echo "⚠️  Hermes gateway status check failed"
  echo "Try: hermes gateway start"
fi

# Test Photon
echo ""
echo "Testing Photon..."

if hermes photon status &>/dev/null; then
  echo "✅ Photon is connected"
else
  echo "⚠️  Photon not connected yet"
  echo "Check: hermes photon status"
fi

# Install WISE² CLI
echo ""
echo "Installing WISE² CLI..."

if [ -d "$(dirname "$0")/../scripts" ]; then
  ln -sf "$(pwd)/scripts/wise2" /usr/local/bin/wise2
  chmod +x /usr/local/bin/wise2
  echo "✅ WISE² CLI installed"
  echo ""
  echo "Test: wise2 help"
else
  echo "⚠️  Could not find WISE² scripts directory"
fi

# Final status
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║  ✅ MacBook Setup Complete!                                 ║"
echo "║                                                              ║"
echo "║  Next Steps:                                                 ║"
echo "║  1. Verify Hermes: hermes gateway status                     ║"
echo "║  2. Verify Photon: hermes photon status                      ║"
echo "║  3. Test CLI: wise2 health                                   ║"
echo "║  4. Send iMessage: Wise, status                              ║"
echo "║                                                              ║"
echo "║  For VPS setup, run: bash deploy/02-vps-setup.sh            ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
