#!/bin/bash

##############################################################################
# WISE² Raspberry Pi Installation Script
#
# This script sets up a complete WISE² instance on Raspberry Pi 3B+
#
# Prerequisites:
#   - Raspberry Pi 3B+ running Debian Trixie
#   - 32GB+ SD Card
#   - Internet connection
#   - sudo access
#
# Usage:
#   bash pi/scripts/install.sh
#   bash pi/scripts/install.sh --no-demo      # Skip demo data
#   bash pi/scripts/install.sh --help         # Show options
#
##############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"
PI_CONFIG_DIR="$PROJECT_DIR/pi"
LOG_FILE="/var/log/wise2-install.log"

# Flags
LOAD_DEMO=true
SKIP_DOCKER=false
SKIP_COMPOSE=false

# Functions
log() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Parse arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --no-demo)
                LOAD_DEMO=false
                shift
                ;;
            --skip-docker)
                SKIP_DOCKER=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                error "Unknown argument: $1"
                ;;
        esac
    done
}

show_help() {
    cat << EOF
WISE² Raspberry Pi Installation Script

Usage: bash pi/scripts/install.sh [OPTIONS]

Options:
    --no-demo          Skip loading demo data
    --skip-docker      Skip Docker installation (assume already installed)
    --help             Show this help message

Examples:
    bash pi/scripts/install.sh                  # Full installation with demo
    bash pi/scripts/install.sh --no-demo        # Skip demo data
    bash pi/scripts/install.sh --skip-docker    # Assume Docker already installed

Requirements:
    - Raspberry Pi 3B+ or later
    - Debian Trixie or compatible
    - 32GB+ SD Card
    - Internet connection
    - sudo access

After installation:
    - Access dashboard at: http://wise.local (or http://$(hostname -I | awk '{print $1}'))
    - Check status: docker-compose -f pi/docker-compose.yml ps
    - View logs: docker-compose -f pi/docker-compose.yml logs -f

EOF
}

# Check system requirements
check_requirements() {
    log "Checking system requirements..."

    # Check if running on Linux
    if [[ "$OSTYPE" != "linux-gnu"* ]]; then
        error "This script is designed for Linux (Raspberry Pi). Detected OS: $OSTYPE"
    fi

    # Check if sudo is available
    if ! command -v sudo &> /dev/null; then
        error "sudo is required but not installed"
    fi

    # Check disk space (minimum 20GB free)
    available_space=$(df /home | awk 'NR==2 {print $4}')
    if [ "$available_space" -lt 20000000 ]; then  # 20GB in KB
        error "Insufficient disk space. At least 20GB free space required. Available: ${available_space}KB"
    fi

    # Check RAM
    total_ram=$(free -m | awk 'NR==2 {print $2}')
    if [ "$total_ram" -lt 1024 ]; then
        warning "System has less than 1GB RAM. WISE² may run slowly."
    fi

    success "System requirements check passed"
}

# Install Docker if not already installed
install_docker() {
    if [ "$SKIP_DOCKER" = true ]; then
        log "Skipping Docker installation (--skip-docker flag set)"
        return
    fi

    if command -v docker &> /dev/null; then
        log "Docker is already installed: $(docker --version)"
        return
    fi

    log "Installing Docker..."

    # Update package lists
    sudo apt-get update

    # Install dependencies
    sudo apt-get install -y \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg \
        lsb-release

    # Add Docker GPG key
    curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

    # Add Docker repository
    echo "deb [arch=arm64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | \
        sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Install Docker
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

    # Add current user to docker group
    sudo usermod -aG docker $USER

    # Start Docker service
    sudo systemctl start docker
    sudo systemctl enable docker

    success "Docker installed and started"
}

# Install Docker Compose if not already installed
install_docker_compose() {
    if command -v docker-compose &> /dev/null; then
        log "Docker Compose is already installed: $(docker-compose --version)"
        return
    fi

    log "Installing Docker Compose..."

    # Download Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

    # Make executable
    sudo chmod +x /usr/local/bin/docker-compose

    success "Docker Compose installed"
}

# Install mDNS support (avahi)
install_mdns() {
    if command -v avahi-daemon &> /dev/null; then
        log "mDNS daemon (avahi) is already installed"
        return
    fi

    log "Installing mDNS support (avahi)..."

    sudo apt-get update
    sudo apt-get install -y avahi-daemon avahi-tools

    # Configure avahi
    sudo systemctl start avahi-daemon
    sudo systemctl enable avahi-daemon

    success "mDNS support installed"
}

# Generate secrets if not already present
generate_secrets() {
    log "Generating security secrets..."

    # Create .env file from template if not exists
    if [ ! -f "$PI_CONFIG_DIR/.env" ]; then
        log "Creating .env file from template..."
        cp "$PI_CONFIG_DIR/.env.example" "$PI_CONFIG_DIR/.env"

        # Generate and replace secrets
        JWT_SECRET=$(openssl rand -hex 32)
        API_KEY=$(openssl rand -hex 32)
        REDIS_PASSWORD=$(openssl rand -hex 16)

        # Use sed to replace values in .env
        sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" "$PI_CONFIG_DIR/.env"
        sed -i "s/API_KEY=.*/API_KEY=$API_KEY/" "$PI_CONFIG_DIR/.env"
        sed -i "s/REDIS_PASSWORD=.*/REDIS_PASSWORD=$REDIS_PASSWORD/" "$PI_CONFIG_DIR/.env"

        success "Secrets generated and stored in .env"
    else
        log ".env file already exists, skipping secret generation"
    fi
}

# Set up data directories
setup_directories() {
    log "Setting up data directories..."

    # Create necessary directories
    mkdir -p "$PROJECT_DIR/pi/data"
    mkdir -p "$PROJECT_DIR/backups"
    mkdir -p "$PROJECT_DIR/logs"

    # Set permissions
    chmod 755 "$PROJECT_DIR/pi/data"
    chmod 755 "$PROJECT_DIR/backups"
    chmod 755 "$PROJECT_DIR/logs"

    success "Data directories created"
}

# Build Docker images
build_images() {
    log "Building Docker images (this may take several minutes)..."

    cd "$PROJECT_DIR"

    # Build images
    docker-compose -f pi/docker-compose.yml build --no-cache api dashboard

    success "Docker images built successfully"
}

# Start services
start_services() {
    log "Starting WISE² services..."

    cd "$PROJECT_DIR"

    # Start all services
    docker-compose -f pi/docker-compose.yml up -d

    # Wait for services to be healthy
    log "Waiting for services to start..."
    sleep 10

    success "Services started"
}

# Wait for services to be healthy
wait_for_health() {
    log "Waiting for services to become healthy..."

    max_attempts=30
    attempt=0

    while [ $attempt -lt $max_attempts ]; do
        # Check if API is healthy
        if curl -sf http://localhost:3000/health > /dev/null 2>&1; then
            log "API service is healthy"

            # Check if Dashboard is healthy
            if curl -sf http://localhost:3001 > /dev/null 2>&1; then
                log "Dashboard service is healthy"
                success "All services are healthy"
                return 0
            fi
        fi

        attempt=$((attempt + 1))
        log "Health check attempt $attempt/$max_attempts..."
        sleep 2
    done

    error "Services did not become healthy within timeout. Check logs with: docker-compose -f pi/docker-compose.yml logs"
}

# Load demo data
load_demo_data() {
    if [ "$LOAD_DEMO" = false ]; then
        log "Skipping demo data (--no-demo flag set)"
        return
    fi

    log "Loading demo data..."

    # Call API to seed demo data
    curl -s -X POST http://localhost:3000/api/admin/seed-demo \
        -H "Content-Type: application/json" \
        -d '{}' > /dev/null 2>&1 || warning "Could not load demo data via API"

    success "Demo data loaded"
}

# Set up systemd service
setup_systemd() {
    log "Setting up systemd service for auto-start..."

    SERVICE_FILE="/etc/systemd/system/wise2.service"

    # Create service file
    sudo tee "$SERVICE_FILE" > /dev/null << EOF
[Unit]
Description=WISE² Enterprise Platform
After=network.target docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/bin/docker-compose -f pi/docker-compose.yml up -d
ExecStop=/usr/bin/docker-compose -f pi/docker-compose.yml down
Restart=on-failure
RestartSec=30

[Install]
WantedBy=multi-user.target
EOF

    # Enable service
    sudo systemctl daemon-reload
    sudo systemctl enable wise2.service

    success "Systemd service configured for auto-start"
}

# Set up log rotation
setup_logrotate() {
    log "Setting up log rotation..."

    LOGROTATE_FILE="/etc/logrotate.d/wise2"

    sudo tee "$LOGROTATE_FILE" > /dev/null << EOF
/var/log/wise2*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0640 root root
    sharedscripts
}
EOF

    success "Log rotation configured"
}

# Display final information
show_completion_info() {
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║          WISE² Installation Complete!                      ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}Dashboard Access:${NC}"
    echo "  • Primary:  http://wise.local"
    echo "  • Fallback: http://$(hostname -I | awk '{print $1}')"
    echo ""
    echo -e "${BLUE}API Endpoint:${NC}"
    echo "  • http://wise.local/api"
    echo ""
    echo -e "${BLUE}Useful Commands:${NC}"
    echo "  • View status:     docker-compose -f pi/docker-compose.yml ps"
    echo "  • View logs:       docker-compose -f pi/docker-compose.yml logs -f"
    echo "  • Restart service: docker-compose -f pi/docker-compose.yml restart"
    echo "  • Stop service:    docker-compose -f pi/docker-compose.yml down"
    echo "  • Health check:    bash pi/scripts/health-check.sh"
    echo ""
    echo -e "${BLUE}Backup & Restore:${NC}"
    echo "  • Backup:  bash pi/scripts/backup.sh"
    echo "  • Restore: bash pi/scripts/restore.sh"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo "  1. Wait 30 seconds for services to fully start"
    echo "  2. Visit http://wise.local in your browser"
    echo "  3. Explore the demo data to understand the system"
    echo "  4. Configure backup schedule in settings"
    echo ""
    echo -e "${YELLOW}Note:${NC} First load may take 30-60 seconds. This is normal."
    echo ""
}

# Main installation flow
main() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║       WISE² Raspberry Pi 3B+ Installation Script          ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    # Initialize log file
    mkdir -p "$(dirname "$LOG_FILE")"
    echo "WISE² Installation Log - $(date)" > "$LOG_FILE"

    # Parse arguments
    parse_args "$@"

    # Run installation steps
    check_requirements
    install_docker
    install_docker_compose
    install_mdns
    generate_secrets
    setup_directories
    build_images
    start_services
    wait_for_health
    load_demo_data
    setup_systemd
    setup_logrotate

    # Show completion info
    show_completion_info

    log "Installation log saved to: $LOG_FILE"
}

# Run main function
main "$@"
