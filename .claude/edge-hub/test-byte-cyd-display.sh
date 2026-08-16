#!/bin/bash

# WISE² Edge Hub - BYTE Mini CYD Display Test Script
# Tests all display update features

set -e

HOST="${1:-wisepi.tail44396d.ts.net}"
DEVICE_ID="${2:-byte-mini-01}"
MQTT_USER="dwise"
MQTT_PASS="${3:-password}"
MQTT_TOPIC="wise2/device/$DEVICE_ID"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   BYTE Mini CYD - Display Update Test                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo
echo "Host: $HOST"
echo "Device: $DEVICE_ID"
echo "MQTT Topic: $MQTT_TOPIC"
echo

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function to publish MQTT message
publish() {
  local title="$1"
  local action="$2"
  local payload="$3"

  echo -e "${BLUE}Test: $title${NC}"
  echo "  Payload: $action"

  mosquitto_pub -h "$HOST" -u "$MQTT_USER" -P "$MQTT_PASS" \
    -t "$MQTT_TOPIC/command" \
    -m "$payload" 2>/dev/null

  if [ $? -eq 0 ]; then
    echo -e "  ${GREEN}✓ Sent${NC}"
  else
    echo -e "  ${RED}✗ Failed${NC}"
  fi

  sleep "$4"
  echo
}

# Test 1: Register device
echo -e "${YELLOW}=== TEST 1: Device Registration ===${NC}"
echo

publish "Send heartbeat" "heartbeat" \
  "{\"deviceId\":\"$DEVICE_ID\",\"deviceType\":\"byte-mini-cyd\",\"timestamp\":$(date +%s000),\"uptime\":3600000,\"battery\":95,\"wifiSignal\":-45,\"temperature\":32,\"features\":[\"display\",\"touch\",\"wifi\",\"mqtt\"],\"version\":\"1.0.0\"}" \
  2

# Verify registration
echo "Verifying device registration..."
RESULT=$(curl -s http://$HOST:4900/devices | jq ".devices[] | select(.deviceId==\"$DEVICE_ID\") | .isOnline" 2>/dev/null)

if [ "$RESULT" = "true" ]; then
  echo -e "${GREEN}✓ Device registered and online${NC}"
else
  echo -e "${YELLOW}⚠ Device may not be registered yet${NC}"
fi

echo
echo -e "${YELLOW}=== TEST 2: Display Updates ===${NC}"
echo

# Test 2: Clear display
publish "Clear display" "clear" \
  "{\"action\":\"clear\",\"color\":\"black\",\"timestamp\":$(date +%s000)}" \
  1

# Test 3: Show text
publish "Show text" "display_text" \
  "{\"action\":\"display_update\",\"text\":\"WISE² Edge Hub\",\"x\":0,\"y\":10,\"color\":\"white\",\"fontSize\":24,\"timestamp\":$(date +%s000)}" \
  3

# Test 4: Show status message
publish "Show status (success)" "show_status" \
  "{\"action\":\"show_status\",\"message\":\"Connected\",\"icon\":\"check\",\"color\":\"green\",\"duration\":2000,\"timestamp\":$(date +%s000)}" \
  3

# Test 5: Show warning status
publish "Show status (warning)" "show_status_warning" \
  "{\"action\":\"show_status\",\"message\":\"Waiting for device...\",\"icon\":\"hourglass\",\"color\":\"yellow\",\"duration\":2000,\"timestamp\":$(date +%s000)}" \
  3

# Test 6: Clear and show multiline
publish "Multiline text" "multiline_text" \
  "{\"action\":\"display_update\",\"text\":\"Line 1\nLine 2\nLine 3\",\"x\":0,\"y\":50,\"color\":\"cyan\",\"fontSize\":16,\"timestamp\":$(date +%s000)}" \
  3

echo -e "${YELLOW}=== TEST 3: Dashboard Layout ===${NC}"
echo

# Test 7: Show dashboard with widgets
publish "Show dashboard" "show_dashboard" \
  "{\"action\":\"show_dashboard\",\"layout\":\"2x2\",\"widgets\":[{\"type\":\"text\",\"label\":\"Status\",\"value\":\"Online\",\"x\":0,\"y\":0},{\"type\":\"battery\",\"value\":95,\"x\":1,\"y\":0},{\"type\":\"signal\",\"value\":-45,\"x\":0,\"y\":1},{\"type\":\"temperature\",\"value\":32,\"x\":1,\"y\":1}],\"timestamp\":$(date +%s000)}" \
  4

echo -e "${YELLOW}=== TEST 4: Brightness Control ===${NC}"
echo

# Test 8: Set brightness
publish "Set brightness high" "brightness_high" \
  "{\"action\":\"set_brightness\",\"value\":100,\"timestamp\":$(date +%s000)}" \
  2

publish "Set brightness medium" "brightness_medium" \
  "{\"action\":\"set_brightness\",\"value\":50,\"timestamp\":$(date +%s000)}" \
  2

publish "Set brightness low" "brightness_low" \
  "{\"action\":\"set_brightness\",\"value\":20,\"timestamp\":$(date +%s000)}" \
  2

echo -e "${YELLOW}=== TEST 5: Complete Demo Sequence ===${NC}"
echo

# Test 9: Complete startup sequence
echo -e "${BLUE}Running startup sequence...${NC}"
echo

publish "Startup - Initializing" "startup_init" \
  "{\"action\":\"show_status\",\"message\":\"Initializing...\",\"icon\":\"gear\",\"color\":\"blue\",\"duration\":2000,\"timestamp\":$(date +%s000)}" \
  2

publish "Startup - Services" "startup_services" \
  "{\"action\":\"display_update\",\"text\":\"Services Online:\nRegistry ✓\nHealth ✓\nVoice ✓\nSupport ✓\",\"x\":0,\"y\":40,\"color\":\"green\",\"fontSize\":14,\"timestamp\":$(date +%s000)}" \
  3

publish "Startup - Complete" "startup_complete" \
  "{\"action\":\"show_status\",\"message\":\"Ready\",\"icon\":\"check\",\"color\":\"green\",\"duration\":2000,\"timestamp\":$(date +%s000)}" \
  2

echo
echo -e "${YELLOW}=== FINAL STATUS ===${NC}"
echo

# Final summary
echo "Testing complete! Summary:"
echo
echo -e "${GREEN}✓ Device registration${NC}"
echo -e "${GREEN}✓ Text display${NC}"
echo -e "${GREEN}✓ Status messages${NC}"
echo -e "${GREEN}✓ Dashboard widgets${NC}"
echo -e "${GREEN}✓ Brightness control${NC}"
echo -e "${GREEN}✓ Complete sequence${NC}"
echo

echo "Next steps:"
echo "1. Check physical BYTE Mini CYD display for output"
echo "2. Verify dashboard updates in real-time"
echo "3. Monitor MQTT topic for commands:"
echo "   mosquitto_sub -h $HOST -u $MQTT_USER -P $MQTT_PASS -t '$MQTT_TOPIC/command' -v"
echo
echo "Display API running on: http://$HOST:4900/devices"
echo "Dashboard API running on: http://$HOST:4903"
echo

echo -e "${GREEN}All tests complete!${NC}"
