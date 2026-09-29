#!/bin/bash

################################################################################
# WISE² Raspberry Pi Backup Script
#
# Automated data backup with retention policies, verification, and notifications
#
# Features:
#   - Full backup (database + application files)
#   - Database-only backup (pg_dump)
#   - Files-only backup (application data + logs)
#   - Retention policies (30 daily, 12 weekly, 12 monthly)
#   - Local and optional S3 backup
#   - Backup verification (checksums, restore test)
#   - Email/Slack notifications
#   - Comprehensive logging
#
# Usage:
#   ./backup-pi.sh [full|db-only|files-only] [options]
#
# Schedule (crontab):
#   0 2 * * * /home/dwise/wise2-core/scripts/backup-pi.sh full >> /var/log/wise2-backup.log 2>&1
#   0 2 * * 0 /home/dwise/wise2-core/scripts/backup-pi.sh full --upload-s3 >> /var/log/wise2-backup.log 2>&1
#
################################################################################

set -euo pipefail

# ============================================================================
# CONFIGURATION
# ============================================================================

# Backup directories
BACKUP_ROOT="/data/wise2/backups"
BACKUP_DAILY="${BACKUP_ROOT}/daily"
BACKUP_WEEKLY="${BACKUP_ROOT}/weekly"
BACKUP_MONTHLY="${BACKUP_ROOT}/monthly"
BACKUP_TEMP="${BACKUP_ROOT}/tmp"

# Application paths
APP_DATA_DIR="/data/wise2/app"
APP_LOGS_DIR="/var/log/wise2"
POSTGRES_BACKUP_DIR="${BACKUP_ROOT}/postgres"

# Database config
DB_NAME="${DB_NAME:-wise2_prod}"
DB_USER="${DB_USER:-wise2}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

# Retention policies
RETENTION_DAILY=30
RETENTION_WEEKLY=12
RETENTION_MONTHLY=12

# S3 config (optional)
S3_ENABLED="${S3_ENABLED:-false}"
S3_BUCKET="${S3_BUCKET:-}"
S3_REGION="${S3_REGION:-us-east-1}"
S3_PREFIX="wise2-backups"

# Notification config
NOTIFY_EMAIL="${NOTIFY_EMAIL:-}"
NOTIFY_SLACK="${NOTIFY_SLACK:-}"
SLACK_WEBHOOK="${SLACK_WEBHOOK:-}"

# Backup metadata
BACKUP_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DATE=$(date +%Y-%m-%d)
BACKUP_WEEK=$(date +%Y-W%V)
BACKUP_MONTH=$(date +%Y-%m)
BACKUP_HOSTNAME=$(hostname)

# Logging
LOG_DIR="/var/log/wise2"
LOG_FILE="${LOG_DIR}/backup-${BACKUP_DATE}.log"

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

# Initialize directories
init_directories() {
    mkdir -p "${BACKUP_DAILY}" "${BACKUP_WEEKLY}" "${BACKUP_MONTHLY}" "${BACKUP_TEMP}" "${POSTGRES_BACKUP_DIR}" "${LOG_DIR}"
    chmod 700 "${BACKUP_ROOT}" "${BACKUP_DAILY}" "${BACKUP_WEEKLY}" "${BACKUP_MONTHLY}"
}

# Logging function
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[${timestamp}] [${level}] ${message}" | tee -a "${LOG_FILE}"
}

# Error handler
error_exit() {
    local message="$1"
    local exit_code="${2:-1}"
    log "ERROR" "${message}"
    send_notification "FAILURE" "${message}"
    exit "${exit_code}"
}

# Get backup size
get_size() {
    if [ -f "$1" ]; then
        du -h "$1" | cut -f1
    elif [ -d "$1" ]; then
        du -sh "$1" | cut -f1
    else
        echo "0"
    fi
}

# ============================================================================
# BACKUP FUNCTIONS
# ============================================================================

# Backup PostgreSQL database
backup_database() {
    local backup_file="${POSTGRES_BACKUP_DIR}/wise2-${BACKUP_TIMESTAMP}.sql.gz"

    log "INFO" "Starting database backup: ${DB_NAME}"

    # Create backup with pg_dump
    if PGPASSWORD="${DB_PASS:-}" pg_dump \
        -h "${DB_HOST}" \
        -p "${DB_PORT}" \
        -U "${DB_USER}" \
        -d "${DB_NAME}" \
        --verbose \
        2>>"${LOG_FILE}" | gzip > "${backup_file}"; then

        local size=$(get_size "${backup_file}")
        log "INFO" "Database backup completed: ${backup_file} (${size})"

        # Generate checksum
        sha256sum "${backup_file}" > "${backup_file}.sha256"
        log "INFO" "Database backup checksum: $(cat ${backup_file}.sha256)"

        echo "${backup_file}"
    else
        error_exit "Database backup failed for ${DB_NAME}"
    fi
}

# Backup application files
backup_files() {
    local backup_file="${BACKUP_TEMP}/wise2-files-${BACKUP_TIMESTAMP}.tar.gz"

    log "INFO" "Starting application files backup"

    # Create tarball of application data and recent logs
    if tar \
        --exclude='node_modules' \
        --exclude='.next' \
        --exclude='dist' \
        --exclude='.git' \
        -czf "${backup_file}" \
        -C /data/wise2 app 2>>"${LOG_FILE}" && \
    tar -czf - -C /var/log wise2 --mtime='7 days ago' 2>>"${LOG_FILE}" | \
        tar -xzf - -C "${BACKUP_TEMP}" 2>>"${LOG_FILE}"; then

        local size=$(get_size "${backup_file}")
        log "INFO" "Application files backup completed: ${backup_file} (${size})"

        # Generate checksum
        sha256sum "${backup_file}" > "${backup_file}.sha256"
        log "INFO" "Files backup checksum: $(cat ${backup_file}.sha256)"

        echo "${backup_file}"
    else
        error_exit "Application files backup failed"
    fi
}

# Create full backup
backup_full() {
    local db_backup=$(backup_database)
    local files_backup=$(backup_files)

    log "INFO" "Creating full backup archive"

    local full_backup="${BACKUP_DAILY}/wise2-full-${BACKUP_TIMESTAMP}.tar.gz"

    if tar -czf "${full_backup}" \
        -C "$(dirname "${db_backup}")" "$(basename "${db_backup}")" \
        -C "$(dirname "${db_backup}")" "$(basename "${db_backup}").sha256" \
        -C "$(dirname "${files_backup}")" "$(basename "${files_backup}")" \
        -C "$(dirname "${files_backup}")" "$(basename "${files_backup}").sha256" \
        2>>"${LOG_FILE}"; then

        local size=$(get_size "${full_backup}")
        log "INFO" "Full backup completed: ${full_backup} (${size})"

        # Create backup manifest
        create_manifest "${full_backup}" "full"

        # Cleanup temp files
        rm -f "${db_backup}" "${db_backup}.sha256" "${files_backup}" "${files_backup}.sha256"

        echo "${full_backup}"
    else
        error_exit "Full backup archive creation failed"
    fi
}

# Create database-only backup
backup_db_only() {
    local db_backup=$(backup_database)

    local final_backup="${BACKUP_DAILY}/wise2-db-${BACKUP_TIMESTAMP}.sql.gz"
    mv "${db_backup}" "${final_backup}"
    mv "${db_backup}.sha256" "${final_backup}.sha256"

    log "INFO" "Database-only backup: ${final_backup}"
    create_manifest "${final_backup}" "database"

    echo "${final_backup}"
}

# Create files-only backup
backup_files_only() {
    local files_backup=$(backup_files)

    local final_backup="${BACKUP_DAILY}/wise2-files-${BACKUP_TIMESTAMP}.tar.gz"
    mv "${files_backup}" "${final_backup}"
    mv "${files_backup}.sha256" "${final_backup}.sha256"

    log "INFO" "Files-only backup: ${final_backup}"
    create_manifest "${final_backup}" "files"

    echo "${final_backup}"
}

# Create backup manifest
create_manifest() {
    local backup_file="$1"
    local backup_type="$2"
    local manifest_file="${backup_file}.manifest"

    cat > "${manifest_file}" << EOF
Backup Manifest
===============

Timestamp:     ${BACKUP_TIMESTAMP}
Date:          ${BACKUP_DATE}
Hostname:      ${BACKUP_HOSTNAME}
Type:          ${backup_type}
Backup File:   $(basename ${backup_file})
Size:          $(get_size ${backup_file})

Database:
  Name:        ${DB_NAME}
  Host:        ${DB_HOST}
  Port:        ${DB_PORT}

Application:
  Data Dir:    ${APP_DATA_DIR}
  Log Dir:     ${APP_LOGS_DIR}

Retention:
  Daily:       ${RETENTION_DAILY} backups
  Weekly:      ${RETENTION_WEEKLY} backups
  Monthly:     ${RETENTION_MONTHLY} backups

Verification:
  Checksum:    SHA256 (see .sha256 file)

Instructions:
  To restore database:
    gunzip < wise2-db-*.sql.gz | psql -U ${DB_USER} -d ${DB_NAME}

  To restore files:
    tar -xzf wise2-files-*.tar.gz -C /

EOF

    log "INFO" "Manifest created: ${manifest_file}"
}

# ============================================================================
# VERIFICATION FUNCTIONS
# ============================================================================

# Verify backup integrity
verify_backup() {
    local backup_file="$1"
    local checksum_file="${backup_file}.sha256"

    log "INFO" "Verifying backup: ${backup_file}"

    if [ ! -f "${checksum_file}" ]; then
        log "WARN" "Checksum file not found: ${checksum_file}"
        return 1
    fi

    # Verify checksum
    if sha256sum -c "${checksum_file}" >>"${LOG_FILE}" 2>&1; then
        log "INFO" "Backup verification passed"
        return 0
    else
        log "ERROR" "Backup verification failed"
        return 1
    fi
}

# Test restore (dry run for database)
test_restore() {
    local backup_file="$1"

    if [[ "${backup_file}" == *".sql.gz" ]]; then
        log "INFO" "Testing database restore (dry-run)"

        # Try to read SQL file (doesn't restore, just verifies it's readable)
        if gunzip -t "${backup_file}" >>"${LOG_FILE}" 2>&1; then
            log "INFO" "Database backup file integrity verified"
            return 0
        else
            log "ERROR" "Database backup file integrity check failed"
            return 1
        fi
    elif [[ "${backup_file}" == *".tar.gz" ]]; then
        log "INFO" "Testing archive integrity"

        if tar -tzf "${backup_file}" >>"${LOG_FILE}" 2>&1 | head -20 >/dev/null; then
            log "INFO" "Archive integrity verified"
            return 0
        else
            log "ERROR" "Archive integrity check failed"
            return 1
        fi
    fi
}

# ============================================================================
# RETENTION POLICY FUNCTIONS
# ============================================================================

# Apply retention policy
apply_retention_policy() {
    log "INFO" "Applying retention policies"

    apply_retention_policy_dir "${BACKUP_DAILY}" "${RETENTION_DAILY}" "daily"
    apply_retention_policy_dir "${BACKUP_WEEKLY}" "${RETENTION_WEEKLY}" "weekly"
    apply_retention_policy_dir "${BACKUP_MONTHLY}" "${RETENTION_MONTHLY}" "monthly"
}

# Apply retention for a specific directory
apply_retention_policy_dir() {
    local backup_dir="$1"
    local retention_count="$2"
    local policy_name="$3"

    local file_count=$(find "${backup_dir}" -maxdepth 1 -type f -name "wise2-*.tar.gz" -o -name "wise2-*.sql.gz" 2>/dev/null | wc -l)

    if [ "${file_count}" -gt "${retention_count}" ]; then
        log "INFO" "Applying ${policy_name} retention: keeping ${retention_count} of ${file_count} backups"

        find "${backup_dir}" -maxdepth 1 -type f \( -name "wise2-*.tar.gz" -o -name "wise2-*.sql.gz" \) -printf '%T@ %p\n' 2>/dev/null | \
            sort -rn | \
            tail -n +$((retention_count + 1)) | \
            cut -d' ' -f2- | \
            while read -r old_backup; do
                log "INFO" "Deleting old ${policy_name} backup: ${old_backup}"
                rm -f "${old_backup}" "${old_backup}.sha256" "${old_backup}.manifest"
            done
    fi
}

# Organize backups into weekly/monthly archives
organize_backups() {
    log "INFO" "Organizing backups into weekly/monthly archives"

    # Move Friday backups to weekly
    find "${BACKUP_DAILY}" -maxdepth 1 -type f -newermt "$(date -d '7 days ago' '+%Y-%m-%d')" \
        -printf '%T@\n' -name "wise2-*.tar.gz" 2>/dev/null | \
        while read -r backup; do
            if [[ "$(date -d @"${backup%.*}" '+%A')" == "Friday" ]]; then
                log "INFO" "Moving to weekly archive: ${backup}"
                mv "${backup}" "${BACKUP_WEEKLY}/"
                [ -f "${backup}.sha256" ] && mv "${backup}.sha256" "${BACKUP_WEEKLY}/"
                [ -f "${backup}.manifest" ] && mv "${backup}.manifest" "${BACKUP_WEEKLY}/"
            fi
        done

    # Move first-of-month backups to monthly
    find "${BACKUP_DAILY}" -maxdepth 1 -type f -name "wise2-*.tar.gz" 2>/dev/null | \
        while read -r backup; do
            if [[ "$(basename "${backup}" | cut -d'-' -f3 | cut -d'_' -f2)" == "01" ]]; then
                log "INFO" "Moving to monthly archive: ${backup}"
                mv "${backup}" "${BACKUP_MONTHLY}/"
                [ -f "${backup}.sha256" ] && mv "${backup}.sha256" "${BACKUP_MONTHLY}/"
                [ -f "${backup}.manifest" ] && mv "${backup}.manifest" "${BACKUP_MONTHLY}/"
            fi
        done
}

# ============================================================================
# S3 UPLOAD FUNCTIONS
# ============================================================================

# Upload backup to S3
upload_to_s3() {
    local backup_file="$1"

    if [ "${S3_ENABLED}" != "true" ] || [ -z "${S3_BUCKET}" ]; then
        log "WARN" "S3 upload disabled or not configured"
        return 0
    fi

    log "INFO" "Starting S3 upload: ${backup_file}"

    # Check if aws-cli is installed
    if ! command -v aws &>/dev/null; then
        log "WARN" "AWS CLI not installed, skipping S3 upload"
        return 1
    fi

    local s3_key="${S3_PREFIX}/${BACKUP_MONTH}/$(basename ${backup_file})"

    if aws s3 cp "${backup_file}" "s3://${S3_BUCKET}/${s3_key}" \
        --region "${S3_REGION}" \
        --storage-class STANDARD_IA \
        --sse AES256 \
        >>"${LOG_FILE}" 2>&1; then

        log "INFO" "S3 upload completed: s3://${S3_BUCKET}/${s3_key}"

        # Also upload manifest and checksum
        [ -f "${backup_file}.sha256" ] && \
            aws s3 cp "${backup_file}.sha256" "s3://${S3_BUCKET}/${s3_key}.sha256" \
            --region "${S3_REGION}" --sse AES256 >>"${LOG_FILE}" 2>&1

        [ -f "${backup_file}.manifest" ] && \
            aws s3 cp "${backup_file}.manifest" "s3://${S3_BUCKET}/${s3_key}.manifest" \
            --region "${S3_REGION}" --sse AES256 >>"${LOG_FILE}" 2>&1

        return 0
    else
        log "ERROR" "S3 upload failed"
        return 1
    fi
}

# ============================================================================
# NOTIFICATION FUNCTIONS
# ============================================================================

# Send notification
send_notification() {
    local status="$1"
    local message="$2"

    if [ "${status}" == "SUCCESS" ]; then
        local backup_size=$(get_size "${BACKUP_DAILY}")
        local backup_count=$(find "${BACKUP_DAILY}" -maxdepth 1 -type f -name "wise2-*.tar.gz" -o -name "wise2-*.sql.gz" 2>/dev/null | wc -l)

        local full_message="WISE² Backup Success

Hostname: ${BACKUP_HOSTNAME}
Date: ${BACKUP_DATE}
Time: $(date '+%H:%M:%S')
Status: COMPLETED

Backup Summary:
- Total backups: ${backup_count}
- Total size: ${backup_size}
- Location: ${BACKUP_DAILY}

${message}"
    else
        local full_message="WISE² Backup Failed

Hostname: ${BACKUP_HOSTNAME}
Date: ${BACKUP_DATE}
Time: $(date '+%H:%M:%S')
Status: ERROR

Error Details:
${message}

Check logs: ${LOG_FILE}"
    fi

    # Email notification
    if [ -n "${NOTIFY_EMAIL}" ] && command -v mail &>/dev/null; then
        echo "${full_message}" | mail -s "WISE² Backup ${status}" "${NOTIFY_EMAIL}"
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
    local color=$([ "${status}" == "SUCCESS" ] && echo "good" || echo "danger")

    local payload=$(cat <<EOF
{
  "attachments": [
    {
      "color": "${color}",
      "title": "WISE² Backup ${status}",
      "fields": [
        {
          "title": "Hostname",
          "value": "${BACKUP_HOSTNAME}",
          "short": true
        },
        {
          "title": "Date",
          "value": "${BACKUP_DATE}",
          "short": true
        },
        {
          "title": "Message",
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
        >>/dev/null 2>&1 || true
}

# ============================================================================
# REPORTING FUNCTIONS
# ============================================================================

# Generate backup report
generate_report() {
    local backup_file="$1"
    local backup_type="$2"

    local report_file="${BACKUP_ROOT}/reports/$(date +%Y%m%d_%H%M%S)-backup-report.txt"
    mkdir -p "${BACKUP_ROOT}/reports"

    cat > "${report_file}" << EOF
WISE² Backup Report
===================

Generated: $(date)
Hostname: ${BACKUP_HOSTNAME}

Backup Details:
  File: $(basename ${backup_file})
  Type: ${backup_type}
  Size: $(get_size ${backup_file})
  Timestamp: ${BACKUP_TIMESTAMP}
  Location: ${backup_file}

Disk Usage:
  Daily:   $(get_size ${BACKUP_DAILY})
  Weekly:  $(get_size ${BACKUP_WEEKLY})
  Monthly: $(get_size ${BACKUP_MONTHLY})
  Total:   $(get_size ${BACKUP_ROOT})

Backup Count:
  Daily:   $(find ${BACKUP_DAILY} -maxdepth 1 -type f -name "wise2-*" 2>/dev/null | wc -l)
  Weekly:  $(find ${BACKUP_WEEKLY} -maxdepth 1 -type f -name "wise2-*" 2>/dev/null | wc -l)
  Monthly: $(find ${BACKUP_MONTHLY} -maxdepth 1 -type f -name "wise2-*" 2>/dev/null | wc -l)

Retention Policies:
  Daily:   Keep last ${RETENTION_DAILY}
  Weekly:  Keep last ${RETENTION_WEEKLY}
  Monthly: Keep last ${RETENTION_MONTHLY}

Recent Backups:
EOF

    ls -lht "${BACKUP_DAILY}" 2>/dev/null | head -5 >> "${report_file}" || true

    log "INFO" "Backup report generated: ${report_file}"
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

main() {
    local backup_type="${1:-full}"
    local upload_s3="${2:-}"

    log "INFO" "=========================================="
    log "INFO" "WISE² Backup Script Started"
    log "INFO" "Backup Type: ${backup_type}"
    log "INFO" "=========================================="

    init_directories

    local backup_file=""

    case "${backup_type}" in
        full)
            backup_file=$(backup_full)
            ;;
        db-only)
            backup_file=$(backup_db_only)
            ;;
        files-only)
            backup_file=$(backup_files_only)
            ;;
        *)
            error_exit "Unknown backup type: ${backup_type}. Use: full, db-only, files-only"
            ;;
    esac

    # Verify backup
    if verify_backup "${backup_file}" && test_restore "${backup_file}"; then
        log "INFO" "Backup verification: PASSED"
    else
        log "WARN" "Backup verification: FAILED (but backup created)"
    fi

    # Upload to S3 if requested
    if [ "${upload_s3}" == "--upload-s3" ]; then
        upload_to_s3 "${backup_file}"
    fi

    # Apply retention policies
    apply_retention_policy
    organize_backups

    # Generate report
    generate_report "${backup_file}" "${backup_type}"

    # Send success notification
    log "INFO" "Backup completed successfully"
    send_notification "SUCCESS" "Backup file: $(basename ${backup_file})"

    log "INFO" "=========================================="
    log "INFO" "WISE² Backup Script Completed"
    log "INFO" "=========================================="
}

# Run main function
main "$@"
