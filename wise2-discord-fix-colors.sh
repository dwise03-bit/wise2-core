#!/bin/bash

# WISE² Discord - Fix Role Colors to Brand Palette
# Navy #050607, Cyan #00D9FF, Neon Green #00FF7F, Gold #C4A369

set -e

echo "🎨 WISE² Discord - Fixing Role Colors"
echo "======================================"
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

# WISE² Brand Colors (hex → decimal)
NAVY=329223           # #050607
CYAN=55807            # #00D9FF
NEON_GREEN=65407      # #00FF7F
GOLD=12816681         # #C4A369
WHITE=16777215        # #FFFFFF

echo "Color Palette:"
echo "  🔵 Navy (Founder): #050607"
echo "  🔷 Cyan (Leadership): #00D9FF"
echo "  🟢 Neon Green (Core Team): #00FF7F"
echo "  🟡 Gold (Executive): #C4A369"
echo "  ⚪ White (Partner): #FFFFFF"
echo ""

# Get all roles
echo "📋 Updating roles with brand colors..."
ROLES=$(discord_api GET "/guilds/$DISCORD_GUILD_ID/roles" | jq -r '.[] | "\(.id):\(.name)"')

for role_info in $ROLES; do
  IFS=':' read -r role_id role_name <<< "$role_info"

  case "$role_name" in
    "Founder")
      COLOR=$NAVY
      EMOJI="👑"
      ;;
    "Executive")
      COLOR=$GOLD
      EMOJI="⚡"
      ;;
    "Leadership")
      COLOR=$CYAN
      EMOJI="🎯"
      ;;
    "Core Team")
      COLOR=$NEON_GREEN
      EMOJI="🚀"
      ;;
    "Partner")
      COLOR=$WHITE
      EMOJI="🤝"
      ;;
    "Contributor")
      COLOR=$NEON_GREEN
      EMOJI="✨"
      ;;
    *)
      continue
      ;;
  esac

  # Update role with brand color
  discord_api PATCH "/guilds/$DISCORD_GUILD_ID/roles/$role_id" \
    "{\"color\":$COLOR}" > /dev/null 2>&1

  echo "   ✅ $EMOJI $role_name → $(printf '%06x' $COLOR)"
done

echo ""
echo "🎨 Brand colors applied!"
echo ""
echo "WISE² Role Palette:"
echo "  👑 Founder (Navy #050607)"
echo "  ⚡ Executive (Gold #C4A369)"
echo "  🎯 Leadership (Cyan #00D9FF)"
echo "  🚀 Core Team (Neon Green #00FF7F)"
echo "  🤝 Partner (White #FFFFFF)"
echo "  ✨ Contributor (Neon Green #00FF7F)"
echo ""
echo "✅ Complete! Refresh Discord to see updated colors."
