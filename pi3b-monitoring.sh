#!/bin/bash
#
# WISE² Edge - Comprehensive Monitoring Script for Raspberry Pi 3B
# Usage: ./pi3b-monitoring.sh [start|stop|status|health|metrics|logs]
#

set -e

COMPOSE_FILE="/opt/wise2-edge/docker-compose.pi3b.yml"
HEALTH_CHECK_LOG="/var/log/wise2-edge-appliance/health-check.log"
METRICS_LOG="/var/log/wise2-edge-appliance/metrics.log"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Monitoring functions
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_ok() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Container status check
check_container_status() {
    print_header "Container Status"

    cd $COMPOSE_FILE/../
    docker-compose -f $COMPOSE_FILE ps

    # Check if all containers are healthy
    local unhealthy=$(docker-compose -f $COMPOSE_FILE ps --filter "status=unhealthy" -q)
    local exited=$(docker-compose -f $COMPOSE_FILE ps --filter "status=exited" -q)

    if [ -z "$unhealthy" ] && [ -z "$exited" ]; then
        print_ok "All containers healthy"
    else
        if [ ! -z "$unhealthy" ]; then
            print_error "Unhealthy containers detected"
        fi
        if [ ! -z "$exited" ]; then
            print_error "Exited containers detected"
        fi
    fi
}

# API health check
check_api_health() {
    print_header "API Health"

    local response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)

    if [ "$response" = "200" ]; then
        print_ok "Health endpoint responding (HTTP $response)"

        # Get detailed health status
        echo ""
        echo "Detailed Status:"
        curl -s http://localhost:3000/health | jq . 2>/dev/null || curl -s http://localhost:3000/health
    else
        print_error "Health endpoint not responding (HTTP $response)"
        return 1
    fi
}

# System resources check
check_system_resources() {
    print_header "System Resources"

    # Temperature
    local temp=$(vcgencmd measure_temp 2>/dev/null || echo "N/A")
    echo "Temperature: $temp"
    if [[ $temp =~ ([0-9.]+) ]]; then
        local temp_val="${BASH_REMATCH[1]}"
        if (( $(echo "$temp_val > 80" | bc -l) )); then
            print_warn "High temperature detected (>${temp_val}°C)"
        elif (( $(echo "$temp_val > 75" | bc -l) )); then
            print_warn "Temperature elevated (${temp_val}°C)"
        else
            print_ok "Temperature normal (${temp_val}°C)"
        fi
    fi

    # Memory usage
    echo ""
    local mem=$(free -h | grep "^Mem:")
    echo "Memory: $mem"

    local swap=$(free -h | grep "^Swap:")
    echo "Swap: $swap"

    local mem_used=$(free | grep "^Mem:" | awk '{print $3}')
    local mem_total=$(free | grep "^Mem:" | awk '{print $2}')
    local mem_percent=$((mem_used * 100 / mem_total))

    if [ $mem_percent -gt 80 ]; then
        print_error "High memory usage: ${mem_percent}%"
    elif [ $mem_percent -gt 70 ]; then
        print_warn "Memory usage elevated: ${mem_percent}%"
    else
        print_ok "Memory usage normal: ${mem_percent}%"
    fi

    # Disk usage
    echo ""
    local disk=$(df -h / | tail -1)
    echo "Disk (/): $disk"

    local disk_used=$(df / | tail -1 | awk '{print $3}')
    local disk_total=$(df / | tail -1 | awk '{print $2}')
    local disk_percent=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')

    if [ $disk_percent -gt 90 ]; then
        print_error "Critical disk usage: ${disk_percent}%"
    elif [ $disk_percent -gt 80 ]; then
        print_warn "High disk usage: ${disk_percent}%"
    else
        print_ok "Disk usage normal: ${disk_percent}%"
    fi

    # CPU info
    echo ""
    local cpu_model=$(grep -m 1 "model name" /proc/cpuinfo | cut -d: -f2 | xargs)
    local cpu_count=$(grep -c "processor" /proc/cpuinfo)
    echo "CPU: $cpu_model (${cpu_count} cores)"

    local uptime=$(uptime | awk '{print $1}')
    echo "Uptime: $uptime"

    # Load average
    local load=$(uptime | grep -oP 'load average: \K.*')
    echo "Load Average: $load"
}

# Docker resource usage
check_docker_resources() {
    print_header "Docker Resource Usage"

    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
}

# Network connectivity check
check_network() {
    print_header "Network Connectivity"

    # Local network
    if ping -c 1 -W 2 192.168.1.1 > /dev/null 2>&1; then
        print_ok "Local gateway reachable"
    else
        print_error "Local gateway unreachable"
    fi

    # Internet connectivity
    if ping -c 1 -W 2 8.8.8.8 > /dev/null 2>&1; then
        print_ok "Internet accessible"
    else
        print_error "Internet not accessible"
    fi

    # DNS resolution
    if nslookup google.com > /dev/null 2>&1; then
        print_ok "DNS resolution working"
    else
        print_error "DNS resolution failed"
    fi

    # Check local services
    echo ""
    echo "Service Connectivity:"
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|301"; then
        print_ok "Edge API (port 3000) reachable"
    else
        print_error "Edge API (port 3000) unreachable"
    fi

    if curl -s -o /dev/null -w "%{http_code}" http://localhost:11434 | grep -q "200\|301"; then
        print_ok "Ollama (port 11434) reachable"
    else
        print_error "Ollama (port 11434) unreachable"
    fi
}

# Detailed logs check
check_logs() {
    print_header "Recent Logs (Last 20 lines)"

    echo -e "\n${BLUE}Edge Runtime Logs:${NC}"
    docker-compose -f $COMPOSE_FILE logs --tail 20 edge-runtime 2>/dev/null || echo "Logs unavailable"

    echo -e "\n${BLUE}Searching for Errors:${NC}"
    docker-compose -f $COMPOSE_FILE logs 2>/dev/null | grep -i error | tail -5 || echo "No errors found"
}

# Full health report
generate_health_report() {
    print_header "WISE² Edge - Full Health Report"

    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "Generated: $timestamp"
    echo ""

    # Quick status
    local api_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)
    if [ "$api_response" = "200" ]; then
        echo -e "${GREEN}Overall Status: HEALTHY${NC}"
    else
        echo -e "${RED}Overall Status: UNHEALTHY${NC}"
    fi

    echo ""
    check_container_status
    echo ""
    check_system_resources
    echo ""
    check_docker_resources
    echo ""
    check_network
    echo ""

    # Save report
    {
        echo "Report generated: $timestamp"
        echo "API Status: HTTP $api_response"
        docker-compose -f $COMPOSE_FILE ps
        free -h
        df -h /
        docker stats --no-stream
    } >> $HEALTH_CHECK_LOG 2>&1

    echo -e "\n${BLUE}Report saved to: $HEALTH_CHECK_LOG${NC}"
}

# Comprehensive metrics export
export_metrics() {
    print_header "Exporting Metrics"

    {
        echo "=== Metrics Export ==="
        echo "Timestamp: $(date)"
        echo ""

        echo "## System Information"
        uname -a
        echo ""

        echo "## Memory Status"
        free -h
        free -b | grep "^Mem:" | awk '{print "Total: " $2 ", Used: " $3 ", Available: " $7}'
        echo ""

        echo "## Disk Status"
        df -h /
        echo ""

        echo "## Temperature"
        vcgencmd measure_temp
        echo ""

        echo "## CPU Frequency"
        grep "cpu MHz" /proc/cpuinfo
        echo ""

        echo "## Uptime"
        uptime
        echo ""

        echo "## Docker Containers"
        docker-compose -f $COMPOSE_FILE ps
        echo ""

        echo "## Docker Resource Usage"
        docker stats --no-stream
        echo ""

        echo "## Network Status"
        ip addr show | grep "inet "
        echo ""

        echo "## Service Health"
        curl -s http://localhost:3000/status | jq . || echo "API unavailable"

    } | tee -a $METRICS_LOG

    echo -e "\n${BLUE}Metrics saved to: $METRICS_LOG${NC}"
}

# Service restart with health check
restart_services() {
    print_header "Restarting Services"

    echo "Stopping services..."
    docker-compose -f $COMPOSE_FILE down

    sleep 3

    echo "Starting services..."
    docker-compose -f $COMPOSE_FILE up -d

    sleep 5

    echo "Waiting for health check..."
    local max_attempts=12
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if curl -s http://localhost:3000/health > /dev/null 2>&1; then
            print_ok "Services healthy"
            docker-compose -f $COMPOSE_FILE ps
            return 0
        fi
        echo "Attempt $((attempt + 1))/$max_attempts..."
        sleep 5
        attempt=$((attempt + 1))
    done

    print_error "Services failed to become healthy"
    return 1
}

# Troubleshooting wizard
run_troubleshooting() {
    print_header "Troubleshooting Wizard"

    echo "Checking for common issues..."
    echo ""

    # Issue 1: Out of memory
    local mem_percent=$(free | grep "^Mem:" | awk '{print $3 * 100 / $2}')
    if (( $(echo "$mem_percent > 80" | bc -l) )); then
        print_error "OUT OF MEMORY"
        echo "Suggestions:"
        echo "  1. Reduce connection limits in .env"
        echo "  2. Restart services: docker-compose restart"
        echo "  3. Check for memory leaks: docker stats"
        echo "  4. Increase swap: sudo fallocate -l 3G /swapfile"
        echo ""
    fi

    # Issue 2: Disk full
    local disk_percent=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ $disk_percent -gt 85 ]; then
        print_error "DISK SPACE CRITICAL"
        echo "Suggestions:"
        echo "  1. Check what's taking space: du -sh /opt/wise2-edge/*"
        echo "  2. Clean Docker: docker system prune -a"
        echo "  3. Remove old logs: sudo find /var/log -type f -name '*.log' -mtime +30 -delete"
        echo "  4. Backup and remove Ollama models: docker exec wise2-ollama ollama rm <model>"
        echo ""
    fi

    # Issue 3: High temperature
    local temp=$(vcgencmd measure_temp 2>/dev/null | grep -oP '\d+\.\d+')
    if (( $(echo "$temp > 80" | bc -l) )); then
        print_error "HIGH TEMPERATURE"
        echo "Suggestions:"
        echo "  1. Improve air circulation around Pi"
        echo "  2. Add heatsink to CPU"
        echo "  3. Check for blocked vents"
        echo "  4. Reduce CPU frequency temporarily (edit /boot/config.txt)"
        echo ""
    fi

    # Issue 4: Unhealthy containers
    local unhealthy=$(docker-compose -f $COMPOSE_FILE ps --filter "status=unhealthy" -q)
    if [ ! -z "$unhealthy" ]; then
        print_error "UNHEALTHY CONTAINERS DETECTED"
        echo "Unhealthy containers:"
        docker-compose -f $COMPOSE_FILE ps --filter "status=unhealthy"
        echo "Suggestions:"
        echo "  1. Check logs: docker-compose logs"
        echo "  2. Restart services: systemctl restart wise2-edge"
        echo "  3. Rebuild: docker-compose up -d --build"
        echo ""
    fi

    # Issue 5: API not responding
    if ! curl -s http://localhost:3000/health > /dev/null 2>&1; then
        print_error "API NOT RESPONDING"
        echo "Suggestions:"
        echo "  1. Check container status: docker-compose ps"
        echo "  2. Check logs: docker-compose logs edge-runtime"
        echo "  3. Restart: docker-compose restart edge-runtime"
        echo "  4. Check port 3000: netstat -tlnp | grep 3000"
        echo ""
    fi

    # Issue 6: Network connectivity
    if ! ping -c 1 -W 2 8.8.8.8 > /dev/null 2>&1; then
        print_error "NO INTERNET CONNECTIVITY"
        echo "Suggestions:"
        echo "  1. Check network status: ip link show"
        echo "  2. Check routing: ip route show"
        echo "  3. Restart networking: sudo systemctl restart networking"
        echo "  4. Check DNS: nslookup google.com"
        echo ""
    fi

    print_ok "Troubleshooting check complete"
}

# Display monitoring menu
show_menu() {
    echo ""
    echo -e "${BLUE}WISE² Edge Monitoring Menu:${NC}"
    echo "  status   - Container and service status"
    echo "  health   - API health check"
    echo "  resources - System resources and Docker stats"
    echo "  logs     - Recent logs and errors"
    echo "  report   - Full health report"
    echo "  metrics  - Export detailed metrics"
    echo "  restart  - Restart all services"
    echo "  trouble  - Troubleshooting wizard"
    echo "  all      - Run all checks"
    echo ""
}

# Main monitoring function
main() {
    local command="${1:-all}"

    case $command in
        status)
            check_container_status
            ;;
        health)
            check_api_health
            ;;
        resources)
            check_system_resources
            echo ""
            check_docker_resources
            ;;
        logs)
            check_logs
            ;;
        report)
            generate_health_report
            ;;
        metrics)
            export_metrics
            ;;
        restart)
            restart_services
            ;;
        trouble)
            run_troubleshooting
            ;;
        all)
            generate_health_report
            echo ""
            check_docker_resources
            echo ""
            check_network
            echo ""
            run_troubleshooting
            ;;
        menu)
            show_menu
            ;;
        *)
            show_menu
            echo -e "${YELLOW}Unknown command: $command${NC}"
            exit 1
            ;;
    esac
}

main "$@"
