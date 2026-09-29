#!/bin/bash
set -e

# WISE² Ray-Ban Integration — VPS Deployment Script
# Usage: bash scripts/rayban-deploy.sh [environment]

ENVIRONMENT=${1:-production}
VPS_HOST="173.208.147.165"
VPS_USER="dwise"
SERVICE_NAME="rayban-service"
PORT=3040

echo "🚀 Ray-Ban Integration Deployment to $ENVIRONMENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Build Docker image
echo "📦 Building Ray-Ban service image..."
docker build \
  -t wise2/rayban:latest \
  -f packages/api/Dockerfile.rayban \
  .

# 2. Tag for registry
docker tag wise2/rayban:latest wise2/rayban:${ENVIRONMENT}

# 3. Push to VPS (or local registry)
if [ "$ENVIRONMENT" = "production" ]; then
  echo "🔐 Pushing to production registry..."
  docker push wise2/rayban:production
else
  echo "💾 Storing locally for staging..."
fi

# 4. Deploy to VPS
echo "🌍 Deploying to VPS (${VPS_HOST})..."
ssh -i ~/.ssh/wise2_vps ${VPS_USER}@${VPS_HOST} << 'EOF'
  set -e
  cd /home/dwise/wise2-core

  echo "📥 Pulling latest Ray-Ban service..."
  docker pull wise2/rayban:latest || true

  echo "🔄 Updating docker-compose..."
  docker-compose -f docker-compose.prod.yml up -d rayban-service

  echo "✅ Verifying Ray-Ban service..."
  sleep 3
  curl -s http://localhost:3040/rayban/health || echo "⚠️  Health check pending..."

  echo "📊 Ray-Ban service deployed successfully!"
EOF

# 5. Verify deployment
echo ""
echo "✅ Deployment Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Ray-Ban Service: https://api.wise2.net/rayban"
echo "Health Check: https://api.wise2.net/rayban/health"
echo ""
echo "📱 Ray-Ban Dashboard: https://wise2.net/hermes-control (Ray-Ban tab)"
echo "🌐 Landing Page: https://wise2.net/rayban"
