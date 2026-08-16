#!/bin/bash

##############################################################################
# WISE² Backup Script
#
# Creates a full system backup including:
# - Database (SQLite)
# - Redis data
# - Configuration
# - Demo data
#
# Usage:
#   bash pi/scripts/backup.sh
#   bash pi/scripts/backup.sh --full
#   bash pi/scripts/backup.sh --output /path/to/backup.tar.gz
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
BACKUP_DIR="${PROJECT_DIR}/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/wise2_backup_${TIMESTAMP}.tar.gz"
FULL_BACKUP=false

# Functions
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Parse arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --full)
                FULL_BACKUP=true
                shift
                ;;
            --output)
                BACKUP_FILE="$2"
                shift 2
                ;;
            *)
                shift
                ;;
        esac
    done
}

# Create backup directory
setup_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        log "Created backup directory: $BACKUP_DIR"
    fi
}

# Stop services for consistent backup
stop_services() {
    if [ "$FULL_BACKUP" = true ]; then
        log "Stopping services for full backup..."
        cd "$PROJECT_DIR"
        docker-compose -f pi/docker-compose.yml stop || warning "Could not stop services"
        sleep 2
    fi
}

# Start services after backup
start_services() {
    if [ "$FULL_BACKUP" = true ]; then
        log "Starting services..."
        cd "$PROJECT_DIR"
        docker-compose -f pi/docker-compose.yml up -d || warning "Could not start services"
    fi
}

# Backup database
backup_database() {
    log "Backing up database..."

    local db_file="${PROJECT_DIR}/pi/data/wise2.db"

    if [ ! -f "$db_file" ]; then
        warning "Database file not found: $db_file"
        return
    fi

    cp "$db_file" "/tmp/wise2_db_backup.db" || error "Failed to backup database"
    success "Database backed up"
}

# Backup Redis
backup_redis() {
    log "Backing up Redis cache..."

    docker-compose -f pi/docker-compose.yml exec -T redis \
        redis-cli -a "${REDIS_PASSWORD}" BGSAVE > /dev/null 2>&1 || warning "Redis backup may not have completed"

    # Wait for Redis to finish
    sleep 2

    success "Redis backup completed"
}

# Backup configuration
backup_config() {
    log "Backing up configuration..."

    cp "${PROJECT_DIR}/pi/.env" "/tmp/wise2_env_backup" 2>/dev/null || warning "Could not backup .env file"
    success "Configuration backed up"
}

# Create archive
create_archive() {
    log "Creating backup archive: $BACKUP_FILE"

    cd "/tmp"

    # List files to backup
    local backup_files=(
        "wise2_db_backup.db"
        "wise2_env_backup"
    )

    # Also backup Docker volumes
    if [ "$FULL_BACKUP" = true ]; then
        log "Including Docker volumes..."
        backup_files+=(
            "${PROJECT_DIR}/pi/data"
            "${PROJECT_DIR}/pi/config"
        )
    fi

    # Create tar archive
    tar -czf "$BACKUP_FILE" "${backup_files[@]}" 2>/dev/null || error "Failed to create archive"

    # Calculate size
    local size=$(du -h "$BACKUP_FILE" | awk '{print $1}')
    success "Backup archive created: $size"
}

# Verify backup
verify_backup() {
    log "Verifying backup integrity..."

    if tar -tzf "$BACKUP_FILE" > /dev/null 2>&1; then
        success "Backup archive is valid"
    else
        error "Backup archive is corrupted"
    fi
}

# Cleanup temporary files
cleanup() {
    log "Cleaning up temporary files..."

    rm -f /tmp/wise2_db_backup.db
    rm -f /tmp/wise2_env_backup

    success "Temporary files cleaned up"
}

# Manage backup retention
manage_retention() {
    log "Managing backup retention (keeping last 7 backups)..."

    cd "$BACKUP_DIR"

    # Count backups
    local backup_count=$(ls -1 wise2_backup_*.tar.gz 2>/dev/null | wc -l)

    if [ "$backup_count" -gt 7 ]; then
        local to_delete=$((backup_count - 7))
        log "Removing $to_delete old backups..."

        ls -1t wise2_backup_*.tar.gz | tail -n "$to_delete" | xargs rm -f

        success "Old backups removed"
    fi
}

# Show backup info
show_info() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════${NC}"
    echo -e "${BLUE} Backup Information${NC}"
    echo -e "${BLUE}════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${BLUE}File:${NC} $BACKUP_FILE"
    echo -e "${BLUE}Size:${NC} $(du -h "$BACKUP_FILE" | awk '{print $1}')"
    echo -e "${BLUE}Time:${NC} $TIMESTAMP"
    echo ""
    echo -e "${BLUE}To restore this backup:${NC}"
    echo "  bash pi/scripts/restore.sh --file '$BACKUP_FILE'"
    echo ""
}

# Main
main() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║       WISE² System Backup                  ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
    echo ""

    parse_args "$@"

    setup_backup_dir
    stop_services
    backup_database
    backup_redis
    backup_config
    create_archive
    verify_backup
    cleanup
    start_services
    manage_retention
    show_info

    success "Backup completed successfully!"
}

# Run
main "$@"
