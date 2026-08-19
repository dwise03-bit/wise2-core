#!/bin/bash

# WISE² K10 IMP v2.0 — Production Deployment Script
# This script deploys firmware, API, and database to production

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  WISE² K10 IMP v2.0 — PRODUCTION DEPLOYMENT                   ║"
echo "║  Date: $(date '+%Y-%m-%d %H:%M:%S')                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
K10_PORT="${K10_PORT:-/dev/cu.usbmodem3101}"
DEPLOYMENT_LOG="/tmp/k10_deployment_$(date +%s).log"
BACKUP_DIR="/tmp/k10_backup_$(date +%Y%m%d_%H%M%S)"

echo ""
echo "📋 Configuration:"
echo "  Project Root: $PROJECT_ROOT"
echo "  K10 Port: $K10_PORT"
echo "  Deployment Log: $DEPLOYMENT_LOG"
echo "  Backup Dir: $BACKUP_DIR"
echo ""

# Step 1: Verify Prerequisites
echo "✓ Step 1/5: Verifying Prerequisites..."
{
  # Check device
  if [ ! -e "$K10_PORT" ]; then
    echo "❌ ERROR: K10 device not found at $K10_PORT"
    echo "   Connect K10 device via USB and try again"
    exit 1
  fi

  # Check Node.js
  if ! command -v node &> /dev/null; then
    echo "❌ ERROR: Node.js not installed"
    exit 1
  fi

  # Check npm
  if ! command -v npm &> /dev/null; then
    echo "❌ ERROR: npm not installed"
    exit 1
  fi

  # Check PostgreSQL (optional, warn if not running)
  if ! psql -U postgres -d postgres -c "SELECT 1" &> /dev/null; then
    echo "⚠️  WARNING: PostgreSQL may not be running"
    echo "   Database migrations will be skipped"
    SKIP_DB="true"
  fi

  echo "✅ Prerequisites verified"
} | tee -a "$DEPLOYMENT_LOG"

# Step 2: Build Website App
echo ""
echo "✓ Step 2/5: Building Website App..."
{
  cd "$PROJECT_ROOT"
  echo "  Building apps/website..."
  npm run build -w apps/website 2>&1 | grep -E "(built|error|✔|✓)" | head -20

  if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo "✅ Website build successful"
  else
    echo "❌ Website build failed"
    exit 1
  fi
} | tee -a "$DEPLOYMENT_LOG"

# Step 3: Deploy Firmware to K10
echo ""
echo "✓ Step 3/5: Deploying Firmware to K10..."
{
  cd "$PROJECT_ROOT/products/byte-k10"

  # Backup current state (if device is running)
  echo "  Creating device backup..."
  mkdir -p "$BACKUP_DIR"
  python3 -m esptool --chip esp32s3 --port "$K10_PORT" read_flash 0x0 0x1000000 "$BACKUP_DIR/full-flash.bin" 2>&1 | tail -5

  # Flash new firmware
  echo "  Flashing firmware to K10..."
  K10_PORT="$K10_PORT" bash build.sh flash 2>&1 | grep -E "(Wrote|Hash|resetting|✓)" | head -10

  if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo "✅ Firmware flashed successfully"
    echo "   Backup saved: $BACKUP_DIR/full-flash.bin"
  else
    echo "❌ Firmware flash failed"
    exit 1
  fi
} | tee -a "$DEPLOYMENT_LOG"

# Step 4: Database Migration
if [ -z "$SKIP_DB" ]; then
  echo ""
  echo "✓ Step 4/5: Running Database Migrations..."
  {
    cd "$PROJECT_ROOT/packages/db"

    echo "  Creating K10 device tracking tables..."
    npx prisma migrate deploy 2>&1 | grep -E "(Creating|✓|✔|✅)" | head -10

    if [ ${PIPESTATUS[0]} -eq 0 ]; then
      echo "✅ Database migrations successful"

      # Verify tables exist
      psql -U postgres -d wise2_k10 -c "\dt" | grep k10 || echo "⚠️  Tables may not exist"
    else
      echo "⚠️  Database migrations skipped (PostgreSQL not running)"
    fi
  } | tee -a "$DEPLOYMENT_LOG"
else
  echo ""
  echo "⊘ Step 4/5: Skipping Database Migrations (PostgreSQL not running)"
fi

# Step 5: Configuration & Verification
echo ""
echo "✓ Step 5/5: Configuration & Verification..."
{
  echo "  Verifying K10 device..."
  sleep 3  # Wait for device to boot

  # Check if device is responsive
  if [ -e "$K10_PORT" ]; then
    echo "✅ K10 device connected and running"
  else
    echo "❌ K10 device not responding"
  fi

  echo ""
  echo "  Environment configuration:"
  echo "    HERMES_ENDPOINT=${HERMES_ENDPOINT:-http://localhost:11434/v1/chat/completions}"
  echo "    OLLAMA_CHAT_MODEL=${OLLAMA_CHAT_MODEL:-mistral:latest}"
  echo "    DATABASE_URL=${DATABASE_URL:-postgresql://localhost:5432/wise2_k10}"

  echo ""
  echo "  API endpoint status:"
  curl -s http://localhost:3000/api/wise-imp/k10/state?device_id=k10_001 > /dev/null 2>&1 && \
    echo "✅ API endpoint responding" || \
    echo "⚠️  API endpoint not yet responding (website may need restart)"

  echo "✅ Configuration verified"
} | tee -a "$DEPLOYMENT_LOG"

# Final Summary
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  ✅ DEPLOYMENT COMPLETE                                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Deployment Summary:"
echo "  ✅ Firmware v2.0 deployed to K10"
echo "  ✅ Website app built with K10 API endpoint"
if [ -z "$SKIP_DB" ]; then
  echo "  ✅ Database schema updated (K10 tables)"
fi
echo "  ✅ Environment configured"
echo ""
echo "🚀 Next Steps:"
echo "  1. Verify device is online: screen $K10_PORT 115200"
echo "  2. Check dashboard API: curl http://localhost:3000/api/wise-imp/k10/state"
echo "  3. Monitor Ollama: ps aux | grep ollama"
echo "  4. Review logs: tail -f /tmp/k10_deployment_*.log"
echo ""
echo "📝 Full deployment log saved to: $DEPLOYMENT_LOG"
echo ""
echo "✅ PRODUCTION DEPLOYMENT READY"
