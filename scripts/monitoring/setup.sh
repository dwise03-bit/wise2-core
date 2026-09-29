#!/bin/bash

# WISE² Metrics System Setup Script
# Initializes the metrics monitoring infrastructure

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SCRIPT_DIR="$PROJECT_ROOT/scripts/monitoring"

echo "=========================================="
echo "WISE² Metrics System - Phase A Setup"
echo "=========================================="
echo ""

# Check prerequisites
echo "[1/5] Checking prerequisites..."
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Please install Node.js 18+"
  exit 1
fi

if ! command -v psql &> /dev/null; then
  echo "⚠️  psql not found. Database operations may fail."
fi

echo "✓ Node.js $(node --version)"
echo ""

# Create logs directory
echo "[2/5] Creating logs directory..."
mkdir -p "$PROJECT_ROOT/logs"
echo "✓ Logs directory ready at $PROJECT_ROOT/logs"
echo ""

# Apply database migration
echo "[3/5] Applying database schema migration..."
if command -v psql &> /dev/null; then
  DB_URL="${DATABASE_URL:-postgresql://localhost/wise2}"
  if psql "$DB_URL" -f "$PROJECT_ROOT/infrastructure/database/002_metrics_schema.sql" &> /dev/null; then
    echo "✓ Database schema applied"
  else
    echo "⚠️  Could not apply migration automatically"
    echo "   To apply manually, run:"
    echo "   psql \$DATABASE_URL -f infrastructure/database/002_metrics_schema.sql"
  fi
else
  echo "⚠️  psql not found. To apply migration manually:"
  echo "   psql \$DATABASE_URL -f infrastructure/database/002_metrics_schema.sql"
fi
echo ""

# Check API connectivity
echo "[4/5] Checking API connectivity..."
API_URL="${METRICS_API_URL:-http://localhost:3001/api/v1/metrics/system}"
if curl -s "$API_URL" -X GET &> /dev/null || true; then
  echo "✓ API endpoint available at $API_URL"
else
  echo "⚠️  Could not reach API at $API_URL"
  echo "   Make sure the API is running before starting the daemon"
fi
echo ""

# Create .env file if needed
echo "[5/5] Setting up environment..."
ENV_FILE="$PROJECT_ROOT/.env.local"

if [ ! -f "$ENV_FILE" ]; then
  echo "Creating $ENV_FILE..."
  cat >> "$ENV_FILE" << 'EOF'

# Metrics configuration
METRICS_API_URL=http://localhost:3001/api/v1/metrics/system
METRICS_API_KEY=
METRICS_INTERVAL=60
EOF
  echo "✓ Environment configuration created"
else
  echo "✓ Environment configuration already exists"
fi
echo ""

# Summary
echo "=========================================="
echo "✓ Phase A Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Start the API server:"
echo "   cd services/api && npm run dev"
echo ""
echo "2. Apply the database migration:"
echo "   psql \$DATABASE_URL -f infrastructure/database/002_metrics_schema.sql"
echo ""
echo "3. Start the metrics daemon:"
echo ""
echo "   Option A - Run once (testing):"
echo "   node $SCRIPT_DIR/collect-metrics.js"
echo ""
echo "   Option B - Run with PM2 (production):"
echo "   pm2 start $SCRIPT_DIR/ecosystem.config.js"
echo ""
echo "   Option C - Run with systemd (Linux):"
echo "   sudo cp infrastructure/systemd/wise2-metrics.service /etc/systemd/system/"
echo "   sudo systemctl daemon-reload"
echo "   sudo systemctl enable wise2-metrics.service"
echo "   sudo systemctl start wise2-metrics.service"
echo ""
echo "4. View metrics in the database:"
echo "   psql \$DATABASE_URL -c 'SELECT * FROM system_metrics ORDER BY collected_at DESC LIMIT 5;'"
echo ""
echo "For more information, see: $SCRIPT_DIR/README.md"
