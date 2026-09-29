#!/bin/bash

################################################################################
# WISE² Production Deployment Script for wise2.net
# This script deploys the complete WISE² platform to production
#
# Usage: ./DEPLOY_TO_PRODUCTION.sh
#
# Prerequisites:
# - SSH access to wise2.net production server
# - Docker and Docker Compose installed
# - Git installed
# - Application code directory: /opt/wise2-core (or specify via WISE2_DIR)
################################################################################

set -e  # Exit on error

# Configuration
WISE2_DIR="${WISE2_DIR:-/opt/wise2-core}"
GIT_BRANCH="${GIT_BRANCH:-main}"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Main deployment flow
main() {
    log_info "=========================================="
    log_info "WISE² Production Deployment Script"
    log_info "=========================================="
    log_info "Target: wise2.net"
    log_info "Branch: $GIT_BRANCH"
    log_info "Directory: $WISE2_DIR"
    echo ""

    # Step 1: Verify prerequisites
    log_info "Step 1: Verifying prerequisites..."
    verify_prerequisites
    log_success "Prerequisites verified"
    echo ""

    # Step 2: Navigate to application directory
    log_info "Step 2: Navigating to application directory..."
    if [ ! -d "$WISE2_DIR" ]; then
        log_error "Directory $WISE2_DIR not found"
        exit 1
    fi
    cd "$WISE2_DIR"
    log_success "Changed to $WISE2_DIR"
    echo ""

    # Step 3: Pull latest code
    log_info "Step 3: Pulling latest code from git..."
    git fetch origin
    git checkout "$GIT_BRANCH"
    git pull origin "$GIT_BRANCH"
    log_success "Code pulled successfully"
    echo ""

    # Step 4: Verify .env.production exists
    log_info "Step 4: Verifying environment configuration..."
    if [ ! -f ".env.production" ]; then
        log_error ".env.production not found"
        log_info "Please ensure .env.production exists with production secrets"
        exit 1
    fi
    log_success ".env.production verified"
    echo ""

    # Step 5: Create .env for docker-compose
    log_info "Step 5: Setting up environment file..."
    cp .env.production .env
    log_success ".env configured"
    echo ""

    # Step 6: Stop existing services
    log_info "Step 6: Stopping existing services..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" down --remove-orphans || true
    log_success "Services stopped"
    echo ""

    # Step 7: Build Docker images
    log_info "Step 7: Building Docker images..."
    log_warning "This may take 5-10 minutes..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" build --parallel 2>&1 | tail -20
    log_success "Docker images built"
    echo ""

    # Step 8: Start services
    log_info "Step 8: Starting services..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
    log_success "Services started"
    echo ""

    # Step 9: Wait for services to be healthy
    log_info "Step 9: Waiting for services to become healthy..."
    sleep 30
    check_service_health
    echo ""

    # Step 10: Verify deployment
    log_info "Step 10: Verifying deployment..."
    verify_deployment
    echo ""

    # Success!
    log_success "=========================================="
    log_success "WISE² Production Deployment Complete!"
    log_success "=========================================="
    log_info ""
    log_info "📊 Service Status:"
    docker-compose -f "$DOCKER_COMPOSE_FILE" ps
    log_info ""
    log_info "🌐 Access Points:"
    log_info "  Website:   https://wise2.net"
    log_info "  Dashboard: https://dashboard.wise2.net"
    log_info "  Admin:     https://admin.wise2.net"
    log_info "  API:       https://api.wise2.net"
    log_info "  Grafana:   https://grafana.wise2.net"
    log_info "  Prometheus: https://prometheus.wise2.net"
    log_info ""
}

verify_prerequisites() {
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    log_success "Docker found: $(docker --version)"

    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    log_success "Docker Compose found: $(docker-compose --version)"

    # Check Git
    if ! command -v git &> /dev/null; then
        log_error "Git is not installed"
        exit 1
    fi
    log_success "Git found: $(git --version)"
}

check_service_health() {
    local max_attempts=30
    local attempt=0
    local healthy_services=0

    while [ $attempt -lt $max_attempts ]; do
        healthy_services=$(docker-compose -f "$DOCKER_COMPOSE_FILE" ps --format json 2>/dev/null | grep -c '"State":"running"' || echo 0)

        if [ $healthy_services -ge 5 ]; then
            log_success "Services becoming healthy ($healthy_services running)"
            return 0
        fi

        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
    done

    log_warning "Timeout waiting for services to be healthy"
    log_info "Current status:"
    docker-compose -f "$DOCKER_COMPOSE_FILE" ps
}

verify_deployment() {
    log_info "Running deployment verification tests..."

    # Test PostgreSQL
    if docker exec wise2-postgres-prod pg_isready -U wise2_prod_user -h localhost &>/dev/null; then
        log_success "PostgreSQL - Connected"
    else
        log_warning "PostgreSQL - Not yet ready"
    fi

    # Test Redis
    if docker exec wise2-core-redis-1 redis-cli ping &>/dev/null; then
        log_success "Redis - Responding"
    else
        log_warning "Redis - Not yet ready"
    fi

    # Test Grafana
    if curl -s http://localhost:3100/api/health &>/dev/null; then
        log_success "Grafana - Accessible"
    else
        log_warning "Grafana - Not yet ready"
    fi

    # Test Prometheus
    if curl -s http://localhost:9090/-/healthy &>/dev/null; then
        log_success "Prometheus - Healthy"
    else
        log_warning "Prometheus - Not yet ready"
    fi

    log_info ""
    log_info "Note: Frontend services (Website, Dashboard, Admin) may take 1-2 minutes to fully initialize"
}

# Rollback function
rollback() {
    log_warning "Rolling back deployment..."
    cd "$WISE2_DIR"
    git revert HEAD --no-edit || true
    docker-compose -f "$DOCKER_COMPOSE_FILE" down
    log_info "Rollback complete"
}

# Trap errors
trap 'log_error "Deployment failed!"; exit 1' ERR

# Run main function
main "$@"
