#!/bin/bash

# WISE² Discord Bot v2.0 — Production Deployment Script
# Usage: ./deploy.sh [production|staging|dev]

set -e

ENVIRONMENT=${1:-production}
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 WISE² Discord Bot v2.0 — Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Environment: $ENVIRONMENT"
echo "Directory: $DIR"
echo ""

# Step 1: Verify environment
echo "1️⃣ Verifying environment..."
if ! grep -q "DISCORD_BOT_TOKEN" /home/dwise/.env; then
  echo "❌ DISCORD_BOT_TOKEN not found in .env"
  exit 1
fi
if ! grep -q "DISCORD_CLIENT_ID" /home/dwise/.env; then
  echo "❌ DISCORD_CLIENT_ID not found in .env"
  exit 1
fi
if ! grep -q "DISCORD_GUILD_ID" /home/dwise/.env; then
  echo "❌ DISCORD_GUILD_ID not found in .env"
  exit 1
fi
echo "✅ Environment variables configured"
echo ""

# Step 2: Verify code
echo "2️⃣ Verifying code..."
cd "$DIR"

# Syntax check
if ! node -c bot.js 2>/dev/null; then
  echo "❌ Syntax error in bot.js"
  exit 1
fi
echo "✅ Syntax valid"

# Check dependencies
if ! npm list > /dev/null 2>&1; then
  echo "⚠️  Installing dependencies..."
  npm install
fi
echo "✅ Dependencies ready"
echo ""

# Step 3: Register commands
echo "3️⃣ Registering Discord commands..."
if npm run register 2>&1 | grep -q "Successfully registered"; then
  echo "✅ Commands registered"
else
  echo "⚠️  Command registration may have failed"
  echo "   (This is OK if bot is already registered)"
fi
echo ""

# Step 4: Deployment
echo "4️⃣ Deploying bot..."

case $ENVIRONMENT in
  production)
    echo "Launching with PM2..."
    if ! command -v pm2 &> /dev/null; then
      echo "⚠️  PM2 not installed. Installing globally..."
      npm install -g pm2
    fi

    pm2 start bot.js --name wise-discord --log-date-format="YYYY-MM-DD HH:mm:ss Z"
    pm2 save
    echo "✅ Bot deployed with PM2"
    echo "   Status: pm2 status"
    echo "   Logs: pm2 logs wise-discord"
    ;;

  staging)
    echo "Launching in foreground for monitoring..."
    npm start
    ;;

  dev)
    echo "Launching in development mode..."
    npm run dev
    ;;

  *)
    echo "❌ Unknown environment: $ENVIRONMENT"
    echo "   Usage: ./deploy.sh [production|staging|dev]"
    exit 1
    ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE"
echo ""
echo "📋 Next steps:"
echo "   1. Verify bot is online in Discord (green dot)"
echo "   2. Type '/' and see all commands"
echo "   3. Test a command: /ai ask \"hello\""
echo "   4. Monitor logs: pm2 logs wise-discord"
echo ""
echo "📚 Documentation:"
echo "   • Setup guide: SETUP_AND_DEPLOY.md"
echo "   • Deployment checklist: DEPLOYMENT_CHECKLIST.md"
echo "   • Command reference: DISCORD_COMMANDS.md"
echo "   • Test report: TEST_REPORT.md"
echo ""
echo "🎉 Success criteria: All 10 commands visible, <3s response time"
