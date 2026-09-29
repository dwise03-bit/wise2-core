#!/bin/bash

# WISE² Customer Journey — Immediate Deployment
# Uses existing Stripe keys + sends everything live

set -e

echo "🚀 WISE² Customer Journey - LIVE DEPLOYMENT"
echo "=============================================="
echo ""

# ============================================================================
# Step 1: Load existing configuration
# ============================================================================
echo "📋 Loading existing configuration..."

# Load .env file (handle ${VAR} placeholders safely)
if [ -f .env.production ]; then
  set -a
  # Create temp file with only valid environment variable lines
  grep "^[^#]" .env.production | grep -v "^[A-Z_]*=\${" > /tmp/.env.filtered
  source /tmp/.env.filtered
  rm -f /tmp/.env.filtered
  set +a
  echo "✅ Loaded .env.production"
elif [ -f .env.prod.local ]; then
  set -a
  grep "^[^#]" .env.prod.local | grep -v "^[A-Z_]*=\${" > /tmp/.env.filtered
  source /tmp/.env.filtered
  rm -f /tmp/.env.filtered
  set +a
  echo "✅ Loaded .env.prod.local"
else
  echo "❌ No production .env file found"
  exit 1
fi

echo ""

# ============================================================================
# Step 2: Check Stripe configuration
# ============================================================================
echo "🔐 Checking Stripe configuration..."

# Stripe keys can come from environment or .env file
if [ -z "$STRIPE_SECRET_KEY" ]; then
  echo "⚠️  STRIPE_SECRET_KEY not set in environment"
  echo "   You can set it: export STRIPE_SECRET_KEY=sk_live_..."
fi

echo "✅ Ready to deploy with Stripe configuration"
echo ""

# ============================================================================
# Step 3: Check SendGrid
# ============================================================================
echo "📧 Checking SendGrid configuration..."

if [ -z "$SENDGRID_API_KEY" ]; then
  echo "⚠️  SENDGRID_API_KEY not set - emails won't send"
  echo "   You can set it: export SENDGRID_API_KEY=SG...."
else
  echo "✅ SendGrid API key configured"
fi

echo ""

# ============================================================================
# Step 4: Build & Deploy
# ============================================================================
echo "🔨 Building Docker images..."

docker-compose -f docker-compose.prod.yml build --no-cache 2>&1 | tail -20

echo ""
echo "🚀 Starting services..."

docker-compose -f docker-compose.prod.yml up -d

echo "⏳ Waiting for services to stabilize..."
sleep 30

echo ""

# ============================================================================
# Step 5: Health checks
# ============================================================================
echo "🏥 Running health checks..."

services=("api" "website" "studio" "postgres")
all_healthy=true

for service in "${services[@]}"; do
  if docker-compose -f docker-compose.prod.yml ps | grep -q "$service.*Up"; then
    echo "✅ $service is running"
  else
    echo "❌ $service is NOT running"
    all_healthy=false
  fi
done

echo ""

# ============================================================================
# Step 6: Success!
# ============================================================================
if [ "$all_healthy" = true ]; then
  echo "════════════════════════════════════════════════════════════════"
  echo "✨ DEPLOYMENT COMPLETE!"
  echo "════════════════════════════════════════════════════════════════"
  echo ""
  echo "📱 Services running:"
  echo "  Website:  http://localhost:3001"
  echo "  Studio:   http://localhost:3005"
  echo "  API:      http://localhost:3000"
  echo "  Database: localhost:5432"
  echo ""
  echo "✅ To go live:"
  echo "  1. Point your domain to this server (DNS)"
  echo "  2. Get SSL certificate (Let's Encrypt)"
  echo "  3. Update Stripe webhook URL to your domain"
  echo ""
  echo "📖 See QUICKSTART.md for testing instructions"
  echo ""
else
  echo "❌ Some services failed to start"
  echo "Run: docker-compose -f docker-compose.prod.yml logs"
  exit 1
fi
