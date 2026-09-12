#!/bin/bash

#
# WISE² Discord Bot Setup Script
#
# Configures and starts the Discord bot integration
# Run after WISE² IMP service is running
#
# Usage: bash deploy/04-discord-setup.sh
#

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║  WISE² Discord Bot Setup                                     ║"
echo "║                                                              ║"
echo "║  This will configure and start the Discord bot service      ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is required but not installed"
  echo "Install from: https://nodejs.org/"
  exit 1
fi
echo "✅ Node.js $(node -v) found"
echo ""

# Check if WISE² IMP is running
echo "Checking WISE² IMP service..."
if curl -s http://localhost:9002/status > /dev/null 2>&1; then
  echo "✅ WISE² IMP service is running on port 9002"
else
  echo "⚠️  WISE² IMP service is not running"
  echo "Start it with: node services/wise2-imp-service.js"
  echo ""
  read -p "Continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi
echo ""

# Get Discord Bot Token
echo "════════════════════════════════════════════════════════════════"
echo "Discord Bot Token"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "To get your bot token:"
echo "  1. Go to https://discord.com/developers/applications"
echo "  2. Click your application"
echo "  3. Go to 'Bot' section"
echo "  4. Copy the token"
echo ""

if [ -f ".env.discord" ]; then
  echo "⚠️  .env.discord already exists"
  read -p "Replace with new token? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Using existing .env.discord"
    SKIP_TOKEN=1
  else
    SKIP_TOKEN=0
  fi
else
  SKIP_TOKEN=0
fi

if [ $SKIP_TOKEN -eq 0 ]; then
  read -p "Enter Discord Bot Token: " DISCORD_BOT_TOKEN
  if [ -z "$DISCORD_BOT_TOKEN" ]; then
    echo "❌ Bot token cannot be empty"
    exit 1
  fi

  # Create .env.discord
  cat > .env.discord << EOF
DISCORD_BOT_TOKEN=$DISCORD_BOT_TOKEN
WISE2_IMP_URL=http://localhost:9002
BOT_PORT=9003
LOG_DIR=data/logs
MEMORY_DIR=data/memory
NODE_ENV=production
LOG_LEVEL=info
CONFIRMATION_EXPIRY_MINUTES=5
EOF

  chmod 600 .env.discord
  echo "✅ Bot token saved to .env.discord (permissions: 600)"
fi
echo ""

# Create directories
echo "Creating required directories..."
mkdir -p data/logs data/memory
echo "✅ Directories ready"
echo ""

# Install dependencies
echo "════════════════════════════════════════════════════════════════"
echo "Installing Dependencies"
echo "════════════════════════════════════════════════════════════════"
if [ -f "package-lock.json" ]; then
  npm install discord.js
elif [ -f "pnpm-lock.yaml" ]; then
  pnpm add discord.js
elif [ -f "yarn.lock" ]; then
  yarn add discord.js
else
  npm install discord.js
fi
echo "✅ Dependencies installed"
echo ""

# Start bot
echo "════════════════════════════════════════════════════════════════"
echo "Starting Discord Bot"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Starting bot on port 9003..."
echo ""

# Load environment and start
if command -v pm2 &> /dev/null; then
  echo "Starting with PM2..."
  set +e
  source .env.discord
  pm2 start services/discord-bot-service.js \
    --name "wise2-discord-bot" \
    --env DISCORD_BOT_TOKEN="$DISCORD_BOT_TOKEN" \
    --env WISE2_IMP_URL="http://localhost:9002"
  set -e
  echo ""
  echo "✅ Bot started with PM2"
  echo ""
  echo "View logs:"
  echo "  pm2 logs wise2-discord-bot"
  echo ""
else
  echo "Starting bot directly..."
  source .env.discord
  node services/discord-bot-service.js &
  BOT_PID=$!
  echo "✅ Bot started with PID $BOT_PID"
  echo ""
  echo "To stop the bot:"
  echo "  kill $BOT_PID"
  echo ""
fi

# Test bot
echo "Waiting for bot to initialize..."
sleep 3

if curl -s http://localhost:9003/log -X POST -d "test" > /dev/null 2>&1; then
  echo "✅ Discord Bot is responding"
else
  echo "⚠️  Bot may still be initializing..."
fi
echo ""

# Next steps
echo "════════════════════════════════════════════════════════════════"
echo "Setup Complete!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo "  1. Add bot to your Discord server:"
echo "     https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=bot"
echo ""
echo "  2. Test bot in Discord:"
echo "     /status"
echo "     /intent description:\"test command\""
echo ""
echo "  3. View logs:"
if command -v pm2 &> /dev/null; then
  echo "     pm2 logs wise2-discord-bot"
else
  echo "     tail -f data/logs/discord-bot.log"
fi
echo ""
echo "  4. Read documentation:"
echo "     docs/DISCORD_BOT.md"
echo ""
echo "For more info: https://github.com/wise2-core"
echo ""
