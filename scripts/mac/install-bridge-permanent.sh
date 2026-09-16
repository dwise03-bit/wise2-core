#!/bin/bash
#
# WISE² MAC CONTROL RELAY - PERMANENT INSTALLATION
#
# Installs launchd supervision for the WISE² Mac bridge with
# auto-recovery, health checks, and self-healing.
#
# This is a production-grade setup that survives:
# - Mac reboot / sleep / wake
# - Terminal closure
# - Process crash
# - Temporary network loss
# - WiFi/network changes
# - User login/logout
#
# Usage:
#   bash scripts/mac/install-bridge-permanent.sh
#
# Safety:
#   - Backs up existing configuration
#   - Validates plist before loading
#   - Never runs as root
#   - All paths are user-relative (~/.wise2)
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                       ║${NC}"
echo -e "${BLUE}║  WISE² MAC CONTROL RELAY PERMANENT INSTALLATION       ║${NC}"
echo -e "${BLUE}║                                                       ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""

# Verify macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
  echo -e "${RED}❌ Error: This script requires macOS${NC}"
  exit 1
fi

# Find Node.js
if ! NODE_PATH=$(command -v node); then
  echo -e "${RED}❌ Error: Node.js not found${NC}"
  echo "   Install: brew install node"
  exit 1
fi

echo -e "${GREEN}✅ macOS detected${NC}"
echo -e "${GREEN}✅ Node.js found:${NC} $NODE_PATH"

# Verify repo structure
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"
RELAY_SRC="$REPO_DIR/services/control-relay"

if [ ! -d "$RELAY_SRC" ]; then
  echo -e "${RED}❌ Error: control-relay not found at $RELAY_SRC${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Repository found:${NC} $REPO_DIR"

# Build control-relay if needed
if [ ! -f "$RELAY_SRC/dist/services/control-relay/src/server.js" ]; then
  echo ""
  echo "Building control-relay..."
  cd "$RELAY_SRC"
  npm install
  npm run build
fi

echo -e "${GREEN}✅ control-relay built${NC}"

# Create ~/.wise2 directory
mkdir -p ~/.wise2/bin
chmod 700 ~/.wise2
echo -e "${GREEN}✅ Created ~/.wise2 directory${NC}"

# Backup existing plist
if [ -f ~/Library/LaunchAgents/com.wise2.control-relay.plist ]; then
  BACKUP="~/Library/LaunchAgents/com.wise2.control-relay.plist.backup.$(date +%s)"
  cp ~/Library/LaunchAgents/com.wise2.control-relay.plist "$BACKUP"
  echo -e "${YELLOW}⚠️  Backed up existing plist${NC}"
fi

# Unload if running
if launchctl list | grep -q "com.wise2.control-relay" 2>/dev/null; then
  echo "Unloading existing service..."
  launchctl bootout user/$(id -u) ~/Library/LaunchAgents/com.wise2.control-relay.plist 2>/dev/null || true
  sleep 1
fi

# Create new plist
echo "Creating launchd agent..."

cat > ~/Library/LaunchAgents/com.wise2.control-relay.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.wise2.control-relay</string>

    <key>ProgramArguments</key>
    <array>
        <string>$NODE_PATH</string>
        <string>$RELAY_SRC/dist/services/control-relay/src/server.js</string>
    </array>

    <key>WorkingDirectory</key>
    <string>$RELAY_SRC</string>

    <key>EnvironmentVariables</key>
    <dict>
        <key>NODE_ENV</key>
        <string>production</string>

        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>

        <key>HOME</key>
        <string>$HOME</string>

        <key>WISE2_RELAY_HOST</key>
        <string>127.0.0.1</string>

        <key>WISE2_RELAY_PORT</key>
        <string>4600</string>

        <key>WISE2_RELAY_TARGETS_FILE</key>
        <string>$HOME/.wise2/targets.json</string>

        <key>WISE2_RELAY_AUDIT_FILE</key>
        <string>$HOME/.wise2/relay-audit.jsonl</string>

        <!-- Configure these from secure storage: -->
        <key>WISE2_RELAY_TOKEN</key>
        <string>REPLACE_ME</string>

        <key>WISE2_OPS_SIGNING_KEYS</key>
        <string>relay-2026-09:REPLACE_ME</string>

        <key>WISE2_BRIDGE_TOKEN_CORE</key>
        <string>REPLACE_ME</string>
    </dict>

    <key>RunAtLoad</key>
    <true/>

    <key>KeepAlive</key>
    <dict>
        <key>SuccessfulExit</key>
        <false/>
    </dict>

    <key>ThrottleInterval</key>
    <integer>10</integer>

    <key>StandardOutPath</key>
    <string>$HOME/.wise2/relay.log</string>

    <key>StandardErrorPath</key>
    <string>$HOME/.wise2/relay.err.log</string>

    <key>ProcessType</key>
    <string>Background</string>

    <key>UserName</key>
    <string>$(whoami)</string>
</dict>
</plist>
EOF

chmod 600 ~/Library/LaunchAgents/com.wise2.control-relay.plist
echo -e "${GREEN}✅ LaunchAgent installed${NC}"

# Validate plist
if ! plutil -lint ~/Library/LaunchAgents/com.wise2.control-relay.plist &>/dev/null; then
  echo -e "${RED}❌ plist validation failed${NC}"
  exit 1
fi

echo -e "${GREEN}✅ plist validation passed${NC}"

# Install health checker
cat > ~/.wise2/bin/bridge-health << 'HEALTH_SCRIPT'
#!/bin/bash
set -e

RELAY_PORT=4600
RELAY_HOST="127.0.0.1"

LAUNCHD_OK=0
PROCESS_OK=0
PORT_OK=0

launchctl list | grep -q "com.wise2.control-relay" && LAUNCHD_OK=1 || true
pgrep -f "control-relay/dist/services/control-relay/src/server.js" &>/dev/null && PROCESS_OK=1 || true
lsof -nP -iTCP:$RELAY_PORT -sTCP:LISTEN 2>/dev/null | grep -q "$RELAY_PORT" && PORT_OK=1 || true

if [ $LAUNCHD_OK -eq 1 ] && [ $PROCESS_OK -eq 1 ] && [ $PORT_OK -eq 1 ]; then
  echo "WISE2 BRIDGE: GREEN"
  echo "  Launchd: ✅"
  echo "  Process: ✅"
  echo "  Port:    ✅"
  exit 0
else
  echo "WISE2 BRIDGE: RED"
  echo "  Launchd: $([ $LAUNCHD_OK -eq 1 ] && echo '✅' || echo '❌')"
  echo "  Process: $([ $PROCESS_OK -eq 1 ] && echo '✅' || echo '❌')"
  echo "  Port:    $([ $PORT_OK -eq 1 ] && echo '✅' || echo '❌')"
  exit 1
fi
HEALTH_SCRIPT

chmod +x ~/.wise2/bin/bridge-health

# Install recovery script
cat > ~/.wise2/bin/bridge-recover << 'RECOVER_SCRIPT'
#!/bin/bash
set -e

echo "Recovering WISE² Bridge..."

if ! launchctl list | grep -q "com.wise2.control-relay"; then
  echo "Bootstrapping service..."
  launchctl bootstrap user/$(id -u) ~/Library/LaunchAgents/com.wise2.control-relay.plist 2>/dev/null
else
  echo "Kickstarting service..."
  launchctl kickstart -k user/$(id -u)/com.wise2.control-relay 2>/dev/null || true
fi

sleep 2

if ~/.wise2/bin/bridge-health 2>&1 | grep -q "GREEN"; then
  echo "✅ Bridge recovered"
  exit 0
else
  echo "❌ Recovery failed. Check: tail ~/.wise2/relay.err.log"
  exit 1
fi
RECOVER_SCRIPT

chmod +x ~/.wise2/bin/bridge-recover

# Install control command
if [ ! -f /usr/local/bin/wise2-bridge ] || ! grep -q "control relay" /usr/local/bin/wise2-bridge 2>/dev/null; then
  cat > /usr/local/bin/wise2-bridge << 'COMMAND_SCRIPT'
#!/bin/bash
case "${1:-help}" in
  status)
    ~/.wise2/bin/bridge-health
    ;;
  doctor)
    ~/.wise2/bin/bridge-health
    echo ""
    echo "Recent logs:"
    tail -10 ~/.wise2/relay.log 2>/dev/null || echo "  (no log yet)"
    ;;
  recover)
    ~/.wise2/bin/bridge-recover
    ;;
  logs)
    tail -${2:-50} ~/.wise2/relay.log
    echo ""
    echo "--- Errors ---"
    tail -${2:-50} ~/.wise2/relay.err.log
    ;;
  *)
    echo "WISE² Bridge Control"
    echo "  wise2-bridge status   # Check health"
    echo "  wise2-bridge doctor   # Full diagnostic"
    echo "  wise2-bridge recover  # Auto-recovery"
    echo "  wise2-bridge logs [N] # Show logs (default 50 lines)"
    ;;
esac
COMMAND_SCRIPT
  chmod +x /usr/local/bin/wise2-bridge
  echo -e "${GREEN}✅ wise2-bridge command installed${NC}"
fi

# Bootstrap the service
echo ""
echo "Loading service..."
launchctl bootstrap user/$(id -u) ~/Library/LaunchAgents/com.wise2.control-relay.plist 2>/dev/null || {
  echo -e "${RED}❌ Failed to load${NC}"
  exit 1
}

echo -e "${GREEN}✅ Service loaded${NC}"

# Wait and test
sleep 3

echo ""
echo "Initial health check:"
if ~/.wise2/bin/bridge-health; then
  echo -e "${GREEN}✅ Bridge is operational${NC}"
else
  echo -e "${YELLOW}⚠️  Bridge starting, check again in a few seconds${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}⚠️  REQUIRED: Configure secrets${NC}"
echo ""
echo "Edit ~/Library/LaunchAgents/com.wise2.control-relay.plist"
echo "Replace REPLACE_ME values with actual tokens"
echo ""
echo "Then reload:"
echo "  launchctl kickstart -k user/\$(id -u)/com.wise2.control-relay"
echo ""
echo -e "${GREEN}✅ Installation complete${NC}"
echo ""
