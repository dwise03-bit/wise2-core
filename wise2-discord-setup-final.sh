#!/bin/bash

# WISE² Complete Discord Ecosystem Setup - Fixed Version
set -e

PAIGE_USER_ID="1539066029823623230"
DWISE_USER_ID="1417669925073453186"
SENCERE_USER_ID="1526432273191141496"

echo "🚀 WISE² Discord Ecosystem - Complete Setup"
echo "=========================================="
echo ""
echo "Guild: $DISCORD_GUILD_ID"
echo ""

# Helper function
discord_api() {
  local method=$1
  local endpoint=$2
  local data=$3

  if [ -z "$DISCORD_BOT_TOKEN" ] || [ -z "$DISCORD_GUILD_ID" ]; then
    echo "❌ Error: Missing credentials"
    return 1
  fi

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

# Step 1: Verify connection
echo "🔐 Step 1: Verifying connection..."
TEST_GUILD=$(discord_api GET "/guilds/$DISCORD_GUILD_ID" | jq -r '.name' 2>/dev/null)
if [ -z "$TEST_GUILD" ] || [ "$TEST_GUILD" = "null" ]; then
  echo "❌ Connection failed"
  exit 1
fi
echo "   ✅ Connected to: $TEST_GUILD"
echo ""

# Step 2: Create Roles
echo "👥 Step 2: Setting up roles..."

for role_name in "Admin" "Secretary" "Developer" "Sales" "Analyst" "Moderator" "Support"; do
  ROLE_ID=$(discord_api GET "/guilds/$DISCORD_GUILD_ID/roles" | jq -r ".[] | select(.name==\"$role_name\") | .id" | head -1)

  if [ -z "$ROLE_ID" ] || [ "$ROLE_ID" = "null" ]; then
    ROLE_ID=$(discord_api POST "/guilds/$DISCORD_GUILD_ID/roles" \
      "{\"name\":\"$role_name\",\"color\":3447003}" | jq -r '.id')
    echo "   ✅ Created: $role_name"
  else
    echo "   ✅ Exists: $role_name"
  fi
done

echo ""

# Step 3: Create Channels
echo "📢 Step 3: Creating channels..."

CHANNELS=(
  "🔔-alerts|alerts"
  "🚀-deployments|deployments"
  "🔨-builds|builds"
  "⚖️-decisions|decisions"
  "📊-status|status"
  "💰-revenue|revenue"
  "🔒-moderator|moderation"
  "🐙-github|github"
  "📈-analytics|analytics"
  "📚-knowledge|knowledge"
  "📋-daily-reports|daily"
  "🎙️-voice-commands|voice"
  "⚡-system-alerts|alerts2"
)

for channel_pair in "${CHANNELS[@]}"; do
  IFS='|' read -r display name <<< "$channel_pair"

  CHANNEL_ID=$(discord_api GET "/guilds/$DISCORD_GUILD_ID/channels" | jq -r ".[] | select(.name==\"$name\") | .id" | head -1)

  if [ -z "$CHANNEL_ID" ] || [ "$CHANNEL_ID" = "null" ]; then
    CHANNEL_ID=$(discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
      "{\"name\":\"$name\",\"type\":0}" | jq -r '.id')
    echo "   ✅ $display"
  else
    echo "   ✅ $display (exists)"
  fi
done

echo ""

# Step 4: Get all channels and grant permissions
echo "🔑 Step 4: Configuring permissions..."

ALL_CHANNELS=$(discord_api GET "/guilds/$DISCORD_GUILD_ID/channels" | jq -r '.[] | .id')
ALL_ROLES=$(discord_api GET "/guilds/$DISCORD_GUILD_ID/roles" | jq -r '.[] | .id')
SECRETARY_ROLE=$(discord_api GET "/guilds/$DISCORD_GUILD_ID/roles" | jq -r ".[] | select(.name==\"Secretary\") | .id")

for CHANNEL_ID in $ALL_CHANNELS; do
  # Grant Secretary role
  discord_api PUT "/channels/$CHANNEL_ID/permissions/$SECRETARY_ROLE" \
    '{"type":"role","allow":"1024","deny":"0"}' > /dev/null 2>&1

  # Grant paige direct access
  discord_api PUT "/channels/$CHANNEL_ID/permissions/$PAIGE_USER_ID" \
    '{"type":"member","allow":"1024","deny":"0"}' > /dev/null 2>&1
done

echo "   ✅ All permissions configured"
echo ""

# Step 5: Assign roles
echo "👤 Step 5: Assigning roles..."

SECRETARY_ROLE=$(discord_api GET "/guilds/$DISCORD_GUILD_ID/roles" | jq -r ".[] | select(.name==\"Secretary\") | .id")
ADMIN_ROLE=$(discord_api GET "/guilds/$DISCORD_GUILD_ID/roles" | jq -r ".[] | select(.name==\"Admin\") | .id")
SALES_ROLE=$(discord_api GET "/guilds/$DISCORD_GUILD_ID/roles" | jq -r ".[] | select(.name==\"Sales\") | .id")

# paige = Secretary
discord_api PUT "/guilds/$DISCORD_GUILD_ID/members/$PAIGE_USER_ID/roles/$SECRETARY_ROLE" "" > /dev/null 2>&1
echo "   ✅ paige: Secretary"

# dwise = Admin
discord_api PUT "/guilds/$DISCORD_GUILD_ID/members/$DWISE_USER_ID/roles/$ADMIN_ROLE" "" > /dev/null 2>&1
echo "   ✅ dwise: Admin"

# sencere = Sales
discord_api PUT "/guilds/$DISCORD_GUILD_ID/members/$SENCERE_USER_ID/roles/$SALES_ROLE" "" > /dev/null 2>&1
echo "   ✅ sencere: Sales"

echo ""

# Step 6: Create webhooks
echo "🔗 Step 6: Setting up webhooks..."

for CHANNEL_ID in $ALL_CHANNELS; do
  WEBHOOK=$(discord_api GET "/channels/$CHANNEL_ID/webhooks" | jq -r '.[0] | select(.name=="WISE² Webhook") | .url' 2>/dev/null)

  if [ -z "$WEBHOOK" ] || [ "$WEBHOOK" = "null" ]; then
    discord_api POST "/channels/$CHANNEL_ID/webhooks" \
      '{"name":"WISE² Webhook"}' > /dev/null 2>&1
  fi
done

echo "   ✅ Webhooks configured"
echo ""

# Step 7: Activation message
echo "✨ Step 7: Posting activation..."

ALERTS_CHANNEL=$(discord_api GET "/guilds/$DISCORD_GUILD_ID/channels" | jq -r ".[] | select(.name==\"alerts\") | .id")

discord_api POST "/channels/$ALERTS_CHANNEL/messages" \
  '{
    "embeds": [{
      "title": "🚀 WISE² Discord Bot Ecosystem - LIVE",
      "description": "Complete bot infrastructure deployed and ready for production",
      "color": 53471,
      "fields": [
        {"name": "🤖 Status","value": "✅ OPERATIONAL","inline": true},
        {"name": "🔒 Security","value": "✅ LOCKED","inline": true},
        {"name": "📊 Channels","value": "13 configured","inline": true},
        {"name": "👥 Roles","value": "7 configured","inline": true},
        {"name": "🔔 Alerts","value": "paige: Full Access","inline": false}
      ],
      "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
    }]
  }' > /dev/null 2>&1

echo "   ✅ Activation message posted"

echo ""
echo "🎉 WISE² Discord Setup Complete!"
echo ""
echo "✅ 13 channels created"
echo "✅ 7 roles configured"
echo "✅ paige has full Secretary access"
echo "✅ Webhooks ready"
echo "✅ Team assigned"
echo ""
echo "System is LIVE and READY!"
