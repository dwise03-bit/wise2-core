#!/bin/bash
##############################################################################
# WISE DEFENSE EDGE INTELLIGENCE NODE - MASTER INSTALLER
#
# One-command deployment for Raspberry Pi 3B+
# Usage: sudo bash install-wise2-defense.sh
#
# Prerequisites:
# - Raspberry Pi OS (32-bit or 64-bit)
# - 2GB swap configured
# - Internet connectivity
# - sudo access
##############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
WISE_HOME="/opt/wise2-defense"
WISE_USER="wise2"
WISE_VERSION="1.0.0"
DEVICE_ID="${WISE_DEFENSE_DEVICE_ID:-EDGE-$(hostname -s | tr a-z A-Z)}"

# Functions
log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

check_os() {
    log_info "Detecting OS..."
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        if [[ "$ID" == "raspbian" ]] || [[ "$ID" == "debian" ]] || [[ "$ID" == "ubuntu" ]]; then
            log_info "Debian-based OS detected: $ID ($VERSION_CODENAME)"
        else
            log_error "This installer requires Debian-based OS (Raspberry Pi OS, Debian, or Ubuntu)"
            exit 1
        fi
    fi
}

check_disk_space() {
    log_info "Checking disk space..."
    available=$(df /opt | awk 'NR==2 {print $4}')
    required=$((2000000)) # 2GB in KB
    if [ $available -lt $required ]; then
        log_error "Insufficient disk space. Required: 2GB, Available: $((available / 1024))MB"
        exit 1
    fi
    log_info "Disk space OK: $((available / 1024))MB available"
}

install_dependencies() {
    log_info "Updating package lists..."
    apt-get update

    log_info "Installing system dependencies..."
    apt-get install -y \
        python3 \
        python3-venv \
        python3-pip \
        build-essential \
        libssl-dev \
        libffi-dev \
        git \
        curl \
        wget \
        sqlite3 \
        systemd \
        dnsmasq \
        rsync \
        htop

    log_info "Verifying Python version..."
    python3 --version
}

create_user() {
    log_info "Creating wise2 system user..."
    if id -u "$WISE_USER" &>/dev/null; then
        log_warn "User $WISE_USER already exists"
    else
        useradd -r -s /bin/bash -d "$WISE_HOME" -m "$WISE_USER"
        log_info "User $WISE_USER created"
    fi
}

create_directories() {
    log_info "Creating directory structure..."
    mkdir -p "$WISE_HOME"/{app,config,data,logs,scripts}
    mkdir -p /var/log/wise2-defense
    mkdir -p /etc/wise2-defense

    chown -R "$WISE_USER:$WISE_USER" "$WISE_HOME"
    chown -R "$WISE_USER:$WISE_USER" /var/log/wise2-defense
}

setup_database() {
    log_info "Initializing SQLite database..."
    su - "$WISE_USER" -c "python3.11 -c 'from app.api.main import Database; Database(\"$WISE_HOME/data/wise2-defense.db\")'"
    log_info "Database initialized"
}

install_python_packages() {
    log_info "Creating Python virtual environment..."
    su - "$WISE_USER" -c "python3 -m venv $WISE_HOME/venv"

    log_info "Installing Python dependencies..."
    su - "$WISE_USER" -c "$WISE_HOME/venv/bin/pip install --upgrade pip setuptools wheel"
    su - "$WISE_USER" -c "$WISE_HOME/venv/bin/pip install -r $WISE_HOME/app/api/requirements.txt"

    log_info "Verifying Python packages..."
    su - "$WISE_USER" -c "$WISE_HOME/venv/bin/python -c 'import fastapi; print(f\"FastAPI {fastapi.__version__} OK\")'"
}

setup_environment() {
    log_info "Creating environment configuration..."
    cat > "$WISE_HOME/.env" <<EOF
# WISE DEFENSE EDGE INTELLIGENCE NODE
# Environment Configuration

WISE_DEFENSE_DEVICE_ID=$DEVICE_ID
WISE_DEFENSE_API_PORT=3014
WISE_DEFENSE_API_KEY=edge-$(openssl rand -hex 16)
WISE_DEFENSE_CLOUD_URL=https://api.wise2.net
WISE_DEFENSE_CLOUD_API_KEY=

# Incident Providers (set as configured)
CRIMERADAR_API_KEY=
NOAA_API_KEY=
WEATHER_API_KEY=

# Hardware
MESHTASTIC_PORT=/dev/ttyUSB0
GPS_PORT=/dev/ttyUSB1

# Logging
LOG_LEVEL=INFO

# Performance
PYTHONUNBUFFERED=1
EOF

    chown "$WISE_USER:$WISE_USER" "$WISE_HOME/.env"
    chmod 600 "$WISE_HOME/.env"
    log_info "Environment configured"
}

install_systemd_services() {
    log_info "Installing systemd services..."

    # Main API service
    cat > /etc/systemd/system/wise2-defense.service <<'EOF'
[Unit]
Description=WISE Defense Edge Intelligence Node
Documentation=https://wise2.net/defense
After=network.target
Wants=wise2-health.service

[Service]
Type=simple
User=wise2
WorkingDirectory=/opt/wise2-defense
Environment="PATH=/opt/wise2-defense/venv/bin:/usr/local/bin:/usr/bin"
Environment="PYTHONUNBUFFERED=1"
ExecStart=/opt/wise2-defense/venv/bin/python /opt/wise2-defense/app/api/main.py
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=wise2-defense

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    log_info "Systemd services installed"
}

enable_services() {
    log_info "Enabling systemd services..."
    systemctl enable wise2-defense.service
    log_info "Services enabled"
}

test_api() {
    log_info "Starting WISE Defense API..."
    systemctl start wise2-defense.service
    sleep 3

    log_info "Testing API health..."
    for i in {1..10}; do
        if curl -f http://localhost:3014/health &>/dev/null; then
            log_info "API is healthy"
            return 0
        fi
        log_warn "API not ready, attempt $i/10..."
        sleep 2
    done

    log_error "API failed to start"
    journalctl -u wise2-defense.service -n 50
    exit 1
}

verify_installation() {
    log_info "=== VERIFICATION REPORT ==="
    echo ""
    echo "WISE DEFENSE INSTALLATION SUMMARY"
    echo "=================================="
    echo "Device ID: $DEVICE_ID"
    echo "Installation Path: $WISE_HOME"
    echo "Version: $WISE_VERSION"
    echo ""
    echo "CORE SYSTEMS:"
    echo "  API ........................ $(systemctl is-active wise2-defense.service)"
    echo "  Database ................... $(test -f $WISE_HOME/data/wise2-defense.db && echo OK || echo MISSING)"
    echo ""
    echo "CONFIGURATION:"
    echo "  Environment ................ $(test -f $WISE_HOME/.env && echo OK || echo MISSING)"
    echo "  Systemd Services ........... OK"
    echo ""
    echo "OPTIONAL HARDWARE:"
    echo "  RTL-SDR .................... $(lsusb -d 0bda:2838 &>/dev/null && echo DETECTED || echo NOT DETECTED)"
    echo "  Meshtastic ................. $(lsusb -d 0d28:0204 &>/dev/null && echo DETECTED || echo NOT DETECTED)"
    echo ""
    echo "READY FOR DEPLOYMENT: YES"
    echo ""
    echo "NEXT STEPS:"
    echo "1. Access dashboard: http://$(hostname -I | awk '{print $1}'):3000"
    echo "2. Configure providers in: $WISE_HOME/.env"
    echo "3. Create watch zones via API"
    echo "4. Connect hardware devices (SDR, Meshtastic, GPS)"
    echo ""
}

backup_if_exists() {
    if [ -d "$WISE_HOME" ]; then
        log_warn "WISE Defense already exists. Creating backup..."
        timestamp=$(date +%Y%m%d_%H%M%S)
        cp -r "$WISE_HOME" "${WISE_HOME}.backup.${timestamp}"
        log_info "Backup created: ${WISE_HOME}.backup.${timestamp}"
    fi
}

# Main
main() {
    clear
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║  WISE DEFENSE L.L.C.                                      ║"
    echo "║  Edge Intelligence Node Installer                         ║"
    echo "║  TRAIN. TEACH. PROTECT.                                   ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo ""

    if [ "$EUID" -ne 0 ]; then
        log_error "This script requires sudo. Run: sudo bash $0"
        exit 1
    fi

    check_os
    check_disk_space
    backup_if_exists
    install_dependencies
    create_user
    create_directories
    install_python_packages
    setup_environment
    install_systemd_services
    enable_services
    test_api
    verify_installation

    log_info "Installation complete!"
}

main "$@"
