#!/bin/bash

################################################################################
# WISE² Raspberry Pi Health Check Script
# Location: /scripts/pi-health-check.sh
# Purpose: Comprehensive system and application health monitoring
# Usage: ./pi-health-check.sh [--email] [--webhook URL] [--verbose]
# Cron: 0 * * * * /scripts/pi-health-check.sh --email  # Hourly with email
################################################################################

set -euo pipefail

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_DIR="${PROJECT_ROOT}/logs"
REPORT_FILE="/tmp/pi-health-report-$(date +%s).txt"
REPORT_JSON="/tmp/pi-health-report-$(date +%s).json"

# Thresholds
DISK_WARN_PCT=85
MEMORY_WARN_PCT=90
BACKUP_MAX_AGE_HOURS=48
CERT_WARN_DAYS=30
ERROR_THRESHOLD_HOUR=10

# Flags
SEND_EMAIL=false
WEBHOOK_URL=""
VERBOSE=false

# Health status tracking
OVERALL_STATUS="OK"
declare -A CHECKS
declare -A CHECK_DETAILS

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --email) SEND_EMAIL=true; shift ;;
        --webhook) WEBHOOK_URL="$2"; shift 2 ;;
        --verbose) VERBOSE=true; shift ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

################################################################################
# Utility Functions
################################################################################

log_check() {
    local check_name="$1"
    local status="$2"
    local details="$3"

    CHECKS["$check_name"]="$status"
    CHECK_DETAILS["$check_name"]="$details"

    if [ "$status" != "OK" ]; then
        OVERALL_STATUS="WARN"
        if [ "$status" = "FAIL" ]; then
            OVERALL_STATUS="FAIL"
        fi
    fi

    if [ "$VERBOSE" = true ]; then
        case $status in
            OK) echo -e "${GREEN}[OK]${NC} $check_name: $details" ;;
            WARN) echo -e "${YELLOW}[WARN]${NC} $check_name: $details" ;;
            FAIL) echo -e "${RED}[FAIL]${NC} $check_name: $details" ;;
        esac
    fi
}

print_header() {
    local title="$1"
    echo ""
    echo "=================================================================================="
    echo "$title"
    echo "=================================================================================="
}

################################################################################
# 1. SERVICE STATUS CHECKS
################################################################################

check_services() {
    print_header "1. SERVICE STATUS"

    local docker_running=false
    local failing_containers=()

    # Check if Docker is running
    if ! command -v docker &> /dev/null; then
        log_check "Docker Installation" "FAIL" "Docker not installed"
        return
    fi

    if ! docker ps &> /dev/null; then
        log_check "Docker Daemon" "FAIL" "Docker daemon not responding"
        return
    fi

    docker_running=true
    log_check "Docker Daemon" "OK" "Running"

    # Check each container status
    if [ "$docker_running" = true ]; then
        local containers
        containers=$(docker ps -a --format "{{.Names}}:{{.State}}")

        if [ -z "$containers" ]; then
            log_check "Docker Containers" "WARN" "No containers found"
        else
            local container_status="OK"
            while IFS=: read -r name state; do
                if [ "$state" != "running" ]; then
                    failing_containers+=("$name ($state)")
                    container_status="FAIL"
                fi
            done <<< "$containers"

            local container_count
            container_count=$(echo "$containers" | wc -l)
            local running_count
            running_count=$(docker ps --format "{{.Names}}" | wc -l)

            if [ "$container_status" = "FAIL" ]; then
                log_check "Docker Containers" "FAIL" \
                    "Running: $running_count/$container_count. Failed: ${failing_containers[*]}"
            else
                log_check "Docker Containers" "OK" "All $running_count containers running"
            fi
        fi

        # Check container restart counts (recent restarts indicate issues)
        local recently_restarted
        recently_restarted=$(docker ps -a --format "{{.Names}} {{.RestartCount}}" | awk '{if($2>2) print $1}')
        if [ -n "$recently_restarted" ]; then
            log_check "Container Stability" "WARN" "High restart count: $recently_restarted"
        else
            log_check "Container Stability" "OK" "No excessive restarts detected"
        fi
    fi
}

################################################################################
# 2. CONNECTIVITY CHECKS
################################################################################

check_connectivity() {
    print_header "2. CONNECTIVITY"

    # External connectivity
    if ping -c 1 -W 2 8.8.8.8 &> /dev/null; then
        log_check "External Connectivity" "OK" "Internet reachable"
    else
        log_check "External Connectivity" "FAIL" "Cannot reach external network"
    fi

    # API endpoint (if configured)
    if [ -n "${API_ENDPOINT:-}" ]; then
        if timeout 5 curl -sf "${API_ENDPOINT}/health" &> /dev/null; then
            log_check "API Endpoint" "OK" "Responding at $API_ENDPOINT"
        else
            log_check "API Endpoint" "FAIL" "Not responding at $API_ENDPOINT"
        fi
    else
        # Try to detect from docker-compose.prod.yml
        if [ -f "$PROJECT_ROOT/docker-compose.prod.yml" ]; then
            local api_port
            api_port=$(grep -o 'API_PORT=[0-9]*' "$PROJECT_ROOT/docker-compose.prod.yml" | cut -d= -f2)
            if [ -n "$api_port" ]; then
                if timeout 5 curl -sf "http://localhost:$api_port/health" &> /dev/null; then
                    log_check "API Endpoint" "OK" "Responding on port $api_port"
                else
                    log_check "API Endpoint" "WARN" "Not responding on port $api_port"
                fi
            fi
        fi
    fi

    # Database connectivity
    if [ -n "${DB_HOST:-}" ] && [ -n "${DB_PORT:-}" ]; then
        if timeout 2 bash -c "echo >/dev/tcp/${DB_HOST}/${DB_PORT}" 2>/dev/null; then
            log_check "Database Port" "OK" "Reachable at $DB_HOST:$DB_PORT"
        else
            log_check "Database Port" "FAIL" "Cannot reach $DB_HOST:$DB_PORT"
        fi
    else
        log_check "Database Port" "WARN" "DB_HOST/DB_PORT not configured"
    fi

    # DNS resolution
    if nslookup google.com &> /dev/null; then
        log_check "DNS Resolution" "OK" "Working"
    else
        log_check "DNS Resolution" "FAIL" "Cannot resolve DNS"
    fi
}

################################################################################
# 3. DISK SPACE
################################################################################

check_disk_space() {
    print_header "3. DISK SPACE"

    local overall_disk_status="OK"

    # Root partition
    local disk_usage
    disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')

    if [ "$disk_usage" -gt "$DISK_WARN_PCT" ]; then
        log_check "Root Disk Usage" "FAIL" "${disk_usage}% used (threshold: ${DISK_WARN_PCT}%)"
        overall_disk_status="FAIL"
    elif [ "$disk_usage" -gt 75 ]; then
        log_check "Root Disk Usage" "WARN" "${disk_usage}% used"
        overall_disk_status="WARN"
    else
        log_check "Root Disk Usage" "OK" "${disk_usage}% used"
    fi

    # Check log directory growth
    if [ -d "$LOG_DIR" ]; then
        local log_size_mb
        log_size_mb=$(du -sm "$LOG_DIR" 2>/dev/null | awk '{print $1}')

        if [ "$log_size_mb" -gt 500 ]; then
            log_check "Log Directory Size" "WARN" "${log_size_mb}MB (consider archiving)"
        else
            log_check "Log Directory Size" "OK" "${log_size_mb}MB"
        fi
    fi

    # Check database growth rate (if MySQL/PostgreSQL running)
    if command -v mysql &> /dev/null && timeout 2 mysql -u root -e "SELECT 1" &> /dev/null; then
        local db_size_mb
        db_size_mb=$(mysql -u root -Ne "SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) FROM information_schema.tables;" 2>/dev/null || echo "0")

        if [ -n "$db_size_mb" ] && [ "$db_size_mb" != "0" ]; then
            log_check "Database Size" "OK" "${db_size_mb}MB"
        fi
    fi
}

################################################################################
# 4. MEMORY USAGE
################################################################################

check_memory() {
    print_header "4. MEMORY"

    local total_mem
    local avail_mem
    local used_percent

    total_mem=$(free -b | grep Mem | awk '{print $2}')
    avail_mem=$(free -b | grep Mem | awk '{print $7}')
    used_percent=$((100 * (total_mem - avail_mem) / total_mem))

    if [ "$used_percent" -gt "$MEMORY_WARN_PCT" ]; then
        log_check "Memory Usage" "FAIL" "${used_percent}% used (threshold: ${MEMORY_WARN_PCT}%)"
    elif [ "$used_percent" -gt 80 ]; then
        log_check "Memory Usage" "WARN" "${used_percent}% used"
    else
        log_check "Memory Usage" "OK" "${used_percent}% used"
    fi

    # Check for memory leaks (processes growing over time)
    local top_process
    top_process=$(ps aux --sort=-%mem | head -2 | tail -1 | awk '{print $1, $6, $11}')
    log_check "Top Memory Process" "OK" "$top_process"
}

################################################################################
# 5. NETWORK METRICS
################################################################################

check_network() {
    print_header "5. NETWORK METRICS"

    # Measure latency to cloud API
    if [ -n "${API_ENDPOINT:-}" ] || [ -n "${CLOUD_API:-}" ]; then
        local api_host
        api_host="${CLOUD_API:-api.wise2.net}"

        if ping -c 3 -W 1 "$api_host" &> /dev/null; then
            local latency
            latency=$(ping -c 3 -W 1 "$api_host" 2>/dev/null | tail -1 | awk -F'/' '{print $5}')

            if [ -n "$latency" ]; then
                if (( $(echo "$latency > 200" | bc -l) )); then
                    log_check "API Latency" "WARN" "${latency}ms (high)"
                else
                    log_check "API Latency" "OK" "${latency}ms"
                fi
            fi
        fi
    fi

    # Network interfaces
    local eth_status
    eth_status=$(ip link show | grep -E "eth0|wlan0" | head -1 | grep -o "UP\|DOWN" || echo "UNKNOWN")

    if [ "$eth_status" = "UP" ]; then
        log_check "Network Interface" "OK" "Connected"
    else
        log_check "Network Interface" "FAIL" "Disconnected"
    fi
}

################################################################################
# 6. UPDATES AVAILABLE
################################################################################

check_updates() {
    print_header "6. UPDATES AVAILABLE"

    # Apt updates
    if command -v apt-get &> /dev/null; then
        apt-get update -qq 2>/dev/null || true

        local apt_updates
        apt_updates=$(apt-get upgrade -s 2>/dev/null | grep "^Inst" | wc -l)

        if [ "$apt_updates" -gt 0 ]; then
            log_check "System Updates" "WARN" "$apt_updates updates available"
        else
            log_check "System Updates" "OK" "System is up to date"
        fi
    fi

    # Docker image updates
    if command -v docker &> /dev/null && docker ps &> /dev/null; then
        local images_to_pull=0

        while IFS= read -r image; do
            if docker pull "$image" 2>/dev/null | grep -q "Status: Downloaded"; then
                ((images_to_pull++))
            fi
        done < <(docker images --format "{{.Repository}}:{{.Tag}}" | grep -v "<none>")

        if [ "$images_to_pull" -gt 0 ]; then
            log_check "Docker Updates" "WARN" "$images_to_pull images have updates"
        else
            log_check "Docker Updates" "OK" "All images current"
        fi
    fi
}

################################################################################
# 7. BACKUPS
################################################################################

check_backups() {
    print_header "7. BACKUPS"

    local backup_dir="${PROJECT_ROOT}/backups"

    if [ ! -d "$backup_dir" ]; then
        log_check "Backup Directory" "WARN" "Backup directory not found at $backup_dir"
        return
    fi

    local latest_backup
    latest_backup=$(find "$backup_dir" -type f -name "*.tar.gz" -o -name "*.sql" -o -name "*.zip" | sort -r | head -1)

    if [ -z "$latest_backup" ]; then
        log_check "Latest Backup" "FAIL" "No backups found in $backup_dir"
        return
    fi

    local backup_age_hours
    backup_age_hours=$(( ($(date +%s) - $(stat -f%m "$latest_backup" 2>/dev/null || stat -c%Y "$latest_backup")) / 3600 ))

    if [ "$backup_age_hours" -gt "$BACKUP_MAX_AGE_HOURS" ]; then
        log_check "Backup Freshness" "FAIL" "Latest backup is ${backup_age_hours}h old (max: ${BACKUP_MAX_AGE_HOURS}h)"
    elif [ "$backup_age_hours" -gt 24 ]; then
        log_check "Backup Freshness" "WARN" "Latest backup is ${backup_age_hours}h old"
    else
        log_check "Backup Freshness" "OK" "Latest backup is ${backup_age_hours}h old"
    fi

    # Check backup size
    local backup_size_mb
    backup_size_mb=$(du -m "$latest_backup" | awk '{print $1}')
    log_check "Latest Backup Size" "OK" "${backup_size_mb}MB"
}

################################################################################
# 8. APPLICATION LOGS
################################################################################

check_logs() {
    print_header "8. APPLICATION LOGS"

    if [ ! -d "$LOG_DIR" ]; then
        log_check "Log Directory" "WARN" "Log directory not found at $LOG_DIR"
        return
    fi

    # Count ERROR entries in last hour
    local one_hour_ago
    one_hour_ago=$(date -d "1 hour ago" "+%Y-%m-%d %H:%M:%S" 2>/dev/null || date -v-1H "+%Y-%m-%d %H:%M:%S")

    local error_count=0
    if [ -f "$LOG_DIR/application.log" ]; then
        error_count=$(grep -c "ERROR\|Exception\|FATAL" "$LOG_DIR/application.log" 2>/dev/null || echo 0)
    fi

    if [ "$error_count" -gt "$ERROR_THRESHOLD_HOUR" ]; then
        log_check "Application Errors (1h)" "FAIL" "$error_count errors detected"
    elif [ "$error_count" -gt 5 ]; then
        log_check "Application Errors (1h)" "WARN" "$error_count errors detected"
    else
        log_check "Application Errors (1h)" "OK" "$error_count errors"
    fi

    # Check for recent crashes
    if grep -qi "segmentation\|core dump\|fatal" "$LOG_DIR"/*.log 2>/dev/null; then
        log_check "Crash Detection" "FAIL" "Recent crashes detected in logs"
    else
        log_check "Crash Detection" "OK" "No recent crashes"
    fi
}

################################################################################
# 9. SSL CERTIFICATE EXPIRATION
################################################################################

check_ssl_certificates() {
    print_header "9. SSL CERTIFICATES"

    local cert_dir="${PROJECT_ROOT}/certs"

    if [ ! -d "$cert_dir" ]; then
        log_check "Certificate Directory" "WARN" "Certificate directory not found at $cert_dir"
        return
    fi

    local has_expired=false
    local has_expiring_soon=false

    while IFS= read -r cert_file; do
        if [ -f "$cert_file" ]; then
            local expiry_date
            expiry_date=$(openssl x509 -enddate -noout -in "$cert_file" 2>/dev/null | cut -d= -f2)

            if [ -n "$expiry_date" ]; then
                local expiry_seconds
                expiry_seconds=$(date -d "$expiry_date" +%s 2>/dev/null || date -f "%b %d %T %Y %Z" "$expiry_date" +%s)

                local now_seconds
                now_seconds=$(date +%s)

                local days_until_expiry
                days_until_expiry=$(( (expiry_seconds - now_seconds) / 86400 ))

                if [ "$days_until_expiry" -lt 0 ]; then
                    log_check "Certificate $(basename "$cert_file")" "FAIL" "Expired $((days_until_expiry * -1)) days ago"
                    has_expired=true
                elif [ "$days_until_expiry" -lt "$CERT_WARN_DAYS" ]; then
                    log_check "Certificate $(basename "$cert_file")" "WARN" "Expires in $days_until_expiry days"
                    has_expiring_soon=true
                else
                    log_check "Certificate $(basename "$cert_file")" "OK" "Valid for $days_until_expiry days"
                fi
            fi
        fi
    done < <(find "$cert_dir" -name "*.crt" -o -name "*.pem")
}

################################################################################
# 10. GENERATE REPORT
################################################################################

generate_text_report() {
    {
        echo "WISE² Raspberry Pi Health Check Report"
        echo "========================================"
        echo "Timestamp: $(date)"
        echo "Hostname: $(hostname)"
        echo "Uptime: $(uptime)"
        echo ""
        echo "OVERALL STATUS: $OVERALL_STATUS"
        echo ""
        echo "Detailed Results:"
        echo "================="

        for check in "${!CHECKS[@]}"; do
            local status="${CHECKS[$check]}"
            local details="${CHECK_DETAILS[$check]}"

            case $status in
                OK) echo "[OK]   $check: $details" ;;
                WARN) echo "[WARN] $check: $details" ;;
                FAIL) echo "[FAIL] $check: $details" ;;
            esac
        done

        echo ""
        echo "System Information:"
        echo "==================="
        echo "CPU: $(grep -m1 "model name" /proc/cpuinfo | cut -d: -f2 | xargs)"
        echo "CPU Cores: $(nproc)"
        echo "CPU Load: $(cat /proc/loadavg | awk '{print $1, $2, $3}')"
        echo "RAM: $(free -h | grep Mem | awk '{print $2}')"
        echo "Kernel: $(uname -r)"
        echo ""

    } > "$REPORT_FILE"

    cat "$REPORT_FILE"
}

################################################################################
# 11. GENERATE JSON REPORT
################################################################################

generate_json_report() {
    {
        echo "{"
        echo "  \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\","
        echo "  \"hostname\": \"$(hostname)\","
        echo "  \"overall_status\": \"$OVERALL_STATUS\","
        echo "  \"checks\": {"

        local first=true
        for check in "${!CHECKS[@]}"; do
            if [ "$first" = false ]; then
                echo ","
            fi
            first=false

            local status="${CHECKS[$check]}"
            local details="${CHECK_DETAILS[$check]}"
            echo -n "    \"$(echo "$check" | tr ' ' '_')\": {\"status\": \"$status\", \"details\": \"$details\"}"
        done

        echo ""
        echo "  }"
        echo "}"
    } > "$REPORT_JSON"

    cat "$REPORT_JSON"
}

################################################################################
# 12. SEND EMAIL REPORT
################################################################################

send_email_report() {
    if [ "$SEND_EMAIL" = false ]; then
        return
    fi

    local email_to="${ALERT_EMAIL:-dwise03@gmail.com}"
    local subject="WISE² Pi Health Check - $OVERALL_STATUS"

    if command -v mail &> /dev/null || command -v sendmail &> /dev/null; then
        mail -s "$subject" "$email_to" < "$REPORT_FILE"
        if [ "$VERBOSE" = true ]; then
            echo "Email sent to $email_to"
        fi
    else
        if [ "$VERBOSE" = true ]; then
            echo "Mail not configured. Cannot send email report."
        fi
    fi
}

################################################################################
# 13. SEND WEBHOOK REPORT
################################################################################

send_webhook_report() {
    if [ -z "$WEBHOOK_URL" ]; then
        return
    fi

    local json_data
    json_data=$(jq -c '.' "$REPORT_JSON" 2>/dev/null || cat "$REPORT_JSON")

    if command -v curl &> /dev/null; then
        curl -X POST "$WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "$json_data" \
            2>/dev/null

        if [ "$VERBOSE" = true ]; then
            echo "Webhook report sent to $WEBHOOK_URL"
        fi
    else
        if [ "$VERBOSE" = true ]; then
            echo "curl not available. Cannot send webhook report."
        fi
    fi
}

################################################################################
# MAIN EXECUTION
################################################################################

main() {
    # Ensure log directory exists
    mkdir -p "$LOG_DIR"

    # Run all checks
    check_services
    check_connectivity
    check_disk_space
    check_memory
    check_network
    check_updates
    check_backups
    check_logs
    check_ssl_certificates

    # Generate reports
    generate_text_report
    generate_json_report

    # Send alerts
    send_email_report
    send_webhook_report

    # Save report to logs
    cp "$REPORT_FILE" "$LOG_DIR/health-check-$(date +%Y%m%d-%H%M%S).txt"

    # Exit with appropriate code
    if [ "$OVERALL_STATUS" = "FAIL" ]; then
        exit 1
    elif [ "$OVERALL_STATUS" = "WARN" ]; then
        exit 0  # Don't fail on warnings
    else
        exit 0
    fi
}

# Execute main function
main "$@"
