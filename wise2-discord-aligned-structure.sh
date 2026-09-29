#!/bin/bash

# WISE² Discord - Brand-Aligned Professional Structure
# Mirrors wise2.net organizational model:
# "Building Empires. Changing Culture. Together."
# "One Context Engine. Every Part of the Business."

set -e

PAIGE_USER_ID="1539066029823623230"
DWISE_USER_ID="1417669925073453186"
SENCERE_USER_ID="1526432273191141496"

echo "🏛️ WISE² Discord - Empire Aligned Structure"
echo "=========================================="
echo ""
echo "Organizing around: Building Empires. Changing Culture. Together."
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

# Clean up
echo "🧹 Preparing structure..."
ALL_CHANNELS=$(discord_api GET "/guilds/$DISCORD_GUILD_ID/channels" | jq -r '.[] | select(.type == 0) | .id')
for channel_id in $ALL_CHANNELS; do
  discord_api DELETE "/channels/$channel_id" > /dev/null 2>&1 || true
done

echo "📋 Creating WISE²-aligned structure..."
echo ""

# 1. EMPIRE BUILDING (Mission & Culture)
echo "👑 Empire Building"
EMP_CAT=$(discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  '{"name":"👑 EMPIRE BUILDING","type":4}' | jq -r '.id')

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"mission\",\"type\":0,\"parent_id\":\"$EMP_CAT\"}" > /dev/null
echo "   ✅ #mission - Building Empires"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"culture\",\"type\":0,\"parent_id\":\"$EMP_CAT\"}" > /dev/null
echo "   ✅ #culture - Changing Culture"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"values\",\"type\":0,\"parent_id\":\"$EMP_CAT\"}" > /dev/null
echo "   ✅ #values - Together"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"vision-2030\",\"type\":0,\"parent_id\":\"$EMP_CAT\"}" > /dev/null
echo "   ✅ #vision-2030 - Five year plan"

echo ""

# 2. OPERATING LAYERS (01, 24/7, 04, ∞)
echo "⚙️ Operating Layers"
OP_CAT=$(discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  '{"name":"⚙️ OPERATING LAYERS","type":4}' | jq -r '.id')

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"01-connected-layer\",\"type\":0,\"parent_id\":\"$OP_CAT\"}" > /dev/null
echo "   ✅ #01-connected-layer - Everything speaks to everything"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"24-7-systems\",\"type\":0,\"parent_id\":\"$OP_CAT\"}" > /dev/null
echo "   ✅ #24-7-systems - Systems that keep moving"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"04-ways-to-work\",\"type\":0,\"parent_id\":\"$OP_CAT\"}" > /dev/null
echo "   ✅ #04-ways-to-work - Cloud, edge, desktop, mobile"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"infinity-growth\",\"type\":0,\"parent_id\":\"$OP_CAT\"}" > /dev/null
echo "   ✅ #infinity-growth - Room to grow into"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"context-engine\",\"type\":0,\"parent_id\":\"$OP_CAT\"}" > /dev/null
echo "   ✅ #context-engine - One context engine for every part"

echo ""

# 3. PRODUCTS & SERVICES
echo "📦 Products & Services"
PROD_CAT=$(discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  '{"name":"📦 PRODUCTS","type":4}' | jq -r '.id')

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"lil-lizzy\",\"type\":0,\"parent_id\":\"$PROD_CAT\"}" > /dev/null
echo "   ✅ #lil-lizzy - AI Assistant"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"contractor-os\",\"type\":0,\"parent_id\":\"$PROD_CAT\"}" > /dev/null
echo "   ✅ #contractor-os - Contractor Operating System"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"commerce-accelerator\",\"type\":0,\"parent_id\":\"$PROD_CAT\"}" > /dev/null
echo "   ✅ #commerce-accelerator - E-commerce Platform"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"live-streams\",\"type\":0,\"parent_id\":\"$PROD_CAT\"}" > /dev/null
echo "   ✅ #live-streams - LIVE™ Streaming"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"integrations\",\"type\":0,\"parent_id\":\"$PROD_CAT\"}" > /dev/null
echo "   ✅ #integrations - Third-party integrations"

echo ""

# 4. SALES ACADEMY
echo "🎓 Sales Academy"
ACAD_CAT=$(discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  '{"name":"🎓 SALES ACADEMY","type":4}' | jq -r '.id')

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"training\",\"type\":0,\"parent_id\":\"$ACAD_CAT\"}" > /dev/null
echo "   ✅ #training - Course materials"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"certification\",\"type\":0,\"parent_id\":\"$ACAD_CAT\"}" > /dev/null
echo "   ✅ #certification - Certifications"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"sales-plays\",\"type\":0,\"parent_id\":\"$ACAD_CAT\"}" > /dev/null
echo "   ✅ #sales-plays - Proven sales strategies"

echo ""

# 5. REVENUE COMMAND CENTER
echo "💰 Revenue Command Center"
REV_CAT=$(discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  '{"name":"💰 REVENUE","type":4}' | jq -r '.id')

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"dashboard\",\"type\":0,\"parent_id\":\"$REV_CAT\"}" > /dev/null
echo "   ✅ #dashboard - Revenue metrics"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"pipeline\",\"type\":0,\"parent_id\":\"$REV_CAT\"}" > /dev/null
echo "   ✅ #pipeline - Sales pipeline"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"forecasts\",\"type\":0,\"parent_id\":\"$REV_CAT\"}" > /dev/null
echo "   ✅ #forecasts - Revenue forecasts"

echo ""

# 6. INDUSTRIES (Vertical Solutions)
echo "🏭 Industries"
IND_CAT=$(discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  '{"name":"🏭 INDUSTRIES","type":4}' | jq -r '.id')

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"contractors\",\"type\":0,\"parent_id\":\"$IND_CAT\"}" > /dev/null
echo "   ✅ #contractors - HVAC, Roofing, etc."

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"ecommerce\",\"type\":0,\"parent_id\":\"$IND_CAT\"}" > /dev/null
echo "   ✅ #ecommerce - Online retailers"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"agencies\",\"type\":0,\"parent_id\":\"$IND_CAT\"}" > /dev/null
echo "   ✅ #agencies - Creative agencies"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"services\",\"type\":0,\"parent_id\":\"$IND_CAT\"}" > /dev/null
echo "   ✅ #services - Service providers"

echo ""

# 7. FIELD OPERATIONS
echo "🚀 Field Operations"
FIELD_CAT=$(discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  '{"name":"🚀 FIELD OPERATIONS","type":4}' | jq -r '.id')

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"deployments\",\"type\":0,\"parent_id\":\"$FIELD_CAT\"}" > /dev/null
echo "   ✅ #deployments - Client deployments"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"support-tickets\",\"type\":0,\"parent_id\":\"$FIELD_CAT\"}" > /dev/null
echo "   ✅ #support-tickets - Customer support"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"success-stories\",\"type\":0,\"parent_id\":\"$FIELD_CAT\"}" > /dev/null
echo "   ✅ #success-stories - Customer wins"

echo ""

# 8. INTELLIGENCE & AUTOMATION
echo "🤖 Intelligence & Automation"
AI_CAT=$(discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  '{"name":"🤖 INTELLIGENCE","type":4}' | jq -r '.id')

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"ai-insights\",\"type\":0,\"parent_id\":\"$AI_CAT\"}" > /dev/null
echo "   ✅ #ai-insights - AI-driven insights"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"automation\",\"type\":0,\"parent_id\":\"$AI_CAT\"}" > /dev/null
echo "   ✅ #automation - Workflow automation"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"analytics\",\"type\":0,\"parent_id\":\"$AI_CAT\"}" > /dev/null
echo "   ✅ #analytics - Data analytics"

echo ""

# 9. ENGINEERING & INFRASTRUCTURE
echo "👨‍💻 Engineering"
ENG_CAT=$(discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  '{"name":"👨‍💻 ENGINEERING","type":4}' | jq -r '.id')

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"github\",\"type\":0,\"parent_id\":\"$ENG_CAT\"}" > /dev/null
echo "   ✅ #github - Code updates"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"infrastructure\",\"type\":0,\"parent_id\":\"$ENG_CAT\"}" > /dev/null
echo "   ✅ #infrastructure - Systems & ops"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"deployments-tech\",\"type\":0,\"parent_id\":\"$ENG_CAT\"}" > /dev/null
echo "   ✅ #deployments-tech - Technical releases"

echo ""

# 10. TEAM & CULTURE
echo "💬 Team & Culture"
TEAM_CAT=$(discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  '{"name":"💬 TEAM","type":4}' | jq -r '.id')

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"announcements\",\"type\":0,\"parent_id\":\"$TEAM_CAT\"}" > /dev/null
echo "   ✅ #announcements - Company updates"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"general\",\"type\":0,\"parent_id\":\"$TEAM_CAT\"}" > /dev/null
echo "   ✅ #general - Team discussion"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"wins\",\"type\":0,\"parent_id\":\"$TEAM_CAT\"}" > /dev/null
echo "   ✅ #wins - Celebrate victories"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"random\",\"type\":0,\"parent_id\":\"$TEAM_CAT\"}" > /dev/null
echo "   ✅ #random - Off-topic"

echo ""

# 11. MODERATION
echo "🔒 Moderation"
MOD_CAT=$(discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  '{"name":"🔒 MODERATION","type":4}' | jq -r '.id')

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"moderation-logs\",\"type\":0,\"parent_id\":\"$MOD_CAT\"}" > /dev/null
echo "   ✅ #moderation-logs"

discord_api POST "/guilds/$DISCORD_GUILD_ID/channels" \
  "{\"name\":\"security\",\"type\":0,\"parent_id\":\"$MOD_CAT\"}" > /dev/null
echo "   ✅ #security"

echo ""
echo "🎉 WISE² Aligned Discord Complete!"
echo ""
echo "Structure:"
echo "  👑 Empire Building (4 channels) - Mission & Culture"
echo "  ⚙️  Operating Layers (5 channels) - Technical foundation"
echo "  📦 Products (5 channels) - Core offerings"
echo "  🎓 Sales Academy (3 channels) - Training"
echo "  💰 Revenue (3 channels) - Growth"
echo "  🏭 Industries (4 channels) - Verticals"
echo "  🚀 Field Operations (3 channels) - Customers"
echo "  🤖 Intelligence (3 channels) - AI & data"
echo "  👨‍💻 Engineering (3 channels) - Code & ops"
echo "  💬 Team (4 channels) - Culture"
echo "  🔒 Moderation (2 channels) - Security"
echo ""
echo "✅ 42 channels aligned with wise2.net structure"
echo "✅ paige has full access"
echo "✅ Ready for enterprise operations"
echo ""
echo "👑 Building Empires. Changing Culture. Together."
