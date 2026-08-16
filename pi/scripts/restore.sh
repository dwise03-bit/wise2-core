#!/bin/bash

##############################################################################
# WISE² Restore Script
#
# Restores system from backup
#
# Usage:
#   bash pi/scripts/restore.sh --file /path/to/backup.tar.gz
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
BACKUP_FILE=""

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
            --file)
                BACKUP_FILE="$2"
                shift 2
                ;;
            *)
                shift
                ;;
        esac
    done
}

# Show usage
show_usage() {
    echo "Usage: bash pi/scripts/restore.sh --file /path/to/backup.tar.gz"
}

# Verify backup file
verify_backup() {
    if [ -z "$BACKUP_FILE" ]; then
        error "No backup file specified. Use: --file /path/to/backup.tar.gz"
    fi

    if [ ! -f "$BACKUP_FILE" ]; then
        error "Backup file not found: $BACKUP_FILE"
    fi

    log "Verifying backup integrity..."

    if ! tar -tzf "$BACKUP_FILE" > /dev/null 2>&1; then
        error "Backup file is corrupted: $BACKUP_FILE"
    fi

    success "Backup file is valid"
}

# Confirm restore
confirm_restore() {
    echo ""
    echo -e "${YELLOW}WARNING: This will overwrite current data!${NC}"
    echo ""
    echo "Backup file: $BACKUP_FILE"
    echo ""
    echo -n "Are you sure you want to restore from this backup? (yes/no): "
    read -r confirm

    if [ "$confirm" != "yes" ]; then
        log "Restore cancelled"
        exit 0
    fi
}

# Stop services
stop_services() {
    log "Stopping services..."

    cd "$PROJECT_DIR"
    docker-compose -f pi/docker-compose.yml stop || warning "Could not stop services"
    sleep 2
}

# Restore files
restore_files() {
    log "Extracting backup files..."

    cd "/tmp"
    tar -xzf "$BACKUP_FILE" || error "Failed to extract backup"

    # Restore database
    if [ -f "wise2_db_backup.db" ]; then
        log "Restoring database..."
        cp wise2_db_backup.db "${PROJECT_DIR}/pi/data/wise2.db" || error "Failed to restore database"
        success "Database restored"
    fi

    # Restore configuration
    if [ -f "wise2_env_backup" ]; then
        log "Restoring configuration..."
        cp wise2_env_backup "${PROJECT_DIR}/pi/.env" || error "Failed to restore .env"
        success "Configuration restored"
    fi
}

# Start services
start_services() {
    log "Starting services..."

    cd "$PROJECT_DIR"
    docker-compose -f pi/docker-compose.yml up -d || error "Failed to start services"

    # Wait for services to become healthy
    log "Waiting for services to become healthy..."
    sleep 10

    if curl -sf http://localhost:3000/health > /dev/null 2>&1; then
        success "Services are healthy"
    else
        warning "Services may still be starting. Check status with: docker-compose -f pi/docker-compose.yml ps"
    fi
}

# Cleanup
cleanup() {
    log "Cleaning up temporary files..."

    rm -f /tmp/wise2_db_backup.db
    rm -f /tmp/wise2_env_backup

    success "Cleanup completed"
}

# Show completion info
show_completion() {
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║     Restore Completed Successfully!        ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}System Status:${NC}"
    echo "  • Services are starting..."
    echo "  • Dashboard: http://wise.local"
    echo "  • Check status: docker-compose -f pi/docker-compose.yml ps"
    echo ""
}

# Main
main() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║       WISE² System Restore                 ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
    echo ""

    parse_args "$@"

    verify_backup
    confirm_restore
    stop_services
    restore_files
    start_services
    cleanup
    show_completion

    success "Restore completed!"
}

# Run
main "$@"
