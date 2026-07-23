#!/bin/bash

# WISE² Complete Deployment Script
# Usage: ./deploy.sh [production|staging]

set -e

ENVIRONMENT=${1:-production}
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "🚀 WISE² Customer Journey Deployment"
echo "Environment: $ENVIRONMENT"
echo ""

# ============================================================================
# Step 1: Validate Environment Variables
# ============================================================================
echo "📋 Validating environment variables..."

required_vars=(
  "STRIPE_PUBLIC_KEY"
  "STRIPE_SECRET_KEY"
  "STRIPE_STARTER_PRICE_ID"
  "STRIPE_PRO_PRICE_ID"
  "STRIPE_WEBHOOK_SECRET"
  "SENDGRID_API_KEY"
  "SENDGRID_FROM_EMAIL"
  "DATABASE_URL"
  "APP_URL"
  "API_BASE_URL"
)

missing_vars=()
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    missing_vars+=("$var")
  fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
  echo "❌ Missing environment variables:"
  for var in "${missing_vars[@]}"; do
    echo "   - $var"
  done
  exit 1
fi

echo "✅ All environment variables present"
echo ""

# ============================================================================
# Step 2: Build Docker Images
# ============================================================================
echo "🔨 Building Docker images..."

docker-compose -f docker-compose.prod.yml build

echo "✅ Docker images built"
echo ""

# ============================================================================
# Step 3: Start Services
# ============================================================================
echo "🚀 Starting services..."

docker-compose -f docker-compose.prod.yml up -d

echo "⏳ Waiting for services to be healthy..."
sleep 30

echo "✅ Services started"
echo ""

# ============================================================================
# Step 4: Run Database Migrations
# ============================================================================
echo "🗄️  Running database migrations..."

docker-compose -f docker-compose.prod.yml exec -T postgres psql \
  -U wise2 \
  -d wise2_prod \
  -f /docker-entrypoint-initdb.d/01-schema.sql

echo "✅ Database migrations complete"
echo ""

# ============================================================================
# Step 5: Health Checks
# ============================================================================
echo "🏥 Running health checks..."

services=("api" "website" "studio" "postgres")
all_healthy=true

for service in "${services[@]}"; do
  if docker-compose -f docker-compose.prod.yml ps | grep -q "$service.*Up"; then
    echo "✅ $service is running"
  else
    echo "❌ $service is not running"
    all_healthy=false
  fi
done

if [ "$all_healthy" = false ]; then
  echo "⚠️  Some services are not running. Check logs:"
  echo "   docker-compose -f docker-compose.prod.yml logs -f"
  exit 1
fi

echo ""

# ============================================================================
# Step 6: Display Service URLs
# ============================================================================
echo "✨ Deployment Complete!"
echo ""
echo "Services are now running:"
echo "  📱 Website:        http://localhost:3001"
echo "  🎨 Studio:         http://localhost:3005"
echo "  🔧 API:            http://localhost:3000"
echo "  💾 Database:       localhost:5432"
echo "  🌐 Nginx:          http://localhost"
echo ""

echo "Next Steps:"
echo "  1. Visit http://localhost/pricing to see pricing page"
echo "  2. Complete checkout flow to test payment"
echo "  3. Check emails: SENDGRID_API_KEY must be valid"
echo "  4. Configure Stripe webhook at: ${API_BASE_URL}/v1/billing/webhook"
echo ""

echo "Useful Commands:"
echo "  View logs:        docker-compose -f docker-compose.prod.yml logs -f"
echo "  Stop services:    docker-compose -f docker-compose.prod.yml down"
echo "  Restart service:  docker-compose -f docker-compose.prod.yml restart api"
echo ""
