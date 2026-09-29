#!/bin/bash

# WISE² Phone System End-to-End Test
# Validates all components of the phone system

set -e

API_URL="${API_BASE_URL:-http://localhost:3000}"
PHONE_GW_URL="${PHONE_GW_URL:-http://localhost:3001}"
TENANT_ID="${TENANT_ID:-default-workspace}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "================================"
echo "WISE² Phone System E2E Test"
echo "================================"
echo ""

# Test 1: API Health
echo -e "${YELLOW}[1/6] Testing API health...${NC}"
if curl -s "$API_URL/health" > /dev/null; then
  echo -e "${GREEN}✓ API is healthy${NC}"
else
  echo -e "${RED}✗ API health check failed${NC}"
  exit 1
fi

# Test 2: Phone Gateway Health
echo -e "${YELLOW}[2/6] Testing Phone Gateway health...${NC}"
HEALTH=$(curl -s "$PHONE_GW_URL/health")
if echo "$HEALTH" | grep -q '"status":"healthy"'; then
  echo -e "${GREEN}✓ Phone Gateway is healthy${NC}"
  echo "   Services: $(echo "$HEALTH" | grep -o '"[a-z]*":"online"' | wc -l) online"
else
  echo -e "${RED}✗ Phone Gateway health check failed${NC}"
  echo "$HEALTH"
  exit 1
fi

# Test 3: Customer Lookup/Create
echo -e "${YELLOW}[3/6] Testing CRM customer operations...${NC}"
CUSTOMER=$(curl -s -X POST "$API_URL/v1/ai-phone/customer" \
  -H "X-Tenant-ID: $TENANT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "primaryPhone": "+15551234567",
    "email": "test@example.com"
  }')

if echo "$CUSTOMER" | grep -q '"id"'; then
  CUSTOMER_ID=$(echo "$CUSTOMER" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo -e "${GREEN}✓ Customer created: $CUSTOMER_ID${NC}"
else
  echo -e "${RED}✗ Customer creation failed${NC}"
  echo "$CUSTOMER"
  exit 1
fi

# Test 4: Lead Creation
echo -e "${YELLOW}[4/6] Testing lead creation...${NC}"
LEAD=$(curl -s -X POST "$API_URL/v1/ai-phone/lead" \
  -H "X-Tenant-ID: $TENANT_ID" \
  -H "Content-Type: application/json" \
  -d "{
    \"customerId\": \"$CUSTOMER_ID\",
    \"source\": \"test\",
    \"intent\": \"HVAC service inquiry\",
    \"sourceCallId\": \"test-call-$(date +%s)\"
  }")

if echo "$LEAD" | grep -q '"id"'; then
  LEAD_ID=$(echo "$LEAD" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo -e "${GREEN}✓ Lead created: $LEAD_ID${NC}"
else
  echo -e "${RED}✗ Lead creation failed${NC}"
  echo "$LEAD"
  exit 1
fi

# Test 5: Appointment Booking
echo -e "${YELLOW}[5/6] Testing appointment booking...${NC}"
START_TIME=$(date -u -d "+1 hour" +"%Y-%m-%dT%H:%M:%SZ")
END_TIME=$(date -u -d "+2 hours" +"%Y-%m-%dT%H:%M:%SZ")

BOOKING=$(curl -s -X POST "$API_URL/v1/ai-phone/booking" \
  -H "X-Tenant-ID: $TENANT_ID" \
  -H "Content-Type: application/json" \
  -d "{
    \"customerId\": \"$CUSTOMER_ID\",
    \"serviceType\": \"hvac-maintenance\",
    \"startAt\": \"$START_TIME\",
    \"endAt\": \"$END_TIME\",
    \"sourceCallId\": \"test-call-$(date +%s)\"
  }")

if echo "$BOOKING" | grep -q '"id"'; then
  BOOKING_ID=$(echo "$BOOKING" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  CONF_NUM=$(echo "$BOOKING" | grep -o '"confirmationNumber":"[^"]*"' | cut -d'"' -f4)
  echo -e "${GREEN}✓ Appointment booked: $BOOKING_ID (Confirmation: $CONF_NUM)${NC}"
else
  echo -e "${RED}✗ Appointment booking failed${NC}"
  echo "$BOOKING"
  exit 1
fi

# Test 6: Call Recording
echo -e "${YELLOW}[6/6] Testing call event recording...${NC}"
CALL_EVENT=$(curl -s -X POST "$API_URL/v1/ai-phone/call-event" \
  -H "X-Tenant-ID: $TENANT_ID" \
  -H "Content-Type: application/json" \
  -d "{
    \"callSid\": \"test-call-$(date +%s)\",
    \"leadId\": \"$LEAD_ID\",
    \"customerId\": \"$CUSTOMER_ID\",
    \"transcript\": \"Test transcript\",
    \"summary\": \"Customer requested HVAC service\",
    \"duration\": 120,
    \"disposition\": \"completed\"
  }")

if echo "$CALL_EVENT" | grep -q '"id"'; then
  CALL_ID=$(echo "$CALL_EVENT" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo -e "${GREEN}✓ Call event recorded: $CALL_ID${NC}"
else
  echo -e "${RED}✗ Call event recording failed${NC}"
  echo "$CALL_EVENT"
  exit 1
fi

# Success Summary
echo ""
echo "================================"
echo -e "${GREEN}✓ All tests passed!${NC}"
echo "================================"
echo ""
echo "Summary:"
echo "  - API: ✓"
echo "  - Phone Gateway: ✓"
echo "  - Customer: ✓ (ID: $CUSTOMER_ID)"
echo "  - Lead: ✓ (ID: $LEAD_ID)"
echo "  - Appointment: ✓ (Conf: $CONF_NUM)"
echo "  - Call Recording: ✓"
echo ""
echo "Next: Configure Asterisk and provision SIP provider"
echo "See: docs/phone-system/DEPLOYMENT_READY.md"
