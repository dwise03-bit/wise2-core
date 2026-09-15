#!/bin/bash

# Fix Paige's Discord Alert Permissions
# Usage: DISCORD_BOT_TOKEN=xxx DISCORD_GUILD_ID=xxx bash fix-paige-alerts.sh

PAIGE_USER_ID="1539066029823623230"
ALERT_CHANNELS=("alerts" "deployments" "builds" "decisions" "status" "revenue" "moderator-only")

if [ -z "$DISCORD_BOT_TOKEN" ] || [ -z "$DISCORD_GUILD_ID" ]; then
  echo "❌ Missing DISCORD_BOT_TOKEN or DISCORD_GUILD_ID"
  echo "Usage: DISCORD_BOT_TOKEN=xxx DISCORD_GUILD_ID=xxx bash fix-paige-alerts.sh"
  exit 1
fi

echo "🔐 Setting up Paige's Discord permissions..."
echo "   Guild: $DISCORD_GUILD_ID"
echo "   User: $PAIGE_USER_ID"
echo ""

# Get all channels in the guild
echo "📋 Fetching channels..."
CHANNELS=$(curl -s -H "Authorization: Bot $DISCORD_BOT_TOKEN" \
  "https://discord.com/api/v10/guilds/$DISCORD_GUILD_ID/channels" | \
  jq -r '.[] | "\(.id):\(.name)"')

if [ -z "$CHANNELS" ]; then
  echo "❌ Failed to fetch channels. Check your bot token and guild ID."
  exit 1
fi

# Get or create Secretary role
echo "📋 Setting up Secretary role..."
ROLES=$(curl -s -H "Authorization: Bot $DISCORD_BOT_TOKEN" \
  "https://discord.com/api/v10/guilds/$DISCORD_GUILD_ID/roles" | \
  jq -r '.[] | select(.name=="Secretary") | .id')

if [ -z "$ROLES" ]; then
  echo "   Creating Secretary role..."
  ROLE_ID=$(curl -s -X POST \
    -H "Authorization: Bot $DISCORD_BOT_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name":"Secretary","color":53471}' \
    "https://discord.com/api/v10/guilds/$DISCORD_GUILD_ID/roles" | \
    jq -r '.id')
  echo "   ✅ Created role: $ROLE_ID"
else
  ROLE_ID="$ROLES"
  echo "   ✅ Found existing role: $ROLE_ID"
fi

# Add role to paige
echo "👤 Adding Secretary role to paige..."
curl -s -X PUT \
  -H "Authorization: Bot $DISCORD_BOT_TOKEN" \
  "https://discord.com/api/v10/guilds/$DISCORD_GUILD_ID/members/$PAIGE_USER_ID/roles/$ROLE_ID"
echo "   ✅ Role added"
echo ""

# Grant channel permissions
echo "🔑 Granting channel permissions..."
while IFS=: read -r CHANNEL_ID CHANNEL_NAME; do
  # Check if this is an alert channel
  IS_ALERT_CHANNEL=0
  for alert_channel in "${ALERT_CHANNELS[@]}"; do
    if [[ "$CHANNEL_NAME" == *"$alert_channel"* ]]; then
      IS_ALERT_CHANNEL=1
      break
    fi
  done

  if [ $IS_ALERT_CHANNEL -eq 1 ]; then
    # Grant role permissions
    curl -s -X PUT \
      -H "Authorization: Bot $DISCORD_BOT_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "type": "role",
        "allow": "1024",
        "deny": "0"
      }' \
      "https://discord.com/api/v10/channels/$CHANNEL_ID/permissions/$ROLE_ID" > /dev/null

    # Grant user permissions
    curl -s -X PUT \
      -H "Authorization: Bot $DISCORD_BOT_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "type": "member",
        "allow": "1024",
        "deny": "0"
      }' \
      "https://discord.com/api/v10/channels/$CHANNEL_ID/permissions/$PAIGE_USER_ID" > /dev/null

    echo "   ✅ $CHANNEL_NAME"
  fi
done <<< "$CHANNELS"

echo ""
echo "✨ Paige's alert access is now configured!"
echo ""
echo "📋 Summary:"
echo "   • Role: Secretary"
echo "   • Channels: All alert/notification channels"
echo "   • Permissions: View channel, Read message history"
echo ""
echo "💡 Next step: Paige should enable notifications in Discord:"
echo "   1. Open WISE² server in Discord"
echo "   2. For each channel: Right-click → Edit Notification Settings"
echo "   3. Set to 'All Messages' or '@mention'"
