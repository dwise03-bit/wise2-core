#!/bin/bash
# WISE² HVAC POCKET NODE — PHASE 1 FOUNDATION
# Automated setup for Raspberry Pi 5
# Run once connected via SSH/Tailscale

set -e

echo "════════════════════════════════════════════"
echo "WISE² POCKET NODE — PHASE 1 FOUNDATION"
echo "════════════════════════════════════════════"
echo

# 1. INSPECT BASELINE
echo "STEP 1: Inspect baseline..."
echo "OS: $(lsb_release -ds)"
echo "Kernel: $(uname -r)"
echo "Hostname: $(hostname)"
echo "Arch: $(uname -m)"
echo "CPU: $(nproc) cores"
echo "RAM: $(free -h | grep Mem | awk '{print $2}')"
echo "Storage: $(df -h / | tail -1 | awk '{print $2}')"
echo

# 2. SET HOSTNAME
echo "STEP 2: Setting hostname to wise2-pocketnode..."
sudo hostnamectl set-hostname wise2-pocketnode
echo "✓ Hostname set"
echo

# 3. ENABLE INTERFACES
echo "STEP 3: Enabling hardware interfaces..."
# I²C
sudo raspi-config nonint do_i2c 0 2>/dev/null || echo "I²C: already enabled or error"
# SPI
sudo raspi-config nonint do_spi 0 2>/dev/null || echo "SPI: already enabled or error"
# 1-Wire (GPIO 4)
sudo raspi-config nonint do_onewire 0 2>/dev/null || echo "1-Wire: already enabled or error"
# Bluetooth (usually on by default)
echo "✓ Interfaces configured"
echo

# 4. UPDATE SYSTEM
echo "STEP 4: Updating system packages..."
sudo apt-get update -qq
sudo apt-get upgrade -y -qq
echo "✓ System updated"
echo

# 5. INSTALL CORE DEPENDENCIES
echo "STEP 5: Installing core stack..."
sudo apt-get install -y -qq \
  git \
  curl \
  wget \
  jq \
  sqlite3 \
  python3 \
  python3-pip \
  python3-venv \
  build-essential \
  libssl-dev \
  libffi-dev \
  python3-dev \
  mosquitto \
  mosquitto-clients \
  i2c-tools \
  libi2c0 \
  hwinfo \
  htop \
  iotop \
  lm-sensors

echo "✓ Core dependencies installed"
echo

# 6. INSTALL DOCKER
echo "STEP 6: Installing Docker..."
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker $(whoami)
  echo "✓ Docker installed"
else
  echo "✓ Docker already installed"
fi
echo

# 7. INSTALL TAILSCALE
echo "STEP 7: Installing Tailscale..."
if ! command -v tailscale &> /dev/null; then
  curl -fsSL https://tailscale.com/install.sh | sh
  echo "⚠️  Tailscale installed. Run: sudo tailscale up"
else
  echo "✓ Tailscale already installed"
fi
echo

# 8. CREATE WISE² DIRECTORIES
echo "STEP 8: Creating WISE² directory structure..."
sudo mkdir -p /opt/wise2/{pocket-node,data,logs,backups}
sudo chown -R $(whoami):$(whoami) /opt/wise2
mkdir -p /opt/wise2/pocket-node/{api,dashboard,edge-agent,sensors,diagnostics,calculations,mqtt,voice,sync,config,scripts,tests}
echo "✓ Directory structure created"
echo

# 9. VERIFY SSH
echo "STEP 9: Verifying SSH..."
sudo systemctl enable ssh
sudo systemctl start ssh
echo "✓ SSH enabled and running"
echo

# 10. SETUP FIREWALL
echo "STEP 10: Configuring firewall..."
sudo apt-get install -y -qq ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 1883/tcp    # MQTT
sudo ufw allow 8080/tcp    # API
sudo ufw allow 3000/tcp    # Dashboard
sudo ufw allow 5900/tcp    # VNC (optional)
sudo ufw --force enable
echo "✓ Firewall configured"
echo

# 11. SYSTEM HEALTH CHECK
echo "STEP 11: System health check..."
echo "Temperature: $(vcgencmd measure_temp 2>/dev/null | grep -o '[0-9]*\.[0-9]*')'C"
echo "CPU Load: $(uptime | awk -F'load average:' '{print $2}')"
echo "Disk Usage: $(df -h / | tail -1 | awk '{print $5}')"
echo "Memory: $(free -h | grep Mem | awk '{print $3 "/" $2}')"
echo

echo "════════════════════════════════════════════"
echo "✅ PHASE 1 FOUNDATION COMPLETE"
echo "════════════════════════════════════════════"
echo
echo "Next steps:"
echo "1. Connect via SSH: ssh d@100.85.242.34 (Tailscale)"
echo "2. Verify: systemctl --failed"
echo "3. Begin PHASE 2: Deploy MQTT, database, Edge Agent"
echo
