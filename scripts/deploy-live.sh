#!/bin/bash
# SoundLabs Live Phase 1 — Production Deployment Script
# Automates deployment of Live features to wise2.net

set -e

echo "🚀 SoundLabs Live Phase 1 — Production Deployment"
echo "=================================================="
echo ""

# Configuration
REPO_DIR="/home/dwise/wise2-core"
SERVER="dwise@173.208.147.165"
ENVIRONMENT="production"

# Step 1: Pull latest code
echo "📥 Step 1: Pulling latest code from main..."
cd "$REPO_DIR" || exit 1
git fetch origin main
git checkout main
git pull origin main
echo "✅ Code pulled"
echo ""

# Step 2: Database migration
echo "🗄️  Step 2: Running database migrations..."
npx prisma migrate deploy
echo "✅ Database migrated"
echo ""

# Step 3: Build Docker images
echo "🐳 Step 3: Building Docker images..."
sudo docker-compose -f docker-compose.prod.yml build --no-cache api website
echo "✅ Images built"
echo ""

# Step 4: Stop old containers
echo "⏹️  Step 4: Stopping old containers..."
sudo docker-compose -f docker-compose.prod.yml down api website
echo "✅ Containers stopped"
echo ""

# Step 5: Start new containers
echo "🚀 Step 5: Starting new containers..."
sudo docker-compose -f docker-compose.prod.yml up -d api website
echo "✅ Containers started"
echo ""

# Step 6: Wait for health checks
echo "⏳ Step 6: Waiting for services to become healthy..."
sleep 30

API_STATUS=$(sudo docker-compose -f docker-compose.prod.yml ps api | grep -c "healthy\|Up" || true)
WEBSITE_STATUS=$(sudo docker-compose -f docker-compose.prod.yml ps website | grep -c "healthy\|Up" || true)

if [ "$API_STATUS" -gt 0 ] && [ "$WEBSITE_STATUS" -gt 0 ]; then
  echo "✅ Services healthy"
else
  echo "❌ Services failed to start"
  sudo docker-compose -f docker-compose.prod.yml ps
  exit 1
fi
echo ""

# Step 7: Verify deployment
echo "🔍 Step 7: Verifying deployment..."
echo ""

echo "Checking API health..."
API_HEALTH=$(curl -s https://api.wise2.net/api/health | grep -c "ok" || echo "0")
if [ "$API_HEALTH" -gt 0 ]; then
  echo "✅ API is healthy"
else
  echo "⚠️  API health check inconclusive"
fi

echo ""
echo "Checking Live endpoints..."
curl -s -I https://api.wise2.net/api/v1/sound-labs/live/rooms | head -n 1

echo ""
echo "Testing WebSocket..."
echo "wss://api.wise2.net/api/live/socket.io"

echo ""
echo "=================================================="
echo "✅ DEPLOYMENT COMPLETE"
echo "=================================================="
echo ""
echo "🎬 SoundLabs Live is now live on wise2.net!"
echo ""
echo "Access points:"
echo "  - REST API:  https://api.wise2.net/api/v1/sound-labs/live/"
echo "  - WebSocket: wss://api.wise2.net/api/live/socket.io"
echo "  - Web Page:  https://wise2.net/live/[roomId]"
echo ""
echo "Next steps:"
echo "  1. Monitor logs: sudo docker logs wise2-api | grep -i live"
echo "  2. Test room creation: curl -H 'Authorization: Bearer \$JWT' https://api.wise2.net/api/v1/sound-labs/live/rooms"
echo "  3. Announce feature to users"
echo ""
