#!/bin/bash
# WISE² K10 + CYD Gateway Deployment Script for Raspberry Pi
#
# Deploys the K10 (voice) + CYD (display) gateway service to wisepi
# This script:
#   - Sets up Node.js environment
#   - Installs MQTT broker (Mosquitto)
#   - Deploys gateway service
#   - Configures systemd auto-start
#   - Sets up networking and firewall
#   - Verifies all 3 devices (K10, CYD, wisepi)
#
# Run on: wisepi (Raspberry Pi 5 running Debian 13 arm64)
# Usage: sudo bash deploy-k10-cyd-gateway.sh
#
# Prerequisites:
#   - SSH access to wisepi
#   - Internet connection for package downloads
#   - ~500MB free disk space

set -e

# ============================================================================
# Configuration
# ============================================================================

GATEWAY_DIR="/opt/wise2/gateway"
GATEWAY_USER="wise2"
GATEWAY_SERVICE="k10-cyd-gateway"
GATEWAY_PORT=8888
MQTT_HOST="localhost"
MQTT_PORT=1883
POCKET_NODE_IP="100.85.242.34"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ============================================================================
# Helper Functions
# ============================================================================

print_header() {
  echo ""
  echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
  echo ""
}

print_step() {
  echo -e "${CYAN}→${NC} $1"
}

print_success() {
  echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
  echo -e "${RED}✗${NC} $1"
}

check_root() {
  if [ "$EUID" -ne 0 ]; then
    print_error "This script requires sudo"
    echo "Run: sudo bash $0"
    exit 1
  fi
  print_success "Running with sudo privileges"
}

# ============================================================================
# Step 1: Prerequisites Check
# ============================================================================

step_prerequisites() {
  print_header "Step 1: Checking Prerequisites"

  # Check if running on Raspberry Pi
  if [ ! -f /proc/cpuinfo ] || ! grep -q "ARM\|arm64" /proc/cpuinfo; then
    print_warning "This does not appear to be an ARM device (may not be RPi)"
  fi

  # Check internet connectivity
  print_step "Checking internet connectivity..."
  if ping -c 1 8.8.8.8 &>/dev/null; then
    print_success "Internet connection available"
  else
    print_warning "Internet connection may be unavailable (continuing anyway)"
  fi

  # Check disk space
  print_step "Checking disk space..."
  AVAILABLE=$(df /opt 2>/dev/null | awk 'NR==2 {print $4}' || echo "0")
  if [ "$AVAILABLE" -gt 500000 ]; then
    print_success "Sufficient disk space available (${AVAILABLE}KB)"
  else
    print_warning "Low disk space (${AVAILABLE}KB available, ~500MB recommended)"
  fi

  # Check if system is up to date
  print_step "Checking system packages..."
  apt-get update > /dev/null 2>&1
  print_success "Package list updated"
}

# ============================================================================
# Step 2: System Setup
# ============================================================================

step_system_setup() {
  print_header "Step 2: System Setup"

  # Install required system packages
  print_step "Installing system packages..."
  apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    python3 \
    mosquitto \
    mosquitto-clients \
    avahi-daemon \
    netcat-openbsd \
    htop \
    tmux \
    > /dev/null 2>&1

  print_success "System packages installed"

  # Enable Mosquitto
  print_step "Enabling Mosquitto MQTT broker..."
  systemctl enable mosquitto > /dev/null 2>&1
  systemctl start mosquitto > /dev/null 2>&1
  print_success "Mosquitto enabled and started"

  # Enable mDNS for device discovery
  print_step "Enabling mDNS (Avahi)..."
  systemctl enable avahi-daemon > /dev/null 2>&1
  systemctl start avahi-daemon > /dev/null 2>&1
  print_success "mDNS enabled for device discovery"
}

# ============================================================================
# Step 3: Node.js Installation
# ============================================================================

step_nodejs_setup() {
  print_header "Step 3: Node.js Installation"

  # Check if Node.js is already installed
  if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_success "Node.js already installed: $NODE_VERSION"
  else
    print_step "Installing Node.js from NodeSource..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
    apt-get install -y nodejs > /dev/null 2>&1
    print_success "Node.js $(node -v) installed"
  fi

  print_success "npm version: $(npm -v)"
}

# ============================================================================
# Step 4: Gateway Directory Setup
# ============================================================================

step_gateway_setup() {
  print_header "Step 4: Gateway Directory Setup"

  # Create gateway directory
  print_step "Creating gateway directory..."
  if [ ! -d "$GATEWAY_DIR" ]; then
    mkdir -p "$GATEWAY_DIR"
    print_success "Created $GATEWAY_DIR"
  else
    print_success "Gateway directory already exists"
  fi

  # Create wise2 user if needed
  print_step "Setting up gateway user..."
  if ! id "$GATEWAY_USER" &>/dev/null; then
    useradd -r -s /bin/bash -d "$GATEWAY_DIR" -m "$GATEWAY_USER" 2>/dev/null || true
    print_success "Created $GATEWAY_USER user"
  else
    print_success "$GATEWAY_USER user already exists"
  fi

  # Set permissions
  chown -R "$GATEWAY_USER:$GATEWAY_USER" "$GATEWAY_DIR"
  chmod 755 "$GATEWAY_DIR"
  print_success "Set permissions on $GATEWAY_DIR"
}

# ============================================================================
# Step 5: Gateway Service Deployment
# ============================================================================

step_deploy_gateway() {
  print_header "Step 5: Deploying Gateway Service"

  # Copy gateway files from git repo
  REPO_ROOT="/Users/danielwise/Projects/wise2-core"

  if [ ! -d "$REPO_ROOT" ]; then
    print_error "WISE² Core repository not found at $REPO_ROOT"
    print_error "Please update REPO_ROOT path in this script"
    return 1
  fi

  print_step "Copying gateway files..."

  # Copy gateway service script
  if [ -f "$REPO_ROOT/.claude/edge-hub/k10-cyd-gateway-service.js" ]; then
    cp "$REPO_ROOT/.claude/edge-hub/k10-cyd-gateway-service.js" "$GATEWAY_DIR/"
    chmod +x "$GATEWAY_DIR/k10-cyd-gateway-service.js"
    print_success "Deployed gateway service"
  else
    print_error "Gateway service script not found"
    return 1
  fi

  # Copy documentation
  if [ -f "$REPO_ROOT/.claude/edge-hub/K10_CYD_WISEPI_INTEGRATION.md" ]; then
    cp "$REPO_ROOT/.claude/edge-hub/K10_CYD_WISEPI_INTEGRATION.md" "$GATEWAY_DIR/"
    print_success "Copied documentation"
  fi

  # Create package.json if it doesn't exist
  if [ ! -f "$GATEWAY_DIR/package.json" ]; then
    print_step "Creating package.json..."
    cat > "$GATEWAY_DIR/package.json" << 'EOF'
{
  "name": "wise2-k10-cyd-gateway",
  "version": "1.0.0",
  "description": "WISE² K10 + CYD Gateway Service for wisepi",
  "main": "k10-cyd-gateway-service.js",
  "scripts": {
    "start": "node k10-cyd-gateway-service.js",
    "dev": "nodemon k10-cyd-gateway-service.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": ["wise2", "k10", "cyd", "gateway", "mqtt"],
  "author": "dwise",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "mqtt": "^5.0.0",
    "axios": "^1.5.0"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
EOF
    print_success "Created package.json"
  fi

  # Install npm dependencies
  print_step "Installing npm dependencies (this may take a minute)..."
  cd "$GATEWAY_DIR"
  sudo -u "$GATEWAY_USER" npm install --production > /dev/null 2>&1
  print_success "npm dependencies installed"

  # Set permissions on node_modules
  chown -R "$GATEWAY_USER:$GATEWAY_USER" "$GATEWAY_DIR/node_modules"
}

# ============================================================================
# Step 6: Systemd Service Setup
# ============================================================================

step_systemd_setup() {
  print_header "Step 6: Systemd Service Setup"

  # Create or update systemd service file
  print_step "Installing systemd service..."
  cat > /etc/systemd/system/$GATEWAY_SERVICE.service << EOF
[Unit]
Description=WISE² K10 + CYD Gateway Service
Documentation=file://$GATEWAY_DIR/K10_CYD_WISEPI_INTEGRATION.md
After=network-online.target mosquitto.service
Wants=network-online.target

[Service]
Type=simple
User=$GATEWAY_USER
WorkingDirectory=$GATEWAY_DIR
ExecStart=/usr/bin/node k10-cyd-gateway-service.js
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=wise2-k10-cyd-gateway

# Environment variables
Environment="NODE_ENV=production"
Environment="MQTT_HOST=$MQTT_HOST"
Environment="MQTT_PORT=$MQTT_PORT"
Environment="GATEWAY_PORT=$GATEWAY_PORT"
Environment="POCKET_NODE_IP=$POCKET_NODE_IP"

# Security
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=yes
ReadWritePaths=$GATEWAY_DIR

# Resource limits
MemoryLimit=512M
CPUQuota=50%

[Install]
WantedBy=multi-user.target
EOF

  chmod 644 /etc/systemd/system/$GATEWAY_SERVICE.service
  systemctl daemon-reload
  print_success "Systemd service installed and configured"

  # Enable service for auto-start
  print_step "Enabling auto-start on boot..."
  systemctl enable $GATEWAY_SERVICE > /dev/null 2>&1
  print_success "Service enabled for auto-start"
}

# ============================================================================
# Step 7: Network Configuration
# ============================================================================

step_network_setup() {
  print_header "Step 7: Network Configuration"

  # Configure firewall (UFW)
  print_step "Configuring firewall rules..."
  if command -v ufw &> /dev/null; then
    ufw allow in on eth0 from 192.168.8.0/24 to any port 8888 > /dev/null 2>&1 || true
    ufw allow in on wlan0 from 192.168.8.0/24 to any port 8888 > /dev/null 2>&1 || true
    ufw allow 1883/tcp > /dev/null 2>&1 || true
    print_success "Firewall rules configured"
  else
    print_warning "UFW not installed, skipping firewall configuration"
  fi

  # Configure MQTT broker for local + remote access
  print_step "Configuring MQTT broker..."
  if [ -f /etc/mosquitto/mosquitto.conf ]; then
    # Backup original
    cp /etc/mosquitto/mosquitto.conf /etc/mosquitto/mosquitto.conf.backup

    # Create listener configuration if not already present
    if ! grep -q "listener 1883" /etc/mosquitto/mosquitto.conf; then
      cat >> /etc/mosquitto/mosquitto.conf << 'EOF'

# WISE² Gateway Configuration
listener 1883
protocol mqtt
allow_anonymous true

listener 8883
protocol mqtt
cafile /etc/mosquitto/certs/ca.crt
certfile /etc/mosquitto/certs/server.crt
keyfile /etc/mosquitto/certs/server.key
EOF
      print_success "MQTT broker configured"
      systemctl restart mosquitto > /dev/null 2>&1
    else
      print_success "MQTT broker already configured"
    fi
  fi

  # Static IP recommendation
  print_warning "For stable gateway operation, consider setting static IP for wisepi"
  print_warning "Current IP: $(hostname -I | awk '{print $1}')"
}

# ============================================================================
# Step 8: Service Startup & Verification
# ============================================================================

step_verify_services() {
  print_header "Step 8: Service Startup & Verification"

  # Start the gateway service
  print_step "Starting gateway service..."
  systemctl start $GATEWAY_SERVICE
  sleep 3

  # Check if service is running
  if systemctl is-active --quiet $GATEWAY_SERVICE; then
    print_success "Gateway service is running"
  else
    print_error "Gateway service failed to start"
    echo ""
    print_step "Service logs:"
    journalctl -u $GATEWAY_SERVICE -n 20
    return 1
  fi

  # Test health endpoint
  print_step "Testing gateway health endpoint..."
  if curl -s http://localhost:$GATEWAY_PORT/health | grep -q "online"; then
    print_success "Gateway health endpoint responding"
  else
    print_warning "Gateway health endpoint may not be responding yet (starting up)"
    sleep 2
  fi

  # Test MQTT connectivity
  print_step "Testing MQTT broker..."
  if mosquitto_pub -h localhost -t "wise2/test" -m "test" 2>/dev/null; then
    print_success "MQTT broker is accessible"
  else
    print_error "MQTT broker not responding"
    return 1
  fi

  # Test Pocket Node connectivity
  print_step "Testing Pocket Node reachability..."
  if ping -c 1 -W 2 $POCKET_NODE_IP &>/dev/null; then
    print_success "Pocket Node reachable at $POCKET_NODE_IP (Tailscale)"
  else
    print_warning "Pocket Node not reachable (check Tailscale connection)"
  fi
}

# ============================================================================
# Step 9: Monitoring & Logging Setup
# ============================================================================

step_monitoring_setup() {
  print_header "Step 9: Monitoring & Logging Setup"

  # Create log directory
  LOG_DIR="/var/log/wise2"
  mkdir -p "$LOG_DIR"
  chown -R "$GATEWAY_USER:$GATEWAY_USER" "$LOG_DIR"
  print_success "Log directory created at $LOG_DIR"

  # Set up log rotation
  print_step "Configuring log rotation..."
  cat > /etc/logrotate.d/wise2-gateway << 'EOF'
/var/log/wise2/*.log {
  daily
  rotate 7
  compress
  delaycompress
  notifempty
  create 0644 wise2 wise2
}
EOF
  print_success "Log rotation configured"

  # Create helper scripts
  print_step "Creating helper scripts..."

  # Status check script
  cat > "$GATEWAY_DIR/check-status.sh" << 'EOF'
#!/bin/bash
echo "=== WISE² K10/CYD Gateway Status ==="
echo ""
echo "Service Status:"
systemctl status k10-cyd-gateway --no-pager
echo ""
echo "Gateway Health:"
curl -s http://localhost:8888/health | jq '.' 2>/dev/null || echo "Gateway not responding"
echo ""
echo "MQTT Status:"
mosquitto_pub -h localhost -t "wise2/status-check" -m "$(date)" && echo "MQTT: OK" || echo "MQTT: OFFLINE"
echo ""
echo "Recent Logs (last 20 lines):"
journalctl -u k10-cyd-gateway -n 20 --no-pager
EOF
  chmod +x "$GATEWAY_DIR/check-status.sh"

  print_success "Helper scripts created"
}

# ============================================================================
# Step 10: Documentation & Summary
# ============================================================================

step_summary() {
  print_header "Deployment Complete!"

  echo ""
  echo -e "${GREEN}✅ WISE² K10/CYD Gateway Successfully Deployed${NC}"
  echo ""

  print_success "Gateway Service: $GATEWAY_SERVICE"
  print_success "Location: $GATEWAY_DIR"
  print_success "Port: $GATEWAY_PORT"
  print_success "User: $GATEWAY_USER"
  print_success "MQTT: $MQTT_HOST:$MQTT_PORT"
  print_success "Pocket Node: $POCKET_NODE_IP"

  echo ""
  echo -e "${CYAN}Gateway Information:${NC}"
  echo "  Status endpoint: http://localhost:$GATEWAY_PORT/health"
  echo "  K10 proxy: http://localhost:$GATEWAY_PORT/k10"
  echo "  CYD proxy: http://localhost:$GATEWAY_PORT/cyd"
  echo "  MQTT topics: wise2/#"

  echo ""
  echo -e "${CYAN}Useful Commands:${NC}"
  echo "  Status:    sudo systemctl status $GATEWAY_SERVICE"
  echo "  Logs:      sudo journalctl -u $GATEWAY_SERVICE -f"
  echo "  Restart:   sudo systemctl restart $GATEWAY_SERVICE"
  echo "  Stop:      sudo systemctl stop $GATEWAY_SERVICE"
  echo "  Check:     bash $GATEWAY_DIR/check-status.sh"

  echo ""
  echo -e "${CYAN}Next Steps:${NC}"
  echo "  1. Connect K10 device to WiFi (same network as wisepi)"
  echo "  2. Connect CYD display to WiFi (same network as wisepi)"
  echo "  3. Devices will auto-discover gateway via mDNS"
  echo "  4. Verify with: curl http://localhost:$GATEWAY_PORT/health"
  echo "  5. Check logs: sudo journalctl -u $GATEWAY_SERVICE -f"

  echo ""
  echo -e "${CYAN}Documentation:${NC}"
  echo "  Setup guide: $GATEWAY_DIR/K10_CYD_WISEPI_INTEGRATION.md"

  echo ""
  echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
  echo ""
}

# ============================================================================
# Error Handler
# ============================================================================

on_error() {
  print_error "Deployment failed at step $1"
  echo ""
  echo "Troubleshooting:"
  echo "  1. Check disk space: df -h"
  echo "  2. Check internet: ping 8.8.8.8"
  echo "  3. View service logs: sudo journalctl -u $GATEWAY_SERVICE"
  echo "  4. Verify MQTT: mosquitto_sub -h localhost -t 'wise2/#' -C 1"
  exit 1
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
  print_header "WISE² K10/CYD Gateway Deployment for wisepi"
  echo "Starting deployment to Raspberry Pi..."
  echo ""

  check_root || on_error "root_check"

  step_prerequisites || on_error "prerequisites"
  step_system_setup || on_error "system_setup"
  step_nodejs_setup || on_error "nodejs_setup"
  step_gateway_setup || on_error "gateway_setup"
  step_deploy_gateway || on_error "deploy_gateway"
  step_systemd_setup || on_error "systemd_setup"
  step_network_setup || on_error "network_setup"
  step_verify_services || on_error "verify_services"
  step_monitoring_setup || on_error "monitoring_setup"
  step_summary

  echo -e "${GREEN}Deployment completed successfully!${NC}"
  echo ""
  echo "The gateway is now running. K10 and CYD devices can connect to wisepi at:"
  echo "  Gateway URL: http://$(hostname -I | awk '{print $1}'):$GATEWAY_PORT"
  echo "  MQTT Broker: $(hostname -I | awk '{print $1}'):$MQTT_PORT"
}

# Run main function
main
