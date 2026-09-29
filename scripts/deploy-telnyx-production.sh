#!/bin/bash
# WISE² Telnyx Production Deployment Script
# This script configures Telnyx and Google Voice providers on production
# Run as: bash scripts/deploy-telnyx-production.sh

set -e

echo "================================"
echo "WISE² Telnyx Production Setup"
echo "================================"
echo ""

# Check if running on production server
if [[ ! -f /home/dwise/.env ]]; then
  echo "❌ ERROR: Not running on production server (dwise@173.208.147.165)"
  echo "This script must be run on the production VPS."
  exit 1
fi

echo "✓ Production server detected"
echo ""

# Backup existing .env
if [[ -f /home/dwise/.env ]]; then
  cp /home/dwise/.env /home/dwise/.env.backup.$(date +%Y%m%d-%H%M%S)
  echo "✓ Backed up existing .env"
fi

echo ""
echo "================================"
echo "TELNYX CONFIGURATION"
echo "================================"
echo ""
echo "Retrieve these values from https://console.telnyx.com"
echo ""

# Telnyx API Key
read -p "TELNYX_API_KEY: " telnyx_api_key
if [[ -z "$telnyx_api_key" ]]; then
  echo "⚠ Skipping TELNYX_API_KEY (optional)"
else
  grep -q "^TELNYX_API_KEY=" /home/dwise/.env && \
    sed -i "s|^TELNYX_API_KEY=.*|TELNYX_API_KEY=$telnyx_api_key|" /home/dwise/.env || \
    echo "TELNYX_API_KEY=$telnyx_api_key" >> /home/dwise/.env
fi

# Telnyx Phone Number
read -p "TELNYX_PHONE_NUMBER (format: +1234567890): " telnyx_phone
if [[ -z "$telnyx_phone" ]]; then
  echo "⚠ Skipping TELNYX_PHONE_NUMBER (optional)"
else
  grep -q "^TELNYX_PHONE_NUMBER=" /home/dwise/.env && \
    sed -i "s|^TELNYX_PHONE_NUMBER=.*|TELNYX_PHONE_NUMBER=$telnyx_phone|" /home/dwise/.env || \
    echo "TELNYX_PHONE_NUMBER=$telnyx_phone" >> /home/dwise/.env
fi

# Telnyx Webhook Secret
read -sp "TELNYX_WEBHOOK_SECRET: " telnyx_secret
echo ""
if [[ -z "$telnyx_secret" ]]; then
  echo "⚠ Skipping TELNYX_WEBHOOK_SECRET (optional)"
else
  grep -q "^TELNYX_WEBHOOK_SECRET=" /home/dwise/.env && \
    sed -i "s|^TELNYX_WEBHOOK_SECRET=.*|TELNYX_WEBHOOK_SECRET=$telnyx_secret|" /home/dwise/.env || \
    echo "TELNYX_WEBHOOK_SECRET=$telnyx_secret" >> /home/dwise/.env
fi

# Telnyx Connection ID
read -p "TELNYX_CONNECTION_ID: " telnyx_conn_id
if [[ -z "$telnyx_conn_id" ]]; then
  echo "⚠ Skipping TELNYX_CONNECTION_ID (optional)"
else
  grep -q "^TELNYX_CONNECTION_ID=" /home/dwise/.env && \
    sed -i "s|^TELNYX_CONNECTION_ID=.*|TELNYX_CONNECTION_ID=$telnyx_conn_id|" /home/dwise/.env || \
    echo "TELNYX_CONNECTION_ID=$telnyx_conn_id" >> /home/dwise/.env
fi

echo ""
echo "================================"
echo "GOOGLE VOICE CONFIGURATION"
echo "================================"
echo ""
echo "Retrieve these from Google Cloud Console"
echo ""

# Google Project ID
read -p "GOOGLE_PROJECT_ID (optional): " google_project_id
if [[ -n "$google_project_id" ]]; then
  grep -q "^GOOGLE_PROJECT_ID=" /home/dwise/.env && \
    sed -i "s|^GOOGLE_PROJECT_ID=.*|GOOGLE_PROJECT_ID=$google_project_id|" /home/dwise/.env || \
    echo "GOOGLE_PROJECT_ID=$google_project_id" >> /home/dwise/.env
fi

# Google Phone Number
read -p "GOOGLE_PHONE_NUMBER (optional): " google_phone
if [[ -n "$google_phone" ]]; then
  grep -q "^GOOGLE_PHONE_NUMBER=" /home/dwise/.env && \
    sed -i "s|^GOOGLE_PHONE_NUMBER=.*|GOOGLE_PHONE_NUMBER=$google_phone|" /home/dwise/.env || \
    echo "GOOGLE_PHONE_NUMBER=$google_phone" >> /home/dwise/.env
fi

echo ""
echo "================================"
echo "RESTARTING SERVICES"
echo "================================"
echo ""

# Navigate to project directory
cd /home/dwise/wise2-core

# Pull latest code
echo "Pulling latest code..."
git pull origin main

# Restart API container
echo "Restarting API container..."
docker-compose -f docker-compose.prod.yml restart api

# Wait for API to be healthy
echo "Waiting for API to be healthy..."
sleep 5
for i in {1..30}; do
  if curl -s http://localhost:3010/api/health > /dev/null; then
    echo "✓ API is healthy"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "⚠ API health check timed out"
  fi
  echo "  Attempt $i/30..."
  sleep 2
done

echo ""
echo "================================"
echo "VERIFICATION"
echo "================================"
echo ""
echo "Testing webhook endpoint..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST https://wise2.net/api/webhooks/telnyx/events \
  -H "Content-Type: application/json" \
  -d '{"data":{"event_type":"test","payload":{}}}')

STATUS=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -1)

if [[ "$STATUS" == "200" ]] || [[ "$STATUS" == "400" ]]; then
  echo "✓ Webhook endpoint is responding (Status: $STATUS)"
else
  echo "⚠ Webhook endpoint may not be ready (Status: $STATUS)"
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Configure webhook in Telnyx Console:"
echo "   URL: https://wise2.net/api/webhooks/telnyx/events"
echo ""
echo "2. Test with inbound call from another phone"
echo ""
echo "3. Monitor webhook delivery in Telnyx Console"
echo ""
