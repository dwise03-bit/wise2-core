#!/bin/bash

##############################################################################
# WISE² Update Script
#
# Updates WISE² to the latest version
#
# Usage:
#   bash pi/scripts/update.sh
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

# Main
main() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║       WISE² Update                         ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
    echo ""

    cd "$PROJECT_DIR"

    log "Pulling latest code..."
    git pull origin main || error "Failed to pull latest code"
    success "Code updated"

    log "Building new images..."
    docker-compose -f pi/docker-compose.yml build --no-cache api dashboard || \
        error "Failed to build images"
    success "Images built"

    log "Stopping old services..."
    docker-compose -f pi/docker-compose.yml down || warning "Could not stop services gracefully"
    sleep 2

    log "Starting updated services..."
    docker-compose -f pi/docker-compose.yml up -d || error "Failed to start services"
    sleep 10

    log "Running health checks..."
    bash pi/scripts/health-check.sh || warning "Health check reported issues"

    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║     Update Completed Successfully!         ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Dashboard: http://wise.local"
    echo ""

    success "WISE² updated to latest version"
}

main "$@"
