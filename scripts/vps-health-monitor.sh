#!/bin/bash
# WISE² VPS Health Monitor + Auto-Restart
# Runs on VPS via systemd service. Ensures all containers stay healthy.
# Usage: ./scripts/vps-health-monitor.sh (runs continuously, logs to systemd journal)

set -e

WORK_DIR="/home/dwise/wise2-core"
COMPOSE_FILE="$WORK_DIR/docker-compose.prod.yml"
LOG_LEVEL="INFO"
CHECK_INTERVAL=30  # seconds

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    local level=$1
    shift
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$level] $@"
}

health_check() {
    local container=$1
    local health_status=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "unknown")

    case "$health_status" in
        healthy)
            return 0
            ;;
        unhealthy)
            log "ERROR" "Container $container is unhealthy"
            return 1
            ;;
        starting)
            log "WARN" "Container $container is starting..."
            return 2
            ;;
        *)
            # Container missing or Docker error
            return 1
            ;;
    esac
}

restart_container() {
    local container=$1
    log "WARN" "Restarting container: $container"
    cd "$WORK_DIR"
    docker-compose -f "$COMPOSE_FILE" restart "$container" 2>&1 | tail -5
    sleep 5
    health_check "$container"
    if [ $? -eq 0 ]; then
        log "INFO" "✅ Container $container recovered"
        return 0
    else
        log "ERROR" "❌ Container $container failed to recover"
        return 1
    fi
}

check_all_services() {
    cd "$WORK_DIR"

    # Core services (order matters for dependencies)
    local services=("wise2-db" "wise2-redis" "wise2-api" "wise2-website" "wise2-nginx")
    local failed=0

    for service in "${services[@]}"; do
        if ! health_check "$service"; then
            log "WARN" "Attempting recovery for $service..."
            if ! restart_container "$service"; then
                failed=$((failed + 1))
            fi
        else
            log "DEBUG" "✅ $service healthy"
        fi
    done

    if [ $failed -gt 0 ]; then
        log "ERROR" "⚠️  $failed service(s) unhealthy after recovery attempts"
        return 1
    fi

    return 0
}

verify_connections() {
    # Check that API can reach database
    log "INFO" "Verifying service connections..."

    # API health check
    if curl -sf http://127.0.0.1:3010/api/health > /dev/null 2>&1; then
        log "DEBUG" "✅ API health endpoint responding"
    else
        log "WARN" "⚠️  API health endpoint not responding"
        restart_container "wise2-api"
    fi

    # Website health check
    if curl -sf http://127.0.0.1:3011/ > /dev/null 2>&1; then
        log "DEBUG" "✅ Website responding"
    else
        log "WARN" "⚠️  Website not responding"
        restart_container "wise2-website"
    fi
}

main() {
    log "INFO" "🚀 WISE² Health Monitor starting (interval: ${CHECK_INTERVAL}s)"

    while true; do
        if check_all_services; then
            verify_connections
            log "INFO" "✅ All systems healthy"
        else
            log "ERROR" "⚠️  System degradation detected; review logs above"
        fi

        sleep "$CHECK_INTERVAL"
    done
}

# Handle signals
trap 'log "INFO" "Shutting down health monitor"; exit 0' SIGTERM SIGINT

main
