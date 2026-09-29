#!/bin/bash

# WISE² Trading Platform Deployment Script
# Deploys ÆTHER-TRADER engine, dashboard, and API to production
# Usage: ./deploy-trading.sh [production|staging]

set -e

ENVIRONMENT=${1:-production}
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

echo "🚀 WISE² Trading Platform Deployment"
echo "Environment: $ENVIRONMENT"
echo "Timestamp: $TIMESTAMP"
echo ""

# ============================================================================
# Step 1: Load Environment
# ============================================================================
echo "📋 Loading environment variables..."

if [ -f ".env.${ENVIRONMENT}" ]; then
  export $(cat ".env.${ENVIRONMENT}" | xargs)
elif [ -f ".env.${ENVIRONMENT}.local" ]; then
  export $(cat ".env.${ENVIRONMENT}.local" | xargs)
elif [ -f ".env.${ENVIRONMENT}.example" ]; then
  echo "⚠️  Using example environment file (not recommended for production)"
  export $(cat ".env.${ENVIRONMENT}.example" | xargs)
else
  echo "❌ No environment file found for $ENVIRONMENT"
  exit 1
fi

echo "✅ Environment loaded"
echo ""

# ============================================================================
# Step 2: Validate Database Connection
# ============================================================================
echo "🔍 Validating database connection..."

if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL not set"
  exit 1
fi

# Test connection
psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1 || {
  echo "❌ Cannot connect to database: $DATABASE_URL"
  exit 1
}

echo "✅ Database connection validated"
echo ""

# ============================================================================
# Step 3: Database Migration
# ============================================================================
echo "📊 Running database migrations..."

cd "$SCRIPT_DIR/packages/db"
npx prisma migrate deploy
npx prisma generate

echo "✅ Database migrations complete"
cd "$SCRIPT_DIR"
echo ""

# ============================================================================
# Step 4: Build Backend
# ============================================================================
echo "🔨 Building API service..."

cd "$SCRIPT_DIR/apps/api"
npm run build

echo "✅ API build complete"
cd "$SCRIPT_DIR"
echo ""

# ============================================================================
# Step 5: Build Frontend
# ============================================================================
echo "🎨 Building frontend dashboard..."

cd "$SCRIPT_DIR/apps/website"
npm run build

echo "✅ Frontend build complete"
cd "$SCRIPT_DIR"
echo ""

# ============================================================================
# Step 6: Docker Build (Optional - for containerized deployment)
# ============================================================================
if command -v docker &> /dev/null; then
  echo "🐳 Building Docker images..."

  docker build \
    --build-arg NODE_ENV=production \
    -f Dockerfile.api \
    -t wise2-trading-api:latest \
    -t wise2-trading-api:$TIMESTAMP \
    .

  docker build \
    --build-arg NODE_ENV=production \
    -f Dockerfile.website \
    -t wise2-trading-web:latest \
    -t wise2-trading-web:$TIMESTAMP \
    .

  echo "✅ Docker images built"
  echo "  - wise2-trading-api:latest"
  echo "  - wise2-trading-web:latest"
  echo ""
else
  echo "⚠️  Docker not found - skipping container build"
  echo ""
fi

# ============================================================================
# Step 7: Update API Routes
# ============================================================================
echo "🔌 Verifying API routes..."

if grep -q "tradingRouter\|/api/trading" "$SCRIPT_DIR/apps/api/src/index.ts" 2>/dev/null; then
  echo "✅ Trading routes already registered"
else
  echo "⚠️  Trading routes may need manual registration in apps/api/src/index.ts"
  echo "   Add this to your API server:"
  echo "   import tradingRouter from './routes/trading';"
  echo "   app.use('/api/trading', tradingRouter);"
fi
echo ""

# ============================================================================
# Step 8: Deployment Summary
# ============================================================================
echo "═══════════════════════════════════════════════════════════════"
echo "✅ WISE² Trading Platform Deployment Ready"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Deployment Summary:"
echo "  Environment: $ENVIRONMENT"
echo "  Timestamp: $TIMESTAMP"
echo "  Database: Migrated"
echo "  API: Built"
echo "  Frontend: Built"
echo "  Status: READY FOR DEPLOYMENT"
echo ""
echo "Next Steps:"
echo ""
echo "1. Deploy using Docker Compose:"
echo "   docker-compose -f docker-compose.${ENVIRONMENT}.yml up -d"
echo ""
echo "2. Or deploy directly:"
echo "   cd apps/api && npm run start"
echo "   cd apps/website && npm start"
echo ""
echo "3. Verify deployment:"
echo "   curl http://localhost:3001/api/trading/signals"
echo "   open http://localhost:3000/trading"
echo ""
echo "4. Check health:"
echo "   curl http://localhost:3001/health"
echo ""
echo "5. Monitor logs:"
echo "   docker logs wise2-api"
echo "   docker logs wise2-web"
echo ""
echo "Endpoints Available:"
echo "  API: http://api.wise2.net/api/trading"
echo "  Dashboard: http://wise2.net/trading"
echo ""
echo "Documentation:"
echo "  Quick Start: WISE2_TRADING_QUICKSTART.md"
echo "  Implementation: WISE2_TRADING_IMPLEMENTATION_COMPLETE.md"
echo "  Deployment: WISE2_TRADING_DELIVERY_SUMMARY.md"
echo ""
echo "═══════════════════════════════════════════════════════════════"
