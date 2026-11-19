#!/usr/bin/env bash
# WISE² Server Migration Script
# Migrates from old VPS (173.208.147.165) to new server (100.109.230.122)
# Run this from your local machine with Tailscale + SSH access

set -euo pipefail

# Configuration
OLD_SERVER="173.208.147.165"
NEW_SERVER="100.109.230.122"
SSH_USER="dwise"
NEW_HOSTNAME="wise2"
NEW_LAN_IP="192.168.8.191"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=====================================${NC}"
echo -e "${YELLOW}WISE² Server Migration${NC}"
echo -e "${YELLOW}From: ${OLD_SERVER}${NC}"
echo -e "${YELLOW}To:   ${NEW_SERVER}${NC}"
echo -e "${YELLOW}=====================================${NC}"
echo ""

# Function to print step
step() {
    echo -e "${GREEN}[STEP $1]${NC} $2"
}

# Function to print error
error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Function to print warning
warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# ============================================================================
# PHASE 1: Verify Connectivity
# ============================================================================

step 1 "Verifying Tailscale connectivity..."

# Check if Tailscale is running
if ! command -v tailscale &> /dev/null; then
    error "Tailscale not found. Please install from https://tailscale.com/download"
fi

# Check Tailscale status
if ! tailscale status &> /dev/null; then
    error "Tailscale is not connected. Please run: tailscale up"
fi

echo "✓ Tailscale connected"

# Test SSH to new server
step 1 "Testing SSH to new server (${NEW_SERVER})..."
if ! ssh -o ConnectTimeout=5 "${SSH_USER}@${NEW_SERVER}" "echo OK" &> /dev/null; then
    error "Cannot SSH to ${NEW_SERVER}. Verify Tailscale connectivity: tailscale status"
fi

echo "✓ SSH connection successful"

# ============================================================================
# PHASE 2: Verify New Server State
# ============================================================================

step 2 "Checking new server configuration..."

NEW_SERVER_INFO=$(ssh "${SSH_USER}@${NEW_SERVER}" "uname -a")
echo "   OS: $(echo $NEW_SERVER_INFO | awk '{print $1, $2}')"

DOCKER_STATUS=$(ssh "${SSH_USER}@${NEW_SERVER}" "docker ps -q 2>/dev/null | wc -l")
echo "   Docker containers running: ${DOCKER_STATUS}"

DISK_USAGE=$(ssh "${SSH_USER}@${NEW_SERVER}" "df -h / | tail -1 | awk '{print \$5}'")
echo "   Disk usage: ${DISK_USAGE}"

# ============================================================================
# PHASE 3: Verify Git Repository
# ============================================================================

step 3 "Verifying git repository on new server..."

if ! ssh "${SSH_USER}@${NEW_SERVER}" "test -d /home/dwise/wise2-core/.git"; then
    warn "Git repository not found on new server"
    echo "   Cloning repository..."
    ssh "${SSH_USER}@${NEW_SERVER}" "cd /home/dwise && git clone https://github.com/dwise03-bit/wise2-core.git"
else
    echo "✓ Git repository exists"
    LATEST_COMMIT=$(ssh "${SSH_USER}@${NEW_SERVER}" "cd /home/dwise/wise2-core && git log --oneline -1")
    echo "   Latest commit: ${LATEST_COMMIT}"
fi

# ============================================================================
# PHASE 4: Update GitHub Secrets (Manual)
# ============================================================================

step 4 "⚠️  MANUAL STEP: Update GitHub Secrets"
echo ""
echo "   Please update the following GitHub secrets:"
echo "   URL: https://github.com/dwise03-bit/wise2-core/settings/secrets/actions"
echo ""
echo "   1. DEPLOY_HOST:"
echo "      Old: ${OLD_SERVER}"
echo "      New: ${NEW_SERVER}"
echo ""
echo "   2. DEPLOY_USER: ${SSH_USER} (should remain unchanged)"
echo "   3. DEPLOY_KEY: (verify it works with Tailscale SSH)"
echo ""

read -p "   Press ENTER when secrets are updated... "

# ============================================================================
# PHASE 5: Fetch Latest Code
# ============================================================================

step 5 "Fetching latest code on new server..."

ssh "${SSH_USER}@${NEW_SERVER}" "cd /home/dwise/wise2-core && git fetch origin main && git reset --hard origin/main"

echo "✓ Repository updated to latest main"

# ============================================================================
# PHASE 6: Deploy Services
# ============================================================================

step 6 "Deploying services to new server..."

ssh "${SSH_USER}@${NEW_SERVER}" << 'DEPLOY_SCRIPT'
set -e
cd /home/dwise/wise2-core

echo "Building Docker images..."
docker compose -f docker-compose.prod.yml build

echo "Starting services..."
docker compose -f docker-compose.prod.yml up -d

echo "Waiting for services to stabilize (10 seconds)..."
sleep 10

echo "Checking service health..."
docker compose -f docker-compose.prod.yml ps
DEPLOY_SCRIPT

echo "✓ Services deployed"

# ============================================================================
# PHASE 7: Verify Services
# ============================================================================

step 7 "Verifying services on new server..."

# Wait a bit for services to fully start
sleep 5

# Check API health
if ssh "${SSH_USER}@${NEW_SERVER}" "curl -sf http://localhost:3000/api/health > /dev/null"; then
    echo "✓ API (port 3000) is healthy"
else
    warn "API health check failed - services may still be starting"
fi

# Check website
if ssh "${SSH_USER}@${NEW_SERVER}" "curl -sf http://localhost:3001/ > /dev/null"; then
    echo "✓ Website (port 3001) is healthy"
else
    warn "Website health check failed - services may still be starting"
fi

# ============================================================================
# PHASE 8: Final Verification
# ============================================================================

step 8 "Final verification checklist..."

echo ""
echo "   ✓ SSH connectivity verified"
echo "   ✓ New server state verified"
echo "   ✓ Git repository updated"
echo "   ✓ GitHub secrets updated"
echo "   ✓ Services deployed"
echo ""

# ============================================================================
# PHASE 9: Post-Migration Steps
# ============================================================================

step 9 "Post-migration steps (manual):"

echo ""
echo "   1. Verify DNS (if needed):"
echo "      Public IP of new server:"
ssh "${SSH_USER}@${NEW_SERVER}" "curl -s ifconfig.me" || echo "      (could not determine)"
echo ""
echo "   2. Update DNS records for wise2.net if public IP changed"
echo ""
echo "   3. Test public access:"
echo "      curl -I https://wise2.net"
echo ""
echo "   4. Monitor logs:"
echo "      ssh ${SSH_USER}@${NEW_SERVER} \"docker compose -f docker-compose.prod.yml logs -f\""
echo ""
echo "   5. Decommission old server (when confident):"
echo "      ssh ${SSH_USER}@${OLD_SERVER} \"docker compose -f docker-compose.prod.yml down\""
echo ""

# ============================================================================
# Summary
# ============================================================================

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}✓ Migration Complete!${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""
echo "New server: ${NEW_SERVER} (${NEW_HOSTNAME})"
echo "SSH: ssh ${SSH_USER}@${NEW_SERVER}"
echo "Status: docker ps on new server"
echo ""
echo "Next: Monitor GitHub Actions for auto-deployment on next push"
echo ""
