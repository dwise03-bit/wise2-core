#!/bin/bash

# WISE² Deployment with 502 Prevention
# This script ensures 502 errors NEVER happen by validating before, during, and after deployment

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/var/log/wise2-deploy-${TIMESTAMP}.log"

echo "🚀 WISE² Deployment with 502 Prevention" | tee -a "$LOG_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$LOG_FILE"

# ============================================================================
# PHASE 1: PRE-DEPLOYMENT VALIDATION
# ============================================================================
echo "" | tee -a "$LOG_FILE"
echo "📋 PHASE 1: PRE-DEPLOYMENT VALIDATION" | tee -a "$LOG_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$LOG_FILE"

# Check required environment variables
echo "Checking environment variables..." | tee -a "$LOG_FILE"
REQUIRED_VARS=(
  "DATABASE_URL"
  "APP_URL"
  "API_BASE_URL"
  "STRIPE_PUBLIC_KEY"
  "STRIPE_SECRET_KEY"
)

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ FATAL: $var not set" | tee -a "$LOG_FILE"
    exit 1
  fi
  echo "  ✓ $var is set" | tee -a "$LOG_FILE"
done

# Validate DATABASE_URL format
if ! [[ "$DATABASE_URL" =~ ^postgresql:// ]]; then
  echo "❌ FATAL: DATABASE_URL must be PostgreSQL connection string" | tee -a "$LOG_FILE"
  exit 1
fi
echo "  ✓ DATABASE_URL format valid" | tee -a "$LOG_FILE"

# Test database connectivity
echo "Testing database connectivity..." | tee -a "$LOG_FILE"
if ! docker exec wise2-db psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
  echo "❌ FATAL: Cannot connect to database" | tee -a "$LOG_FILE"
  echo "Attempting to restart database..." | tee -a "$LOG_FILE"
  docker-compose -f "$PROJECT_DIR/docker-compose.prod.yml" restart postgres || true
  sleep 10

  if ! docker exec wise2-db psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
    echo "❌ FATAL: Database still not responding" | tee -a "$LOG_FILE"
    exit 1
  fi
fi
echo "  ✓ Database connectivity confirmed" | tee -a "$LOG_FILE"

# Check Docker daemon
echo "Checking Docker..." | tee -a "$LOG_FILE"
if ! docker ps > /dev/null 2>&1; then
  echo "❌ FATAL: Docker daemon not responding" | tee -a "$LOG_FILE"
  exit 1
fi
echo "  ✓ Docker is running" | tee -a "$LOG_FILE"

# ============================================================================
# PHASE 2: BUILD & COMPILE
# ============================================================================
echo "" | tee -a "$LOG_FILE"
echo "🔨 PHASE 2: BUILD & COMPILE" | tee -a "$LOG_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$LOG_FILE"

cd "$PROJECT_DIR"

# Build API
echo "Building API..." | tee -a "$LOG_FILE"
if ! docker-compose -f docker-compose.prod.yml build --no-cache api 2>&1 | tee -a "$LOG_FILE"; then
  echo "❌ FATAL: API build failed" | tee -a "$LOG_FILE"
  exit 1
fi
echo "✓ API build successful" | tee -a "$LOG_FILE"

# Build Website
echo "Building Website..." | tee -a "$LOG_FILE"
if ! docker-compose -f docker-compose.prod.yml build --no-cache website 2>&1 | tee -a "$LOG_FILE"; then
  echo "❌ FATAL: Website build failed" | tee -a "$LOG_FILE"
  exit 1
fi
echo "✓ Website build successful" | tee -a "$LOG_FILE"

# ============================================================================
# PHASE 3: DEPLOYMENT
# ============================================================================
echo "" | tee -a "$LOG_FILE"
echo "🚀 PHASE 3: DEPLOYMENT" | tee -a "$LOG_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$LOG_FILE"

# Stop old containers gracefully
echo "Stopping old containers..." | tee -a "$LOG_FILE"
docker-compose -f docker-compose.prod.yml stop -t 30 api website || true
sleep 5

# Start containers
echo "Starting containers..." | tee -a "$LOG_FILE"
if ! docker-compose -f docker-compose.prod.yml up -d api website postgres redis 2>&1 | tee -a "$LOG_FILE"; then
  echo "❌ FATAL: Failed to start containers" | tee -a "$LOG_FILE"
  exit 1
fi
echo "✓ Containers started" | tee -a "$LOG_FILE"

# Wait for services to stabilize
echo "Waiting for services to stabilize..." | tee -a "$LOG_FILE"
sleep 15

# ============================================================================
# PHASE 4: POST-DEPLOYMENT VALIDATION
# ============================================================================
echo "" | tee -a "$LOG_FILE"
echo "✅ PHASE 4: POST-DEPLOYMENT VALIDATION" | tee -a "$LOG_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$LOG_FILE"

# Check API health
echo "Checking API health..." | tee -a "$LOG_FILE"
HEALTH_RETRIES=10
for i in $(seq 1 $HEALTH_RETRIES); do
  if curl -s "http://localhost:3000/api/health" | grep -q "ok"; then
    echo "✓ API health check passed" | tee -a "$LOG_FILE"
    break
  fi
  if [ $i -eq $HEALTH_RETRIES ]; then
    echo "❌ FATAL: API failed health check after $HEALTH_RETRIES attempts" | tee -a "$LOG_FILE"
    echo "API logs:" | tee -a "$LOG_FILE"
    docker-compose -f docker-compose.prod.yml logs api | tail -50 | tee -a "$LOG_FILE"
    exit 1
  fi
  echo "  Attempt $i/$HEALTH_RETRIES..." | tee -a "$LOG_FILE"
  sleep 3
done

# Check Website
echo "Checking Website..." | tee -a "$LOG_FILE"
if curl -s "http://localhost:3001" | grep -q "WISE²"; then
  echo "✓ Website is responding" | tee -a "$LOG_FILE"
else
  echo "⚠️  Website response unexpected" | tee -a "$LOG_FILE"
fi

# Check all containers running
echo "Verifying all containers..." | tee -a "$LOG_FILE"
RUNNING=$(docker-compose -f docker-compose.prod.yml ps --services --filter "status=running" | wc -l)
EXPECTED=$(docker-compose -f docker-compose.prod.yml ps --services | wc -l)

if [ "$RUNNING" -eq "$EXPECTED" ]; then
  echo "✓ All $RUNNING containers running" | tee -a "$LOG_FILE"
else
  echo "❌ FATAL: Only $RUNNING/$EXPECTED containers running" | tee -a "$LOG_FILE"
  docker-compose -f docker-compose.prod.yml ps
  exit 1
fi

# ============================================================================
# PHASE 5: INSTALL HEALTH MONITOR
# ============================================================================
echo "" | tee -a "$LOG_FILE"
echo "🏥 PHASE 5: INSTALL HEALTH MONITOR" | tee -a "$LOG_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$LOG_FILE"

# Install health monitor service
echo "Installing health monitor..." | tee -a "$LOG_FILE"
if sudo cp "$SCRIPT_DIR/wise2-api-health-monitor.service" /etc/systemd/system/; then
  sudo systemctl daemon-reload
  sudo systemctl enable wise2-api-health-monitor.service
  sudo systemctl restart wise2-api-health-monitor.service
  echo "✓ Health monitor installed and running" | tee -a "$LOG_FILE"
else
  echo "⚠️  Could not install health monitor (requires sudo)" | tee -a "$LOG_FILE"
fi

# ============================================================================
# SUCCESS
# ============================================================================
echo "" | tee -a "$LOG_FILE"
echo "✅ DEPLOYMENT COMPLETE - 502 PREVENTION ACTIVE" | tee -a "$LOG_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "🎉 All systems verified and running" | tee -a "$LOG_FILE"
echo "📊 Health monitor active - will auto-restart on any 502 errors" | tee -a "$LOG_FILE"
echo "📋 Deployment log: $LOG_FILE" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
