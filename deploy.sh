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
  "DATABASE_URL"
  "APP_URL"
  "API_BASE_URL"
)

# Optional: deploy proceeds without these, but email features are disabled.
optional_vars=(
  "SENDGRID_API_KEY"
  "SENDGRID_FROM_EMAIL"
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

for var in "${optional_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "⚠️  Optional variable $var not set — email features will be disabled"
  fi
done

echo "✅ All required environment variables present"
echo ""

# ============================================================================
# Step 2: Build Docker Images
# ============================================================================
echo "🔨 Building Docker images..."

# Build all services (api, website, studio, postgres volume)
if ! docker compose -f docker-compose.prod.yml build --no-cache; then
  echo "❌ Docker build failed"
  docker compose -f docker-compose.prod.yml logs
  exit 1
fi

echo "✅ All Docker images built successfully"
echo ""

# ============================================================================
# Step 3: Start Services
# ============================================================================
echo "🚀 Starting services..."

if ! docker compose -f docker-compose.prod.yml up -d; then
  echo "❌ Failed to start services"
  docker compose -f docker-compose.prod.yml logs
  exit 1
fi

echo "⏳ Waiting for services to be healthy..."
sleep 30

# Verify services are running
if ! docker compose -f docker-compose.prod.yml ps | grep -q "Up"; then
  echo "❌ Services failed to start properly"
  docker compose -f docker-compose.prod.yml logs
  exit 1
fi

echo "✅ Services started"
echo ""

# ============================================================================
# Step 4: Run Database Migrations
# ============================================================================
echo "🗄️  Running database migrations..."

# Wait for database to be healthy
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
  if docker compose -f docker-compose.prod.yml exec -T postgres pg_isready -U wise2 -d wise2_prod > /dev/null 2>&1; then
    echo "✓ Database is ready"
    break
  fi
  attempt=$((attempt + 1))
  echo "⏳ Waiting for database... ($attempt/$max_attempts)"
  sleep 2
done

if [ $attempt -eq $max_attempts ]; then
  echo "❌ Database failed to become ready after $max_attempts attempts"
  docker compose -f docker-compose.prod.yml logs postgres
  exit 1
fi

# Run migrations if schema file exists
if [ -f "packages/db/schema.sql" ]; then
  echo "📝 Applying database schema..."
  docker compose -f docker-compose.prod.yml exec -T postgres psql \
    -U wise2 \
    -d wise2_prod \
    -f /docker-entrypoint-initdb.d/01-schema.sql || {
    echo "⚠️ Schema application had errors (may be normal if tables already exist)"
  }
else
  echo "⚠️ Database schema file not found at packages/db/schema.sql"
fi

echo "✅ Database initialization complete"
echo ""

# ============================================================================
# Step 5: Health Checks
# ============================================================================
echo "🏥 Running health checks..."

critical_services=("postgres" "api" "website")
all_healthy=true

for service in "${critical_services[@]}"; do
  container_id=$(docker compose -f docker-compose.prod.yml ps -q $service 2>/dev/null)

  if [ -z "$container_id" ]; then
    echo "❌ $service container not found"
    all_healthy=false
    continue
  fi

  # Check if running
  status=$(docker inspect --format='{{.State.Status}}' "$container_id" 2>/dev/null)
  if [ "$status" != "running" ]; then
    echo "❌ $service is not running (status: $status)"
    all_healthy=false
    continue
  fi

  echo "✓ $service is running"
done

if [ "$all_healthy" = false ]; then
  echo ""
  echo "❌ Some critical services failed to start"
  echo ""
  echo "Service status:"
  docker compose -f docker-compose.prod.yml ps
  echo ""
  echo "Recent logs:"
  docker compose -f docker-compose.prod.yml logs --tail=50
  exit 1
fi

echo ""
echo "✅ All critical services are healthy"
echo ""

# ============================================================================
# Step 6: Display Service URLs
# ============================================================================
echo "✨ WISE² Deployment Complete!"
echo ""
echo "Production Services:"
echo "  📱 Website:        https://wise2.net"
echo "  📊 Dashboard:      https://wise2.net/dashboard"
echo "  🔧 API:            https://api.wise2.net"
echo "  💾 Database:       wise2_prod (PostgreSQL 15)"
echo ""

echo "Local Service Ports (from VPS):"
echo "  website:3001       → https://wise2.net (via nginx)"
echo "  api:3010           → https://api.wise2.net (via nginx)"
echo "  postgres:5432      → wise2_prod database"
echo ""

echo "Verification Commands:"
echo "  View all services: docker compose -f docker-compose.prod.yml ps"
echo "  View logs (api):   docker compose -f docker-compose.prod.yml logs -f api"
echo "  View logs (web):   docker compose -f docker-compose.prod.yml logs -f website"
echo "  View logs (db):    docker compose -f docker-compose.prod.yml logs -f postgres"
echo ""

echo "Common Operations:"
echo "  Stop all:         docker compose -f docker-compose.prod.yml down"
echo "  Restart service:  docker compose -f docker-compose.prod.yml restart api"
echo "  Pull latest:      git pull origin main && ./deploy.sh production"
echo ""

echo "Next Steps:"
echo "  1. Verify: curl https://wise2.net/"
echo "  2. Check dashboard: https://wise2.net/dashboard"
echo "  3. Monitor logs for any errors"
echo "  4. Configure Stripe webhook if needed"
echo ""
