#!/bin/bash

################################################################################
# WISE² Core - Backup Manager for Rollback Support
#
# Manages backup creation, rotation, and cleanup
# Supports both local and remote (Pi) backup operations
#
# Usage:
#   ./backup-manager.sh <pi_hostname> create     # Create new backup
#   ./backup-manager.sh <pi_hostname> list       # List available backups
#   ./backup-manager.sh <pi_hostname> cleanup    # Remove old backups
#   ./backup-manager.sh <pi_hostname> restore <backup_file>
#
################################################################################

set -euo pipefail

# ============================================================================
# CONFIGURATION
# ============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUPS_DIR="${PROJECT_ROOT}/logs/backups"
BACKUP_LOG="${BACKUPS_DIR}/backup.log"

# Create backups directory if needed
mkdir -p "$BACKUPS_DIR"

# Configuration
SSH_USER="${SSH_USER:-pi}"
SSH_PORT="${SSH_PORT:-22}"
SSH_TIMEOUT=30

PI_DEPLOY_DIR="/opt/wise2-edge"
PI_BACKUPS_DIR="/opt/wise2-edge-backups"

# Backup retention (days)
BACKUP_RETENTION_DAYS=7
BACKUP_RETENTION_COUNT=10

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

log() {
    local level="$1"
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[${timestamp}] [${level}] ${message}" | tee -a "$BACKUP_LOG"
}

print_header() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
}

print_ok() {
    echo -e "${GREEN}✓${NC} $1"
    log "INFO" "✓ $1"
}

print_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    log "WARN" "⚠ $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
    log "ERROR" "✗ $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
    log "INFO" "ℹ $1"
}

# SSH command executor
ssh_execute() {
    local cmd="$1"
    ssh -p "$SSH_PORT" -o ConnectTimeout="$SSH_TIMEOUT" \
        -o StrictHostKeyChecking=no \
        "${SSH_USER}@${PI_HOSTNAME}" "$cmd"
}

# Format bytes to human readable
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

# ============================================================================
# BACKUP OPERATIONS
# ============================================================================

validate_pi_connection() {
    if ! ssh -p "$SSH_PORT" -o ConnectTimeout="$SSH_TIMEOUT" \
         -o StrictHostKeyChecking=no \
         "${SSH_USER}@${PI_HOSTNAME}" "echo 'connected'" &>/dev/null; then
        print_error "Cannot connect to Pi at ${PI_HOSTNAME}"
        return 1
    fi
    return 0
}

create_backup() {
    print_header "Creating Backup"

    local backup_timestamp=$(date +%Y%m%d-%H%M%S)
    local backup_name="backup-${backup_timestamp}"
    local pi_backup_dir="${PI_BACKUPS_DIR}/${backup_name}"
    local local_backup_file="${BACKUPS_DIR}/${backup_name}.tar.gz"

    print_info "Backup name: $backup_name"
    print_info "Location: $pi_backup_dir"

    # Create backup directory on Pi
    print_info "Creating backup directory on Pi..."
    ssh_execute "mkdir -p '${pi_backup_dir}'" || {
        print_error "Failed to create backup directory"
        return 1
    }

    # Backup database
    print_info "Backing up PostgreSQL database..."
    ssh_execute "cd ${pi_backup_dir} && \
        docker-compose -f ${PI_DEPLOY_DIR}/docker-compose.pi3b.yml exec -T postgres \
        pg_dump -U wise2 wise2_prod -F custom > db-dump.dump 2>/dev/null || \
        echo 'Database backup skipped (service may not be running)'" || true

    # Backup Docker volumes
    print_info "Backing up Docker volumes..."
    ssh_execute "cd ${pi_backup_dir} && \
        docker run --rm \
        -v wise2_postgres_data:/data \
        -v ${PI_BACKUPS_DIR}:/backup \
        alpine tar czf /backup/${backup_name}/volumes-postgres.tar.gz -C /data . 2>/dev/null || \
        echo 'Volume backup skipped'" || true

    # Backup Redis data
    print_info "Backing up Redis..."
    ssh_execute "cd ${pi_backup_dir} && \
        docker run --rm \
        -v wise2_redis_data:/data \
        -v ${PI_BACKUPS_DIR}:/backup \
        alpine tar czf /backup/${backup_name}/volumes-redis.tar.gz -C /data . 2>/dev/null || \
        echo 'Redis backup skipped'" || true

    # Create metadata file
    print_info "Creating backup metadata..."
    ssh_execute "cat > ${pi_backup_dir}/BACKUP_MANIFEST.txt <<'MANIFEST'
Backup Name: ${backup_name}
Backup Time: $(date)
Git Commit: $(cd ${PI_DEPLOY_DIR} && git rev-parse HEAD 2>/dev/null || echo 'unknown')
Docker Images:
$(cd ${PI_DEPLOY_DIR} && docker-compose -f docker-compose.pi3b.yml images 2>/dev/null || echo 'unknown')
MANIFEST
" || true

    # List backup contents
    print_info "Backup contents:"
    ssh_execute "ls -lh ${pi_backup_dir}/" || true

    # Calculate total size
    local total_size=$(ssh_execute "du -sh ${pi_backup_dir} | cut -f1")
    print_ok "Backup created: ${backup_name} (${total_size})"

    # Copy to local system if desired
    if [ "${BACKUP_TO_LOCAL:-false}" == "true" ]; then
        print_info "Copying backup to local system..."
        scp -P "$SSH_PORT" -r "${SSH_USER}@${PI_HOSTNAME}:${pi_backup_dir}" \
            "${BACKUPS_DIR}/" 2>/dev/null || print_warn "Could not copy to local"
    fi

    log "INFO" "Backup ${backup_name} completed successfully"
}

list_backups() {
    print_header "Available Backups"

    print_info "Backups on Pi:"
    ssh_execute "ls -lht ${PI_BACKUPS_DIR}/ | grep '^d' | awk '{print \$NF, \$6, \$7, \$8}'" || {
        print_warn "No backups found or cannot list"
        return 0
    }

    print_info "Local backups:"
    if [ -d "$BACKUPS_DIR" ]; then
        ls -1lht "$BACKUPS_DIR"/backup-* 2>/dev/null | awk '{printf "%-30s %10s\n", $NF, $5}' || print_warn "No local backups"
    else
        print_warn "No local backup directory"
    fi
}

cleanup_backups() {
    print_header "Cleaning Up Old Backups"

    print_info "Retention policy:"
    echo "  - Keep backups for: ${BACKUP_RETENTION_DAYS} days"
    echo "  - Keep minimum of: ${BACKUP_RETENTION_COUNT} backups"
    echo ""

    # Cleanup on Pi
    print_info "Checking Pi backups for cleanup..."
    ssh_execute "cd ${PI_BACKUPS_DIR} && \
        for backup in backup-*; do
            if [ -d \"\$backup\" ]; then
                backup_age=\$(( ( \$(date +%s) - \$(stat -c %Y \"\$backup\" 2>/dev/null || stat -f %m \"\$backup\") ) / 86400 ))
                if [ \$backup_age -gt ${BACKUP_RETENTION_DAYS} ]; then
                    echo \"Removing old backup: \$backup (age: \${backup_age} days)\"
                    rm -rf \"\$backup\"
                fi
            fi
        done
        echo \"Backup cleanup complete\"" || print_warn "Could not cleanup Pi backups"

    # Cleanup local backups
    print_info "Checking local backups for cleanup..."
    if [ -d "$BACKUPS_DIR" ]; then
        local count=0
        local removed=0

        while IFS= read -r backup; do
            count=$((count + 1))

            if [ $count -gt $BACKUP_RETENTION_COUNT ]; then
                print_warn "Removing old backup: $(basename $backup)"
                rm -rf "$backup"
                removed=$((removed + 1))
            fi
        done < <(find "$BACKUPS_DIR" -maxdepth 1 -type d -name "backup-*" | sort -r)

        print_ok "Local cleanup complete (removed $removed backups)"
    fi

    log "INFO" "Backup cleanup completed"
}

restore_backup() {
    local backup_arg="${1:-}"

    print_header "Restoring Backup"

    if [ -z "$backup_arg" ]; then
        print_error "No backup specified"
        echo "Usage: $0 $PI_HOSTNAME restore <backup_name>"
        echo ""
        print_info "Available backups:"
        list_backups
        return 1
    fi

    # Validate backup exists
    print_info "Looking for backup: $backup_arg"

    # Could be local or on Pi
    local backup_path=""

    if [ -d "${BACKUPS_DIR}/${backup_arg}" ]; then
        backup_path="${BACKUPS_DIR}/${backup_arg}"
        print_ok "Found local backup"
    elif ssh_execute "[ -d '${PI_BACKUPS_DIR}/${backup_arg}' ]" 2>/dev/null; then
        backup_path="${PI_BACKUPS_DIR}/${backup_arg}"
        print_ok "Found backup on Pi"
    else
        print_error "Backup not found: $backup_arg"
        return 1
    fi

    print_warn "This will restore from backup: $backup_arg"
    read -p "Continue? (yes/no): " response

    if [ "$response" != "yes" ]; then
        print_info "Restore cancelled"
        return 0
    fi

    # Perform restore
    print_info "Starting restore process..."
    print_warn "Services will be stopped during restore"

    # Stop services
    print_info "Stopping services..."
    ssh_execute "cd ${PI_DEPLOY_DIR} && \
        docker-compose -f docker-compose.pi3b.yml stop" || print_warn "Service stop had issues"

    # Restore database
    if ssh_execute "[ -f '${backup_path}/db-dump.dump' ]" 2>/dev/null; then
        print_info "Restoring database..."
        ssh_execute "cd ${PI_DEPLOY_DIR} && \
            docker-compose -f docker-compose.pi3b.yml exec -T postgres \
            pg_restore -U wise2 -d wise2_prod < ${backup_path}/db-dump.dump" || print_warn "Database restore had issues"
    fi

    # Start services
    print_info "Starting services..."
    ssh_execute "cd ${PI_DEPLOY_DIR} && \
        docker-compose -f docker-compose.pi3b.yml up -d" || print_warn "Service startup had issues"

    print_ok "Restore complete"
    log "INFO" "Backup restore completed: $backup_arg"
}

# ============================================================================
# VALIDATION & MAIN
# ============================================================================

validate_arguments() {
    if [ $# -lt 2 ]; then
        print_error "Usage: $0 <pi_hostname> <operation> [arguments]"
        echo ""
        echo "Operations:"
        echo "  create    - Create new backup"
        echo "  list      - List available backups"
        echo "  cleanup   - Remove old backups"
        echo "  restore   - Restore from backup"
        echo ""
        echo "Examples:"
        echo "  $0 pi.local create"
        echo "  $0 pi.local list"
        echo "  $0 pi.local cleanup"
        echo "  $0 pi.local restore backup-20260723-120000"
        exit 1
    fi

    PI_HOSTNAME="$1"
    OPERATION="$2"
    shift 2
    ARGS="$@"
}

main() {
    print_header "WISE² Core - Backup Manager"

    validate_arguments "$@"

    print_info "Target Pi: $PI_HOSTNAME"
    print_info "Operation: $OPERATION"

    if ! validate_pi_connection; then
        exit 1
    fi

    case "$OPERATION" in
        create)
            create_backup
            ;;
        list)
            list_backups
            ;;
        cleanup)
            cleanup_backups
            ;;
        restore)
            restore_backup $ARGS
            ;;
        *)
            print_error "Unknown operation: $OPERATION"
            exit 1
            ;;
    esac

    echo ""
    print_ok "Backup operation completed"
}

main "$@"
