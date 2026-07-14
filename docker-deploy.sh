#!/bin/bash

# SoundLabs Docker Deployment Script
# Usage: ./docker-deploy.sh [command]
# Commands: setup, build, deploy, stop, logs, status, backup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="wise2-soundlabs"
IMAGE_TAG="latest"

echo_info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
}

echo_success() {
    echo -e "${GREEN}✓ ${1}${NC}"
}

echo_warning() {
    echo -e "${YELLOW}⚠ ${1}${NC}"
}

echo_error() {
    echo -e "${RED}✗ ${1}${NC}"
}

# Check prerequisites
check_requirements() {
    echo_info "Checking requirements..."

    if ! command -v docker &> /dev/null; then
        echo_error "Docker is not installed"
        exit 1
    fi
    echo_success "Docker installed"

    if ! command -v docker-compose &> /dev/null; then
        echo_error "Docker Compose is not installed"
        exit 1
    fi
    echo_success "Docker Compose installed"
}

# Setup environment
setup() {
    echo_info "Setting up SoundLabs deployment..."

    # Check if .env.production exists
    if [ ! -f .env.production ]; then
        echo_warning ".env.production not found. Creating from template..."
        if [ -f .env.production.example ]; then
            cp .env.production.example .env.production
            echo_warning "⚠ Please edit .env.production with your production values!"
            echo_warning "   Required changes:"
            echo_warning "   - DB_PASSWORD"
            echo_warning "   - REDIS_PASSWORD"
            echo_warning "   - JWT_SECRET"
            echo_warning "   - NEXT_PUBLIC_API_URL"
        else
            echo_error ".env.production.example not found"
            exit 1
        fi
    else
        echo_success ".env.production found"
    fi

    # Create necessary directories
    mkdir -p backups logs ssl
    echo_success "Directories created"
}

# Build Docker image
build() {
    echo_info "Building Docker image..."
    docker build -t ${PROJECT_NAME}:${IMAGE_TAG} .
    echo_success "Docker image built: ${PROJECT_NAME}:${IMAGE_TAG}"
}

# Deploy services
deploy() {
    echo_info "Starting services..."
    docker-compose up -d
    echo_success "Services started"

    echo_info "Waiting for services to be ready..."
    sleep 5

    status

    echo_success "Deployment complete!"
    echo ""
    echo_info "Access your application:"
    echo "  Studio:    http://localhost:3003"
    echo "  Dashboard: http://localhost:3002"
    echo "  Admin:     http://localhost:3004"
    echo "  Website:   http://localhost:3001"
}

# Stop services
stop() {
    echo_info "Stopping services..."
    docker-compose down
    echo_success "Services stopped"
}

# View logs
logs() {
    SERVICE=${1:-studio}
    echo_info "Showing logs for $SERVICE..."
    docker-compose logs -f $SERVICE
}

# Check status
status() {
    echo_info "Service status:"
    echo ""
    docker-compose ps
    echo ""
}

# Backup database
backup() {
    echo_info "Creating database backup..."

    BACKUP_FILE="backups/wise2-$(date +%Y%m%d-%H%M%S).sql.gz"
    docker-compose exec -T postgres pg_dump -U wise2_user wise2_core | gzip > $BACKUP_FILE

    echo_success "Backup created: $BACKUP_FILE"
    ls -lh $BACKUP_FILE
}

# Restore database
restore() {
    BACKUP_FILE=${1:-}

    if [ -z "$BACKUP_FILE" ]; then
        echo_error "Usage: ./docker-deploy.sh restore <backup_file>"
        echo_info "Available backups:"
        ls -lh backups/
        exit 1
    fi

    if [ ! -f "$BACKUP_FILE" ]; then
        echo_error "Backup file not found: $BACKUP_FILE"
        exit 1
    fi

    echo_warning "This will overwrite the current database. Continue? (yes/no)"
    read -r response

    if [ "$response" != "yes" ]; then
        echo_warning "Restore cancelled"
        exit 0
    fi

    echo_info "Restoring from $BACKUP_FILE..."
    gunzip < $BACKUP_FILE | docker-compose exec -T postgres psql -U wise2_user wise2_core

    echo_success "Database restored"
}

# Update deployment
update() {
    echo_info "Updating deployment..."

    echo_info "Creating backup..."
    backup

    echo_info "Pulling latest code..."
    git pull origin main

    echo_info "Rebuilding image..."
    build

    echo_info "Restarting services..."
    docker-compose down
    docker-compose up -d

    echo_success "Update complete!"
    status
}

# Clean up
clean() {
    echo_warning "This will remove all containers and volumes. Continue? (yes/no)"
    read -r response

    if [ "$response" != "yes" ]; then
        echo_warning "Cleanup cancelled"
        exit 0
    fi

    echo_info "Removing containers and volumes..."
    docker-compose down -v
    echo_success "Cleanup complete"
}

# Main script
main() {
    COMMAND=${1:-help}

    case $COMMAND in
        setup)
            check_requirements
            setup
            ;;
        build)
            check_requirements
            build
            ;;
        deploy)
            check_requirements
            setup
            build
            deploy
            ;;
        stop)
            stop
            ;;
        logs)
            logs ${2:-studio}
            ;;
        status)
            status
            ;;
        backup)
            backup
            ;;
        restore)
            restore $2
            ;;
        update)
            update
            ;;
        clean)
            clean
            ;;
        *)
            echo "SoundLabs Docker Deployment Script"
            echo ""
            echo "Usage: $0 <command>"
            echo ""
            echo "Commands:"
            echo "  setup      - Setup environment and configuration"
            echo "  build      - Build Docker image"
            echo "  deploy     - Full deployment (setup + build + start)"
            echo "  stop       - Stop all services"
            echo "  logs       - View service logs (default: studio)"
            echo "  status     - Show service status"
            echo "  backup     - Backup database"
            echo "  restore    - Restore database from backup"
            echo "  update     - Update to latest version"
            echo "  clean      - Remove all containers and volumes"
            echo ""
            echo "Examples:"
            echo "  $0 deploy           # Deploy to production"
            echo "  $0 logs studio      # View studio logs"
            echo "  $0 backup           # Backup database"
            echo "  $0 restore backups/wise2-20260714-120000.sql.gz"
            ;;
    esac
}

main $@
