# WISE² Edge on Raspberry Pi 3B - Setup Checklist

This checklist helps you track installation progress and verify each step works correctly.

---

## Pre-Installation Phase

### Hardware Preparation
- [ ] Raspberry Pi 3B obtained and verified
- [ ] microSD card (16GB+ recommended) ready
- [ ] Card reader or adapter available
- [ ] USB power supply rated 2.5A+ at 5V available
- [ ] Ethernet cable available (or WiFi configured)
- [ ] Monitor and HDMI cable for initial setup (or headless over SSH)

### Software Preparation
- [ ] Balena Etcher installed on laptop
- [ ] Raspberry Pi OS Lite image downloaded (~350MB)
  - From: https://www.raspberrypi.com/software/operating-systems/
  - Use 32-bit version (better for Pi 3B than 64-bit)
- [ ] SSH client available (macOS/Linux: built-in, Windows: PuTTY or WSL)
- [ ] Text editor ready (nano, vim, VS Code, etc)

### Network Configuration
- [ ] WiFi SSID and password available (if using wireless)
- [ ] Router admin access available (if setting static IP)
- [ ] DHCP enabled on router
- [ ] Port 22 (SSH) not blocked by firewall

---

## Phase 1: OS Installation & Initial Setup (10-15 minutes)

### Step 1.1: Flash OS Image
- [ ] Raspberry Pi OS Lite image extracted
- [ ] Balena Etcher launched
- [ ] Image file selected: `raspios-bullseye-arm64-lite.img` (32-bit)
- [ ] microSD card selected in Etcher (VERIFY DEVICE!)
- [ ] Flash started (~5 minutes)
- [ ] Flash completed successfully
- [ ] SD card still mounted

### Step 1.2: Enable SSH (Headless Setup)
- [ ] Navigate to /Volumes/boot (macOS) or /mnt/boot (Linux)
- [ ] Created empty file: `ssh` (no extension)
  ```bash
  touch /Volumes/boot/ssh
  ```
- [ ] File is now visible in boot partition

### Step 1.3: Configure WiFi (if wireless)
- [ ] Navigated to /Volumes/boot
- [ ] Created file: `wpa_supplicant.conf`
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
- [ ] SSID and password are correct in file
- [ ] File saved and visible in boot partition

### Step 1.4: Boot Pi
- [ ] SD card ejected safely from laptop
- [ ] SD card inserted into Pi 3B
- [ ] USB power connected to Pi
- [ ] Red power LED lights up
- [ ] Green activity LED flashing
- [ ] Waited 2-3 minutes for first boot and filesystem expansion

### Step 1.5: SSH Connection
- [ ] Found Pi's IP address:
  - [ ] From router admin interface, OR
  - [ ] Via nmap: `nmap -sn 192.168.1.0/24 | grep -i raspberry`, OR
  - [ ] Via mDNS: `ping raspberrypi.local`
- [ ] SSH connection established:
  ```bash
  ssh pi@raspberrypi.local
  # or: ssh pi@<ip-address>
  ```
- [ ] Default password accepted: `raspberry`
- [ ] Prompt shows: `pi@raspberrypi:~ $`

### Step 1.6: Password Change
- [ ] Ran password change command: `passwd`
- [ ] Old password entered: `raspberry`
- [ ] New strong password entered twice
- [ ] Password change confirmed

---

## Phase 2: System Optimization (15-20 minutes)

### Step 2.1: System Update
- [ ] Ran system update:
  ```bash
  sudo apt update
  sudo apt upgrade -y
  ```
- [ ] Package installation completed without errors
- [ ] No broken dependencies reported

### Step 2.2: Install Essential Packages
- [ ] Ran package installation:
  ```bash
  sudo apt install -y build-essential git curl wget nano htop \
    git-core libffi-dev libssl-dev python3 python3-dev python3-pip \
    python3-rpi.gpio alsa-utils wireguard wireguard-tools dnsutils
  ```
- [ ] All packages installed successfully
- [ ] No dependency conflicts

### Step 2.3: Swap Configuration
- [ ] Checked current memory status:
  ```bash
  free -h
  ```
- [ ] Showed: ~1GB RAM (from Pi 3B)
- [ ] Created 2GB swap:
  ```bash
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  ```
- [ ] Swap activation verified:
  ```bash
  free -h
  # Shows ~3GB total (1GB + 2GB swap)
  ```
- [ ] Made permanent in /etc/fstab:
  ```bash
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  ```
- [ ] Entry added to fstab file

### Step 2.4: System Optimization
- [ ] Disabled unnecessary services:
  ```bash
  sudo systemctl disable avahi-daemon
  sudo systemctl disable bluetooth
  sudo systemctl stop bluetooth
  ```
- [ ] Services disabled successfully
- [ ] Edited GPU memory config:
  ```bash
  sudo nano /boot/config.txt
  # Added or verified: gpu_mem=64
  ```
- [ ] Saved config.txt

---

## Phase 3: Docker & Runtime Installation (20-30 minutes)

### Step 3.1: Docker Installation
- [ ] Downloaded and ran Docker install script:
  ```bash
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  ```
- [ ] Docker installed successfully
- [ ] Added user to docker group:
  ```bash
  sudo usermod -aG docker pi
  ```
- [ ] Started Docker service:
  ```bash
  sudo systemctl enable docker
  sudo systemctl start docker
  ```
- [ ] Docker version verified:
  ```bash
  docker --version
  # Shows: Docker version 20.10+
  ```
- [ ] Test container ran successfully:
  ```bash
  docker run hello-world
  ```

### Step 3.2: Docker Compose Installation
- [ ] Installed Docker Compose:
  ```bash
  sudo apt install -y docker-compose
  ```
- [ ] Installation successful
- [ ] Version verified:
  ```bash
  docker-compose --version
  # Shows: docker-compose version 1.29+
  ```

### Step 3.3: Node.js Installation
- [ ] Added NodeSource repository:
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
  ```
- [ ] Repository added successfully
- [ ] Installed Node.js:
  ```bash
  sudo apt install -y nodejs
  ```
- [ ] Node.js version verified:
  ```bash
  node --version    # v20.x.x
  npm --version     # 10.x.x
  ```
- [ ] Optimized npm configuration:
  ```bash
  npm config set fetch-timeout 120000
  npm config set fetch-retries 5
  npm config set fetch-retry-mintimeout 20000
  npm config set fetch-retry-maxtimeout 120000
  ```

---

## Phase 4: WISE² Edge Setup (15-20 minutes)

### Step 4.1: Clone Repository
- [ ] Navigated to home directory:
  ```bash
  cd ~
  ```
- [ ] Cloned WISE² repository:
  ```bash
  git clone https://github.com/dwise03-bit/wise2-core.git wise2-edge
  cd wise2-edge/services/edge-appliance
  ```
- [ ] Verified correct directory:
  ```bash
  pwd  # Should end with: wise2-core/services/edge-appliance
  ls -la  # Shows: docker-compose.yml, package.json, README.md
  ```

### Step 4.2: Install Node Dependencies
- [ ] Installed npm dependencies:
  ```bash
  npm install --prefer-offline --no-audit
  ```
- [ ] Installation completed (takes 5-10 minutes on Pi 3B)
- [ ] Verified installation:
  ```bash
  npm list  # Shows dependencies installed
  ```

### Step 4.3: Create Configuration
- [ ] Copied environment template:
  ```bash
  cp .env.example .env
  nano .env
  ```
- [ ] Edited .env with Pi 3B-specific values:
  - [ ] NODE_ID=edge-pi3b-1
  - [ ] PORT=3000
  - [ ] VOICE_MODEL=tinyllama
  - [ ] OLLAMA_URL=http://localhost:11434
  - [ ] OFFLINE_MODE=false
  - [ ] MAX_CONNECTIONS=20
  - [ ] SYNC_INTERVAL=60000
- [ ] Saved .env file
- [ ] Verified file created:
  ```bash
  cat .env | head -10
  ```

### Step 4.4: Build TypeScript
- [ ] Built TypeScript to JavaScript:
  ```bash
  npm run build
  ```
- [ ] Build completed without errors
- [ ] Verified build output:
  ```bash
  ls -la dist/
  # Shows: index.js, agent.js, api.js, etc.
  ```

### Step 4.5: Build Docker Image
- [ ] Built Docker image for Pi 3B:
  ```bash
  docker build -f docker/Dockerfile -t wise2/edge-pi3b:latest .
  ```
- [ ] Build completed successfully (takes 10-15 minutes first time)
- [ ] Verified image:
  ```bash
  docker images | grep wise2
  # Shows: wise2/edge-pi3b:latest
  ```

---

## Phase 5: Deployment Setup (10-15 minutes)

### Step 5.1: Create Deployment Directory
- [ ] Created deployment directory:
  ```bash
  sudo mkdir -p /opt/wise2-edge
  sudo chown pi:pi /opt/wise2-edge
  ```
- [ ] Directory created with correct ownership
- [ ] Created subdirectories:
  ```bash
  mkdir -p /opt/wise2-edge/{data,models,logs}
  ```
- [ ] Created log directory:
  ```bash
  sudo mkdir -p /var/log/wise2-edge-appliance
  sudo chown pi:pi /var/log/wise2-edge-appliance
  ```

### Step 5.2: Copy Docker Compose Configuration
- [ ] Located docker-compose.pi3b.yml:
  - [ ] File exists in /Users/danielwise/Projects/wise2-core/
- [ ] Copied Pi 3B-specific compose file:
  ```bash
  # On your laptop:
  # Ensure docker-compose.pi3b.yml has been copied to /opt/wise2-edge/
  ```
- [ ] Verified file exists on Pi:
  ```bash
  ls -la /opt/wise2-edge/docker-compose.pi3b.yml
  ```
- [ ] Reviewed resource limits in file (should match Pi 3B constraints)

### Step 5.3: Copy Environment Configuration
- [ ] Copied .env to deployment directory:
  ```bash
  cp ~/wise2-edge/services/edge-appliance/.env /opt/wise2-edge/.env
  ```
- [ ] Verified .env exists:
  ```bash
  cat /opt/wise2-edge/.env | head -10
  ```

---

## Phase 6: Start Services (5-10 minutes)

### Step 6.1: Start Docker Containers
- [ ] Navigated to deployment directory:
  ```bash
  cd /opt/wise2-edge
  ```
- [ ] Started all services:
  ```bash
  docker-compose -f docker-compose.pi3b.yml up -d
  ```
- [ ] Services started (may take 30-45 seconds)

### Step 6.2: Monitor Startup
- [ ] Monitored container startup in another terminal:
  ```bash
  watch -n 5 'docker-compose -f docker-compose.pi3b.yml ps'
  ```
- [ ] Waited for all containers to show "healthy" or "running"
- [ ] Expected containers:
  - [ ] wise2-ollama: healthy
  - [ ] wise2-db-init: exited (completed successfully)
  - [ ] wise2-edge-runtime: healthy
- [ ] Verified startup completed (typically 30-45 seconds)

### Step 6.3: Verify Container Health
- [ ] Checked container status:
  ```bash
  docker-compose -f docker-compose.pi3b.yml ps
  ```
- [ ] All containers showing correct status
- [ ] Checked Docker logs for errors:
  ```bash
  docker-compose -f docker-compose.pi3b.yml logs
  ```
- [ ] No critical errors in logs

---

## Phase 7: API Verification (5 minutes)

### Step 7.1: Health Endpoint Test
- [ ] Tested health endpoint:
  ```bash
  curl http://localhost:3000/health
  ```
- [ ] Response received:
  - [ ] HTTP 200 status
  - [ ] JSON response with status: "ready"
  - [ ] Shows nodeId: "edge-pi3b-1"

### Step 7.2: Status Report Test
- [ ] Tested status endpoint:
  ```bash
  curl http://localhost:3000/status | jq .
  ```
- [ ] Response includes:
  - [ ] connectivity object
  - [ ] components status
  - [ ] uptime information

### Step 7.3: Metrics Test
- [ ] Tested metrics endpoint:
  ```bash
  curl http://localhost:3000/health/metrics | jq .
  ```
- [ ] Response includes:
  - [ ] CPU usage
  - [ ] Memory usage
  - [ ] Disk usage
  - [ ] Temperature (if available)

---

## Phase 8: System Integration (10-15 minutes)

### Step 8.1: Create Systemd Service
- [ ] Created systemd service file:
  ```bash
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
  
  MemoryLimit=512M
  CPUQuota=90%
  
  [Install]
  WantedBy=multi-user.target
  EOF
  ```
- [ ] Service file created successfully
- [ ] Reloaded systemd daemon:
  ```bash
  sudo systemctl daemon-reload
  ```
- [ ] Enabled service for autostart:
  ```bash
  sudo systemctl enable wise2-edge
  ```
- [ ] Service enabled successfully

### Step 8.2: Start Service
- [ ] Started wise2-edge service:
  ```bash
  sudo systemctl start wise2-edge
  ```
- [ ] Service started successfully
- [ ] Checked service status:
  ```bash
  sudo systemctl status wise2-edge
  ```
- [ ] Status shows "active (running)"

### Step 8.3: Test Autostart
- [ ] Verified API is responding after service start:
  ```bash
  curl http://localhost:3000/health
  ```
- [ ] Received successful health response
- [ ] Systemd logs show no errors:
  ```bash
  journalctl -u wise2-edge -n 20
  ```

---

## Phase 9: Network & Remote Access (10 minutes)

### Step 9.1: Configure Static IP (Optional)
- [ ] Edited DHCP configuration:
  ```bash
  sudo nano /etc/dhcpcd.conf
  ```
- [ ] Added static IP entry (example for eth0):
  ```bash
  interface eth0
  static ip_address=192.168.1.100/24
  static routers=192.168.1.1
  static domain_name_servers=8.8.8.8 8.8.4.4
  ```
- [ ] Saved configuration
- [ ] Rebooted Pi:
  ```bash
  sudo reboot
  ```
- [ ] Waited 2 minutes for reboot
- [ ] Verified static IP assigned:
  ```bash
  hostname -I
  # Should show: 192.168.1.100
  ```

### Step 9.2: Verify mDNS Hostname
- [ ] Tested mDNS hostname access:
  ```bash
  ping raspberrypi.local
  ```
- [ ] Ping responded with Pi's IP
- [ ] Tested API via hostname:
  ```bash
  curl http://raspberrypi.local:3000/health
  ```
- [ ] Received successful response

### Step 9.3: SSH Access Verification
- [ ] Verified SSH access still works:
  ```bash
  ssh pi@raspberrypi.local
  # Should connect without password issues
  ```
- [ ] Connected successfully
- [ ] Exited: `exit`

---

## Phase 10: Monitoring & Maintenance (15 minutes)

### Step 10.1: Create Health Check Script
- [ ] Located monitoring script:
  ```bash
  ls -la /opt/wise2-edge/health-check.sh
  # Or download: https://raw.githubusercontent.com/dwise03-bit/wise2-core/main/pi3b-monitoring.sh
  ```
- [ ] Script is executable:
  ```bash
  chmod +x /opt/wise2-edge/health-check.sh
  ```
- [ ] Test health check:
  ```bash
  /opt/wise2-edge/health-check.sh
  ```
- [ ] Script executes without errors
- [ ] Output shows:
  - [ ] Container status
  - [ ] API health
  - [ ] System resources
  - [ ] Network connectivity

### Step 10.2: Create Monitoring Cron Job
- [ ] Opened crontab editor:
  ```bash
  crontab -e
  ```
- [ ] Added hourly health check:
  ```bash
  0 * * * * /opt/wise2-edge/health-check.sh > /var/log/wise2-edge-appliance/health-check.log 2>&1
  ```
- [ ] Saved crontab
- [ ] Verified cron job:
  ```bash
  crontab -l
  # Should show the new entry
  ```

### Step 10.3: Create Backup Script
- [ ] Opened backup script:
  ```bash
  nano /opt/wise2-edge/backup.sh
  ```
- [ ] Added backup automation:
  ```bash
  #!/bin/bash
  BACKUP_DIR="/opt/wise2-edge/backups"
  TIMESTAMP=$(date +%Y%m%d_%H%M%S)
  mkdir -p $BACKUP_DIR
  cp /opt/wise2-edge/data/wise2-edge.db $BACKUP_DIR/wise2-edge.db.$TIMESTAMP
  cp /opt/wise2-edge/.env $BACKUP_DIR/.env.$TIMESTAMP
  find $BACKUP_DIR -type f -mtime +7 -delete
  ```
- [ ] Made executable:
  ```bash
  chmod +x /opt/wise2-edge/backup.sh
  ```
- [ ] Tested backup:
  ```bash
  /opt/wise2-edge/backup.sh
  ```
- [ ] Backup created successfully:
  ```bash
  ls -la /opt/wise2-edge/backups/
  ```

### Step 10.4: Schedule Daily Backups
- [ ] Opened crontab editor:
  ```bash
  crontab -e
  ```
- [ ] Added daily backup at 2 AM:
  ```bash
  0 2 * * * /opt/wise2-edge/backup.sh
  ```
- [ ] Saved crontab
- [ ] Verified:
  ```bash
  crontab -l
  ```

---

## Phase 11: Performance Verification (10 minutes)

### Step 11.1: System Resource Check
- [ ] Checked memory usage:
  ```bash
  free -h
  # Verify: 1GB RAM + 2GB swap, reasonable usage
  ```
- [ ] Checked disk space:
  ```bash
  df -h /
  # Verify: > 5GB free on 16GB+ card
  ```
- [ ] Checked temperature:
  ```bash
  vcgencmd measure_temp
  # Should be: < 75°C at idle, < 80°C under load
  ```
- [ ] Checked CPU load:
  ```bash
  top -n1 | head -10
  # Verify: reasonable load average
  ```

### Step 11.2: Docker Resource Analysis
- [ ] Checked Docker resource usage:
  ```bash
  docker stats --no-stream
  ```
- [ ] Container memory usage:
  - [ ] wise2-ollama: ~300-400MB
  - [ ] wise2-edge-runtime: ~200-300MB
  - [ ] Total: < 800MB (leaves ~200MB buffer for system)

### Step 11.3: API Performance Test
- [ ] Tested API response time:
  ```bash
  time curl http://localhost:3000/health
  # Should be: < 200ms
  ```
- [ ] Tested multiple requests:
  ```bash
  for i in {1..5}; do curl -s http://localhost:3000/health | jq .status; done
  # All should return: "ready"
  ```

---

## Phase 12: Production Hardening (15-20 minutes)

### Step 12.1: Security Hardening
- [ ] Updated system packages:
  ```bash
  sudo apt update && sudo apt upgrade -y
  ```
- [ ] Enabled firewall:
  ```bash
  sudo apt install -y ufw
  sudo ufw enable
  sudo ufw allow 22/tcp   # SSH
  sudo ufw allow 3000/tcp # WISE² API
  sudo ufw allow 3002/tcp # Webhooks
  sudo ufw status
  ```
- [ ] Firewall configured and active
- [ ] Configured automatic security updates:
  ```bash
  sudo apt install -y unattended-upgrades
  sudo dpkg-reconfigure -plow unattended-upgrades
  ```

### Step 12.2: Configure Cloud Sync (Optional)
- [ ] Obtained API key from WISE² Cloud dashboard
- [ ] Updated .env with API key:
  ```bash
  nano /opt/wise2-edge/.env
  # Set: API_KEY=<your-api-key>
  # Set: CLOUD_URL=https://api.wise2.cloud
  ```
- [ ] Restarted services:
  ```bash
  docker-compose -f /opt/wise2-edge/docker-compose.pi3b.yml restart
  ```
- [ ] Verified cloud connectivity:
  ```bash
  curl http://localhost:3000/status | jq '.connectivity'
  ```

### Step 12.3: Configure WireGuard VPN (Optional)
- [ ] Generated WireGuard keys:
  ```bash
  cd /etc/wireguard
  sudo umask 077
  sudo wg genkey | tee privatekey | wg pubkey > publickey
  ```
- [ ] Created WireGuard config:
  ```bash
  sudo nano /etc/wireguard/wise2.conf
  ```
- [ ] Added config template and registered with cloud
- [ ] Enabled WireGuard:
  ```bash
  sudo systemctl enable wg-quick@wise2
  sudo systemctl start wg-quick@wise2
  ```

### Step 12.4: Enable Log Rotation
- [ ] Created logrotate config:
  ```bash
  sudo tee /etc/logrotate.d/wise2-edge > /dev/null << 'EOF'
  /var/log/wise2-edge-appliance/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 pi pi
    sharedscripts
  }
  EOF
  ```
- [ ] Log rotation configured
- [ ] Tested rotation:
  ```bash
  sudo logrotate -vf /etc/logrotate.d/wise2-edge
  ```

---

## Phase 13: Documentation & Testing (10 minutes)

### Step 13.1: Document Installation
- [ ] Saved setup notes:
  ```bash
  cat > /opt/wise2-edge/INSTALLATION_NOTES.md << 'EOF'
  # WISE² Edge Installation Notes
  
  - Installation Date: $(date)
  - Raspberry Pi Model: Pi 3B
  - OS: Raspberry Pi OS Lite (32-bit)
  - Node ID: edge-pi3b-1
  - Static IP: 192.168.1.100 (or DHCP)
  - Hostname: raspberrypi.local
  
  ## Key Commands
  - Health check: curl http://localhost:3000/health
  - Full monitoring: /opt/wise2-edge/health-check.sh
  - View logs: docker-compose -f /opt/wise2-edge/docker-compose.pi3b.yml logs
  - Restart: systemctl restart wise2-edge
  
  ## Emergency Procedures
  - Out of memory: docker system prune -a
  - Disk full: df -h && du -sh /opt/wise2-edge/*
  - High temperature: Check heatsink, improve ventilation
  EOF
  ```

### Step 13.2: Final Verification Tests
- [ ] API health check:
  ```bash
  curl -s http://localhost:3000/health | jq . && echo "✓ API healthy"
  ```
- [ ] Container status:
  ```bash
  docker-compose -f /opt/wise2-edge/docker-compose.pi3b.yml ps | grep "healthy" && echo "✓ All healthy"
  ```
- [ ] Autostart verification:
  ```bash
  sudo systemctl status wise2-edge | grep "active (running)" && echo "✓ Autostart working"
  ```
- [ ] All tests passed

### Step 13.3: Test Offline Operation
- [ ] Disconnect network (or disable interface):
  ```bash
  sudo ifconfig eth0 down
  sleep 10
  ```
- [ ] Verify edge still responds:
  ```bash
  curl http://localhost:3000/health
  # Should still return 200 OK
  ```
- [ ] Check connectivity status:
  ```bash
  curl -s http://localhost:3000/status | jq '.connectivity'
  # Should show: {"cloud": false, "localNetwork": false, "vpn": false}
  ```
- [ ] Reconnect network:
  ```bash
  sudo ifconfig eth0 up
  sleep 10
  ```

---

## Final Checklist Summary

### Installation Complete When:
- [x] All phases 1-13 checked off
- [x] API health endpoint returning 200 OK
- [x] All containers showing "healthy" status
- [x] System resources within acceptable limits (memory < 80%, CPU < 90%, temp < 80°C)
- [x] Autostart service working after system reboot
- [x] Offline mode tested and verified
- [x] Monitoring and backup scheduled
- [x] Security hardening applied
- [x] Installation documentation saved

### Post-Installation Next Steps
- [ ] Configure cloud API keys for bidirectional sync
- [ ] Set up GPIO automation rules (if applicable)
- [ ] Configure voice control features (if applicable)
- [ ] Set up monitoring dashboards
- [ ] Document network topology and IP allocation
- [ ] Plan disaster recovery procedures
- [ ] Schedule regular system audits
- [ ] Monitor for security updates

### Support Resources
- **Full Documentation**: PI3B_EDGE_INSTALLATION_GUIDE.md
- **Monitoring Script**: /opt/wise2-edge/health-check.sh
- **WISE² Documentation**: https://docs.wise2.cloud
- **Troubleshooting**: Part 11 of installation guide

---

## Emergency Recovery Commands

```bash
# If services won't start:
docker-compose -f /opt/wise2-edge/docker-compose.pi3b.yml logs edge-runtime

# If out of memory:
docker system prune -a

# If disk full:
du -sh /opt/wise2-edge/* | sort -h

# If API unresponsive:
docker-compose -f /opt/wise2-edge/docker-compose.pi3b.yml restart edge-runtime

# If temperature critical:
vcgencmd measure_temp  # Check temp
# Add heatsink to CPU, improve ventilation

# If network down:
ip link show
ip route show
sudo systemctl restart networking

# Emergency reboot:
sudo reboot
```

---

**Congratulations!** Your Raspberry Pi 3B is now running WISE² Edge in production. 🍓✨

Status: **Installation Complete**  
Date: $(date)  
System: Raspberry Pi 3B - Ready for Deployment
