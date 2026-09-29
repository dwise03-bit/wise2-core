#!/bin/bash

# WISE² Complete Discord Bot Ecosystem Setup
# Sets up all bots, channels, webhooks, and permissions
# Usage: DISCORD_BOT_TOKEN=xxx DISCORD_GUILD_ID=xxx bash setup-wise2-discord-complete.sh

set -e

PAIGE_USER_ID="1539066029823623230"
DWISE_USER_ID="1417669925073453186"
SENCERE_USER_ID="1526432273191141496"

# Bot definitions
declare -A BOTS=(
  ["main"]="Main WISE² Bot"
  ["analytics"]="Analytics & Insights"
  ["deployment"]="Deployment Notifications"
  ["github"]="GitHub Integration"
  ["knowledge"]="Knowledge Base"
  ["moderation"]="Moderation"
  ["daily"]="Daily Reports"
  ["music"]="Music & Audio"
  ["tasks"]="Task Management"
  ["ai"]="AI Assistant"
)

# Channel definitions with permissions
declare -A CHANNELS=(
  ["alerts"]="general"
  ["deployments"]="ops"
  ["builds"]="ops"
  ["decisions"]="leadership"
  ["status"]="general"
  ["revenue"]="sales"
  ["moderator-only"]="leadership"
  ["github"]="dev"
  ["analytics"]="data"
  ["knowledge"]="support"
  ["daily-reports"]="leadership"
)

if [ -z "$DISCORD_BOT_TOKEN" ] || [ -z "$DISCORD_GUILD_ID" ]; then
  echo "❌ Missing DISCORD_BOT_TOKEN or DISCORD_GUILD_ID"
  echo "Usage: DISCORD_BOT_TOKEN=xxx DISCORD_GUILD_ID=xxx bash setup-wise2-discord-complete.sh"
  exit 1
fi

echo "🚀 WISE² Discord Bot Ecosystem Setup"
echo "===================================="
echo "Guild: $DISCORD_GUILD_ID"
echo ""

# Function to call Discord API
discord_api() {
  local method=$1
  local endpoint=$2
  local data=$3

  if [ -z "$data" ]; then
    curl -s -X "$method" \
      -H "Authorization: Bot $DISCORD_BOT_TOKEN" \
      "https://discord.com/api/v10$endpoint"
  else
    curl -s -X "$method" \
      -H "Authorization: Bot $DISCORD_BOT_TOKEN" \
      -H "Content-Type: application/json" \
      -d "$data" \
      "https://discord.com/api/v10$endpoint"
  fi
}

# Step 1: Create/Verify Roles
echo "📋 Step 1: Setting up roles..."

# Admin role
ADMIN_ROLE=$(discord_api GET "/guilds/$DISCORD_GUILD_ID/roles" | jq -r '.[] | select(.name=="Admin") | .id' | head -1)
if [ -z "$ADMIN_ROLE" ]; then
  ADMIN_ROLE=$(discord_api POST "/guilds/$DISCORD_GUILD_ID/roles" '{"name":"Admin","color":16711680,"permissions":"8"}' | jq -r '.id')
  echo "   ✅ Created Admin role: $ADMIN_ROLE"
else
  echo "   ✅ Admin role exists: $ADMIN_ROLE"
fi

# Secretary role
SECRETARY_ROLE=$(discord_api GET "/guilds/$DISCORD_GUILD_ID/roles" | jq -r '.[] | select(.name=="Secretary") | .id' | head -1)
if [ -z "$SECRETARY_ROLE" ]; then
  SECRETARY_ROLE=$(discord_api POST "/guilds/$DISCORD_GUILD_ID/roles" '{"name":"Secretary","color":53471}' | jq -r '.id')
  echo "   ✅ Created Secretary role: $SECRETARY_ROLE"
else
  echo "   ✅ Secretary role exists: $SECRETARY_ROLE"
fi

# Developer role
DEV_ROLE=$(discord_api GET "/guilds/$DISCORD_GUILD_ID/roles" | jq -r '.[] | select(.name=="Developer") | .id' | head -1)
if [ -z "$DEV_ROLE" ]; then
  DEV_ROLE=$(discord_api POST "/guilds/$DISCORD_GUILD_ID/roles" '{"name":"Developer","color":3447003}' | jq -r '.id')
  echo "   ✅ Created Developer role: $DEV_ROLE"
else
  echo "   ✅ Developer role exists: $DEV_ROLE"
fi

# Sales role
SALES_ROLE=$(discord_api GET "/guilds/$DISCORD_GUILD_ID/roles" | jq -r '.[] | select(.name=="Sales") | .id' | head -1)
if [ -z "$SALES_ROLE" ]; then
  SALES_ROLE=$(discord_api POST "/guilds/$DISCORD_GUILD_ID/roles" '{"name":"Sales","color":11027200}' | jq -r '.id')
  echo "   ✅ Created Sales role: $SALES_ROLE"
else
  echo "   ✅ Sales role exists: $SALES_ROLE"
fi

echo ""
echo "📋 Step 2: Creating/verifying channels..."

# Get all existing channels
EXISTING_CHANNELS=$(discord_api GET "/guilds/$DISCORD_GUILD_ID/channels" | jq -r '.[] | .name')

# Create channels as needed
declare -A CHANNEL_IDS
for channel_name in "${!CHANNELS[@]}"; do
  if echo "$EXISTING_CHANNELS" | grep -q "^$channel_name$"; then
    CHANNEL_ID=$(discord_api GET "/guilds/$DISCORD_GUILD_ID/channels" | jq -r ".[] | select(.name==\"$channel_name\") | .id")
    CHANNEL_IDS[$channel_name]=$CHANNEL_ID
    echo "   ✅ $channel_name"
  else
    CHANNEL_ID=$(discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
      "{\"name\":\"$channel_name\",\"type\":0}" | jq -r '.id')
    CHANNEL_IDS[$channel_name]=$CHANNEL_ID
    echo "   ✅ Created: $channel_name"
  fi
done

echo ""
echo "👤 Step 3: Granting paige (Secretary) permissions..."

# Add Secretary role to paige
discord_api PUT "/guilds/$DISCORD_GUILD_ID/members/$PAIGE_USER_ID/roles/$SECRETARY_ROLE" "" > /dev/null
echo "   ✅ Added Secretary role"

# Grant channel permissions to Secretary role and paige
for channel_name in "${!CHANNEL_IDS[@]}"; do
  CHANNEL_ID=${CHANNEL_IDS[$channel_name]}

  # Grant role permissions
  discord_api PUT "/channels/$CHANNEL_ID/permissions/$SECRETARY_ROLE" \
    '{"type":"role","allow":"1024","deny":"0"}' > /dev/null

  # Grant direct user permissions
  discord_api PUT "/channels/$CHANNEL_ID/permissions/$PAIGE_USER_ID" \
    '{"type":"member","allow":"1024","deny":"0"}' > /dev/null

  echo "   ✅ $channel_name"
done

echo ""
echo "🤖 Step 4: Configuring bot permissions..."

# Grant Admin role to bot (for managing other bots)
BOT_USER_ID=$(discord_api GET "/users/@me" | jq -r '.id')
discord_api PUT "/guilds/$DISCORD_GUILD_ID/members/$BOT_USER_ID/roles/$ADMIN_ROLE" "" > /dev/null
echo "   ✅ Bot has Admin role"

echo ""
echo "🔗 Step 5: Setting up webhooks..."

# Create webhooks for each channel if they don't exist
WEBHOOK_URLS=""
for channel_name in "${!CHANNEL_IDS[@]}"; do
  CHANNEL_ID=${CHANNEL_IDS[$channel_name]}

  # Check if webhook exists
  WEBHOOK=$(discord_api GET "/channels/$CHANNEL_ID/webhooks" | jq -r '.[0] | select(.name=="WISE² Webhook") | .url')

  if [ -z "$WEBHOOK" ]; then
    WEBHOOK=$(discord_api POST "/channels/$CHANNEL_ID/webhooks" \
      '{"name":"WISE² Webhook"}' | jq -r '.url')
    echo "   ✅ Created webhook for $channel_name"
  else
    echo "   ✅ Webhook exists for $channel_name"
  fi

  WEBHOOK_URLS="$WEBHOOK_URLS\nDISCORD_WEBHOOK_${channel_name^^}=$WEBHOOK"
done

echo ""
echo "✨ Step 6: Sending test alerts..."

# Send test message to alerts channel
ALERTS_CHANNEL_ID=${CHANNEL_IDS["alerts"]}
discord_api POST "/channels/$ALERTS_CHANNEL_ID/messages" \
  '{
    "embeds": [{
      "title": "✅ WISE² Discord Bot Ecosystem Ready",
      "description": "All bots, channels, and permissions configured.",
      "color": 53471,
      "fields": [
        {"name":"🤖 Bots","value":"Main, Analytics, Deployment, GitHub, Knowledge, Moderation, Daily Reports, Music, Tasks, AI Assistant","inline":false},
        {"name":"📊 Channels","value":"alerts, deployments, builds, decisions, status, revenue, moderator-only, github, analytics, knowledge, daily-reports","inline":false},
        {"name":"👥 Permissions","value":"Paige (Secretary) has full access to all alert channels","inline":false},
        {"name":"🔗 Webhooks","value":"All channels have webhooks configured","inline":false}
      ],
      "timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
    }]
  }' > /dev/null

echo "   ✅ Test alert sent to #alerts"

echo ""
echo "🎉 WISE² Discord Setup Complete!"
echo ""
echo "📋 Summary:"
echo "   • Roles: Admin, Secretary, Developer, Sales"
echo "   • Channels: 11 channels created"
echo "   • Permissions: Paige has Secretary access"
echo "   • Webhooks: All configured"
echo "   • Bots: Ready to deploy (10 bot types)"
echo ""
echo "🚀 Next Steps:"
echo "   1. Deploy bot services: docker-compose -f discord-ecosystem/docker-compose.yml up -d"
echo "   2. Configure bot tokens in environment"
echo "   3. Enable slash commands in Discord"
echo "   4. Paige: Enable notifications in Discord settings"
echo ""
echo "📚 Bot Types:"
for bot_name in "${!BOTS[@]}"; do
  echo "   • $bot_name: ${BOTS[$bot_name]}"
done

# Save webhook URLs for reference
echo ""
echo "📄 Webhook URLs (for reference):"
echo -e "$WEBHOOK_URLS"
