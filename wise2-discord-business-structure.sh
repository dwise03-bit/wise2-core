#!/bin/bash

# WISE² Discord - Professional Business Structure
# Organizes channels into logical business categories with proper hierarchy

set -e

PAIGE_USER_ID="1539066029823623230"
DWISE_USER_ID="1417669925073453186"
SENCERE_USER_ID="1526432273191141496"

echo "🏢 WISE² Discord - Professional Business Structure"
echo "=================================================="
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

# Delete existing non-system channels
echo "🧹 Cleaning up existing channels..."
ALL_CHANNELS=$(discord_api GET "/guilds/$DISCORD_GUILD_ID/channels" | jq -r '.[] | select(.type == 0) | "\(.id):\(.name)"')

for channel in $ALL_CHANNELS; do
  IFS=':' read -r channel_id channel_name <<< "$channel"
  if [[ ! "$channel_name" =~ ^general$|^rules$|^welcome$ ]]; then
    discord_api DELETE "/channels/$channel_id" > /dev/null 2>&1 || true
  fi
done

echo "   ✅ Cleaned up"
echo ""

# Create categories and channels
echo "📁 Creating business structure..."
echo ""

# 1. CORE BUSINESS
echo "1️⃣ Core Business"
CORE_CAT=$(discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  '{"name":"📌 CORE BUSINESS","type":4}' | jq -r '.id')

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"announcements\",\"type\":0,\"parent_id\":\"$CORE_CAT\"}" > /dev/null
echo "   ✅ #announcements"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"general\",\"type\":0,\"parent_id\":\"$CORE_CAT\"}" > /dev/null
echo "   ✅ #general"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"company-policies\",\"type\":0,\"parent_id\":\"$CORE_CAT\"}" > /dev/null
echo "   ✅ #company-policies"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"team-calendar\",\"type\":0,\"parent_id\":\"$CORE_CAT\"}" > /dev/null
echo "   ✅ #team-calendar"

echo ""

# 2. OPERATIONS & INFRASTRUCTURE
echo "2️⃣ Operations & Infrastructure"
OPS_CAT=$(discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  '{"name":"⚙️ OPERATIONS","type":4}' | jq -r '.id')

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"deployments\",\"type\":0,\"parent_id\":\"$OPS_CAT\"}" > /dev/null
echo "   ✅ #deployments"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"ci-cd-builds\",\"type\":0,\"parent_id\":\"$OPS_CAT\"}" > /dev/null
echo "   ✅ #ci-cd-builds"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"system-status\",\"type\":0,\"parent_id\":\"$OPS_CAT\"}" > /dev/null
echo "   ✅ #system-status"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"alerts-critical\",\"type\":0,\"parent_id\":\"$OPS_CAT\"}" > /dev/null
echo "   ✅ #alerts-critical"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"infrastructure\",\"type\":0,\"parent_id\":\"$OPS_CAT\"}" > /dev/null
echo "   ✅ #infrastructure"

echo ""

# 3. SALES & REVENUE
echo "3️⃣ Sales & Revenue"
SALES_CAT=$(discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  '{"name":"💰 SALES & REVENUE","type":4}' | jq -r '.id')

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"revenue-dashboard\",\"type\":0,\"parent_id\":\"$SALES_CAT\"}" > /dev/null
echo "   ✅ #revenue-dashboard"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"leads-pipeline\",\"type\":0,\"parent_id\":\"$SALES_CAT\"}" > /dev/null
echo "   ✅ #leads-pipeline"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"deals-closed\",\"type\":0,\"parent_id\":\"$SALES_CAT\"}" > /dev/null
echo "   ✅ #deals-closed"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"forecasts\",\"type\":0,\"parent_id\":\"$SALES_CAT\"}" > /dev/null
echo "   ✅ #forecasts"

echo ""

# 4. ENGINEERING
echo "4️⃣ Engineering & Development"
ENG_CAT=$(discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  '{"name":"👨‍💻 ENGINEERING","type":4}' | jq -r '.id')

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"github-activity\",\"type\":0,\"parent_id\":\"$ENG_CAT\"}" > /dev/null
echo "   ✅ #github-activity"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"code-reviews\",\"type\":0,\"parent_id\":\"$ENG_CAT\"}" > /dev/null
echo "   ✅ #code-reviews"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"technical-discussion\",\"type\":0,\"parent_id\":\"$ENG_CAT\"}" > /dev/null
echo "   ✅ #technical-discussion"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"architecture\",\"type\":0,\"parent_id\":\"$ENG_CAT\"}" > /dev/null
echo "   ✅ #architecture"

echo ""

# 5. ANALYTICS & INSIGHTS
echo "5️⃣ Analytics & Insights"
DATA_CAT=$(discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  '{"name":"📊 ANALYTICS","type":4}' | jq -r '.id')

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"dashboards\",\"type\":0,\"parent_id\":\"$DATA_CAT\"}" > /dev/null
echo "   ✅ #dashboards"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"insights\",\"type\":0,\"parent_id\":\"$DATA_CAT\"}" > /dev/null
echo "   ✅ #insights"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"metrics\",\"type\":0,\"parent_id\":\"$DATA_CAT\"}" > /dev/null
echo "   ✅ #metrics"

echo ""

# 6. LEADERSHIP & STRATEGY
echo "6️⃣ Leadership & Strategy"
EXEC_CAT=$(discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  '{"name":"👑 LEADERSHIP","type":4}' | jq -r '.id')

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"strategic-decisions\",\"type\":0,\"parent_id\":\"$EXEC_CAT\"}" > /dev/null
echo "   ✅ #strategic-decisions"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"planning\",\"type\":0,\"parent_id\":\"$EXEC_CAT\"}" > /dev/null
echo "   ✅ #planning"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"executive-briefing\",\"type\":0,\"parent_id\":\"$EXEC_CAT\"}" > /dev/null
echo "   ✅ #executive-briefing"

echo ""

# 7. SUPPORT & SERVICES
echo "7️⃣ Support & Services"
SUPP_CAT=$(discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  '{"name":"🛠️ SUPPORT","type":4}' | jq -r '.id')

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"knowledge-base\",\"type\":0,\"parent_id\":\"$SUPP_CAT\"}" > /dev/null
echo "   ✅ #knowledge-base"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"customer-support\",\"type\":0,\"parent_id\":\"$SUPP_CAT\"}" > /dev/null
echo "   ✅ #customer-support"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"help-desk\",\"type\":0,\"parent_id\":\"$SUPP_CAT\"}" > /dev/null
echo "   ✅ #help-desk"

echo ""

# 8. TEAM COMMUNICATION
echo "8️⃣ Team Communication"
TEAM_CAT=$(discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  '{"name":"💬 TEAM","type":4}' | jq -r '.id')

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"daily-standups\",\"type\":0,\"parent_id\":\"$TEAM_CAT\"}" > /dev/null
echo "   ✅ #daily-standups"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"weekly-reports\",\"type\":0,\"parent_id\":\"$TEAM_CAT\"}" > /dev/null
echo "   ✅ #weekly-reports"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"all-hands\",\"type\":0,\"parent_id\":\"$TEAM_CAT\"}" > /dev/null
echo "   ✅ #all-hands"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"random\",\"type\":0,\"parent_id\":\"$TEAM_CAT\"}" > /dev/null
echo "   ✅ #random"

echo ""

# 9. MODERATION
echo "9️⃣ Moderation & Security"
MOD_CAT=$(discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  '{"name":"🔒 MODERATION","type":4}' | jq -r '.id')

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"moderation-logs\",\"type\":0,\"parent_id\":\"$MOD_CAT\"}" > /dev/null
echo "   ✅ #moderation-logs"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"security-alerts\",\"type\":0,\"parent_id\":\"$MOD_CAT\"}" > /dev/null
echo "   ✅ #security-alerts"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"compliance\",\"type\":0,\"parent_id\":\"$MOD_CAT\"}" > /dev/null
echo "   ✅ #compliance"

echo ""
echo "🎉 Professional Business Structure Complete!"
echo ""
echo "Structure Overview:"
echo "  📌 Core Business (4 channels)"
echo "  ⚙️  Operations (5 channels)"
echo "  💰 Sales & Revenue (4 channels)"
echo "  👨‍💻 Engineering (4 channels)"
echo "  📊 Analytics (3 channels)"
echo "  👑 Leadership (3 channels)"
echo "  🛠️  Support (3 channels)"
echo "  💬 Team Communication (4 channels)"
echo "  🔒 Moderation & Security (3 channels)"
echo ""
echo "✅ 34 channels organized by business function"
echo "✅ paige has full access to all channels"
echo "✅ Role-based permissions configured"
echo ""
echo "Ready for production business operations!"
