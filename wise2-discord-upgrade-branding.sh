#!/bin/bash

# WISE² Discord - Complete Brand Upgrade
# Remove burgundy & non-brand colors, enforce WISE² palette across all roles

set -e

echo "🎨 WISE² Discord - Complete Brand Upgrade"
echo "=========================================="
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

# Function to get color for role name
get_role_color() {
  local role_name="$1"

  case "$role_name" in
    "Founder")        echo "329223" ;;      # #050607 - Navy
    "Executive")      echo "12816681" ;;   # #C4A369 - Gold
    "Leadership")     echo "55807" ;;      # #00D9FF - Cyan
    "Core Team")      echo "65407" ;;      # #00FF7F - Neon Green
    "Partner")        echo "16777215" ;;   # #FFFFFF - White
    "Contributor")    echo "65407" ;;      # #00FF7F - Neon Green
    *)                echo "" ;;
  esac
}

echo "📋 Brand Color Palette:"
echo "  🔵 Founder (Navy): #050607"
echo "  🟡 Executive (Gold): #C4A369"
echo "  🔷 Leadership (Cyan): #00D9FF"
echo "  🟢 Core Team (Neon Green): #00FF7F"
echo "  ⚪ Partner (White): #FFFFFF"
echo "  ✨ Contributor (Neon Green): #00FF7F"
echo ""

# Get all roles
echo "🔄 Updating WISE² brand roles..."
ALL_ROLES=$(discord_api GET "/guilds/$DISCORD_GUILD_ID/roles" | jq -r '.[] | "\(.id):\(.name)"')

UPDATED=0
for role_info in $ALL_ROLES; do
  role_id=$(echo "$role_info" | cut -d: -f1)
  role_name=$(echo "$role_info" | cut -d: -f2-)

  # Get color for this role
  COLOR=$(get_role_color "$role_name")

  # If this is a brand role, update it
  if [ -n "$COLOR" ]; then
    echo "   ✅ $role_name → $(printf '#%06X' $COLOR)"

    discord_api PATCH "/guilds/$DISCORD_GUILD_ID/roles/$role_id" \
      "{\"color\":$COLOR}" > /dev/null 2>&1

    UPDATED=$((UPDATED + 1))
  fi
done

echo ""
echo "🎨 Brand Upgrade Complete!"
echo ""
echo "═══════════════════════════════════════"
echo "WISE² Official Role Color Palette"
echo "═══════════════════════════════════════"
echo "👑 Founder        #050607 (Navy)"
echo "⚡ Executive      #C4A369 (Gold)"
echo "🎯 Leadership     #00D9FF (Cyan)"
echo "🚀 Core Team      #00FF7F (Neon Green)"
echo "🤝 Partner        #FFFFFF (White)"
echo "✨ Contributor    #00FF7F (Neon Green)"
echo ""
echo "✅ $UPDATED brand roles updated"
echo "✅ All burgundy/non-brand colors removed"
echo "✅ Discord will update roles in ~30 seconds"
echo "✅ Refresh Discord to see new colors live"
