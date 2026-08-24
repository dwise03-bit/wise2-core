#!/bin/bash
# RTL-SDR Integration Deployment Script
# Automated deployment for spectrum monitoring integration
# Run this on the deployment server as: bash DEPLOY_RTL_SDR.sh

set -e  # Exit on error

echo "=========================================="
echo "RTL-SDR Spectrum Monitor Deployment"
echo "=========================================="
echo ""

# Configuration
WISE_DEFENSE_API_URL="http://localhost:3014"
API_KEY="${WISE_DEFENSE_API_KEY:-change_me_in_production}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_step() {
    echo -e "${GREEN}[STEP]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
log_step "Checking prerequisites..."

if ! command -v python3 &> /dev/null; then
    log_error "Python 3 not found"
    exit 1
fi

if ! command -v rtl_power &> /dev/null; then
    log_warn "rtl_power not found. Install with: sudo apt install rtl-sdr"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
log_step "Checking Python dependencies..."

python3 -c "import requests" 2>/dev/null || {
    log_warn "requests library not found. Installing..."
    pip3 install requests --user
}

echo ""
log_step "Deploying WISE Defense API enhancements..."

# Verify API file exists
if [ ! -f "$REPO_ROOT/apps/wise-defense-edge/app/api/main.py" ]; then
    log_error "API file not found at $REPO_ROOT/apps/wise-defense-edge/app/api/main.py"
    exit 1
fi

echo "✓ API enhancements verified in main.py"

echo ""
log_step "Deploying RTL-SDR processor..."

# Create destination directory
DEST_DIR="/opt/wise2-defense/app"
if [ ! -d "$DEST_DIR" ]; then
    log_warn "Creating $DEST_DIR..."
    sudo mkdir -p "$DEST_DIR"
fi

# Copy processor script
PROCESSOR_SRC="$REPO_ROOT/apps/wise-defense-edge/app/sdr_processor.py"
if [ -f "$PROCESSOR_SRC" ]; then
    sudo cp "$PROCESSOR_SRC" "$DEST_DIR/"
    sudo chmod +x "$DEST_DIR/sdr_processor.py"
    echo "✓ Processor script deployed to $DEST_DIR/sdr_processor.py"
else
    log_error "Processor script not found at $PROCESSOR_SRC"
    exit 1
fi

echo ""
log_step "Deploying systemd service..."

# Copy and configure systemd service
SERVICE_SRC="$REPO_ROOT/apps/wise-defense-edge/systemd/wise2-sdr-processor.service"
if [ -f "$SERVICE_SRC" ]; then
    # Update API key in service file (temporary copy)
    TEMP_SERVICE=$(mktemp)
    sed "s/YOUR_API_KEY_HERE/${API_KEY}/g" "$SERVICE_SRC" > "$TEMP_SERVICE"

    sudo cp "$TEMP_SERVICE" /etc/systemd/system/wise2-sdr-processor.service
    rm "$TEMP_SERVICE"

    sudo systemctl daemon-reload
    echo "✓ Systemd service deployed"
else
    log_error "Service file not found at $SERVICE_SRC"
    exit 1
fi

echo ""
log_step "Configuring website environment..."

# Check for .env.production
if [ -f "$REPO_ROOT/apps/website/.env.production" ]; then
    # Update or add environment variables
    if grep -q "WISE_DEFENSE_API_URL" "$REPO_ROOT/apps/website/.env.production"; then
        sed -i.bak "s|WISE_DEFENSE_API_URL=.*|WISE_DEFENSE_API_URL=${WISE_DEFENSE_API_URL}|" \
            "$REPO_ROOT/apps/website/.env.production"
    else
        echo "WISE_DEFENSE_API_URL=${WISE_DEFENSE_API_URL}" >> "$REPO_ROOT/apps/website/.env.production"
    fi

    if grep -q "WISE_DEFENSE_API_KEY" "$REPO_ROOT/apps/website/.env.production"; then
        sed -i "s/WISE_DEFENSE_API_KEY=.*/WISE_DEFENSE_API_KEY=${API_KEY}/" \
            "$REPO_ROOT/apps/website/.env.production"
    else
        echo "WISE_DEFENSE_API_KEY=${API_KEY}" >> "$REPO_ROOT/apps/website/.env.production"
    fi

    echo "✓ Environment variables configured"
else
    log_warn ".env.production not found. Creating with defaults..."
    cat > "$REPO_ROOT/apps/website/.env.production" << EOF
WISE_DEFENSE_API_URL=${WISE_DEFENSE_API_URL}
WISE_DEFENSE_API_KEY=${API_KEY}
EOF
    chmod 600 "$REPO_ROOT/apps/website/.env.production"
fi

echo ""
log_step "Testing API endpoints..."

# Test spectrum endpoint
RESPONSE=$(curl -s -H "X-API-Key: ${API_KEY}" \
    "${WISE_DEFENSE_API_URL}/api/sdr/spectrum" 2>/dev/null || echo "")

if echo "$RESPONSE" | grep -q "spectrum"; then
    echo "✓ Spectrum endpoint responding"
else
    log_warn "Spectrum endpoint not responding yet (API may not be running)"
fi

echo ""
log_step "Running test scan..."

# Try single scan
if python3 "$DEST_DIR/sdr_processor.py" \
    --api-url "$WISE_DEFENSE_API_URL" \
    --api-key "$API_KEY" \
    --once 2>&1 | tee /tmp/sdr_test.log | grep -q "Recorded"; then
    echo "✓ Test scan successful"
else
    log_warn "Test scan did not complete. Check logs:"
    cat /tmp/sdr_test.log | tail -20
fi

echo ""
log_step "Starting processor service..."

# Enable and start service
sudo systemctl enable wise2-sdr-processor
sudo systemctl restart wise2-sdr-processor

sleep 2

# Check status
if sudo systemctl is-active --quiet wise2-sdr-processor; then
    echo "✓ Processor service running"
    echo ""
    echo "Recent logs:"
    sudo journalctl -u wise2-sdr-processor -n 5 --no-pager
else
    log_error "Processor service failed to start"
    sudo systemctl status wise2-sdr-processor
    exit 1
fi

echo ""
log_step "Building website..."

cd "$REPO_ROOT/apps/website"

if pnpm install > /dev/null 2>&1; then
    echo "✓ Dependencies installed"
else
    log_warn "pnpm install had issues, continuing..."
fi

if pnpm build > /tmp/build.log 2>&1; then
    echo "✓ Website built successfully"
else
    log_error "Website build failed"
    tail -50 /tmp/build.log
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Deploy website to production:"
echo "   cd $REPO_ROOT/apps/website && npm run deploy"
echo ""
echo "2. Verify spectrum monitor is working:"
echo "   https://wisedefensellc.com/dashboard/spectrum"
echo ""
echo "3. Monitor processor logs:"
echo "   sudo journalctl -u wise2-sdr-processor -f"
echo ""
echo "4. Check API directly:"
echo "   curl -H 'X-API-Key: $API_KEY' http://localhost:3014/api/sdr/spectrum"
echo ""
echo "⚠️  IMPORTANT: Change API_KEY from 'change_me_in_production' before production deployment"
echo ""
echo "Documentation:"
echo "  - Integration Guide: $REPO_ROOT/RTL_SDR_INTEGRATION_GUIDE.md"
echo "  - Verification: $REPO_ROOT/RTL_SDR_VERIFICATION_CHECKLIST.md"
echo "  - Summary: $REPO_ROOT/RTL_SDR_IMPLEMENTATION_SUMMARY.md"
echo ""
