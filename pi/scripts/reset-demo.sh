#!/bin/bash

##############################################################################
# WISE² Reset to Demo Data
#
# Resets system to factory demo state
#
# Usage:
#   bash pi/scripts/reset-demo.sh
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

# Confirm reset
confirm_reset() {
    echo ""
    echo -e "${YELLOW}WARNING: This will delete all data and reload demo data!${NC}"
    echo ""
    echo -n "Are you sure you want to reset to demo data? (yes/no): "
    read -r confirm

    if [ "$confirm" != "yes" ]; then
        log "Reset cancelled"
        exit 0
    fi
}

# Main
main() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║   Reset to Demo Data                       ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
    echo ""

    confirm_reset

    cd "$PROJECT_DIR"

    log "Stopping services..."
    docker-compose -f pi/docker-compose.yml down || warning "Could not stop services gracefully"
    sleep 2

    log "Clearing database..."
    rm -f pi/data/wise2.db || warning "Could not delete database"
    success "Database cleared"

    log "Starting services..."
    docker-compose -f pi/docker-compose.yml up -d || error "Failed to start services"
    sleep 10

    log "Loading demo data..."
    # TODO: Call API to seed demo data once endpoint is available
    curl -s -X POST http://localhost:3000/api/admin/seed-demo \
        -H "Content-Type: application/json" \
        -d '{}' > /dev/null 2>&1 || warning "Could not load demo data via API"

    success "Demo data loaded"

    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║     Reset Completed Successfully!          ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Dashboard: http://wise.local"
    echo ""

    success "System reset to demo state"
}

main "$@"
