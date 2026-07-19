#!/bin/bash
set -e

echo "🚀 WISE² Production Deployment Script"
echo "======================================"

# Configuration
REPO_PATH="/home/dwise/wise2-core"
COMPOSE_FILE="docker-compose.production.yml"
NGINX_CONF="/etc/nginx/sites-available/wise2.net"
BACKUP_DIR="/home/dwise/backups/$(date +%Y%m%d-%H%M%S)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}ℹ${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# Step 1: Backup current state
log_info "Step 1: Backing up current state..."
mkdir -p "$BACKUP_DIR"
docker-compose -f docker-compose.prod.yml config > "$BACKUP_DIR/docker-compose-backup.yml" 2>/dev/null || true
cp "$NGINX_CONF" "$BACKUP_DIR/nginx-backup.conf" 2>/dev/null || true
log_info "Backup saved to: $BACKUP_DIR"

# Step 2: Pull latest code
log_info "Step 2: Pulling latest code from GitHub..."
cd "$REPO_PATH"
git fetch origin main
git reset --hard origin/main

# Step 3: Build all Docker images
log_info "Step 3: Building Docker images..."
docker build -f apps/website/Dockerfile -t wise2-website:latest . 2>&1 | tail -5
docker build -f apps/dashboard/Dockerfile -t wise2-dashboard:latest . 2>&1 | tail -5
docker build -f apps/admin/Dockerfile -t wise2-admin:latest . 2>&1 | tail -5
docker build -f apps/studio/Dockerfile -t wise2-studio:latest . 2>&1 | tail -5
docker build -f packages/api/Dockerfile -t wise2-api:latest . 2>&1 | tail -5
log_info "All Docker images built successfully"

# Step 4: Stop old containers
log_info "Step 4: Stopping old containers..."
docker-compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true
docker rm -f wise2-website-prod wise2-dashboard-prod wise2-admin-prod wise2-studio-prod wise2-api-prod 2>/dev/null || true

# Step 5: Update nginx configuration
log_info "Step 5: Updating nginx configuration..."
sudo cp infrastructure/nginx/wise2.net.conf "$NGINX_CONF"
sudo nginx -t && sudo systemctl reload nginx
log_info "Nginx configuration updated"

# Step 6: Start all services with new compose file
log_info "Step 6: Starting all services..."
docker-compose -f "$COMPOSE_FILE" up -d

# Step 7: Wait for services to be healthy
log_info "Step 7: Waiting for services to become healthy..."
for i in {1..60}; do
    if docker ps | grep -q wise2-website-prod && \
       docker ps | grep -q wise2-dashboard-prod && \
       docker ps | grep -q wise2-admin-prod && \
       docker ps | grep -q wise2-studio-prod && \
       docker ps | grep -q wise2-api-prod; then
        log_info "All services are running"
        break
    fi
    echo -n "."
    sleep 2
done

# Step 8: Health checks
log_info "Step 8: Running health checks..."
sleep 10

check_endpoint() {
    local url=$1
    local name=$2
    if curl -sf "$url" > /dev/null 2>&1; then
        log_info "✓ $name is healthy"
        return 0
    else
        log_warn "✗ $name is not responding yet"
        return 1
    fi
}

check_endpoint "http://localhost:3011" "Website"
check_endpoint "http://localhost:3002" "Dashboard"
check_endpoint "http://localhost:3003" "Admin"
check_endpoint "http://localhost:3005" "Studio"
check_endpoint "http://localhost:3010/api/health" "API"
check_endpoint "http://localhost:3100" "Grafana"

# Step 9: Verify containers
log_info "Step 9: Container status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep wise2

# Step 10: Display summary
log_info "Step 10: Deployment Summary"
echo ""
echo "✓ Deployment complete!"
echo ""
echo "Services:"
echo "  • Website:  https://wise2.net"
echo "  • Dashboard: https://dashboard.wise2.net"
echo "  • Admin:    https://admin.wise2.net"
echo "  • Studio:   https://studio.wise2.net"
echo "  • API:      https://api.wise2.net"
echo "  • Grafana:  https://grafana.wise2.net"
echo ""
echo "Backup location: $BACKUP_DIR"
echo ""

log_info "🎉 WISE² is now live and ready to make money!"
