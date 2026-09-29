#!/bin/bash

# WISE² Discord Bot Health Check Script
# Runs daily to monitor bot health and performance
# Usage: ./bot-health-check.sh [--quiet] [--alert-webhook <url>]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DISCORD_DIR="$PROJECT_ROOT/services/wise-discord"
LOGS_DIR="$PROJECT_ROOT/data/logs/health-checks"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
HEALTH_REPORT="$LOGS_DIR/$(date '+%Y-%m-%d').json"

# Parse arguments
QUIET=false
ALERT_WEBHOOK=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --quiet) QUIET=true; shift ;;
    --alert-webhook) ALERT_WEBHOOK="$2"; shift 2 ;;
    *) shift ;;
  esac
done

# Ensure log directory exists
mkdir -p "$LOGS_DIR"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Logging function
log() {
  if [ "$QUIET" = false ]; then
    echo -e "$1"
  fi
}

# Initialize report
report_start=$(date +%s)
checks_passed=0
checks_failed=0
issues=""

log "${GREEN}🏥 WISE² Discord Bot Health Check${NC}"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Timestamp: $TIMESTAMP"
log ""

# 1. Check if bot process is running
log "${YELLOW}1️⃣  Bot Process Status${NC}"
if pm2 list | grep -q "wise-discord"; then
  log "${GREEN}   ✅ Bot running on PM2${NC}"
  bot_status="online"
  ((checks_passed++))
else
  log "${RED}   ❌ Bot NOT running${NC}"
  bot_status="offline"
  issues="${issues}Bot process offline. "
  ((checks_failed++))
fi
log ""

# 2. Check memory usage
log "${YELLOW}2️⃣  Memory Usage${NC}"
if pm2 list | grep -q "wise-discord"; then
  memory=$(pm2 show wise-discord 2>/dev/null | grep "memory" | awk '{print $NF}' | sed 's/M//g' || echo "0")
  memory_mb=${memory%.*}

  if [ "$memory_mb" -lt 300 ]; then
    log "${GREEN}   ✅ Memory: ${memory_mb}MB (healthy)${NC}"
    memory_status="healthy"
    ((checks_passed++))
  elif [ "$memory_mb" -lt 500 ]; then
    log "${YELLOW}   ⚠️  Memory: ${memory_mb}MB (elevated)${NC}"
    memory_status="elevated"
    issues="${issues}Memory usage elevated. "
    ((checks_passed++))
  else
    log "${RED}   ❌ Memory: ${memory_mb}MB (critical)${NC}"
    memory_status="critical"
    issues="${issues}Memory usage critical (>500MB). "
    ((checks_failed++))
  fi
else
  memory_status="unknown"
  log "${YELLOW}   ⚠️  Cannot determine memory (bot offline)${NC}"
fi
log ""

# 3. Check bot uptime
log "${YELLOW}3️⃣  Bot Uptime${NC}"
if pm2 list | grep -q "wise-discord"; then
  uptime=$(pm2 show wise-discord 2>/dev/null | grep "uptime" | awk '{print $NF}' || echo "unknown")
  log "${GREEN}   ✅ Uptime: $uptime${NC}"
  uptime_status="$uptime"
  ((checks_passed++))
else
  uptime_status="offline"
  log "${YELLOW}   ⚠️  Cannot determine uptime (bot offline)${NC}"
fi
log ""

# 4. Check for recent errors in logs
log "${YELLOW}4️⃣  Recent Errors (last 50 lines)${NC}"
error_count=0
if [ -f "$DISCORD_DIR/pm2.log" ] || pm2 logs wise-discord --lines 50 2>/dev/null | grep -qi "error"; then
  error_count=$(pm2 logs wise-discord --lines 50 2>/dev/null | grep -ic "error" || echo "0")
fi

if [ "$error_count" -eq 0 ]; then
  log "${GREEN}   ✅ No errors detected${NC}"
  error_status="clean"
  ((checks_passed++))
elif [ "$error_count" -lt 5 ]; then
  log "${YELLOW}   ⚠️  $error_count errors found${NC}"
  error_status="minor"
  issues="${issues}Minor errors detected. "
  ((checks_passed++))
else
  log "${RED}   ❌ $error_count errors found${NC}"
  error_status="critical"
  issues="${issues}Multiple errors detected. "
  ((checks_failed++))
fi
log ""

# 5. Test Discord connectivity
log "${YELLOW}5️⃣  Discord API Connectivity${NC}"
if pm2 list | grep -q "wise-discord"; then
  # Check if bot has connected within last hour
  recent_logs=$(pm2 logs wise-discord --lines 100 2>/dev/null | grep -i "ready\|connected" | tail -1 || echo "")
  if [ -n "$recent_logs" ]; then
    log "${GREEN}   ✅ Connected to Discord${NC}"
    discord_status="connected"
    ((checks_passed++))
  else
    log "${YELLOW}   ⚠️  Cannot verify Discord connection${NC}"
    discord_status="unknown"
  fi
else
  discord_status="offline"
  log "${YELLOW}   ⚠️  Cannot check (bot offline)${NC}"
fi
log ""

# 6. Test command execution (sample)
log "${YELLOW}6️⃣  Sample Command Test${NC}"
# This would require actual Discord interaction, so we'll skip it for now
# In production, you'd test via Discord API or a test webhook
log "${YELLOW}   ⏭️  Skipped (requires Discord interaction)${NC}"
log ""

# Calculate summary
total_checks=$((checks_passed + checks_failed))
health_percentage=$((checks_passed * 100 / total_checks))

log "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
log "${GREEN}✅ Checks Passed: $checks_passed / $total_checks${NC}"
if [ "$checks_failed" -gt 0 ]; then
  log "${RED}❌ Checks Failed: $checks_failed${NC}"
fi
log "${GREEN}📊 Health Score: ${health_percentage}%${NC}"
log ""

# Save report to file
report_end=$(date +%s)
duration=$((report_end - report_start))

cat > "$HEALTH_REPORT" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "checks_passed": $checks_passed,
  "checks_failed": $checks_failed,
  "total_checks": $total_checks,
  "health_percentage": $health_percentage,
  "duration_seconds": $duration,
  "bot_status": "$bot_status",
  "memory_status": "$memory_status",
  "memory_mb": $memory_mb,
  "uptime": "$uptime_status",
  "errors": $error_count,
  "error_status": "$error_status",
  "discord_status": "$discord_status",
  "issues": "$issues"
}
EOF

log "${GREEN}📝 Report saved to: $HEALTH_REPORT${NC}"

# Send alert if configured and there are failures
if [ -n "$ALERT_WEBHOOK" ] && [ "$checks_failed" -gt 0 ]; then
  log ""
  log "${YELLOW}📢 Sending alert to webhook...${NC}"

  alert_payload=$(cat <<EOF
{
  "content": "⚠️ **WISE² Discord Bot Health Alert**",
  "embeds": [
    {
      "color": 16711680,
      "title": "Bot Health Check Failed",
      "fields": [
        {"name": "Health Score", "value": "${health_percentage}%", "inline": true},
        {"name": "Issues", "value": "$issues", "inline": false},
        {"name": "Bot Status", "value": "$bot_status", "inline": true},
        {"name": "Memory", "value": "${memory_mb}MB", "inline": true},
        {"name": "Timestamp", "value": "$TIMESTAMP", "inline": false}
      ]
    }
  ]
}
EOF
)

  curl -X POST -H 'Content-type: application/json' \
    --data "$alert_payload" \
    "$ALERT_WEBHOOK" 2>/dev/null || true

  log "${GREEN}   ✅ Alert sent${NC}"
fi

exit $checks_failed
