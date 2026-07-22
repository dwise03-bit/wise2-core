# WISE² Edge on Raspberry Pi 3B - Complete Installation Guide

**Target Hardware**: Raspberry Pi 3B (1GB RAM, ARMv7)  
**Target OS**: Raspberry Pi OS Lite (Bullseye 32-bit recommended)  
**Installation Time**: 45-60 minutes  
**Skill Level**: Intermediate (comfortable with terminal, basic Linux)

---

## Executive Summary

This guide installs WISE² Edge on a resource-constrained Raspberry Pi 3B, enabling:

- **Offline-first operation**: Full functionality without cloud connectivity
- **Local AI inference**: Lightweight LLM inference via Ollama (Mistral 7B quantized)
- **Voice control**: Wake-word detection, speech-to-text (local), basic TTS
- **GPIO automation**: Control lights, relays, sensors
- **Bidirectional sync**: Automatic sync to cloud when connectivity returns
- **Lightweight runtime**: ~200MB footprint, runs on 1GB RAM with swap

---

## Part 1: Hardware & Prerequisites

### Hardware Checklist

- [ ] Raspberry Pi 3B (specifically 3B, not 3B+)
- [ ] 16-32GB microSD card (Class 10 A1, SanDisk/Samsung recommended)
- [ ] 2.5A+ USB power supply (Official Pi PSU recommended)
- [ ] Ethernet cable OR WiFi (onboard, will auto-detect)
- [ ] Optional: USB microphone + speaker (for voice control)
- [ ] Optional: Pi camera module (for camera features)
- [ ] Optional: GPIO LEDs/relays for testing automation

### Software Prerequisites

- Mac/Linux laptop for SD card flashing
- Balena Etcher (download from https://www.balena.io/etcher/)
- SSH client (built-in on Mac/Linux, PuTTY on Windows)
- Text editor (nano, vim, or VS Code)

### Network Checklist

- [ ] Router with DHCP enabled (for auto IP assignment)
- [ ] Static IP preferred (see Static IP section in Part 5)
- [ ] Port 22 open for SSH (usually default)
- [ ] Port 3000 accessible on local network

---

## Part 2: System Preparation

### Step 1: Flash Raspberry Pi OS

1. **Download OS image**
   ```bash
   # Download Raspberry Pi OS Lite 32-bit (Bullseye)
   # Smaller than 64-bit, better compatibility with Pi 3B
   # From: https://www.raspberrypi.com/software/operating-systems/
   # File: ~350MB compressed
   ```

2. **Flash to SD card using Balena Etcher**
   - Open Balena Etcher
   - Select downloaded `.img` file
   - Select microSD card (⚠️ verify correct device to avoid data loss)
   - Click Flash (takes ~5 minutes)

3. **Enable SSH (headless setup)**
   - After flashing completes, DO NOT eject yet
   - Create empty file named `ssh` in boot partition:
     ```bash
     # On macOS
     cd /Volumes/boot
     touch ssh
     # On Linux
     mkdir -p /mnt/boot
     sudo touch /mnt/boot/ssh
     ```

4. **Configure WiFi (if using wireless)**
   - Create file `wpa_supplicant.conf` in boot partition:
     ```bash
     cat > /Volumes/boot/wpa_supplicant.conf << 'EOF'
     country=US
     ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
     update_config=1
     
     network={
       ssid="YOUR_SSID"
       psk="YOUR_PASSWORD"
       key_mgmt=WPA-PSK
     }
     EOF
     ```
   - Replace `YOUR_SSID` and `YOUR_PASSWORD`

5. **Eject SD card and insert into Pi**

### Step 2: Initial Boot & SSH Connection

1. **Power on Pi**
   - Insert SD card into Pi
   - Connect power (red LED lights, green LED flashes)
   - Wait 2-3 minutes for first boot and filesystem expansion

2. **Find Pi's IP address**
   ```bash
   # Scan local network (on your laptop)
   # Option 1: From router web interface (check connected devices)
   # Option 2: Using nmap (if installed)
   nmap -sn 192.168.1.0/24 | grep -i raspberry
   
   # Option 3: Assume default hostname
   ping raspberrypi.local
   ```

3. **SSH into Pi**
   ```bash
   # Default credentials: pi / raspberry
   ssh pi@raspberrypi.local
   # or: ssh pi@<ip-address>
   
   # First login: accept host key (type 'yes')
   # Verify successful connection (you see the pi prompt)
   ```

### Step 3: Initial System Configuration

```bash
# Update system packages
sudo apt update
sudo apt upgrade -y

# Install essential build tools
sudo apt install -y \
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
  python3-pip

# Change default password (STRONGLY RECOMMENDED)
passwd
# Enter current password (raspberry)
# Enter new password twice

# Create WISE² system user (optional but recommended)
sudo useradd -m -s /bin/bash wise2
sudo usermod -aG sudo,docker,gpio,i2c,video,audio wise2
```

### Step 4: Optimize for Pi 3B's Constraints

#### Memory Management
```bash
# Check current configuration
free -h
df -h

# Enable swap (critical for 1GB Pi 3B)
# Create 2GB swap file
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent (survives reboot)
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify
free -h
# Should show ~3GB total (1GB RAM + 2GB swap)
```

#### Disable Unnecessary Services
```bash
# Stop services that consume memory on Pi 3B
sudo systemctl disable avahi-daemon
sudo systemctl disable bluetooth
sudo systemctl stop bluetooth

# Reduce GPU memory allocation (Pi 3B has shared memory)
# Edit GPU memory in config.txt
sudo nano /boot/config.txt
# Find or add: gpu_mem=64
# This leaves more for CPU/RAM
```

#### Filesystem Optimization
```bash
# Enable journal compression (saves disk space)
echo 'ext4.default_journal_ioctl=1' | sudo tee -a /etc/sysctl.conf

# Disable unnecessary logging
sudo systemctl disable rsyslog
# Or reduce log size:
sudo nano /etc/logrotate.d/rsyslog
# Change "rotate 7" to "rotate 3"
```

---

## Part 3: Install Docker & Runtime Dependencies

### Step 1: Install Docker

```bash
# Install Docker (ARM32 compatible version)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add pi user to docker group (avoid sudo for docker commands)
sudo usermod -aG docker pi

# Verify Docker installation
docker --version
# Expected: Docker version 20.10+ (ARM32)

# Start Docker service
sudo systemctl enable docker
sudo systemctl start docker

# Test Docker
docker run hello-world
```

### Step 2: Install Docker Compose

```bash
# Docker Compose for ARM32
sudo apt install -y docker-compose

# Verify installation
docker-compose --version
# Expected: docker-compose version 1.29+
```

### Step 3: Install Node.js

```bash
# Pi 3B requires 32-bit Node.js (not 64-bit)
curl -sL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs

# Verify
node --version
npm --version
# Expected: node v20.x.x, npm 10.x.x

# Reduce npm cache (saves disk space on Pi 3B)
npm cache clean --force
npm config set fetch-timeout 120000
npm config set fetch-retries 5
npm config set fetch-retry-mintimeout 20000
npm config set fetch-retry-maxtimeout 120000
```

### Step 4: Install Additional Runtime Dependencies

```bash
# Required for GPIO control
sudo apt install -y python3-rpi.gpio

# For voice control (optional, can be added later)
sudo apt install -y alsa-utils

# For camera support (if using Pi camera)
sudo apt install -y python3-picamera

# For WireGuard VPN (cloud sync)
sudo apt install -y wireguard wireguard-tools

# DNS utilities for network troubleshooting
sudo apt install -y dnsutils

# Monitoring tools
sudo apt install -y nethogs iotop

# Verify all installations
which docker docker-compose node npm
# All should show paths
```

---

## Part 4: Clone & Prepare WISE² Edge

### Step 1: Clone Repository

```bash
# Navigate to home directory
cd ~

# Clone repository
git clone https://github.com/dwise03-bit/wise2-core.git wise2-edge
cd wise2-edge/services/edge-appliance

# Verify we're in correct directory
pwd
# Should end with: wise2-core/services/edge-appliance
ls -la
# Should show: docker-compose.yml, package.json, README.md, etc.
```

### Step 2: Install Node Dependencies

```bash
# This may take 5-10 minutes on Pi 3B
npm install

# If npm hangs, try:
npm install --prefer-offline --no-audit

# Verify installation
npm list
# Should show dependencies installed without errors
```

### Step 3: Create Pi 3B-Specific Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit for Pi 3B constraints
nano .env
```

**Insert this Pi 3B-optimized .env config:**

```bash
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
LOCAL_DB_PATH=/home/pi/wise2-edge/data/wise2-edge.db
MODEL_PATH=/home/pi/wise2-edge/models

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
```

### Step 4: Create Lightweight Docker Compose Override

```bash
# Create Pi 3B-specific docker-compose override
cat > docker-compose.pi3b.yml << 'EOF'
version: '3.9'

services:
  # Lightweight Ollama (quantized models only)
  ollama:
    image: ollama/ollama:latest
    container_name: wise2-ollama
    ports:
      - '11434:11434'
    volumes:
      - ollama-data:/root/.ollama
    environment:
      OLLAMA_HOST: 0.0.0.0:11434
    restart: unless-stopped
    # Resource limits for Pi 3B
    deploy:
      resources:
        limits:
          cpus: '1.5'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:11434/api/tags']
      interval: 60s
      timeout: 10s
      retries: 3
      start_period: 60s
    networks:
      - wise2-edge

  # Database initialization
  db-init:
    image: busybox
    container_name: wise2-db-init
    volumes:
      - ./data:/data
    command: mkdir -p /data
    networks:
      - wise2-edge

  # Edge Runtime Service
  edge-runtime:
    build:
      context: .
      dockerfile: docker/Dockerfile
      args:
        NODE_ENV: production
    container_name: wise2-edge-runtime
    depends_on:
      - ollama
      - db-init
    ports:
      - '3000:3000'
      - '3002:3002'
    volumes:
      - ./data:/data
      - ./models:/models:ro
      - /var/log/wise2-edge-appliance:/var/log/wise2-edge-appliance
      - /dev:/dev
      - /sys:/sys:ro
      - /proc:/proc:ro
    environment:
      NODE_ENV: production
      NODE_ID: edge-pi3b-1
      PORT: 3000
      LOCAL_DB_PATH: /data/wise2-edge.db
      MODEL_PATH: /models
      VOICE_MODEL: tinyllama
      CLOUD_URL: https://api.wise2.cloud
      API_KEY: ${API_KEY:-}
      OLLAMA_URL: http://ollama:11434
      OFFLINE_MODE: false
      LOG_LEVEL: info
    restart: unless-stopped
    # Resource limits for Pi 3B (1GB RAM)
    deploy:
      resources:
        limits:
          cpus: '1.8'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/health']
      interval: 60s
      timeout: 10s
      retries: 3
      start_period: 30s
    networks:
      - wise2-edge
    cap_add:
      - SYS_ADMIN
      - NET_ADMIN
      - SYS_RAWIO
    devices:
      - /dev/mem:/dev/mem
      - /dev/gpiomem:/dev/gpiomem

volumes:
  ollama-data:
    driver: local

networks:
  wise2-edge:
    driver: bridge
EOF

# Verify file created
cat docker-compose.pi3b.yml | head -20
```

---

## Part 5: Build & Deploy

### Step 1: Build TypeScript

```bash
# From edge-appliance directory
npm run build

# Verify build
ls -la dist/
# Should contain: index.js, agent.js, api.js, etc.
```

### Step 2: Build Docker Image

```bash
# Build ARM32-compatible image for Pi 3B
docker build -f docker/Dockerfile -t wise2/edge-pi3b:latest .

# This takes 10-15 minutes on Pi 3B (first time)
# Subsequent builds are faster (cached layers)

# Verify image
docker images | grep wise2
# Should show: wise2/edge-pi3b:latest
```

### Step 3: Create Deployment Directory

```bash
# Create persistent deployment location
sudo mkdir -p /opt/wise2-edge
sudo chown pi:pi /opt/wise2-edge

# Copy deployment files
cp -r docker-compose.pi3b.yml /opt/wise2-edge/
cp -r .env /opt/wise2-edge/
cp -r data /opt/wise2-edge/ 2>/dev/null || true
cp -r models /opt/wise2-edge/ 2>/dev/null || true

# Create log directory
sudo mkdir -p /var/log/wise2-edge-appliance
sudo chown pi:pi /var/log/wise2-edge-appliance
```

### Step 4: Start Services

```bash
# Navigate to deployment directory
cd /opt/wise2-edge

# Start all services with Pi 3B compose file
docker-compose -f docker-compose.pi3b.yml up -d

# Monitor startup (watch for "healthy" status)
# This takes 30-45 seconds first time
watch -n 5 'docker-compose -f docker-compose.pi3b.yml ps'
# Press Ctrl+C to exit watch

# Expected output:
# NAME              STATUS         PORTS
# wise2-ollama      healthy        0.0.0.0:11434->11434/tcp
# wise2-db-init     exited(0)      
# wise2-edge-runtime healthy       0.0.0.0:3000->3000/tcp, 0.0.0.0:3002->3002/tcp
```

### Step 5: Verify Installation

```bash
# Check container health
docker-compose -f docker-compose.pi3b.yml ps

# Check logs (verify no errors)
docker-compose -f docker-compose.pi3b.yml logs -f edge-runtime

# Test health endpoint (in another terminal)
curl http://localhost:3000/health

# Expected response:
# {
#   "status": "ready",
#   "nodeId": "edge-pi3b-1",
#   "uptime": 1234567,
#   "connectivity": {
#     "cloud": false,
#     "localNetwork": true,
#     "vpn": false
#   }
# }
```

---

## Part 6: System Integration & Autostart

### Step 1: Create Systemd Service

```bash
# Create service file for autostart
sudo tee /etc/systemd/system/wise2-edge.service > /dev/null << 'EOF'
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

# Resource limits for Pi 3B
MemoryLimit=512M
CPUQuota=90%

[Install]
WantedBy=multi-user.target
EOF

# Verify service file
sudo systemctl daemon-reload
sudo systemctl status wise2-edge

# Enable autostart
sudo systemctl enable wise2-edge
```

### Step 2: Configure PM2 (Alternative Approach)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Create PM2 ecosystem file
cat > /opt/wise2-edge/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'wise2-edge',
      script: '/opt/wise2-edge/dist/index.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        LOG_LEVEL: 'info'
      },
      max_memory_restart: '256M',
      error_file: '/var/log/wise2-edge-appliance/error.log',
      out_file: '/var/log/wise2-edge-appliance/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
EOF

# Start with PM2
cd /opt/wise2-edge
pm2 start ecosystem.config.js

# Save PM2 config for autostart
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup \
  -u pi --hp /home/pi
```

### Step 3: Test Autostart

```bash
# Reboot Pi to test autostart
sudo reboot

# Wait 2 minutes for boot and services to start
# Then verify services are running
docker-compose -f /opt/wise2-edge/docker-compose.pi3b.yml ps

# Test API endpoint
curl http://localhost:3000/health

# Check systemd status
sudo systemctl status wise2-edge
```

---

## Part 7: Remote Access & Networking

### Option 1: Static IP Configuration

```bash
# Edit network configuration
sudo nano /etc/dhcpcd.conf

# Add at end of file:
interface eth0
static ip_address=192.168.1.100/24
static routers=192.168.1.1
static domain_name_servers=8.8.8.8 8.8.4.4

# For WiFi instead:
interface wlan0
static ip_address=192.168.1.100/24
static routers=192.168.1.1
static domain_name_servers=8.8.8.8 8.8.4.4

# Save and exit (Ctrl+O, Enter, Ctrl+X)
# Reboot to apply
sudo reboot
```

### Option 2: mDNS Hostname Registration

```bash
# Already enabled by default on Pi OS
# Access Pi using hostname
ping raspberrypi.local
curl http://raspberrypi.local:3000/health

# Change hostname (optional)
sudo raspi-config
# Navigate: System Options > Hostname > Enter new name
# Reboot
sudo reboot
```

### Option 3: Remote SSH Tunneling

```bash
# From your laptop, create secure tunnel
ssh -L 3000:localhost:3000 pi@raspberrypi.local

# Now access from laptop:
curl http://localhost:3000/health

# Or from another machine on network:
ssh -R 3000:localhost:3000 -N user@external-server
# (if you have external server)
```

---

## Part 8: Configure Cloud Sync (Optional)

### Setup WireGuard VPN

```bash
# Generate WireGuard keys (on Pi)
cd /etc/wireguard
sudo umask 077
sudo wg genkey | tee privatekey | wg pubkey > publickey

# Display keys for registration
sudo cat privatekey
sudo cat publickey

# Create WireGuard config
sudo nano /etc/wireguard/wise2.conf
```

**WireGuard Config Template:**

```ini
[Interface]
PrivateKey = <your-private-key>
Address = 10.0.0.2/32
DNS = 8.8.8.8

[Peer]
PublicKey = <cloud-server-public-key>
Endpoint = <cloud-server-ip>:51820
AllowedIPs = 10.0.0.0/24, <cloud-network-subnet>
PersistentKeepalive = 25
```

```bash
# Enable WireGuard
sudo systemctl enable wg-quick@wise2
sudo systemctl start wg-quick@wise2

# Verify connection
sudo wg show
```

### Configure Cloud API Keys

```bash
# Edit .env in deployment directory
nano /opt/wise2-edge/.env

# Set:
API_KEY=your-api-key-from-wise2-cloud
CLOUD_URL=https://api.wise2.cloud
OFFLINE_MODE=false

# Restart services
docker-compose -f docker-compose.pi3b.yml restart edge-runtime

# Verify cloud connectivity
curl http://localhost:3000/status | jq '.connectivity'
```

---

## Part 9: Monitoring & Health Checks

### System Monitoring Dashboard

```bash
# Install htop for real-time monitoring
sudo apt install -y htop

# Monitor Pi resources
htop
# Watch CPU, memory, and process list
# Press Q to exit

# Monitor Docker resource usage
docker stats --no-stream

# Check temperature (critical for Pi 3B)
vcgencmd measure_temp
# Should be < 80°C under normal load
# > 85°C indicates thermal issues
```

### Check WISE² Edge Health

```bash
# Health endpoint (quick check)
curl http://localhost:3000/health | jq

# Full status report
curl http://localhost:3000/status | jq

# System metrics
curl http://localhost:3000/health/metrics | jq

# Check logs in real-time
docker-compose -f /opt/wise2-edge/docker-compose.pi3b.yml logs -f

# Search logs for errors
docker-compose -f /opt/wise2-edge/docker-compose.pi3b.yml logs | grep -i error
```

### Create Health Check Script

```bash
cat > /opt/wise2-edge/health-check.sh << 'EOF'
#!/bin/bash

echo "=========================================="
echo "WISE² Edge - Pi 3B Health Check"
echo "=========================================="

# Check Docker containers
echo -e "\n[1] Container Status:"
docker-compose -f docker-compose.pi3b.yml ps

# Check API health
echo -e "\n[2] API Health:"
curl -s http://localhost:3000/health | jq . || echo "API unreachable"

# Check system resources
echo -e "\n[3] System Resources:"
echo "CPU Temperature: $(vcgencmd measure_temp)"
echo "Memory: $(free -h | grep Mem)"
echo "Disk: $(df -h / | tail -1)"

# Check network connectivity
echo -e "\n[4] Network:"
ping -c 1 8.8.8.8 > /dev/null 2>&1 && echo "Internet: OK" || echo "Internet: NO"
ping -c 1 raspberrypi.local > /dev/null 2>&1 && echo "Local: OK" || echo "Local: NO"

# Check logs for errors (last 10)
echo -e "\n[5] Recent Errors:"
docker-compose -f docker-compose.pi3b.yml logs --tail 20 | grep -i error || echo "No errors found"

echo -e "\n=========================================="
EOF

chmod +x /opt/wise2-edge/health-check.sh

# Run health check
/opt/wise2-edge/health-check.sh
```

### Automated Health Monitoring

```bash
# Create cron job for hourly health checks
crontab -e

# Add this line:
0 * * * * /opt/wise2-edge/health-check.sh > /var/log/wise2-edge-appliance/health-check.log 2>&1

# Verify cron job
crontab -l
```

---

## Part 10: Testing & Verification

### API Endpoint Tests

```bash
# 1. Health Check
curl -i http://localhost:3000/health
# Expected: 200 OK

# 2. Status Report
curl -s http://localhost:3000/status | jq

# 3. System Info
curl -s http://localhost:3000/health/metrics | jq

# 4. Voice Capability (if enabled)
curl -X POST http://localhost:3000/voice/speak \
  -H "Content-Type: application/json" \
  -d '{"text": "WISE Edge is running"}'

# 5. GPIO Test (if GPIO available)
# Set GPIO 17 high (requires appropriate wiring)
curl -X POST http://localhost:3000/gpio/17 \
  -H "Content-Type: application/json" \
  -d '{"mode": "out", "value": true}'

# 6. Command Execution
curl -X POST http://localhost:3000/commands \
  -H "Content-Type: application/json" \
  -d '{"command": "system status"}'
```

### Offline Operation Test

```bash
# Disconnect network (or disable network interface)
sudo ifconfig eth0 down

# Wait 10 seconds

# Verify edge still responds
curl http://localhost:3000/health
# Should still return 200 OK

# Check cloud connectivity status
curl http://localhost:3000/status | jq '.connectivity'
# Should show: {"cloud": false, "localNetwork": true, "vpn": false}

# Reconnect network
sudo ifconfig eth0 up

# Verify sync re-established
sleep 5
curl http://localhost:3000/status | jq '.connectivity'
# Should show: {"cloud": true, "localNetwork": true, "vpn": true}
```

### Performance Benchmarking

```bash
# Install Apache Bench (load testing)
sudo apt install -y apache2-utils

# Simple load test (100 requests, 10 concurrent)
ab -n 100 -c 10 http://localhost:3000/health

# Expected results for Pi 3B:
# Requests per second: 10-20
# Time per request: 50-100ms
# Failed requests: 0
```

---

## Part 11: Troubleshooting Guide

### Issue: Services Won't Start

```bash
# Check Docker daemon
sudo systemctl status docker
sudo systemctl start docker

# Check logs
docker-compose -f /opt/wise2-edge/docker-compose.pi3b.yml logs

# Check disk space (Pi 3B often full)
df -h
# If > 90% full: clean Docker images
docker system prune -a

# Rebuild from scratch
cd /opt/wise2-edge
docker-compose -f docker-compose.pi3b.yml down -v
docker-compose -f docker-compose.pi3b.yml up -d --build
```

### Issue: High CPU/Memory Usage

```bash
# Check resource limits
docker stats

# Reduce model size (use tinyllama instead of mistral)
nano /opt/wise2-edge/.env
# Change: VOICE_MODEL=tinyllama

# Reduce connection limits
nano /opt/wise2-edge/.env
# Change: MAX_CONNECTIONS=10

# Restart
docker-compose -f docker-compose.pi3b.yml restart
```

### Issue: Thermal Throttling

```bash
# Check temperature
vcgencmd measure_temp

# If > 80°C:
# 1. Improve air circulation around Pi
# 2. Add heatsink (cheap ~$5)
# 3. Reduce CPU frequency (temporary workaround)
sudo nano /boot/config.txt
# Add: arm_freq=1000  (reduce from default 1200)
# Save and reboot

# Monitor temperature
watch -n 1 vcgencmd measure_temp
```

### Issue: Ollama Model Download Fails

```bash
# Check Ollama logs
docker logs wise2-ollama

# Ollama stores models in /root/.ollama/models
# For Pi 3B, use ONLY quantized 7B models
# Recommended: tinyllama (1.1GB), mistral:7b-q4 (3.8GB)

# Pull model manually
docker exec wise2-ollama ollama pull tinyllama

# Check available models
docker exec wise2-ollama ollama ls
```

### Issue: Out of Memory Errors

```bash
# Check swap status
free -h
swapon --show

# If swap < 2GB, increase it
sudo swapoff /swapfile
sudo fallocate -l 3G /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Verify
free -h

# Reduce Ollama memory
nano /opt/wise2-edge/docker-compose.pi3b.yml
# Change: memory: 256M
docker-compose -f docker-compose.pi3b.yml restart
```

### Issue: Network Connectivity Issues

```bash
# Test local network
ping -c 5 192.168.1.1

# Test internet
ping -c 5 8.8.8.8

# Restart networking
sudo systemctl restart networking

# Check IP configuration
ip addr show
ip route show

# For WiFi issues
sudo nano /etc/wpa_supplicant/wpa_supplicant.conf
# Verify SSID and password correct
sudo systemctl restart wpa_supplicant
```

### Issue: SSH Connection Refused

```bash
# Check SSH is running
sudo systemctl status ssh
sudo systemctl start ssh
sudo systemctl enable ssh

# Check SSH port is listening
sudo ss -tlnp | grep ssh

# Try different approaches to find Pi
ping raspberrypi.local
nmap -p 22 192.168.1.0/24  # Find device with SSH open

# From Mac, reset known_hosts
ssh-keygen -R raspberrypi.local
ssh pi@raspberrypi.local
```

---

## Part 12: Performance Tuning

### Optimize for 1GB RAM

```bash
# Current state analysis
free -h
df -h

# 1. Disable unnecessary services
sudo systemctl disable apt-daily.service
sudo systemctl disable apt-daily-upgrade.service
sudo systemctl disable man-db.timer

# 2. Reduce journal size
sudo journalctl --vacuum=50M

# 3. Clean old logs
sudo find /var/log -type f -name "*.log" -mtime +30 -delete

# 4. Clean Docker
docker system prune -a
docker image prune

# 5. Reduce database cache
nano /opt/wise2-edge/.env
# Add: SQLITE_CACHE_MB=16

# Verify improvements
free -h
```

### Database Optimization

```bash
# SQLite is optimized in edge-appliance
# Manual optimization (optional):

# Backup database first
cp /opt/wise2-edge/data/wise2-edge.db{,.backup}

# Optimize (via Docker)
docker exec wise2-edge-runtime sqlite3 /data/wise2-edge.db "VACUUM;"
docker exec wise2-edge-runtime sqlite3 /data/wise2-edge.db "PRAGMA optimize;"

# Check size reduction
ls -lh /opt/wise2-edge/data/
```

### Network Optimization

```bash
# Reduce sync frequency if not needed
nano /opt/wise2-edge/.env
# Change: SYNC_INTERVAL=120000  (from 60s to 2min)

# Batch operations to reduce network overhead
nano /opt/wise2-edge/.env
# Add: SYNC_BATCH_SIZE=50

# Restart
docker-compose -f docker-compose.pi3b.yml restart
```

---

## Part 13: Backup & Recovery

### Create Backup Script

```bash
cat > /opt/wise2-edge/backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/opt/wise2-edge/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

echo "Starting WISE² Edge backup..."

# Backup database
cp /opt/wise2-edge/data/wise2-edge.db \
   $BACKUP_DIR/wise2-edge.db.$TIMESTAMP

# Backup configuration
cp /opt/wise2-edge/.env \
   $BACKUP_DIR/.env.$TIMESTAMP

# Backup models (optional, takes space)
# tar -czf $BACKUP_DIR/models.$TIMESTAMP.tar.gz \
#     /opt/wise2-edge/models

# Keep only last 7 backups
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup complete: $BACKUP_DIR"
ls -lh $BACKUP_DIR
EOF

chmod +x /opt/wise2-edge/backup.sh

# Test backup
/opt/wise2-edge/backup.sh

# Schedule daily backups (crontab)
crontab -e
# Add: 0 2 * * * /opt/wise2-edge/backup.sh
```

### Full System Backup (SD Card Image)

```bash
# On Pi: shrink filesystem first
sudo resize2fs -M /dev/mmcblk0p2

# On Mac/Linux laptop:
# 1. Insert SD card
# 2. Unmount: diskutil unmountDisk /dev/disk4
# 3. Create image:
sudo dd if=/dev/rdisk4 of=pi-wise2-backup.img bs=4m status=progress
# Takes ~10-15 minutes

# Compress
gzip pi-wise2-backup.img  # Results in ~2-3GB file

# Store in cloud or external drive
```

### Restore from Backup

```bash
# Restore database from backup
cp /opt/wise2-edge/backups/wise2-edge.db.* /opt/wise2-edge/data/wise2-edge.db

# Restart services
docker-compose -f /opt/wise2-edge/docker-compose.pi3b.yml restart

# Restore config
cp /opt/wise2-edge/backups/.env.* /opt/wise2-edge/.env
# Restart again
docker-compose -f /opt/wise2-edge/docker-compose.pi3b.yml restart
```

---

## Part 14: Next Steps & Features

### Immediate Next Steps

- [ ] Test all API endpoints (Part 10)
- [ ] Configure static IP or hostname
- [ ] Set up monitoring cron job
- [ ] Create database backup
- [ ] Document your API_KEY and cloud credentials

### Recommended Additions

1. **Voice Control**
   ```bash
   sudo apt install -y espeak python3-pyaudio
   # Configure microphone/speaker
   # Test: curl -X POST http://localhost:3000/voice/speak -d '{"text":"test"}'
   ```

2. **Camera Integration**
   ```bash
   sudo apt install -y python3-picamera
   # Connect Pi camera module
   # Test: curl http://localhost:3000/camera/capture -o photo.jpg
   ```

3. **GPIO Automation Examples**
   ```bash
   # Connect LED to GPIO 17
   curl -X POST http://localhost:3000/gpio/17 \
     -d '{"mode":"out","value":true}'
   
   # Create automation trigger for scheduled tasks
   curl -X POST http://localhost:3000/automations/triggers \
     -H "Content-Type: application/json" \
     -d '{"type":"cron","config":{"expression":"0 9 * * *"},...}'
   ```

4. **Cloud Synchronization**
   - Generate API key from WISE² Cloud dashboard
   - Configure WireGuard VPN (Part 8)
   - Enable automatic sync

### Production Hardening Checklist

- [ ] Change default Pi password
- [ ] Configure firewall (ufw)
- [ ] Set up SSH key authentication
- [ ] Enable automatic security updates
- [ ] Configure log rotation
- [ ] Set up monitoring alerts
- [ ] Create disaster recovery plan
- [ ] Document network topology
- [ ] Document API usage patterns

---

## Part 15: Performance Expectations & Specifications

### Hardware Specifications (Pi 3B)

| Component | Specification |
|-----------|---------------|
| CPU | ARM Cortex-A53 @ 1.2 GHz (4 cores) |
| RAM | 1GB (shared with GPU) |
| Storage | microSD card (16-32GB) |
| Network | 10/100 Ethernet, 802.11b/g/n WiFi |
| GPIO | 40 pins, 3.3V logic |
| Power | 2.5A @ 5V (1.3W idle, 3.5W active) |

### Performance Benchmarks (Pi 3B with WISE² Edge)

| Operation | Time | Notes |
|-----------|------|-------|
| Boot time | 45-60s | From power on to ready |
| API response | 50-150ms | Health check endpoint |
| AI inference (tinyllama) | 2-5s | Per request (4K input tokens) |
| Command execution | 200-500ms | GPIO control, voice output |
| Sync cycle | 1-2s | With cloud connectivity |
| Database query | 5-20ms | Typical local queries |

### Resource Usage Patterns

| Resource | Idle | Active | Peak |
|----------|------|--------|------|
| CPU usage | 5-15% | 30-60% | 80-90% |
| Memory | 200MB | 400-500MB | 600-700MB |
| Disk I/O | <1MB/s | 5-10MB/s | 20MB/s |
| Network | 0.1MB/s | 0.5-1MB/s | 5MB/s |

### Storage Breakdown

| Component | Size |
|-----------|------|
| OS (Raspberry Pi OS Lite) | 1.8GB |
| Docker images | 1.2GB |
| Node dependencies | 400MB |
| Ollama models (tinyllama) | 1.1GB |
| Database + logs | 50-200MB |
| **Total** | ~4.5-5GB |

Recommended: 16GB+ microSD card for headroom

---

## Part 16: Reference & Troubleshooting Checklist

### Pre-Deployment Checklist

- [ ] Raspberry Pi 3B purchased and verified
- [ ] microSD card (16GB+) ready
- [ ] Power supply rated 2.5A+ at 5V
- [ ] Ethernet or WiFi configured
- [ ] SSH access verified from laptop
- [ ] System updated (`sudo apt update && sudo apt upgrade`)
- [ ] Swap configured (2GB minimum)
- [ ] Docker installed and tested
- [ ] Node.js 20+ installed

### Installation Checklist

- [ ] WISE² repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] Docker image built successfully
- [ ] `.env` configured with API keys
- [ ] `docker-compose.pi3b.yml` in place
- [ ] Deployment directory `/opt/wise2-edge` created
- [ ] Systemd service installed and enabled
- [ ] All containers starting without errors
- [ ] Health endpoint responding (200 OK)

### Post-Deployment Checklist

- [ ] API health check passing
- [ ] Static IP configured (if desired)
- [ ] Hostname accessible via mDNS
- [ ] Backup script created and tested
- [ ] Monitoring cron job scheduled
- [ ] Log rotation configured
- [ ] Security updates enabled
- [ ] Cloud API keys configured (if using sync)
- [ ] Offline mode tested
- [ ] Documentation saved locally

### Quick Troubleshooting Map

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| Docker won't start | Docker service stopped | `sudo systemctl restart docker` |
| Services crash immediately | Out of memory | Increase swap, reduce model size |
| API unreachable | Port 3000 blocked | Check `docker ps`, verify port forwarding |
| Ollama slow/unresponsive | Disk thrashing (swap) | Check `free -h`, add more swap or RAM |
| High CPU temperature | Thermal issue | Add heatsink, improve ventilation |
| Can't connect to network | DNS/network config | Check `ip addr show`, restart networking |
| Database errors | Corrupted database | Restore from backup or rebuild |
| Out of disk space | Full microSD | Check `df -h`, run `docker system prune` |

---

## Appendix A: Useful Commands Reference

```bash
# System Info
uname -a                           # OS version
free -h                             # Memory status
df -h                               # Disk status
vcgencmd measure_temp               # CPU temperature
systemctl status docker             # Docker service status

# Docker Commands
docker ps                           # List running containers
docker logs <container>             # View container logs
docker-compose -f docker-compose.pi3b.yml logs -f
docker stats                        # Real-time resource usage
docker system prune -a              # Clean unused images

# Network Commands
hostname -I                         # Show IP address
ping 8.8.8.8                        # Test internet
curl http://localhost:3000/health   # Test API
netstat -tlnp                       # Show open ports
iwconfig                            # WiFi configuration

# File Management
ls -lah                             # Detailed listing
du -sh <path>                       # Directory size
tar -czf backup.tar.gz <dir>        # Compress directory
scp file.txt pi@raspberrypi.local:~ # Copy to Pi

# Systemd Services
sudo systemctl start wise2-edge      # Start service
sudo systemctl stop wise2-edge       # Stop service
sudo systemctl restart wise2-edge    # Restart service
sudo systemctl status wise2-edge     # Check status
sudo systemctl enable wise2-edge     # Enable autostart
journalctl -u wise2-edge -f         # Follow logs
```

---

## Appendix B: Pi 3B vs Pi 4 Comparison

| Feature | Pi 3B | Pi 4 |
|---------|-------|------|
| CPU | ARM Cortex-A53 1.2GHz | ARM Cortex-A72 1.5GHz |
| RAM | 1GB | 2-8GB |
| Storage Speed | microSD only | microSD or SSD |
| Network | Ethernet + WiFi | Gigabit Ethernet + WiFi |
| WISE² Edge | ✓ (optimized guide) | ✓ (standard setup) |
| Recommended for | Edge sensors, basic automation | Full production deployment |

For WISE² Edge 3B: Focus on lightweight models and careful resource management  
For WISE² Edge 4/5: Standard setup with room for advanced features

---

## Appendix C: Further Resources

- **WISE² Documentation**: https://docs.wise2.cloud
- **Raspberry Pi OS**: https://www.raspberrypi.com/software/operating-systems/
- **Docker Compose**: https://docs.docker.com/compose/
- **Node.js**: https://nodejs.org/
- **Ollama Models**: https://ollama.ai/
- **GPIO Control**: https://pinout.xyz/

---

## Support & Next Steps

**Installation Complete!** Your Pi 3B is now running WISE² Edge.

### Need Help?

1. **Check Logs**: `docker-compose logs` (see Part 11)
2. **Health Check**: `/opt/wise2-edge/health-check.sh`
3. **Review Troubleshooting**: Part 11 of this guide
4. **Test Endpoints**: Use curl commands in Part 10

### Report Issues

- Save system logs: `docker logs wise2-edge-runtime > logs.txt`
- Check disk/memory: `df -h && free -h`
- Include Pi model: `uname -a`
- Include OS version: `cat /etc/os-release`

### What's Next?

1. Configure cloud sync (Part 8)
2. Add voice control features
3. Create GPIO automation rules
4. Set up monitoring dashboards
5. Deploy additional WISE² services

---

**WISE² Edge Installation Complete**  
**Version**: 1.0  
**Last Updated**: 2026-07-21  
**Target**: Raspberry Pi 3B with 1GB RAM  
**Status**: Production Ready

Happy building! 🍓✨
