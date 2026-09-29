#!/bin/bash

# WISE² Discord Setup - Interactive Runner
# Prompts for bot token, auto-extracts guild ID, runs complete setup

set -e

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🚀 WISE² Complete Discord Ecosystem Setup                ║"
echo "║     Take Full Control & Deploy Everything                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if token provided as argument
if [ -n "$1" ]; then
  DISCORD_BOT_TOKEN="$1"
else
  # Prompt for bot token
  echo "📝 Enter your Discord Bot Token"
  echo "   (Get it from: https://discord.com/developers/applications)"
  echo "   Click your WISE² bot → Bot → Copy Token"
  echo ""
  read -sp "Bot Token: " DISCORD_BOT_TOKEN
  echo ""
fi

if [ -z "$DISCORD_BOT_TOKEN" ]; then
  echo "❌ Bot token is required"
  exit 1
fi

echo ""
echo "🔍 Extracting guild information..."
echo ""

# Get guilds where bot is installed
GUILDS=$(curl -s -H "Authorization: Bot $DISCORD_BOT_TOKEN" \
  "https://discord.com/api/v10/users/@me/guilds" | jq -r '.[] | "\(.id) - \(.name)"')

if [ -z "$GUILDS" ]; then
  echo "❌ Could not connect to Discord API"
  echo "   Check your bot token and try again"
  exit 1
fi

echo "📊 Found WISE² server(s):"
echo ""
echo "$GUILDS" | nl
echo ""

# If multiple guilds, prompt to select
GUILD_COUNT=$(echo "$GUILDS" | wc -l)
if [ $GUILD_COUNT -eq 1 ]; then
  DISCORD_GUILD_ID=$(echo "$GUILDS" | awk '{print $1}')
else
  echo "Multiple servers found. Enter the number of your WISE² server:"
  read -p "Selection (1-$GUILD_COUNT): " SELECTION
  DISCORD_GUILD_ID=$(echo "$GUILDS" | sed -n "${SELECTION}p" | awk '{print $1}')
fi

if [ -z "$DISCORD_GUILD_ID" ]; then
  echo "❌ Invalid guild ID"
  exit 1
fi

GUILD_NAME=$(echo "$GUILDS" | grep "^$DISCORD_GUILD_ID" | cut -d' ' -f3-)
echo ""
echo "✅ Selected: $GUILD_NAME ($DISCORD_GUILD_ID)"
echo ""

# Export for master setup script
export DISCORD_BOT_TOKEN
export DISCORD_GUILD_ID

echo "🚀 Launching WISE² Discord Master Setup..."
echo ""

# Run master setup
bash /Users/danielwise/Projects/wise2-core/wise2-discord-master-setup.sh

echo ""
echo "✨ Setup complete!"
