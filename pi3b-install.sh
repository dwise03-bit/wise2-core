#!/bin/bash
#
# WISE² Edge - Automated Installation Script for Raspberry Pi 3B
# This script automates the installation process from Part 2-5 of the guide
#
# Usage: curl -sSL https://raw.githubusercontent.com/dwise03-bit/wise2-core/main/pi3b-install.sh | bash
#

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
WISE2_HOME="/opt/wise2-edge"
WISE2_USER="pi"
WISE2_REPO="https://github.com/dwise03-bit/wise2-core.git"

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

log_section() {
    echo ""
    echo -e "${GREEN}======================================${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${GREEN}======================================${NC}"
}

# Check prerequisites
check_prerequisites() {
    log_section "Checking Prerequisites"

    # Check if running as root or with sudo
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root (use: sudo ./pi3b-install.sh)"
    fi

    # Check Pi 3B model
    if ! grep -q "Pi 3" /proc/device-tree/model; then
        log_warn "This system does not appear to be a Raspberry Pi 3B"
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi

    # Check internet connectivity
    if ! ping -c 1 8.8.8.8 > /dev/null 2>&1; then
        log_error "No internet connectivity detected. Please connect to the network first."
    fi

    log_info "Prerequisites check passed"
}

# Update system
update_system() {
    log_section "Updating System"

    apt update
    DEBIAN_FRONTEND=noninteractive apt upgrade -y

    apt install -y \
        build-essential \
        git \
        curl \
        wget \
        nano \
        htop \
        git-core \
        libffi-dev \
        libssl-dev \
        python3 \
        python3-dev \
        python3-pip \
        python3-rpi.gpio \
        alsa-utils \
        wireguard \
        wireguard-tools \
        dnsutils \
        nethogs \
        iotop

    log_info "System updated successfully"
}

# Configure swap
configure_swap() {
    log_section "Configuring Swap (2GB)"

    # Check if swap already exists
    if grep -q "/swapfile" /etc/fstab; then
        log_info "Swap already configured"
        return
    fi

    # Create swap file
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile

    # Make permanent
    echo '/swapfile none swap sw 0 0' >> /etc/fstab

    log_info "Swap configured: $(free -h | grep Swap)"
}

# Optimize system
optimize_system() {
    log_section "Optimizing for Pi 3B Constraints"

    # Disable unnecessary services
    systemctl disable avahi-daemon || true
    systemctl disable bluetooth || true
    systemctl stop bluetooth || true

    # Reduce GPU memory
    if ! grep -q "gpu_mem=64" /boot/config.txt; then
        echo "gpu_mem=64" >> /boot/config.txt
    fi

    log_info "System optimized"
}

# Install Docker
install_docker() {
    log_section "Installing Docker"

    # Check if Docker already installed
    if command -v docker &> /dev/null; then
        log_info "Docker already installed: $(docker --version)"
        return
    fi

    # Install Docker
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh

    # Add user to docker group
    usermod -aG docker $WISE2_USER

    # Start Docker
    systemctl enable docker
    systemctl start docker

    log_info "Docker installed: $(docker --version)"
}

# Install Docker Compose
install_docker_compose() {
    log_section "Installing Docker Compose"

    # Check if already installed
    if command -v docker-compose &> /dev/null; then
        log_info "Docker Compose already installed: $(docker-compose --version)"
        return
    fi

    apt install -y docker-compose

    log_info "Docker Compose installed: $(docker-compose --version)"
}

# Install Node.js
install_nodejs() {
    log_section "Installing Node.js 20"

    # Check if already installed
    if command -v node &> /dev/null; then
        node_version=$(node --version)
        if [[ $node_version == v20* ]]; then
            log_info "Node.js already installed: $node_version"
            return
        fi
    fi

    # Add NodeSource repository
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs

    # Optimize npm for Pi 3B
    npm config set fetch-timeout 120000
    npm config set fetch-retries 5
    npm config set fetch-retry-mintimeout 20000
    npm config set fetch-retry-maxtimeout 120000

    log_info "Node.js installed: $(node --version)"
}

# Clone WISE² repository
clone_repository() {
    log_section "Cloning WISE² Repository"

    # Create home directory
    mkdir -p $WISE2_HOME

    # Check if already cloned
    if [ -d "$WISE2_HOME/services/edge-appliance" ]; then
        log_info "Repository already cloned at $WISE2_HOME"
        return
    fi

    # Clone repository
    git clone $WISE2_REPO $WISE2_HOME/repo

    # Set ownership
    chown -R $WISE2_USER:$WISE2_USER $WISE2_HOME

    log_info "Repository cloned to $WISE2_HOME"
}

# Install dependencies
install_dependencies() {
    log_section "Installing Node Dependencies"

    cd $WISE2_HOME/repo/services/edge-appliance

    # Install dependencies
    sudo -u $WISE2_USER npm install --prefer-offline --no-audit

    log_info "Dependencies installed"
}

# Create configuration
create_configuration() {
    log_section "Creating Configuration"

    edge_dir="$WISE2_HOME/repo/services/edge-appliance"

    # Copy .env template
    cp "$edge_dir/.env.example" "$edge_dir/.env"

    # Create Pi 3B-specific .env
    cat > "$WISE2_HOME/.env" << 'EOF'
# ========================================
# WISE² Edge - Pi 3B Configuration
# ========================================

# Node Runtime
NODE_ENV=production
NODE_ID=edge-pi3b-1
PORT=3000
LOG_LEVEL=info

# Memory & Performance (Pi 3B specific)
MAX_CONNECTIONS=20
REQUEST_TIMEOUT=30000
SYNC_INTERVAL=60000
HEALTH_CHECK_INTERVAL=45000

# Database & Storage
LOCAL_DB_PATH=/opt/wise2-edge/data/wise2-edge.db
MODEL_PATH=/opt/wise2-edge/models

# AI Models (lightweight for Pi 3B)
VOICE_MODEL=tinyllama
OLLAMA_URL=http://localhost:11434
OLLAMA_MEMORY_LIMIT=512m

# Cloud Configuration
CLOUD_URL=https://api.wise2.cloud
API_KEY=
WIREGUARD_CONFIG_PATH=/etc/wireguard/wise2.conf
OFFLINE_MODE=false

# Features
ENABLE_VOICE=true
ENABLE_GPIO=true
ENABLE_CAMERA=false
ENABLE_PROMETHEUS=false

# Performance Tuning (Pi 3B)
MAX_RETRY_ATTEMPTS=3
RETRY_DELAY_MS=1000
QUEUE_MAX_SIZE=100
EOF

    log_info "Configuration created at $WISE2_HOME/.env"
}

# Create deployment structure
create_deployment() {
    log_section "Creating Deployment Structure"

    # Create directories
    mkdir -p $WISE2_HOME/data
    mkdir -p $WISE2_HOME/models
    mkdir -p $WISE2_HOME/logs
    mkdir -p /var/log/wise2-edge-appliance

    # Set permissions
    chown -R $WISE2_USER:$WISE2_USER $WISE2_HOME
    chown -R $WISE2_USER:$WISE2_USER /var/log/wise2-edge-appliance

    log_info "Deployment structure created"
}

# Create systemd service
create_systemd_service() {
    log_section "Creating Systemd Service"

    cat > /etc/systemd/system/wise2-edge.service << 'EOF'
[Unit]
Description=WISE² Edge Appliance (Docker)
After=docker.service network-online.target
Requires=docker.service
Wants=network-online.target

[Service]
Type=simple
User=pi
WorkingDirectory=/opt/wise2-edge
ExecStartPre=-/usr/bin/docker-compose -f docker-compose.pi3b.yml down
ExecStart=/usr/bin/docker-compose -f docker-compose.pi3b.yml up
ExecStop=/usr/bin/docker-compose -f docker-compose.pi3b.yml down
Restart=on-failure
RestartSec=10s
TimeoutStartSec=300

MemoryLimit=512M
CPUQuota=90%

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable wise2-edge

    log_info "Systemd service created and enabled"
}

# Create health check script
create_health_check_script() {
    log_section "Creating Health Check Script"

    cat > $WISE2_HOME/health-check.sh << 'EOF'
#!/bin/bash

echo "=========================================="
echo "WISE² Edge - Pi 3B Health Check"
echo "=========================================="

# Check Docker containers
echo -e "\n[1] Container Status:"
docker-compose -f docker-compose.pi3b.yml ps 2>/dev/null || echo "Docker not available"

# Check API health
echo -e "\n[2] API Health:"
curl -s http://localhost:3000/health 2>/dev/null | jq . 2>/dev/null || echo "API unreachable"

# Check system resources
echo -e "\n[3] System Resources:"
echo "CPU Temperature: $(vcgencmd measure_temp 2>/dev/null || echo 'N/A')"
echo "Memory: $(free -h | grep Mem)"
echo "Disk: $(df -h / | tail -1)"

# Check network connectivity
echo -e "\n[4] Network:"
ping -c 1 8.8.8.8 > /dev/null 2>&1 && echo "Internet: OK" || echo "Internet: NO"
ping -c 1 raspberrypi.local > /dev/null 2>&1 && echo "Local: OK" || echo "Local: NO"

# Check logs for errors (last 10)
echo -e "\n[5] Recent Errors:"
docker-compose -f docker-compose.pi3b.yml logs 2>/dev/null --tail 20 | grep -i error || echo "No errors found"

echo -e "\n=========================================="
EOF

    chmod +x $WISE2_HOME/health-check.sh
    chown $WISE2_USER:$WISE2_USER $WISE2_HOME/health-check.sh

    log_info "Health check script created"
}

# Display summary
display_summary() {
    log_section "Installation Summary"

    cat << EOF
✓ System updated and optimized
✓ Docker installed
✓ Docker Compose installed
✓ Node.js 20 installed
✓ WISE² repository cloned
✓ Dependencies installed
✓ Configuration created
✓ Systemd service configured
✓ Health check script created

${GREEN}NEXT STEPS:${NC}

1. Copy docker-compose.pi3b.yml:
   cp ~/wise2-edge/repo/services/edge-appliance/docker-compose.yml \\
      ~/wise2-edge/docker-compose.pi3b.yml
   # Edit as needed for Pi 3B constraints

2. Build Docker image (takes 10-15 minutes):
   cd ~/wise2-edge/repo/services/edge-appliance
   npm run build
   npm run docker:build

3. Start services:
   docker-compose -f /opt/wise2-edge/docker-compose.pi3b.yml up -d

4. Verify installation:
   curl http://localhost:3000/health

5. Enable autostart:
   systemctl start wise2-edge
   systemctl status wise2-edge

6. Run health checks:
   /opt/wise2-edge/health-check.sh

${YELLOW}IMPORTANT:${NC}
- Set API_KEY in /opt/wise2-edge/.env before cloud sync
- Review /opt/wise2-edge/docker-compose.pi3b.yml for resource limits
- Monitor temperature: vcgencmd measure_temp
- Check free space: df -h
- Monitor swap usage: free -h

For full documentation, see: PI3B_EDGE_INSTALLATION_GUIDE.md

EOF
}

# Main installation flow
main() {
    log_section "WISE² Edge Installation for Raspberry Pi 3B"

    echo "This script will install WISE² Edge with the following:"
    echo "  - System optimization for 1GB RAM Pi 3B"
    echo "  - Docker & Docker Compose"
    echo "  - Node.js 20"
    echo "  - WISE² Edge appliance"
    echo "  - Systemd service for autostart"
    echo ""
    read -p "Continue with installation? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_error "Installation cancelled"
    fi

    # Run installation steps
    check_prerequisites
    update_system
    configure_swap
    optimize_system
    install_docker
    install_docker_compose
    install_nodejs
    clone_repository
    install_dependencies
    create_configuration
    create_deployment
    create_systemd_service
    create_health_check_script
    display_summary

    log_section "Installation Complete!"
    log_info "Your Pi 3B is ready for WISE² Edge deployment"
}

# Run main function
main "$@"
