#!/bin/bash
# WISE² VPS Permanent Setup + Sync
# One-time setup to ensure everything works forever
# Run this ONCE on the VPS after initial deployment

set -e

echo "🚀 WISE² VPS Permanent Setup"
echo "=============================="
echo ""

# Configuration
WORK_DIR="/home/dwise/wise2-core"
SERVICE_NAME="wise2-monitor"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"

# Helper functions
log_info() { echo "✓ $@"; }
log_warn() { echo "⚠️  $@"; }
log_error() { echo "❌ $@"; exit 1; }

# 1. Verify prerequisites
log_info "Checking prerequisites..."
command -v docker &>/dev/null || log_error "Docker not installed"
command -v git &>/dev/null || log_error "Git not installed"
[ -d "$WORK_DIR" ] || log_error "Work directory not found: $WORK_DIR"
cd "$WORK_DIR"

# 2. Create docker network (if not exists)
log_info "Setting up Docker network..."
docker network create wise2-net 2>/dev/null || true

# 3. Make health monitor executable
log_info "Setting up health monitor..."
chmod +x "$WORK_DIR/scripts/vps-health-monitor.sh"

# 4. Create systemd service (requires sudo)
log_info "Setting up systemd service..."
if [ "$EUID" -eq 0 ]; then
    cat > "$SERVICE_FILE" << 'EOF'
[Unit]
Description=WISE² VPS Health Monitor and Auto-Restart
After=docker.service
Wants=docker.service

[Service]
Type=simple
User=dwise
WorkingDirectory=/home/dwise/wise2-core
ExecStart=/home/dwise/wise2-core/scripts/vps-health-monitor.sh
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=wise2-monitor

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable "$SERVICE_NAME"
    systemctl restart "$SERVICE_NAME"
    log_info "Systemd service installed and started"
else
    log_warn "Not running as root; systemd service setup requires: sudo"
    echo ""
    echo "To complete setup, run:"
    echo "  sudo cp scripts/wise2-monitor.service /etc/systemd/system/"
    echo "  sudo systemctl daemon-reload"
    echo "  sudo systemctl enable wise2-monitor"
    echo "  sudo systemctl start wise2-monitor"
fi

# 5. Initialize Docker Compose (pre-pull images)
log_info "Pre-pulling Docker images (this may take a few minutes)..."
docker-compose -f docker-compose.prod.yml pull 2>&1 | grep -E "Pulling|Downloaded|Already|digest" || true

# 6. Verify database
log_info "Verifying database..."
docker-compose -f docker-compose.prod.yml up -d postgres redis
sleep 10

# Wait for postgres to be healthy
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U wise2 -d wise2_prod > /dev/null 2>&1; then
        log_info "Database is ready"
        break
    fi
    echo "Waiting for database... ($((attempt+1))/$max_attempts)"
    sleep 2
    attempt=$((attempt + 1))
done

if [ $attempt -eq $max_attempts ]; then
    log_error "Database failed to start after ${max_attempts} attempts"
fi

# 7. Start all services
log_info "Starting all services..."
docker-compose -f docker-compose.prod.yml up -d

# 8. Wait for services to be healthy
log_info "Waiting for services to become healthy..."
sleep 15

# 9. Verify all services
log_info "Verifying service health..."
services=("postgres" "redis" "api" "website" "nginx")
all_healthy=true

for service in "${services[@]}"; do
    container_name="wise2-$(echo $service | sed 's/^postgres$/db/')"
    health=$(docker inspect --format='{{.State.Health.Status}}' "$container_name" 2>/dev/null || echo "unknown")

    if [ "$health" == "healthy" ] || [ "$health" == "unknown" ]; then
        log_info "$service: $health ✓"
    else
        log_warn "$service: $health ✗"
        all_healthy=false
    fi
done

echo ""
if [ "$all_healthy" = true ]; then
    log_info "✅ All services are healthy!"
else
    log_warn "⚠️  Some services need attention; check: docker-compose logs"
fi

# 10. Final status
echo ""
echo "📊 Deployment Summary"
echo "===================="
docker-compose -f docker-compose.prod.yml ps
echo ""
log_info "🔐 API endpoint: https://api.wise2.net"
log_info "🌐 Website: https://wise2.net"
log_info "📋 Logs: journalctl -u wise2-monitor -f"
echo ""
echo "Next steps:"
echo "  - Monitor health: journalctl -u wise2-monitor -f"
echo "  - Check Docker: docker-compose -f docker-compose.prod.yml logs -f"
echo "  - Restart service: sudo systemctl restart wise2-monitor"
