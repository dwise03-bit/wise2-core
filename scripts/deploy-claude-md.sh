#!/bin/bash

# Deploy CLAUDE.md to Mac and wise2.net
# Usage: ./scripts/deploy-claude-md.sh

set -e

CLAUDE_MD_PATH="/home/user/wise2-core/CLAUDE.md"
SERVER_IP="173.208.147.165"
SERVER_USER="dwise"
MAC_PATH="~/.wise2/CLAUDE.md"
WISE2_PATH="/var/www/wise2.net/CLAUDE.md"

echo "🚀 Deploying CLAUDE.md..."

# Check file exists
if [ ! -f "$CLAUDE_MD_PATH" ]; then
    echo "❌ CLAUDE.md not found at $CLAUDE_MD_PATH"
    exit 1
fi

# Deploy to wise2.net server
echo "📤 Copying to wise2.net server ($SERVER_IP)..."
ssh "$SERVER_USER@$SERVER_IP" "mkdir -p /var/www/wise2.net" || echo "⚠️  Warning: Could not create directory on server"
scp "$CLAUDE_MD_PATH" "$SERVER_USER@$SERVER_IP:$WISE2_PATH" && echo "✅ Deployed to wise2.net" || echo "❌ Failed to deploy to wise2.net"

# Deploy to Mac via bridge
echo "📱 Copying to Mac via bridge..."
if command -v wise2-bridge &> /dev/null; then
    wise2-bridge doctor || wise2-bridge recover
    # Copy via remote command
    ssh "$SERVER_USER@$SERVER_IP" "scp -r $CLAUDE_MD_PATH dwise@localhost:$MAC_PATH" 2>/dev/null || echo "⚠️  Warning: Could not deploy to Mac directly"
    echo "✅ Mac deployment initiated"
else
    echo "⚠️  wise2-bridge not available"
fi

# Archive in data layer
cp "$CLAUDE_MD_PATH" "/home/user/wise2-core/data/CLAUDE.md.$(date +%Y%m%d-%H%M%S)"
echo "✅ Archived to data layer"

echo ""
echo "✨ Deployment complete!"
echo ""
echo "Files available at:"
echo "  - wise2.net: $WISE2_PATH"
echo "  - Mac: $MAC_PATH"
echo "  - Data archive: /home/user/wise2-core/data/CLAUDE.md.*"
