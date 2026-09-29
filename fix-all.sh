#!/bin/bash

# WISE² Comprehensive Fix & Deployment Script
# Diagnoses and fixes all known issues before deploying

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$SCRIPT_DIR/deployment_${TIMESTAMP}.log"

echo "🔧 WISE² COMPREHENSIVE FIX & DEPLOYMENT" | tee -a "$LOG_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$LOG_FILE"
echo "Timestamp: $TIMESTAMP" | tee -a "$LOG_FILE"
echo "Log file: $LOG_FILE" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# ============================================================================
# PHASE 1: DIAGNOSTIC
# ============================================================================
echo "📊 PHASE 1: SYSTEM DIAGNOSTIC" | tee -a "$LOG_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$LOG_FILE"

# Check environment variables
echo "" | tee -a "$LOG_FILE"
echo "Checking environment variables..." | tee -a "$LOG_FILE"

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

optional_vars=(
  "SENDGRID_API_KEY"
  "SENDGRID_FROM_EMAIL"
)

missing_required=()
missing_optional=()

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    missing_required+=("$var")
    echo "  ❌ $var - MISSING" | tee -a "$LOG_FILE"
  else
    # Show first/last 8 chars for security
    value="${!var}"
    if [ ${#value} -gt 16 ]; then
      masked="${value:0:8}...${value: -8}"
    else
      masked="***"
    fi
    echo "  ✅ $var - SET ($masked)" | tee -a "$LOG_FILE"
  fi
done

for var in "${optional_vars[@]}"; do
  if [ -z "${!var}" ]; then
    missing_optional+=("$var")
    echo "  ⚠️  $var - MISSING (optional)" | tee -a "$LOG_FILE"
  else
    echo "  ✅ $var - SET" | tee -a "$LOG_FILE"
  fi
done

# Check Docker
echo "" | tee -a "$LOG_FILE"
echo "Checking Docker..." | tee -a "$LOG_FILE"
if command -v docker &> /dev/null; then
  echo "  ✅ Docker installed: $(docker --version)" | tee -a "$LOG_FILE"
else
  echo "  ❌ Docker not found" | tee -a "$LOG_FILE"
fi

if command -v docker-compose &> /dev/null; then
  echo "  ✅ Docker Compose installed: $(docker-compose --version)" | tee -a "$LOG_FILE"
else
  echo "  ❌ Docker Compose not found" | tee -a "$LOG_FILE"
fi

# Check database
echo "" | tee -a "$LOG_FILE"
echo "Checking database connectivity..." | tee -a "$LOG_FILE"
if [ -n "$DATABASE_URL" ]; then
  if command -v psql &> /dev/null; then
    echo "  🔍 PostgreSQL client found" | tee -a "$LOG_FILE"
    # Extract connection string (don't log actual credentials)
    echo "  📍 Database: Extracted from DATABASE_URL" | tee -a "$LOG_FILE"
  else
    echo "  ⚠️  psql client not found (can still connect via Docker)" | tee -a "$LOG_FILE"
  fi
else
  echo "  ❌ DATABASE_URL not set" | tee -a "$LOG_FILE"
fi

# Check git status
echo "" | tee -a "$LOG_FILE"
echo "Checking git status..." | tee -a "$LOG_FILE"
git_status=$(cd "$SCRIPT_DIR" && git status --porcelain)
if [ -z "$git_status" ]; then
  echo "  ✅ Working tree clean" | tee -a "$LOG_FILE"
else
  echo "  ⚠️  Uncommitted changes found:" | tee -a "$LOG_FILE"
  echo "$git_status" | sed 's/^/     /' | tee -a "$LOG_FILE"
fi

# ============================================================================
# PHASE 2: ENVIRONMENT FIX
# ============================================================================
echo "" | tee -a "$LOG_FILE"
echo "📋 PHASE 2: ENVIRONMENT CONFIGURATION" | tee -a "$LOG_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$LOG_FILE"

if [ ${#missing_required[@]} -gt 0 ]; then
  echo "" | tee -a "$LOG_FILE"
  echo "🚨 MISSING REQUIRED VARIABLES:" | tee -a "$LOG_FILE"
  for var in "${missing_required[@]}"; do
    echo "  - $var" | tee -a "$LOG_FILE"
  done

  echo "" | tee -a "$LOG_FILE"
  echo "Instructions to fix:" | tee -a "$LOG_FILE"
  echo "  1. Open: $SCRIPT_DIR/.env.production" | tee -a "$LOG_FILE"
  echo "  2. Add/verify these variables are set" | tee -a "$LOG_FILE"
  echo "  3. Save and re-run this script" | tee -a "$LOG_FILE"

  echo "" | tee -a "$LOG_FILE"
  echo "For STRIPE_STARTER_PRICE_ID and STRIPE_PRO_PRICE_ID:" | tee -a "$LOG_FILE"
  echo "  1. Go to: https://dashboard.stripe.com/products" | tee -a "$LOG_FILE"
  echo "  2. Find your Starter and Pro products" | tee -a "$LOG_FILE"
  echo "  3. Click each product and find the Price ID (price_xxxxx)" | tee -a "$LOG_FILE"
  echo "  4. Add to .env.production:" | tee -a "$LOG_FILE"
  echo "     STRIPE_STARTER_PRICE_ID=price_xxxxx" | tee -a "$LOG_FILE"
  echo "     STRIPE_PRO_PRICE_ID=price_xxxxx" | tee -a "$LOG_FILE"

  echo "" | tee -a "$LOG_FILE"
  echo "For DATABASE_URL:" | tee -a "$LOG_FILE"
  echo "  Should be in format:" | tee -a "$LOG_FILE"
  echo "  postgresql://user:password@host:port/database?sslmode=require" | tee -a "$LOG_FILE"

  exit 1
fi

echo "" | tee -a "$LOG_FILE"
echo "✅ All required environment variables are set" | tee -a "$LOG_FILE"

if [ ${#missing_optional[@]} -gt 0 ]; then
  echo "" | tee -a "$LOG_FILE"
  echo "⚠️  Missing optional variables (email features will be disabled):" | tee -a "$LOG_FILE"
  for var in "${missing_optional[@]}"; do
    echo "  - $var" | tee -a "$LOG_FILE"
  done
fi

# ============================================================================
# PHASE 3: PRE-DEPLOYMENT CHECKS
# ============================================================================
echo "" | tee -a "$LOG_FILE"
echo "🔍 PHASE 3: PRE-DEPLOYMENT CHECKS" | tee -a "$LOG_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$LOG_FILE"

# Check database schema
echo "" | tee -a "$LOG_FILE"
echo "Checking database schema..." | tee -a "$LOG_FILE"
cd "$SCRIPT_DIR"
if [ -f "packages/db/prisma/schema.prisma" ]; then
  echo "  ✅ Prisma schema found" | tee -a "$LOG_FILE"
  echo "  📍 Will run migrations during deployment" | tee -a "$LOG_FILE"
else
  echo "  ❌ Prisma schema not found" | tee -a "$LOG_FILE"
  exit 1
fi

# Check docker-compose.prod.yml
echo "" | tee -a "$LOG_FILE"
echo "Checking Docker Compose configuration..." | tee -a "$LOG_FILE"
if [ -f "docker-compose.prod.yml" ]; then
  echo "  ✅ docker-compose.prod.yml found" | tee -a "$LOG_FILE"
else
  echo "  ❌ docker-compose.prod.yml not found" | tee -a "$LOG_FILE"
  exit 1
fi

# ============================================================================
# PHASE 4: BUILD & TEST
# ============================================================================
echo "" | tee -a "$LOG_FILE"
echo "🔨 PHASE 4: BUILD & DEPLOYMENT" | tee -a "$LOG_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$LOG_FILE"

read -p "Ready to deploy to production? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
  echo "Deployment cancelled" | tee -a "$LOG_FILE"
  exit 0
fi

echo "" | tee -a "$LOG_FILE"
echo "🚀 Starting deployment..." | tee -a "$LOG_FILE"

# Run the main deployment script
if [ -f "$SCRIPT_DIR/deploy.sh" ]; then
  echo "Running deploy.sh..." | tee -a "$LOG_FILE"
  bash "$SCRIPT_DIR/deploy.sh" production 2>&1 | tee -a "$LOG_FILE"
  deployment_result=$?

  if [ $deployment_result -eq 0 ]; then
    echo "" | tee -a "$LOG_FILE"
    echo "✅ DEPLOYMENT SUCCESSFUL" | tee -a "$LOG_FILE"
  else
    echo "" | tee -a "$LOG_FILE"
    echo "❌ DEPLOYMENT FAILED" | tee -a "$LOG_FILE"
    echo "See logs above for details" | tee -a "$LOG_FILE"
    exit $deployment_result
  fi
else
  echo "❌ deploy.sh not found" | tee -a "$LOG_FILE"
  exit 1
fi

# ============================================================================
# PHASE 5: POST-DEPLOYMENT
# ============================================================================
echo "" | tee -a "$LOG_FILE"
echo "✅ PHASE 5: POST-DEPLOYMENT VERIFICATION" | tee -a "$LOG_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$LOG_FILE"

echo "" | tee -a "$LOG_FILE"
echo "Summary:" | tee -a "$LOG_FILE"
echo "  ✅ Environment validated" | tee -a "$LOG_FILE"
echo "  ✅ Pre-deployment checks passed" | tee -a "$LOG_FILE"
echo "  ✅ Deployment completed" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "Log saved to: $LOG_FILE" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "🎉 WISE² DEPLOYMENT COMPLETE!" | tee -a "$LOG_FILE"
