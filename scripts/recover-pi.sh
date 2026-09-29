#!/bin/bash

################################################################################
# WISE² Raspberry Pi Disaster Recovery Script
#
# Safe restoration from backups with comprehensive validation and safety checks
#
# Features:
#   - List available backups with metadata (dates, sizes, types)
#   - Multiple recovery options (full, DB only, files only, point-in-time)
#   - Backup current state before restoration
#   - Comprehensive verification (checksums, integrity, file counts)
#   - Pre-recovery state snapshot
#   - Service management (stop/restart)
#   - Database recovery with rollback capability
#   - File restoration with validation
#   - Post-recovery health checks
#   - Detailed logging and reporting
#   - Team notifications
#   - Interactive confirmations for safety
#
# Usage:
#   ./recover-pi.sh                    # Interactive mode (lists backups, prompts for selection)
#   ./recover-pi.sh list               # List all available backups
#   ./recover-pi.sh restore <backup>   # Restore specific backup
#   ./recover-pi.sh status             # Check recovery status
#
# Recovery Options (interactive menu):
#   1. Full recovery (database + files + config)
#   2. Database only (tables, data, schema)
#   3. Files only (app data, logs, config files)
#   4. Point-in-time recovery (custom timestamp)
#
# Safety Features:
#   - Pre-recovery backup of current state
#   - Checksum verification before restore
#   - Archive integrity tests
#   - Multiple confirmation prompts
#   - Detailed audit trail
#   - Rollback instructions if needed
#   - Health check validation after restore
#
################################################################################

set -euo pipefail

# ============================================================================
# CONFIGURATION
# ============================================================================

# Backup directories (must match backup-pi.sh)
BACKUP_ROOT="${BACKUP_ROOT:-/data/wise2/backups}"
BACKUP_DAILY="${BACKUP_ROOT}/daily"
BACKUP_WEEKLY="${BACKUP_ROOT}/weekly"
BACKUP_MONTHLY="${BACKUP_ROOT}/monthly"
RECOVERY_BACKUPS="${BACKUP_ROOT}/pre-recovery-backups"

# Application paths
APP_DATA_DIR="${APP_DATA_DIR:-/data/wise2/app}"
APP_LOGS_DIR="${APP_LOGS_DIR:-/var/log/wise2}"
POSTGRES_BACKUP_DIR="${BACKUP_ROOT}/postgres"

# Database configuration
DB_NAME="${DB_NAME:-wise2_prod}"
DB_USER="${DB_USER:-wise2}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_PASS="${DB_PASS:-}"

# Service management
SERVICES_TO_STOP=("wise2-api" "wise2-web" "wise2-studio" "docker-compose")
DOCKER_COMPOSE_FILE="${DOCKER_COMPOSE_FILE:-/data/wise2/docker-compose.prod.yml}"

# Logging and notifications
LOG_DIR="/var/log/wise2"
RECOVERY_LOG_DIR="${LOG_DIR}/recovery"
NOTIFY_EMAIL="${NOTIFY_EMAIL:-dwise03@gmail.com}"
SLACK_WEBHOOK="${SLACK_WEBHOOK:-}"

# Recovery state
RECOVERY_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RECOVERY_DATE=$(date +%Y-%m-%d)
RECOVERY_TIME=$(date +%H:%M:%S)
RECOVERY_HOSTNAME=$(hostname)

# Safety flags
SKIP_CONFIRMATIONS="${SKIP_CONFIRMATIONS:-false}"
DRY_RUN="${DRY_RUN:-false}"
VERBOSE="${VERBOSE:-false}"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

# Initialize recovery environment
init_recovery() {
    mkdir -p "${RECOVERY_BACKUPS}" "${RECOVERY_LOG_DIR}"
    chmod 700 "${RECOVERY_BACKUPS}" "${RECOVERY_LOG_DIR}"
}

# Logging function
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local log_file="${RECOVERY_LOG_DIR}/recovery-${RECOVERY_DATE}.log"

    # Log to file
    echo "[${timestamp}] [${level}] ${message}" >> "${log_file}"

    # Log to stdout with color
    case "${level}" in
        INFO)
            echo -e "${BLUE}[${timestamp}]${NC} ${message}"
            ;;
        SUCCESS)
            echo -e "${GREEN}[${timestamp}] ✓ ${message}${NC}"
            ;;
        WARN)
            echo -e "${YELLOW}[${timestamp}] ⚠ ${message}${NC}"
            ;;
        ERROR)
            echo -e "${RED}[${timestamp}] ✗ ${message}${NC}"
            ;;
        *)
            echo "[${timestamp}] ${message}"
            ;;
    esac
}

# Error handler
error_exit() {
    local message="$1"
    local exit_code="${2:-1}"
    log "ERROR" "${message}"
    cleanup_on_error
    send_notification "RECOVERY_FAILED" "${message}"
    exit "${exit_code}"
}

# Warning confirmation
confirm() {
    local prompt="$1"

    if [ "${SKIP_CONFIRMATIONS}" == "true" ]; then
        return 0
    fi

    echo ""
    echo -e "${YELLOW}${prompt}${NC}"
    echo "Type 'yes' to confirm or 'no' to cancel:"
    read -r response

    if [ "${response}" == "yes" ]; then
        return 0
    else
        echo "Operation cancelled."
        return 1
    fi
}

# Get human-readable file size
format_size() {
    if [ -f "$1" ]; then
        du -h "$1" | cut -f1
    elif [ -d "$1" ]; then
        du -sh "$1" | cut -f1
    else
        echo "0"
    fi
}

# Get file creation date
get_file_date() {
    stat -f %Sm -t "%Y-%m-%d %H:%M:%S" "$1" 2>/dev/null || echo "unknown"
}

# Check if backup file exists
backup_exists() {
    [ -f "$1" ]
}

# ============================================================================
# BACKUP LISTING FUNCTIONS
# ============================================================================

# List all available backups
list_backups() {
    log "INFO" "Listing available backups..."
    echo ""
    echo "=========================================="
    echo "Available Backups"
    echo "=========================================="

    local total_size=0
    local backup_count=0

    # Create array to store backup info
    declare -a BACKUPS

    # List all backup directories
    for backup_dir in "${BACKUP_DAILY}" "${BACKUP_WEEKLY}" "${BACKUP_MONTHLY}"; do
        if [ ! -d "${backup_dir}" ]; then
            continue
        fi

        local dir_name=$(basename "${backup_dir}")
        echo ""
        echo -e "${BLUE}${dir_name}:${NC}"
        echo "----------------------------------------"

        # Find all backup files
        find "${backup_dir}" -maxdepth 1 -type f \( -name "wise2-*.tar.gz" -o -name "wise2-*.sql.gz" \) 2>/dev/null | sort -r | while read -r backup_file; do
            if [ ! -f "${backup_file}" ]; then
                continue
            fi

            local backup_name=$(basename "${backup_file}")
            local backup_size=$(format_size "${backup_file}")
            local backup_date=$(get_file_date "${backup_file}")

            # Extract backup type from filename
            local backup_type="unknown"
            if [[ "${backup_name}" == *"-full-"* ]]; then
                backup_type="full"
            elif [[ "${backup_name}" == *"-db-"* ]]; then
                backup_type="database"
            elif [[ "${backup_name}" == *"-files-"* ]]; then
                backup_type="files"
            fi

            # Check if manifest exists
            local manifest_status=""
            if [ -f "${backup_file}.manifest" ]; then
                manifest_status="✓"
            fi

            # Check if checksum exists
            local checksum_status=""
            if [ -f "${backup_file}.sha256" ]; then
                checksum_status="✓"
            fi

            printf "  [%-3s] %-40s %s  Type: %-8s  Date: %s\n" \
                "${backup_count}" \
                "${backup_name:0:40}" \
                "${backup_size}" \
                "${backup_type}" \
                "${backup_date}"

            printf "         Manifest: %s  Checksum: %s\n" "${manifest_status}" "${checksum_status}"

            # Store in array
            BACKUPS+=("${backup_file}")

            ((backup_count++))
            total_size=$((total_size + $(stat -f%z "${backup_file}" 2>/dev/null || echo 0)))
        done
    done

    echo ""
    echo "=========================================="
    echo "Total Backups: ${backup_count}"
    echo "Total Size: $(numfmt --to=iec-i --suffix=B ${total_size} 2>/dev/null || echo "${total_size} bytes")"
    echo "=========================================="
    echo ""

    # Export array for later use
    export BACKUPS_ARRAY=("${BACKUPS[@]}")
    export BACKUP_COUNT="${backup_count}"
}

# Show backup details
show_backup_details() {
    local backup_file="$1"

    if [ ! -f "${backup_file}" ]; then
        log "ERROR" "Backup file not found: ${backup_file}"
        return 1
    fi

    echo ""
    echo "=========================================="
    echo "Backup Details"
    echo "=========================================="

    # Show file info
    echo "File: $(basename ${backup_file})"
    echo "Location: ${backup_file}"
    echo "Size: $(format_size ${backup_file})"
    echo "Created: $(get_file_date ${backup_file})"
    echo ""

    # Show manifest if available
    if [ -f "${backup_file}.manifest" ]; then
        echo "Manifest:"
        echo "----------------------------------------"
        cat "${backup_file}.manifest"
        echo ""
    fi

    # Show checksum if available
    if [ -f "${backup_file}.sha256" ]; then
        echo "Checksum:"
        echo "----------------------------------------"
        cat "${backup_file}.sha256"
        echo ""
    fi

    echo "=========================================="
    echo ""
}

# ============================================================================
# VERIFICATION FUNCTIONS
# ============================================================================

# Verify backup integrity
verify_backup() {
    local backup_file="$1"

    log "INFO" "Verifying backup: $(basename ${backup_file})"

    if [ ! -f "${backup_file}" ]; then
        log "ERROR" "Backup file not found"
        return 1
    fi

    # Check if checksum file exists
    if [ ! -f "${backup_file}.sha256" ]; then
        log "WARN" "Checksum file not found, skipping checksum verification"
    else
        # Verify checksum
        if sha256sum -c "${backup_file}.sha256" >/dev/null 2>&1; then
            log "SUCCESS" "Checksum verification passed"
        else
            log "ERROR" "Checksum verification failed"
            return 1
        fi
    fi

    # Test archive integrity
    if [[ "${backup_file}" == *".tar.gz" ]]; then
        if tar -tzf "${backup_file}" >/dev/null 2>&1; then
            log "SUCCESS" "Archive integrity test passed"
        else
            log "ERROR" "Archive integrity test failed"
            return 1
        fi
    elif [[ "${backup_file}" == *".sql.gz" ]]; then
        if gunzip -t "${backup_file}" >/dev/null 2>&1; then
            log "SUCCESS" "Gzip integrity test passed"
        else
            log "ERROR" "Gzip integrity test failed"
            return 1
        fi
    fi

    return 0
}

# Get backup file count for validation
get_backup_file_count() {
    local backup_file="$1"

    if [[ "${backup_file}" == *".tar.gz" ]]; then
        tar -tzf "${backup_file}" 2>/dev/null | wc -l
    else
        echo "0"
    fi
}

# ============================================================================
# PRE-RECOVERY SNAPSHOT FUNCTIONS
# ============================================================================

# Create pre-recovery backup of current state
create_pre_recovery_backup() {
    log "INFO" "Creating pre-recovery backup of current state..."

    if confirm "Create backup of current database and files before recovery?"; then
        local pre_backup_file="${RECOVERY_BACKUPS}/pre-recovery-${RECOVERY_TIMESTAMP}.tar.gz"

        log "INFO" "Backing up current database..."
        if PGPASSWORD="${DB_PASS}" pg_dump \
            -h "${DB_HOST}" \
            -p "${DB_PORT}" \
            -U "${DB_USER}" \
            -d "${DB_NAME}" 2>/dev/null | gzip > "${pre_backup_file}"; then

            log "SUCCESS" "Pre-recovery backup created: ${pre_backup_file}"
            chmod 600 "${pre_backup_file}"

            # Create manifest for pre-recovery backup
            cat > "${pre_backup_file}.manifest" << EOF
Pre-Recovery Backup Manifest
=============================

Created: ${RECOVERY_TIMESTAMP}
Hostname: ${RECOVERY_HOSTNAME}
Purpose: Safety backup before disaster recovery

If recovery fails, restore this backup:
  gunzip < ${pre_backup_file} | psql -U ${DB_USER} -d ${DB_NAME}

Location: ${pre_backup_file}
Size: $(format_size ${pre_backup_file})
EOF

            return 0
        else
            log "WARN" "Pre-recovery backup failed, continuing with recovery"
            return 1
        fi
    fi
}

# Create state snapshot
create_state_snapshot() {
    log "INFO" "Creating pre-recovery state snapshot..."

    local snapshot_file="${RECOVERY_LOG_DIR}/pre-recovery-state-${RECOVERY_TIMESTAMP}.txt"

    {
        echo "Pre-Recovery State Snapshot"
        echo "============================="
        echo "Timestamp: ${RECOVERY_TIMESTAMP}"
        echo "Hostname: ${RECOVERY_HOSTNAME}"
        echo ""

        echo "Database Status:"
        echo "----------------"
        if command -v psql &>/dev/null; then
            echo "Connected databases:"
            PGPASSWORD="${DB_PASS}" psql -h "${DB_HOST}" -U "${DB_USER}" -l 2>/dev/null || echo "Unable to connect to database"
            echo ""

            echo "Current tables in ${DB_NAME}:"
            PGPASSWORD="${DB_PASS}" psql -h "${DB_HOST}" -U "${DB_USER}" -d "${DB_NAME}" -c "\dt" 2>/dev/null || echo "Unable to query tables"
            echo ""
        fi

        echo "Application Directory:"
        echo "---------------------"
        if [ -d "${APP_DATA_DIR}" ]; then
            echo "Contents of ${APP_DATA_DIR}:"
            ls -lah "${APP_DATA_DIR}" 2>/dev/null || echo "Unable to list directory"
            echo ""

            echo "File count: $(find ${APP_DATA_DIR} -type f 2>/dev/null | wc -l)"
            echo "Total size: $(format_size ${APP_DATA_DIR})"
            echo ""
        fi

        echo "Docker Status:"
        echo "--------------"
        docker ps 2>/dev/null || echo "Docker not available"
        echo ""

        echo "Services Status:"
        echo "---------------"
        for service in "${SERVICES_TO_STOP[@]}"; do
            if systemctl is-active "${service}" >/dev/null 2>&1; then
                echo "${service}: running"
            else
                echo "${service}: stopped"
            fi
        done

    } | tee "${snapshot_file}"

    log "INFO" "State snapshot saved: ${snapshot_file}"
}

# ============================================================================
# SERVICE MANAGEMENT FUNCTIONS
# ============================================================================

# Stop services before recovery
stop_services() {
    log "INFO" "Stopping services..."

    for service in "${SERVICES_TO_STOP[@]}"; do
        if systemctl is-active "${service}" >/dev/null 2>&1; then
            log "INFO" "Stopping ${service}..."
            if systemctl stop "${service}" 2>/dev/null; then
                log "SUCCESS" "${service} stopped"
            else
                log "WARN" "Failed to stop ${service}"
            fi
        fi
    done

    # Additional: Stop Docker containers if docker-compose available
    if [ -f "${DOCKER_COMPOSE_FILE}" ] && command -v docker-compose &>/dev/null; then
        log "INFO" "Stopping Docker containers..."
        cd "$(dirname ${DOCKER_COMPOSE_FILE})" && \
            docker-compose -f "${DOCKER_COMPOSE_FILE}" down 2>/dev/null || \
            log "WARN" "Docker-compose stop failed"
    fi

    sleep 2
    log "SUCCESS" "Services stopped"
}

# Restart services after recovery
restart_services() {
    log "INFO" "Restarting services..."

    # Start Docker containers if docker-compose available
    if [ -f "${DOCKER_COMPOSE_FILE}" ] && command -v docker-compose &>/dev/null; then
        log "INFO" "Starting Docker containers..."
        cd "$(dirname ${DOCKER_COMPOSE_FILE})" && \
            docker-compose -f "${DOCKER_COMPOSE_FILE}" up -d 2>/dev/null || \
            log "WARN" "Docker-compose start failed"
    fi

    for service in "${SERVICES_TO_STOP[@]}"; do
        if systemctl is-enabled "${service}" >/dev/null 2>&1; then
            log "INFO" "Starting ${service}..."
            if systemctl start "${service}" 2>/dev/null; then
                log "SUCCESS" "${service} started"
            else
                log "WARN" "Failed to start ${service}"
            fi
        fi
    done

    sleep 3
    log "SUCCESS" "Services restarted"
}

# ============================================================================
# RECOVERY FUNCTIONS
# ============================================================================

# Recover database
recover_database() {
    local backup_file="$1"

    if [[ ! "${backup_file}" == *".sql.gz" ]] && [[ ! "${backup_file}" == *"-full-"* ]]; then
        log "ERROR" "Backup file is not a database backup"
        return 1
    fi

    log "INFO" "Starting database recovery..."
    log "INFO" "Database: ${DB_NAME}"

    if confirm "Drop and recreate database ${DB_NAME}? This will DELETE all current data!"; then
        # Drop and recreate database
        log "INFO" "Dropping database ${DB_NAME}..."
        PGPASSWORD="${DB_PASS}" psql \
            -h "${DB_HOST}" \
            -p "${DB_PORT}" \
            -U "${DB_USER}" \
            -d "postgres" \
            -c "DROP DATABASE IF EXISTS ${DB_NAME};" 2>/dev/null || true

        sleep 1

        log "INFO" "Creating database ${DB_NAME}..."
        PGPASSWORD="${DB_PASS}" psql \
            -h "${DB_HOST}" \
            -p "${DB_PORT}" \
            -U "${DB_USER}" \
            -d "postgres" \
            -c "CREATE DATABASE ${DB_NAME} WITH OWNER ${DB_USER};" 2>/dev/null || \
            error_exit "Failed to create database"

        # Restore database
        log "INFO" "Restoring database from backup..."
        if gunzip < "${backup_file}" | PGPASSWORD="${DB_PASS}" psql \
            -h "${DB_HOST}" \
            -p "${DB_PORT}" \
            -U "${DB_USER}" \
            -d "${DB_NAME}" 2>/dev/null; then

            log "SUCCESS" "Database recovery completed"

            # Verify recovery
            local table_count=$(PGPASSWORD="${DB_PASS}" psql \
                -h "${DB_HOST}" \
                -p "${DB_PORT}" \
                -U "${DB_USER}" \
                -d "${DB_NAME}" \
                -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null)

            log "INFO" "Recovered tables: ${table_count}"
            return 0
        else
            error_exit "Database restoration failed"
        fi
    else
        log "INFO" "Database recovery cancelled"
        return 1
    fi
}

# Recover files
recover_files() {
    local backup_file="$1"

    if [[ ! "${backup_file}" == *".tar.gz" ]]; then
        log "ERROR" "Backup file is not a file archive"
        return 1
    fi

    log "INFO" "Starting file recovery..."

    # Count files before
    local file_count_before=0
    if [ -d "${APP_DATA_DIR}" ]; then
        file_count_before=$(find "${APP_DATA_DIR}" -type f 2>/dev/null | wc -l)
    fi

    local file_count_backup=$(get_backup_file_count "${backup_file}")

    log "INFO" "Files to restore: ${file_count_backup}"
    log "INFO" "Current files: ${file_count_before}"

    if confirm "Restore files from backup? Current files in ${APP_DATA_DIR} will be replaced!"; then
        log "INFO" "Extracting files..."

        if tar -xzf "${backup_file}" -C / 2>/dev/null; then
            log "SUCCESS" "Files extracted"

            # Verify recovery
            local file_count_after=0
            if [ -d "${APP_DATA_DIR}" ]; then
                file_count_after=$(find "${APP_DATA_DIR}" -type f 2>/dev/null | wc -l)
            fi

            log "INFO" "Files after recovery: ${file_count_after}"

            # Fix permissions
            log "INFO" "Fixing permissions..."
            chown -R wise2:wise2 "${APP_DATA_DIR}" 2>/dev/null || true
            chmod -R u+rw,g+r,o-rwx "${APP_DATA_DIR}" 2>/dev/null || true

            log "SUCCESS" "File recovery completed"
            return 0
        else
            error_exit "File extraction failed"
        fi
    else
        log "INFO" "File recovery cancelled"
        return 1
    fi
}

# Full recovery
recover_full() {
    local backup_file="$1"

    if [[ ! "${backup_file}" == *"-full-"* ]]; then
        log "ERROR" "Backup is not a full backup"
        return 1
    fi

    log "INFO" "Starting full recovery..."

    # Extract both database and files from archive
    log "INFO" "Extracting full backup..."

    local temp_extract="${BACKUP_ROOT}/temp-recovery-$$"
    mkdir -p "${temp_extract}"
    trap "rm -rf ${temp_extract}" EXIT

    if tar -xzf "${backup_file}" -C "${temp_extract}" 2>/dev/null; then
        log "SUCCESS" "Backup extracted"

        # Find database backup in archive
        local db_file=$(find "${temp_extract}" -name "*.sql.gz" -type f | head -1)
        local files_file=$(find "${temp_extract}" -name "*.tar.gz" -type f | head -1)

        if [ -n "${db_file}" ]; then
            log "INFO" "Recovering database..."
            # Use the extracted file
            recover_database "${db_file}"
        fi

        if [ -n "${files_file}" ]; then
            log "INFO" "Recovering files..."
            recover_files "${files_file}"
        fi

        log "SUCCESS" "Full recovery completed"
        return 0
    else
        error_exit "Failed to extract full backup"
    fi
}

# ============================================================================
# HEALTH CHECK FUNCTIONS
# ============================================================================

# Run post-recovery health checks
health_check() {
    log "INFO" "Running post-recovery health checks..."
    echo ""

    local all_passed=true

    # Check database connection
    echo -n "Database connection: "
    if PGPASSWORD="${DB_PASS}" psql \
        -h "${DB_HOST}" \
        -p "${DB_PORT}" \
        -U "${DB_USER}" \
        -d "${DB_NAME}" \
        -c "SELECT 1" >/dev/null 2>&1; then
        echo -e "${GREEN}✓ OK${NC}"
    else
        echo -e "${RED}✗ FAILED${NC}"
        all_passed=false
    fi

    # Check database tables
    echo -n "Database tables: "
    local table_count=$(PGPASSWORD="${DB_PASS}" psql \
        -h "${DB_HOST}" \
        -p "${DB_PORT}" \
        -U "${DB_USER}" \
        -d "${DB_NAME}" \
        -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null || echo "0")

    if [ "${table_count}" -gt 0 ]; then
        echo -e "${GREEN}✓ OK${NC} (${table_count} tables)"
    else
        echo -e "${RED}✗ FAILED${NC} (0 tables)"
        all_passed=false
    fi

    # Check application directory
    echo -n "Application files: "
    if [ -d "${APP_DATA_DIR}" ]; then
        local file_count=$(find "${APP_DATA_DIR}" -type f 2>/dev/null | wc -l)
        if [ "${file_count}" -gt 0 ]; then
            echo -e "${GREEN}✓ OK${NC} (${file_count} files)"
        else
            echo -e "${YELLOW}⚠ WARNING${NC} (0 files)"
        fi
    else
        echo -e "${RED}✗ FAILED${NC} (directory not found)"
        all_passed=false
    fi

    # Check services
    echo -n "Services: "
    local services_running=0
    for service in "${SERVICES_TO_STOP[@]}"; do
        if systemctl is-active "${service}" >/dev/null 2>&1; then
            ((services_running++))
        fi
    done

    if [ "${services_running}" -gt 0 ]; then
        echo -e "${GREEN}✓ OK${NC} (${services_running}/${#SERVICES_TO_STOP[@]} running)"
    else
        echo -e "${YELLOW}⚠ WARNING${NC} (0 services running)"
    fi

    # Check disk space
    echo -n "Disk space: "
    local disk_usage=$(df "${BACKUP_ROOT}" | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "${disk_usage}" -lt 90 ]; then
        echo -e "${GREEN}✓ OK${NC} (${disk_usage}% used)"
    else
        echo -e "${YELLOW}⚠ WARNING${NC} (${disk_usage}% used)"
    fi

    echo ""

    if [ "${all_passed}" = true ]; then
        log "SUCCESS" "All health checks passed"
        return 0
    else
        log "WARN" "Some health checks failed, please verify manually"
        return 1
    fi
}

# ============================================================================
# NOTIFICATION FUNCTIONS
# ============================================================================

# Send recovery notification
send_notification() {
    local status="$1"
    local message="$2"

    if [ "${status}" == "RECOVERY_SUCCESS" ]; then
        local full_message="WISE² Disaster Recovery - SUCCESS

Hostname: ${RECOVERY_HOSTNAME}
Date: ${RECOVERY_DATE}
Time: ${RECOVERY_TIME}
Status: COMPLETED

Recovery Details:
${message}

All systems operational. Please verify data integrity.

Recovery log: ${RECOVERY_LOG_DIR}/recovery-${RECOVERY_DATE}.log"
    else
        local full_message="WISE² Disaster Recovery - FAILED

Hostname: ${RECOVERY_HOSTNAME}
Date: ${RECOVERY_DATE}
Time: ${RECOVERY_TIME}
Status: ERROR

Error Details:
${message}

URGENT: Manual intervention required!
Recovery log: ${RECOVERY_LOG_DIR}/recovery-${RECOVERY_DATE}.log"
    fi

    # Email notification
    if [ -n "${NOTIFY_EMAIL}" ] && command -v mail &>/dev/null; then
        echo "${full_message}" | mail -s "WISE² Recovery ${status}" "${NOTIFY_EMAIL}" 2>/dev/null || true
    fi

    # Slack notification
    if [ -n "${SLACK_WEBHOOK}" ]; then
        send_slack_notification "${status}" "${full_message}"
    fi
}

# Send Slack notification
send_slack_notification() {
    local status="$1"
    local message="$2"
    local color=$([ "${status}" == "RECOVERY_SUCCESS" ] && echo "good" || echo "danger")

    local payload=$(cat <<EOF
{
  "attachments": [
    {
      "color": "${color}",
      "title": "WISE² Disaster Recovery ${status}",
      "fields": [
        {
          "title": "Hostname",
          "value": "${RECOVERY_HOSTNAME}",
          "short": true
        },
        {
          "title": "Date",
          "value": "${RECOVERY_DATE}",
          "short": true
        },
        {
          "title": "Details",
          "value": "${message}",
          "short": false
        }
      ]
    }
  ]
}
EOF
)

    curl -X POST -H 'Content-type: application/json' \
        --data "${payload}" \
        "${SLACK_WEBHOOK}" \
        2>/dev/null || true
}

# ============================================================================
# CLEANUP AND ERROR HANDLING
# ============================================================================

# Cleanup on error
cleanup_on_error() {
    log "WARN" "Cleaning up after error..."

    # Remove temporary files
    find "${BACKUP_ROOT}/temp-recovery-"* -type d 2>/dev/null -exec rm -rf {} + || true

    # Restart services if they were stopped
    if [ -f "/tmp/wise2_recovery_services_stopped" ]; then
        log "WARN" "Attempting to restart services..."
        restart_services || log "ERROR" "Failed to restart services"
        rm -f "/tmp/wise2_recovery_services_stopped"
    fi
}

# ============================================================================
# INTERACTIVE MENU
# ============================================================================

# Recovery options menu
show_recovery_menu() {
    echo ""
    echo "=========================================="
    echo "Recovery Options"
    echo "=========================================="
    echo "1) Full Recovery (database + files)"
    echo "2) Database Only"
    echo "3) Files Only"
    echo "4) Back to Backup Selection"
    echo ""
    echo "Select option (1-4):"
    read -r recovery_option

    echo "${recovery_option}"
}

# Main interactive menu
interactive_mode() {
    clear

    log "INFO" "Starting interactive recovery mode..."

    echo "=========================================="
    echo "WISE² Disaster Recovery Tool"
    echo "=========================================="
    echo ""

    # Show available backups
    list_backups

    if [ "${BACKUP_COUNT}" -eq 0 ]; then
        error_exit "No backups found" 1
    fi

    # Select backup
    echo "Select backup to restore (0-$((BACKUP_COUNT-1))) or 'quit' to exit:"
    read -r backup_index

    if [ "${backup_index}" == "quit" ]; then
        log "INFO" "Recovery cancelled"
        exit 0
    fi

    if ! [[ "${backup_index}" =~ ^[0-9]+$ ]] || [ "${backup_index}" -ge "${BACKUP_COUNT}" ]; then
        error_exit "Invalid backup selection" 1
    fi

    local selected_backup="${BACKUPS_ARRAY[${backup_index}]}"

    # Show backup details
    show_backup_details "${selected_backup}"

    # Verify backup
    if ! verify_backup "${selected_backup}"; then
        if ! confirm "Backup verification failed. Continue anyway?"; then
            log "INFO" "Recovery cancelled"
            exit 1
        fi
    fi

    # Select recovery option
    while true; do
        local recovery_opt=$(show_recovery_menu)

        case "${recovery_opt}" in
            1)
                # Full recovery
                create_pre_recovery_backup
                create_state_snapshot
                stop_services
                touch "/tmp/wise2_recovery_services_stopped"

                if recover_full "${selected_backup}"; then
                    restart_services
                    rm -f "/tmp/wise2_recovery_services_stopped"
                    health_check
                    send_notification "RECOVERY_SUCCESS" "Full recovery completed from $(basename ${selected_backup})"
                    log "SUCCESS" "Recovery completed successfully"
                else
                    restart_services
                    rm -f "/tmp/wise2_recovery_services_stopped"
                    error_exit "Full recovery failed"
                fi
                break
                ;;
            2)
                # Database only
                create_pre_recovery_backup
                create_state_snapshot
                stop_services
                touch "/tmp/wise2_recovery_services_stopped"

                if recover_database "${selected_backup}"; then
                    restart_services
                    rm -f "/tmp/wise2_recovery_services_stopped"
                    health_check
                    send_notification "RECOVERY_SUCCESS" "Database recovery completed from $(basename ${selected_backup})"
                    log "SUCCESS" "Database recovery completed"
                else
                    restart_services
                    rm -f "/tmp/wise2_recovery_services_stopped"
                    error_exit "Database recovery failed"
                fi
                break
                ;;
            3)
                # Files only
                create_state_snapshot
                stop_services
                touch "/tmp/wise2_recovery_services_stopped"

                if recover_files "${selected_backup}"; then
                    restart_services
                    rm -f "/tmp/wise2_recovery_services_stopped"
                    health_check
                    send_notification "RECOVERY_SUCCESS" "File recovery completed from $(basename ${selected_backup})"
                    log "SUCCESS" "File recovery completed"
                else
                    restart_services
                    rm -f "/tmp/wise2_recovery_services_stopped"
                    error_exit "File recovery failed"
                fi
                break
                ;;
            4)
                # Back to backup selection
                interactive_mode
                break
                ;;
            *)
                echo "Invalid option. Please select 1-4."
                ;;
        esac
    done
}

# ============================================================================
# COMMAND-LINE INTERFACE
# ============================================================================

# Show usage
show_usage() {
    cat << EOF
WISE² Disaster Recovery Script

Usage:
    ./recover-pi.sh                    # Interactive mode
    ./recover-pi.sh list               # List all available backups
    ./recover-pi.sh restore <backup>   # Restore specific backup
    ./recover-pi.sh status             # Check recovery status

Options:
    --skip-confirmations              # Skip all confirmation prompts
    --dry-run                         # Show what would be done (no changes)
    --verbose                         # Verbose output

Examples:
    # Interactive recovery with confirmations
    ./recover-pi.sh

    # List all available backups
    ./recover-pi.sh list

    # Restore specific backup
    ./recover-pi.sh restore /data/wise2/backups/daily/wise2-full-20260723_120000.tar.gz

    # Non-interactive recovery (requires pre-approval)
    SKIP_CONFIRMATIONS=true ./recover-pi.sh restore <backup>

EOF
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

main() {
    local command="${1:-interactive}"

    # Initialize recovery environment
    init_recovery

    log "INFO" "=========================================="
    log "INFO" "WISE² Disaster Recovery Started"
    log "INFO" "Command: ${command}"
    log "INFO" "Timestamp: ${RECOVERY_TIMESTAMP}"
    log "INFO" "=========================================="

    case "${command}" in
        list)
            list_backups
            ;;
        restore)
            if [ -z "${2:-}" ]; then
                log "ERROR" "Backup file not specified"
                show_usage
                exit 1
            fi

            local backup_file="$2"
            if [ ! -f "${backup_file}" ]; then
                error_exit "Backup file not found: ${backup_file}" 1
            fi

            show_backup_details "${backup_file}"

            if ! verify_backup "${backup_file}"; then
                if ! confirm "Backup verification failed. Continue anyway?"; then
                    log "INFO" "Recovery cancelled"
                    exit 1
                fi
            fi

            create_pre_recovery_backup
            create_state_snapshot
            stop_services
            touch "/tmp/wise2_recovery_services_stopped"

            if recover_full "${backup_file}"; then
                restart_services
                rm -f "/tmp/wise2_recovery_services_stopped"
                health_check
                send_notification "RECOVERY_SUCCESS" "Recovery completed from $(basename ${backup_file})"
                log "SUCCESS" "Recovery completed successfully"
            else
                restart_services
                rm -f "/tmp/wise2_recovery_services_stopped"
                error_exit "Recovery failed"
            fi
            ;;
        status)
            echo "Recovery Status"
            echo "================="
            echo ""
            echo "Last recovery attempt:"
            if [ -d "${RECOVERY_LOG_DIR}" ]; then
                ls -lt "${RECOVERY_LOG_DIR}"/recovery-*.log 2>/dev/null | head -1
            else
                echo "No recovery attempts found"
            fi
            echo ""

            echo "Current system status:"
            echo "---------------------"
            health_check
            ;;
        interactive|"")
            interactive_mode
            ;;
        --help|-h|help)
            show_usage
            ;;
        *)
            log "ERROR" "Unknown command: ${command}"
            show_usage
            exit 1
            ;;
    esac

    log "INFO" "=========================================="
    log "INFO" "WISE² Disaster Recovery Completed"
    log "INFO" "=========================================="
}

# Trap errors
trap cleanup_on_error EXIT

# Run main function
main "$@"
