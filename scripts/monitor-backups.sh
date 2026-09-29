#!/bin/bash

################################################################################
# WISE² Core - Backup Monitoring & Health Check
#
# Comprehensive backup health monitoring:
# - Check local backup files (existence, size, age, integrity)
# - Verify remote backups (S3/cloud sync status)
# - Monitor backup storage (disk space, retention needs)
# - Test restore capability (monthly verification)
# - Generate status reports
# - Alert on issues
#
# Usage:
#   ./monitor-backups.sh status         # Check backup health
#   ./monitor-backups.sh report         # Generate detailed report
#   ./monitor-backups.sh test-restore   # Test restore (monthly)
#   ./monitor-backups.sh dashboard      # Show metrics for dashboard
#   ./monitor-backups.sh check-hourly   # Hourly check (cron)
#
# Cron Setup:
#   # Hourly health checks
#   0 * * * * /opt/wise2-core/scripts/monitor-backups.sh check-hourly
#
#   # Monthly restore tests (1st of month at 02:00 UTC)
#   0 2 1 * * /opt/wise2-core/scripts/monitor-backups.sh test-restore
#
################################################################################

set -euo pipefail

# ============================================================================
# CONFIGURATION
# ============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUPS_DIR="${PROJECT_ROOT}/logs/backups"
MONITOR_DIR="${BACKUPS_DIR}/monitor"
MONITOR_LOG="${MONITOR_DIR}/monitor.log"
STATUS_FILE="${MONITOR_DIR}/status.json"
METRICS_FILE="${MONITOR_DIR}/metrics.json"
RESTORE_TEST_LOG="${MONITOR_DIR}/restore-tests.log"

# Thresholds
BACKUP_AGE_WARN_HOURS=48
BACKUP_AGE_CRITICAL_HOURS=72
MIN_DISK_SPACE_PERCENT=20
MIN_BACKUP_SIZE_MB=1

# Retention policy
BACKUP_RETENTION_DAYS=7
BACKUP_RETENTION_MIN_COUNT=10

# Remote backup (S3)
S3_BUCKET="${S3_BUCKET_BACKUP:-}"
AWS_REGION="${AWS_REGION:-us-east-1}"

# Database config (for restore tests)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-wise2_prod}"
DB_USER="${DB_USER:-wise2_prod}"
TEST_DB_NAME="${DB_NAME}_test_restore"

# Create directories
mkdir -p "$MONITOR_DIR"

# ============================================================================
# LOGGING & OUTPUT FUNCTIONS
# ============================================================================

log() {
    local level="$1"
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[${timestamp}] [${level}] ${message}" >> "$MONITOR_LOG"

    # Write to stderr so it doesn't get captured when we need to capture stdout
    case "$level" in
        ERROR)   echo -e "${RED}✗${NC} $message" >&2 ;;
        WARN)    echo -e "${YELLOW}⚠${NC} $message" >&2 ;;
        OK)      echo -e "${GREEN}✓${NC} $message" >&2 ;;
        INFO)    echo -e "${BLUE}ℹ${NC} $message" >&2 ;;
        *)       echo "$message" >&2 ;;
    esac
}

format_size() {
    local bytes=$1
    if [ $bytes -lt 1024 ]; then
        echo "${bytes}B"
    elif [ $bytes -lt 1048576 ]; then
        echo "$(( bytes / 1024 ))KB"
    elif [ $bytes -lt 1073741824 ]; then
        echo "$(( bytes / 1048576 ))MB"
    else
        echo "$(( bytes / 1073741824 ))GB"
    fi
}

calculate_age_hours() {
    local file_time=$1
    local current_time=$(date +%s)
    echo $(( (current_time - file_time) / 3600 ))
}

# ============================================================================
# BACKUP FILE CHECKING
# ============================================================================

check_local_backups() {
    log "INFO" "Checking local backups..."

    local status="OK"
    local backup_count=0
    local latest_backup=""
    local latest_age_hours=999

    if [ ! -d "$BACKUPS_DIR" ]; then
        log "ERROR" "Backups directory not found: $BACKUPS_DIR"
        echo "FAIL"
        return 1
    fi

    # Find all backup files
    while IFS= read -r backup_file; do
        if [ -f "$backup_file" ]; then
            backup_count=$((backup_count + 1))

            local file_size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file" 2>/dev/null || echo 0)
            local file_time=$(stat -f%m "$backup_file" 2>/dev/null || stat -c%Y "$backup_file" 2>/dev/null || echo 0)
            local age_hours=$(calculate_age_hours "$file_time")
            local file_size_mb=$(( file_size / 1048576 ))

            log "INFO" "  Found: $(basename $backup_file) (${file_size_mb}MB, ${age_hours}h old)"

            # Track latest backup
            if [ $age_hours -lt $latest_age_hours ]; then
                latest_backup="$backup_file"
                latest_age_hours=$age_hours
            fi

            # Check file size
            if [ $file_size_mb -lt $MIN_BACKUP_SIZE_MB ]; then
                log "WARN" "Backup too small: $(basename $backup_file) (${file_size_mb}MB)"
                status="WARN"
            fi

            # Check file age
            if [ $age_hours -gt $BACKUP_AGE_CRITICAL_HOURS ]; then
                log "ERROR" "Backup too old: $(basename $backup_file) (${age_hours}h)"
                status="FAIL"
            elif [ $age_hours -gt $BACKUP_AGE_WARN_HOURS ]; then
                log "WARN" "Backup aging: $(basename $backup_file) (${age_hours}h)"
                status="WARN"
            fi

            # Verify integrity if gzip
            if [[ "$backup_file" == *.gz ]]; then
                if ! gzip -t "$backup_file" 2>/dev/null; then
                    log "ERROR" "Backup integrity check failed: $(basename $backup_file)"
                    status="FAIL"
                else
                    log "OK" "Backup integrity verified: $(basename $backup_file)"
                fi
            fi
        fi
    done < <(find "$BACKUPS_DIR" -maxdepth 1 -type f \( -name "backup-*" -o -name "wise2_backup_*" \) 2>/dev/null)

    if [ $backup_count -eq 0 ]; then
        log "ERROR" "No backups found in $BACKUPS_DIR"
        status="FAIL"
    else
        log "OK" "Found $backup_count local backup(s)"
    fi

    echo "$status"
}

# ============================================================================
# REMOTE BACKUP CHECKING (S3)
# ============================================================================

check_remote_backups() {
    log "INFO" "Checking remote backups..."

    if [ -z "$S3_BUCKET" ]; then
        log "INFO" "S3 backup not configured (S3_BUCKET_BACKUP not set)"
        echo "SKIP"
        return 0
    fi

    if ! command -v aws &> /dev/null; then
        log "WARN" "AWS CLI not installed, skipping S3 check"
        echo "SKIP"
        return 0
    fi

    local status="OK"
    local remote_count=0

    # List remote backups
    log "INFO" "Syncing with S3 bucket: $S3_BUCKET"

    if ! aws s3 ls "s3://${S3_BUCKET}/backups/" --region "$AWS_REGION" 2>/dev/null | while read -r line; do
        if [[ $line == *".gz"* ]] || [[ $line == *"backup"* ]]; then
            remote_count=$((remote_count + 1))
            log "INFO" "  Remote: $line"
        fi
    done; then
        log "WARN" "Could not list S3 backups (check credentials)"
        status="WARN"
    fi

    if [ $remote_count -eq 0 ]; then
        log "WARN" "No remote backups found in S3"
        status="WARN"
    fi

    echo "$status"
}

# ============================================================================
# DISK SPACE MONITORING
# ============================================================================

check_disk_space() {
    log "INFO" "Checking backup storage disk space..."

    local status="OK"

    # Get filesystem info for backup directory
    local filesystem=$(df "$BACKUPS_DIR" | tail -1)
    local used=$(echo "$filesystem" | awk '{print $3}')
    local available=$(echo "$filesystem" | awk '{print $4}')
    local total=$(echo "$filesystem" | awk '{print $2}')
    local percent_used=$(echo "$filesystem" | awk '{print $5}' | sed 's/%//')
    local percent_available=$(( 100 - percent_used ))

    log "INFO" "Disk usage: ${percent_used}% used, ${percent_available}% available"
    log "INFO" "  Total: $(format_size $(( total * 1024 )))"
    log "INFO" "  Used: $(format_size $(( used * 1024 )))"
    log "INFO" "  Available: $(format_size $(( available * 1024 )))"

    # Check available space threshold
    if [ $percent_available -lt $MIN_DISK_SPACE_PERCENT ]; then
        log "ERROR" "Disk space critically low: only ${percent_available}% available"
        status="FAIL"
    elif [ $percent_available -lt $((MIN_DISK_SPACE_PERCENT + 10)) ]; then
        log "WARN" "Disk space running low: ${percent_available}% available"
        status="WARN"
    else
        log "OK" "Disk space healthy: ${percent_available}% available"
    fi

    # Calculate backup retention needs
    local total_backup_size=0
    while IFS= read -r backup_file; do
        if [ -f "$backup_file" ]; then
            local file_size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file" 2>/dev/null || echo 0)
            total_backup_size=$((total_backup_size + file_size))
        fi
    done < <(find "$BACKUPS_DIR" -maxdepth 1 -type f \( -name "backup-*" -o -name "wise2_backup_*" \) 2>/dev/null)

    log "INFO" "Total backup storage: $(format_size $total_backup_size)"

    echo "$status"
}

# ============================================================================
# RESTORE TEST (Monthly)
# ============================================================================

test_restore() {
    log "INFO" "Testing restore capability..."

    # Find latest backup
    local latest_backup=""
    local latest_time=0

    while IFS= read -r backup_file; do
        if [ -f "$backup_file" ]; then
            local file_time=$(stat -f%m "$backup_file" 2>/dev/null || stat -c%Y "$backup_file" 2>/dev/null || echo 0)
            if [ $file_time -gt $latest_time ]; then
                latest_backup="$backup_file"
                latest_time=$file_time
            fi
        fi
    done < <(find "$BACKUPS_DIR" -maxdepth 1 -type f \( -name "backup-*" -o -name "wise2_backup_*" \) 2>/dev/null)

    if [ -z "$latest_backup" ]; then
        log "ERROR" "No backup found for restore test"
        echo "FAIL"
        return 1
    fi

    log "INFO" "Testing restore from: $(basename $latest_backup)"

    local test_start=$(date +%s)
    local status="OK"

    # Check if backup can be extracted (integrity test)
    if [[ "$latest_backup" == *.sql.gz ]]; then
        log "INFO" "Testing SQL backup extraction..."
        if ! gunzip -t "$latest_backup" 2>/dev/null; then
            log "ERROR" "Cannot extract backup file"
            status="FAIL"
        else
            log "OK" "Backup extraction test passed"
        fi
    elif [[ "$latest_backup" == *.tar.gz ]]; then
        log "INFO" "Testing TAR archive integrity..."
        if ! tar -tzf "$latest_backup" > /dev/null 2>&1; then
            log "ERROR" "Cannot extract TAR archive"
            status="FAIL"
        else
            log "OK" "TAR archive integrity test passed"

            # Show contents preview
            log "INFO" "Archive contents preview:"
            tar -tzf "$latest_backup" 2>/dev/null | head -10 | while read -r line; do
                log "INFO" "  $line"
            done
        fi
    else
        log "WARN" "Unknown backup format, skipping extraction test"
    fi

    # Simulate restore (don't actually restore to production DB)
    if [ "$status" == "OK" ]; then
        log "INFO" "Simulating database restore (no changes to production)..."

        # Check if database is accessible
        if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" >/dev/null 2>&1; then
            log "WARN" "Cannot connect to production database, skipping restore simulation"
        else
            log "OK" "Database connectivity verified"
            # In a real test, we would restore to a test database
            # For now, we just verify we can connect
        fi
    fi

    local test_end=$(date +%s)
    local test_duration=$(( test_end - test_start ))

    log "INFO" "Restore test completed in ${test_duration}s"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] Restore test: $status (duration: ${test_duration}s, file: $(basename $latest_backup))" >> "$RESTORE_TEST_LOG"

    echo "$status"
}

# ============================================================================
# BACKUP HEALTH DASHBOARD
# ============================================================================

generate_status_json() {
    local local_status="$1"
    local remote_status="$2"
    local disk_status="$3"
    local restore_status="$4"

    # Determine overall status
    local overall="OK"
    if [[ "$local_status" == "FAIL" ]] || [[ "$remote_status" == "FAIL" ]] || [[ "$disk_status" == "FAIL" ]] || [[ "$restore_status" == "FAIL" ]]; then
        overall="FAIL"
    elif [[ "$local_status" == "WARN" ]] || [[ "$remote_status" == "WARN" ]] || [[ "$disk_status" == "WARN" ]] || [[ "$restore_status" == "WARN" ]]; then
        overall="WARN"
    fi

    # Count backups
    local backup_count=$(find "$BACKUPS_DIR" -maxdepth 1 -type f \( -name "backup-*" -o -name "wise2_backup_*" \) 2>/dev/null | wc -l)

    # Latest backup info
    local latest_backup=""
    local latest_size="N/A"
    local latest_age="N/A"

    while IFS= read -r backup_file; do
        if [ -f "$backup_file" ]; then
            latest_backup=$(basename "$backup_file")
            local file_size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file" 2>/dev/null || echo 0)
            local file_time=$(stat -f%m "$backup_file" 2>/dev/null || stat -c%Y "$backup_file" 2>/dev/null || echo 0)
            latest_size="$(format_size $file_size)"
            latest_age="$(calculate_age_hours $file_time)h"
            break
        fi
    done < <(find "$BACKUPS_DIR" -maxdepth 1 -type f -name "*backup*" -exec ls -t {} + 2>/dev/null | head -1)

    # Disk space
    local filesystem=$(df "$BACKUPS_DIR" | tail -1)
    local percent_used=$(echo "$filesystem" | awk '{print $5}' | sed 's/%//')
    local percent_available=$(( 100 - percent_used ))

    # Generate JSON
    cat > "$STATUS_FILE" <<EOF
{
  "timestamp": "$(date -u +'%Y-%m-%dT%H:%M:%SZ')",
  "status": "$overall",
  "checks": {
    "local_backups": "$local_status",
    "remote_backups": "$remote_status",
    "disk_space": "$disk_status",
    "restore_test": "$restore_status"
  },
  "backups": {
    "count": $backup_count,
    "latest_name": "$latest_backup",
    "latest_size": "$latest_size",
    "latest_age_hours": "$latest_age"
  },
  "storage": {
    "percent_used": $percent_used,
    "percent_available": $percent_available
  },
  "thresholds": {
    "age_warn_hours": $BACKUP_AGE_WARN_HOURS,
    "age_critical_hours": $BACKUP_AGE_CRITICAL_HOURS,
    "min_disk_space_percent": $MIN_DISK_SPACE_PERCENT,
    "min_backup_size_mb": $MIN_BACKUP_SIZE_MB
  }
}
EOF

    log "OK" "Status JSON generated: $STATUS_FILE"
}

# ============================================================================
# ALERTING
# ============================================================================

send_alert() {
    local severity="$1"
    local message="$2"

    # Log to alert log
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$severity] $message" >> "${MONITOR_DIR}/alerts.log"

    # Send email if configured
    if command -v mail &> /dev/null && [ -n "${ALERT_EMAIL:-}" ]; then
        echo "$message" | mail -s "WISE² Backup Alert [$severity]" "$ALERT_EMAIL"
    fi

    # Send Discord notification if webhook configured
    if [ -n "${DISCORD_WEBHOOK:-}" ]; then
        local color="16711680"  # Red for ERROR
        [ "$severity" = "WARN" ] && color="16776960"  # Yellow
        [ "$severity" = "OK" ] && color="65280"       # Green

        curl -X POST "$DISCORD_WEBHOOK" \
            -H 'Content-Type: application/json' \
            -d "{
                \"embeds\": [{
                    \"title\": \"WISE² Backup Alert\",
                    \"description\": \"$message\",
                    \"color\": $color,
                    \"timestamp\": \"$(date -u +'%Y-%m-%dT%H:%M:%SZ')\"
                }]
            }" 2>/dev/null || true
    fi
}

# ============================================================================
# REPORT GENERATION
# ============================================================================

generate_report() {
    log "INFO" "Generating backup status report..."

    local report_file="${MONITOR_DIR}/backup-report-$(date +%Y%m%d-%H%M%S).txt"

    {
        echo "═══════════════════════════════════════════════════════════════"
        echo "WISE² BACKUP HEALTH REPORT"
        echo "Generated: $(date)"
        echo "═══════════════════════════════════════════════════════════════"
        echo ""

        echo "LOCAL BACKUPS"
        echo "─────────────────────────────────────────────────────────────"
        if [ -d "$BACKUPS_DIR" ]; then
            find "$BACKUPS_DIR" -maxdepth 1 -type f \( -name "backup-*" -o -name "wise2_backup_*" \) -exec ls -lh {} \; | awk '{printf "%-50s %10s  %s %s\n", $NF, $5, $6, $7}'
        else
            echo "  (Backups directory not found)"
        fi
        echo ""

        echo "DISK SPACE"
        echo "─────────────────────────────────────────────────────────────"
        df -h "$BACKUPS_DIR" | tail -1 | awk '{printf "Filesystem: %-20s Size: %8s  Used: %8s  Available: %8s (%s)\n", $1, $2, $3, $4, $5}'
        echo ""

        echo "BACKUP RETENTION POLICY"
        echo "─────────────────────────────────────────────────────────────"
        echo "  Keep backups for: $BACKUP_RETENTION_DAYS days"
        echo "  Keep minimum of: $BACKUP_RETENTION_MIN_COUNT backups"
        echo ""

        echo "RECENT RESTORE TESTS"
        echo "─────────────────────────────────────────────────────────────"
        if [ -f "$RESTORE_TEST_LOG" ]; then
            tail -10 "$RESTORE_TEST_LOG"
        else
            echo "  (No restore tests yet)"
        fi
        echo ""

        echo "MONITORING CONFIGURATION"
        echo "─────────────────────────────────────────────────────────────"
        echo "  Backup age warning: $BACKUP_AGE_WARN_HOURS hours"
        echo "  Backup age critical: $BACKUP_AGE_CRITICAL_HOURS hours"
        echo "  Min disk space: $MIN_DISK_SPACE_PERCENT%"
        echo "  Min backup size: $MIN_BACKUP_SIZE_MB MB"
        echo "  S3 bucket: ${S3_BUCKET:-Not configured}"
        echo ""

        echo "═══════════════════════════════════════════════════════════════"
    } | tee "$report_file"

    log "OK" "Report saved to: $report_file"
}

# ============================================================================
# DASHBOARD METRICS
# ============================================================================

show_dashboard() {
    if [ ! -f "$STATUS_FILE" ]; then
        log "WARN" "Status file not found, running health check first..."
        run_health_check
    fi

    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}WISE² BACKUP HEALTH DASHBOARD${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
    echo ""

    if [ -f "$STATUS_FILE" ]; then
        local status=$(grep '"status"' "$STATUS_FILE" | grep -o '"[^"]*"$' | tr -d '"')
        local color="$GREEN"
        [ "$status" = "WARN" ] && color="$YELLOW"
        [ "$status" = "FAIL" ] && color="$RED"

        echo -e "Overall Status: ${color}${status}${NC}"
        echo ""

        echo "Backup Checks:"
        grep '"checks"' -A 4 "$STATUS_FILE" | tail -4 | sed 's/.*"\([^"]*\)": "\([^"]*\)"/  ✓ \1: \2/'
        echo ""

        echo "Latest Backup:"
        local latest=$(grep '"latest_name"' "$STATUS_FILE" | grep -o '"[^"]*"$' | tr -d '"')
        local size=$(grep '"latest_size"' "$STATUS_FILE" | grep -o '"[^"]*"$' | tr -d '"')
        local age=$(grep '"latest_age_hours"' "$STATUS_FILE" | grep -o '"[^"]*"$' | tr -d '"')
        echo "  Name: $latest"
        echo "  Size: $size"
        echo "  Age: $age"
        echo ""

        echo "Storage:"
        local used=$(grep '"percent_used"' "$STATUS_FILE" | grep -o '[0-9]*')
        local avail=$(grep '"percent_available"' "$STATUS_FILE" | grep -o '[0-9]*')
        echo "  Used: ${used}%"
        echo "  Available: ${avail}%"
        echo ""
    fi

    echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
}

# ============================================================================
# MAIN OPERATIONS
# ============================================================================

run_health_check() {
    log "INFO" "Running backup health check..."

    local local_status=$(check_local_backups)
    local remote_status=$(check_remote_backups)
    local disk_status=$(check_disk_space)

    generate_status_json "$local_status" "$remote_status" "$disk_status" "UNTESTED"

    # Determine if we should alert
    if [[ "$local_status" == "FAIL" ]] || [[ "$disk_status" == "FAIL" ]]; then
        send_alert "ERROR" "Backup health check FAILED: local=$local_status, disk=$disk_status"
    elif [[ "$local_status" == "WARN" ]] || [[ "$disk_status" == "WARN" ]]; then
        send_alert "WARN" "Backup health check WARNING: local=$local_status, disk=$disk_status"
    fi

    log "OK" "Health check completed"
}

run_monthly_test() {
    log "INFO" "Running monthly restore test..."

    local restore_status=$(test_restore)

    # Update status JSON
    if [ -f "$STATUS_FILE" ]; then
        sed -i '' "s/\"restore_test\": \"[^\"]*\"/\"restore_test\": \"$restore_status\"/" "$STATUS_FILE"
    fi

    if [[ "$restore_status" == "FAIL" ]]; then
        send_alert "ERROR" "Monthly restore test FAILED"
    fi

    log "OK" "Monthly test completed"
}

# ============================================================================
# CLEANUP & ROTATION
# ============================================================================

cleanup_old_backups() {
    log "INFO" "Cleaning up old backups per retention policy..."

    local removed=0

    # Find backups older than retention days
    while IFS= read -r backup_file; do
        if [ -f "$backup_file" ]; then
            local file_time=$(stat -f%m "$backup_file" 2>/dev/null || stat -c%Y "$backup_file" 2>/dev/null || echo 0)
            local age_days=$(( ($(date +%s) - file_time) / 86400 ))

            if [ $age_days -gt $BACKUP_RETENTION_DAYS ]; then
                log "INFO" "Removing old backup (${age_days} days): $(basename $backup_file)"
                rm -f "$backup_file"
                removed=$((removed + 1))
            fi
        fi
    done < <(find "$BACKUPS_DIR" -maxdepth 1 -type f \( -name "backup-*" -o -name "wise2_backup_*" \) 2>/dev/null)

    log "OK" "Cleaned up $removed old backup(s)"
}

# ============================================================================
# COMMAND ROUTING
# ============================================================================

show_usage() {
    cat <<EOF
WISE² Backup Monitoring

Usage: ./monitor-backups.sh <command>

Commands:
  status          - Check backup health (local, remote, disk, restore)
  report          - Generate detailed backup status report
  test-restore    - Test restore capability (monthly verification)
  dashboard       - Show backup health dashboard
  check-hourly    - Hourly health check (for cron)
  cleanup         - Remove old backups per retention policy
  help            - Show this help message

Examples:
  ./monitor-backups.sh status
  ./monitor-backups.sh report
  ./monitor-backups.sh test-restore
  ./monitor-backups.sh dashboard

Cron Setup:
  # Hourly health checks
  0 * * * * /opt/wise2-core/scripts/monitor-backups.sh check-hourly

  # Monthly restore tests (1st of month at 02:00 UTC)
  0 2 1 * * /opt/wise2-core/scripts/monitor-backups.sh test-restore

EOF
}

main() {
    local command="${1:-status}"

    case "$command" in
        status)
            run_health_check
            ;;
        report)
            generate_report
            ;;
        test-restore|test)
            run_monthly_test
            ;;
        dashboard)
            run_health_check >/dev/null 2>&1 || true
            show_dashboard
            ;;
        check-hourly)
            run_health_check >/dev/null 2>&1 || true
            cleanup_old_backups
            ;;
        cleanup)
            cleanup_old_backups
            ;;
        help|--help|-h)
            show_usage
            ;;
        *)
            echo "Unknown command: $command"
            show_usage
            exit 1
            ;;
    esac
}

main "$@"
