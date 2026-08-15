#!/bin/bash

##############################################################################
# WISE² Health Check Script
#
# Comprehensive system health diagnostics
#
# Usage:
#   bash pi/scripts/health-check.sh
#   bash pi/scripts/health-check.sh --detailed
#   bash pi/scripts/health-check.sh --json
#
##############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"

# Flags
DETAILED=false
JSON_OUTPUT=false

# Counters
HEALTHY=0
UNHEALTHY=0
WARNINGS=0

# Functions
status_healthy() {
    echo -e "${GREEN}✓${NC} $1"
    HEALTHY=$((HEALTHY + 1))
}

status_unhealthy() {
    echo -e "${RED}✗${NC} $1"
    UNHEALTHY=$((UNHEALTHY + 1))
}

status_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

status_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

check_command() {
    local cmd="$1"
    local name="$2"

    if command -v "$cmd" &> /dev/null; then
        status_healthy "$name is installed"
        return 0
    else
        status_unhealthy "$name is not installed"
        return 1
    fi
}

# Parse arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --detailed)
                DETAILED=true
                shift
                ;;
            --json)
                JSON_OUTPUT=true
                shift
                ;;
            *)
                shift
                ;;
        esac
    done
}

# Check Docker status
check_docker() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    echo -e "${BLUE} Docker & Compose${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"

    # Check Docker
    if docker --version &> /dev/null; then
        status_healthy "Docker: $(docker --version | grep -oP 'Docker version \K[^,]+')"
    else
        status_unhealthy "Docker is not installed"
        return
    fi

    # Check Docker daemon
    if docker ps &> /dev/null; then
        status_healthy "Docker daemon is running"
    else
        status_unhealthy "Docker daemon is not responding"
        return
    fi

    # Check Docker Compose
    if docker-compose --version &> /dev/null; then
        status_healthy "Docker Compose: $(docker-compose --version | grep -oP 'Docker Compose version \K[^,]+')"
    else
        status_warning "Docker Compose v1 may be deprecated"
    fi

    # Check for docker-compose plugin
    if docker compose version &> /dev/null; then
        status_healthy "Docker Compose plugin is available"
    else
        status_warning "Docker Compose plugin is not available"
    fi
}

# Check services
check_services() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    echo -e "${BLUE} Services Status${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"

    cd "$PROJECT_DIR"

    # Get service status
    if ! docker-compose -f pi/docker-compose.yml ps &> /dev/null; then
        status_unhealthy "Cannot access Docker Compose configuration"
        return
    fi

    # Check each service
    local services=(traefik redis api dashboard)

    for service in "${services[@]}"; do
        local state=$(docker-compose -f pi/docker-compose.yml ps -q "$service" 2>/dev/null || echo "")

        if [ -z "$state" ]; then
            status_unhealthy "Service not found: $service"
            continue
        fi

        # Check if container is running
        if docker inspect "$state" --format='{{.State.Running}}' 2>/dev/null | grep -q "true"; then
            status_healthy "Service is running: $service"

            if [ "$DETAILED" = true ]; then
                local uptime=$(docker inspect "$state" --format='{{.State.StartedAt}}' 2>/dev/null)
                status_info "  Started: $uptime"
            fi
        else
            status_unhealthy "Service is not running: $service"
        fi
    done
}

# Check endpoints
check_endpoints() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    echo -e "${BLUE} API Endpoints${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"

    # Check API health
    if curl -sf http://localhost:3000/health > /dev/null 2>&1; then
        status_healthy "API is responding: http://localhost:3000"
    else
        status_unhealthy "API is not responding"
    fi

    # Check Dashboard
    if curl -sf http://localhost:3001 > /dev/null 2>&1; then
        status_healthy "Dashboard is responding: http://localhost:3001"
    else
        status_unhealthy "Dashboard is not responding"
    fi

    # Check Traefik
    if curl -sf http://localhost:8080/api/overview > /dev/null 2>&1; then
        status_healthy "Traefik is responding: http://localhost:8080"
    else
        status_warning "Traefik dashboard is not responding"
    fi

    # Check via mDNS
    if ping -c 1 wise.local &> /dev/null; then
        status_healthy "mDNS hostname is accessible: wise.local"
    else
        status_warning "mDNS hostname not accessible: wise.local"
    fi
}

# Check resources
check_resources() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    echo -e "${BLUE} System Resources${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"

    # CPU usage
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    echo -e "${BLUE}CPU${NC}: ${cpu_usage}% used"
    if (( $(echo "$cpu_usage < 20" | bc -l) )); then
        status_healthy "CPU usage is low"
    elif (( $(echo "$cpu_usage < 50" | bc -l) )); then
        status_info "CPU usage is moderate"
    else
        status_warning "CPU usage is high: ${cpu_usage}%"
    fi

    # Memory usage
    local mem_info=$(free -m | awk 'NR==2')
    local mem_total=$(echo "$mem_info" | awk '{print $2}')
    local mem_used=$(echo "$mem_info" | awk '{print $3}')
    local mem_percent=$(( (mem_used * 100) / mem_total ))

    echo -e "${BLUE}Memory${NC}: ${mem_used}MB / ${mem_total}MB (${mem_percent}%)"
    if [ "$mem_percent" -lt 50 ]; then
        status_healthy "Memory usage is healthy"
    elif [ "$mem_percent" -lt 75 ]; then
        status_info "Memory usage is moderate"
    else
        status_warning "Memory usage is high: ${mem_percent}%"
    fi

    # Docker stats
    if [ "$DETAILED" = true ]; then
        echo ""
        status_info "Container Memory Usage:"
        docker stats --no-stream --format "table {{.Container}}\t{{.MemUsage}}" 2>/dev/null || true
    fi

    # Disk usage
    local disk_info=$(df -h / | awk 'NR==2')
    local disk_used=$(echo "$disk_info" | awk '{print $3}')
    local disk_total=$(echo "$disk_info" | awk '{print $2}')
    local disk_percent=$(echo "$disk_info" | awk '{print $5}' | cut -d'%' -f1)

    echo -e "${BLUE}Disk${NC}: ${disk_used} / ${disk_total} (${disk_percent}%)"
    if [ "$disk_percent" -lt 75 ]; then
        status_healthy "Disk usage is healthy"
    elif [ "$disk_percent" -lt 90 ]; then
        status_warning "Disk usage is high: ${disk_percent}%"
    else
        status_unhealthy "Disk usage is critical: ${disk_percent}%"
    fi
}

# Check logs for errors
check_logs() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    echo -e "${BLUE} Recent Logs (last 10 lines per service)${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"

    if [ "$DETAILED" = true ]; then
        cd "$PROJECT_DIR"

        for service in traefik redis api dashboard; do
            echo ""
            echo -e "${BLUE}$service:${NC}"
            docker-compose -f pi/docker-compose.yml logs --tail=5 "$service" 2>/dev/null || echo "No logs available"
        done
    else
        status_info "Use --detailed flag to see full logs"
    fi
}

# Check database
check_database() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    echo -e "${BLUE} Database${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"

    # Check if database file exists
    if [ -f "$PROJECT_DIR/pi/data/wise2.db" ]; then
        local db_size=$(du -h "$PROJECT_DIR/pi/data/wise2.db" | awk '{print $1}')
        status_healthy "SQLite database exists: $db_size"
    else
        status_warning "SQLite database not found"
    fi
}

# Check Redis
check_redis() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    echo -e "${BLUE} Redis Cache${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"

    # Try to ping Redis
    if docker exec wise2-redis redis-cli -a "${REDIS_PASSWORD}" ping > /dev/null 2>&1; then
        status_healthy "Redis is responding"

        if [ "$DETAILED" = true ]; then
            local mem_used=$(docker exec wise2-redis redis-cli -a "${REDIS_PASSWORD}" info memory 2>/dev/null | grep used_memory_human | cut -d: -f2)
            status_info "  Memory used: $mem_used"
        fi
    else
        status_warning "Cannot connect to Redis"
    fi
}

# Print summary
print_summary() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    echo -e "${BLUE} Summary${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"

    echo -e "${GREEN}✓ Healthy: $HEALTHY${NC}"

    if [ "$WARNINGS" -gt 0 ]; then
        echo -e "${YELLOW}⚠ Warnings: $WARNINGS${NC}"
    fi

    if [ "$UNHEALTHY" -gt 0 ]; then
        echo -e "${RED}✗ Unhealthy: $UNHEALTHY${NC}"
    fi

    echo ""

    if [ "$UNHEALTHY" -eq 0 ]; then
        echo -e "${GREEN}System is healthy!${NC}"
    else
        echo -e "${RED}System has issues that need attention.${NC}"
    fi
}

# Main
main() {
    parse_args "$@"

    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║   WISE² System Health Check                ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"

    check_docker
    check_services
    check_endpoints
    check_resources
    check_database
    check_redis
    check_logs
    print_summary

    echo ""
}

# Run
main "$@"
