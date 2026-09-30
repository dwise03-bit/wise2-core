#!/bin/bash

# WISE² Tailscale + Codex Remote — Quick Install Script for macOS

set -e

echo "🚀 WISE² Tailscale + Codex Remote Installer"
echo "==========================================="
echo ""

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
  echo "❌ This script is for macOS only"
  exit 1
fi

# Check for required tools
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Install from: https://nodejs.org"
  exit 1
fi

if ! command -v brew &> /dev/null; then
  echo "❌ Homebrew not found. Install from: https://brew.sh"
  exit 1
fi

echo "✅ Node.js: $(node -v)"
echo "✅ npm: $(npm -v)"
echo ""

# Prompt for API keys
echo "🔑 API Configuration"
echo "===================="
echo ""

read -sp "Enter Tailscale API Key (from https://login.tailscale.com/admin/settings/keys): " TAILSCALE_KEY
echo ""

read -sp "Enter OpenAI API Key (from https://platform.openai.com/account/api-keys): " OPENAI_KEY
echo ""

# Validate keys
if [ -z "$TAILSCALE_KEY" ] || [ -z "$OPENAI_KEY" ]; then
  echo "❌ API keys are required"
  exit 1
fi

# Install Tailscale if needed
echo "📦 Installing Tailscale..."
if ! command -v tailscale &> /dev/null; then
  brew install tailscale
  echo "✅ Tailscale installed"
else
  echo "✅ Tailscale already installed: $(tailscale version)"
fi

# Start Tailscale daemon
echo ""
echo "🔐 Starting Tailscale daemon..."
if ! pgrep -x "tailscaled" > /dev/null; then
  launchctl start io.tailscale.ipn.macos
  sleep 2
fi
echo "✅ Tailscale daemon running"

# Install Node dependencies
echo ""
echo "📥 Installing Node dependencies..."
npm install

# Create .env file
echo ""
echo "📝 Creating configuration..."
cat > .env <<EOF
TAILSCALE_API_KEY=$TAILSCALE_KEY
TAILSCALE_MACHINE_NAME=wise2-mac
OPENAI_API_KEY=$OPENAI_KEY
OPENAI_MODEL=gpt-4
PORT=3009
NODE_ENV=production
LOG_LEVEL=info
EOF
chmod 600 .env
echo "✅ Configuration created (.env)"

# Build the service
echo ""
echo "🔨 Building service..."
npm run build
echo "✅ Build complete"

# Setup LaunchAgent
echo ""
echo "⚙️  Setting up macOS LaunchAgent..."

LAUNCH_AGENT_DIR="$HOME/Library/LaunchAgents"
PLIST_PATH="$LAUNCH_AGENT_DIR/com.wise2.codex-remote.plist"
SERVICE_PATH="$(pwd)/dist/index.js"

mkdir -p "$LAUNCH_AGENT_DIR"
mkdir -p "$HOME/.wise2/logs"

cat > "$PLIST_PATH" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>Label</key>
	<string>com.wise2.codex-remote</string>
	<key>ProgramArguments</key>
	<array>
		<string>/usr/local/bin/node</string>
		<string>REPLACE_SERVICE_PATH</string>
	</array>
	<key>WorkingDirectory</key>
	<string>REPLACE_WORKING_DIR</string>
	<key>RunAtLoad</key>
	<true/>
	<key>KeepAlive</key>
	<true/>
	<key>StandardOutPath</key>
	<string>REPLACE_HOME/.wise2/logs/codex-remote.log</string>
	<key>StandardErrorPath</key>
	<string>REPLACE_HOME/.wise2/logs/codex-remote-error.log</string>
	<key>EnvironmentVariables</key>
	<dict>
		<key>PATH</key>
		<string>/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
		<key>NODE_ENV</key>
		<string>production</string>
	</dict>
</dict>
</plist>
PLIST

# Replace placeholders in plist
sed -i '' "s|REPLACE_SERVICE_PATH|$SERVICE_PATH|g" "$PLIST_PATH"
sed -i '' "s|REPLACE_WORKING_DIR|$(pwd)|g" "$PLIST_PATH"
sed -i '' "s|REPLACE_HOME|$HOME|g" "$PLIST_PATH"

echo "✅ LaunchAgent created: $PLIST_PATH"

# Load the service
echo ""
echo "🎯 Loading service..."
launchctl load "$PLIST_PATH" 2>/dev/null || launchctl unload "$PLIST_PATH" && launchctl load "$PLIST_PATH"
sleep 2

# Verify service is running
if launchctl list | grep -q "com.wise2.codex-remote"; then
  echo "✅ Service loaded and running"
else
  echo "⚠️  Service may not be running. Check logs:"
  echo "   tail -f $HOME/.wise2/logs/codex-remote-error.log"
fi

# Test the service
echo ""
echo "🧪 Testing service..."
sleep 1

if curl -s http://localhost:3009/health | grep -q "healthy"; then
  echo "✅ Service is responding"
else
  echo "⚠️  Service may not be responding yet. Wait a moment and try:"
  echo "   curl http://localhost:3009/health"
fi

# Print summary
echo ""
echo "✨ Installation Complete!"
echo "========================="
echo ""
echo "📋 Quick Start:"
echo "   1. Service is running at: http://localhost:3009"
echo "   2. Check status: curl http://localhost:3009/health"
echo "   3. View logs: tail -f $HOME/.wise2/logs/codex-remote.log"
echo ""
echo "🔗 Access from Tailscale:"
echo "   - Your machine is on the Tailscale network"
echo "   - Access from other devices on the same Tailnet"
echo ""
echo "📖 Documentation:"
echo "   - README: $(pwd)/README.md"
echo "   - API Docs: $(pwd)/README.md#api-reference"
echo ""
echo "❌ To uninstall:"
echo "   launchctl unload $PLIST_PATH"
echo "   rm $PLIST_PATH"
echo ""
