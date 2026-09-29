# WISE² Core - Raspberry Pi Setup Guide

**Complete deployment guide for running WISE² on Raspberry Pi 3B+ and newer**

**Version**: 1.0  
**Last Updated**: 2026-07-23  
**Status**: Production-Ready

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step-by-Step Setup](#step-by-step-setup)
3. [Environment Setup](#environment-setup)
4. [Deployment](#deployment)
5. [Post-Deployment Configuration](#post-deployment-configuration)
6. [Operations](#operations)
7. [Performance Optimization](#performance-optimization)
8. [Troubleshooting](#troubleshooting)
9. [Maintenance Schedule](#maintenance-schedule)
10. [Support & Contact](#support--contact)

---

## Prerequisites

### Hardware Requirements

- **Raspberry Pi**: 3B+, 4, or newer (4GB RAM minimum, 8GB+ recommended)
- **Storage**: 16GB+ microSD card (Class 10 U3 or faster)
- **Power Supply**: 2.5A+ USB-C (Pi 4) or micro-USB (Pi 3B+)
- **Network**: Ethernet (preferred) or WiFi 5GHz
- **Cooling**: Optional heatsink (recommended for sustained load)

### Supported Operating Systems

- Raspberry Pi OS Lite (64-bit) — **Recommended**
- Raspberry Pi OS (32-bit) — Slower, not recommended
- Ubuntu Server 22.04 LTS (arm64) — Advanced users

### Knowledge Requirements

- Basic Linux command line
- SSH access to remote machines
- Understanding of environment variables
- Docker basics (optional, container format used)

---

## Step-by-Step Setup

### 1. Flash Raspberry Pi OS

**On your laptop/desktop:**

```bash
# Download Raspberry Pi Imager
# macOS:
brew install raspberry-pi-imager

# Linux:
sudo apt-get install rpi-imager

# Windows:
# Visit https://www.raspberrypi.com/software/
```

**Use the Imager tool:**

1. Open Raspberry Pi Imager
2. Select: **Raspberry Pi OS (other) → Raspberry Pi OS Lite (64-bit)**
3. Select your microSD card
4. Click **Next**, then **Edit Settings**
5. Configure:
   - Hostname: `wise2-pi` (or your preferred name)
   - Username: `pi`
   - Password: [Set a strong password]
   - WiFi SSID + Password (if using WiFi)
   - Locale: Set your timezone
   - Enable SSH: ✓ Check this box
6. Click **Save**, then **Yes** to write image (5-10 minutes)

**Expected output:**
```
Writing... [████████████████████] 100%
Verifying... [████████████████████] 100%
```

### 2. Initial SSH Connection

**Insert microSD into Pi, power on, wait 1-2 minutes for first boot.**

```bash
# From your laptop
ssh pi@wise2-pi.local

# If .local doesn't resolve, find IP via router admin panel:
ssh pi@<pi-ip-address>

# Expected prompt:
# The authenticity of host 'wise2-pi.local' can't be established...
# Type 'yes' and press Enter
```

**First-time checks:**

```bash
# Verify OS and architecture
uname -m
# Expected output: aarch64

lsb_release -a
# Expected output: Raspberry Pi OS (64-bit)

# Check available disk space
df -h /
# Expected: 14G available (on 16GB card after OS)

# Check RAM
free -h
# Expected: ~3.9Gi (Pi 4 with 4GB) or ~7.8Gi (Pi 4 with 8GB)
```

### 3. Run Initial Setup Script

**Clone the repository:**

```bash
cd ~
git clone https://github.com/yourusername/wise2-core.git
cd wise2-core
```

**Run initialization script with interactive prompts:**

```bash
# Make script executable
chmod +x scripts/init-pi.sh

# Run with prompts
./scripts/init-pi.sh

# The script will ask:
# 1. Node.js version (recommend LTS 20.x)
# 2. PostgreSQL username (recommend 'wise2')
# 3. PostgreSQL password (generate secure password)
# 4. Redis password (generate secure password)
# 5. Deployment type: production or staging
# 6. SSL certificate (auto or bring-your-own)
# 7. Domain name (e.g., pi.wise2.local)
```

**Expected output:**

```
========================================
WISE² Core - Raspberry Pi Setup
========================================

[1/8] Updating system packages...
      ✓ Completed in 45 seconds

[2/8] Installing Node.js v20.x...
      ✓ Completed in 2 minutes 15 seconds

[3/8] Installing PostgreSQL...
      ✓ Completed in 3 minutes 30 seconds

[4/8] Installing Redis...
      ✓ Completed in 1 minute

[5/8] Installing Docker...
      ✓ Completed in 2 minutes

[6/8] Configuring SSL certificates...
      ✓ Self-signed cert created: /etc/ssl/certs/wise2-pi.crt

[7/8] Creating application user...
      ✓ User 'wise2' created with home: /home/wise2

[8/8] Running system checks...
      ✓ All checks passed

Setup complete! Run ./deploy-to-pi.sh to deploy.
Estimated time: 15 minutes
```

---

## Environment Setup

### 1. Required Environment Variables

**Create `.env.pi` in project root:**

```bash
# Copy template
cp .env.example .env.pi

# Edit with your values
nano .env.pi
```

**`.env.pi` template:**

```env
# ===== DEPLOYMENT =====
NODE_ENV=production
DEPLOYMENT_TARGET=raspberry-pi
RASPBERRY_PI_HOSTNAME=wise2-pi.local

# ===== DATABASE =====
DATABASE_URL=postgresql://wise2:${DB_PASSWORD}@localhost:5432/wise2_production
DB_USER=wise2
DB_PASSWORD=${DB_PASSWORD}
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wise2_production

# ===== REDIS =====
REDIS_URL=redis://:${REDIS_PASSWORD}@localhost:6379/0
REDIS_PASSWORD=${REDIS_PASSWORD}

# ===== API SERVER =====
API_PORT=3001
API_HOST=0.0.0.0
API_WORKERS=2

# ===== WEBSITE =====
WEBSITE_PORT=3000
WEBSITE_HOST=0.0.0.0

# ===== DASHBOARD =====
DASHBOARD_PORT=3005
DASHBOARD_HOST=0.0.0.0

# ===== MONITORING =====
LOG_LEVEL=info
LOG_DIR=/var/log/wise2
ENABLE_MONITORING=true
MONITORING_PORT=9090

# ===== SSL/TLS =====
SSL_ENABLED=true
SSL_CERT_PATH=/etc/ssl/certs/wise2-pi.crt
SSL_KEY_PATH=/etc/ssl/private/wise2-pi.key
SSL_DOMAIN=wise2-pi.local

# ===== API KEYS (if using external services) =====
# STRIPE_SECRET_KEY=sk_test_...
# DISCORD_BOT_TOKEN=your_token_here
# SENDGRID_API_KEY=your_key_here

# ===== CORS & SECURITY =====
CORS_ORIGIN=https://wise2-pi.local:3000
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX_REQUESTS=100
```

### 2. Generate Secure Credentials

```bash
# Generate strong passwords
openssl rand -base64 32

# Example output:
# aBc1De2Fg3Hj4Kl5Mn6Op7Qr8St9Uv0Wx1Yz2+/=

# Store two generated values in .env.pi:
# - DB_PASSWORD: first generated value
# - REDIS_PASSWORD: second generated value
```

### 3. API Keys (Optional)

- **Stripe** (payments): https://stripe.com
- **Discord Bot Token** (notifications): https://discord.dev
- **SendGrid** (email): https://sendgrid.com

These are optional for basic deployment.

### 4. SSL Certificates

**Verify certificates created during init:**

```bash
# Check certificate
ls -la /etc/ssl/certs/wise2-pi.* /etc/ssl/private/wise2-pi.*

# View details
openssl x509 -in /etc/ssl/certs/wise2-pi.crt -text -noout | head -20
```

---

## Deployment

### 1. Pre-Deployment Checks

```bash
# Verify disk space (need minimum 2GB free)
df -h /

# Verify memory
free -h

# Check services running
sudo systemctl status postgresql redis-server docker
```

### 2. Run Deployment Script

```bash
# Make script executable
chmod +x scripts/deploy-to-pi.sh

# Run deployment (10-15 minutes on Pi 4)
./scripts/deploy-to-pi.sh
```

**Expected output:**

```
========================================
WISE² Core - Raspberry Pi Deployment
========================================

[1/5] Installing dependencies...
      ✓ Completed in 3 minutes

[2/5] Building packages...
      ✓ Completed in 5 minutes

[3/5] Running database migrations...
      ✓ Applied 12 migrations

[4/5] Starting services...
      ✓ All services started

[5/5] Running health checks...
      API: ✓ Running on :3001
      Website: ✓ Running on :3000
      Dashboard: ✓ Running on :3005

Deployment complete!
Access at: https://wise2-pi.local:3000
```

### 3. Verify Services

```bash
# Check service status
sudo systemctl status wise2-api wise2-website wise2-dashboard

# Check listening ports
sudo netstat -tlnp | grep -E ':(3000|3001|3005|5432|6379)'
```

### 4. Test Endpoints

```bash
# Test API
curl -k https://wise2-pi.local:3001/health

# Test Website
curl -k https://wise2-pi.local:3000

# Test Dashboard
curl -k https://wise2-pi.local:3005/health
```

---

## Post-Deployment Configuration

### 1. Monitoring

```bash
# Install monitoring
npm run install:monitoring

# Verify on port 9090
curl http://localhost:9090/metrics
```

### 2. Alerts

```bash
# Create disk alert script
sudo nano /usr/local/bin/wise2-disk-alert.sh
```

Add:

```bash
#!/bin/bash
USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $USAGE -gt 80 ]; then
  echo "ALERT: Disk usage at ${USAGE}%" | mail -s "Pi Alert" dwise03@gmail.com
fi
```

Make executable and add to cron:

```bash
sudo chmod +x /usr/local/bin/wise2-disk-alert.sh
sudo crontab -e

# Add: 0 */6 * * * /usr/local/bin/wise2-disk-alert.sh
```

### 3. Backups

```bash
# Create backup directory
sudo mkdir -p /mnt/backup/wise2
sudo chown pi:pi /mnt/backup/wise2

# Create backup script
cat > ~/backup-wise2.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/mnt/backup/wise2"
DATE=$(date +%Y%m%d_%H%M%S)

echo "Backing up database..."
pg_dump wise2_production | gzip > $BACKUP_DIR/db_$DATE.sql.gz

echo "Backing up application..."
tar -czf $BACKUP_DIR/app_$DATE.tar.gz \
  ~/wise2-core \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=dist

echo "Backup complete: $DATE"
ls -lh $BACKUP_DIR/
EOF

chmod +x ~/backup-wise2.sh
```

### 4. Auto-Updates

```bash
# Enable automatic updates
sudo apt-get install unattended-upgrades -y
sudo systemctl enable unattended-upgrades
sudo systemctl start unattended-upgrades
```

---

## Operations

### Daily Checks

```bash
# Run health check
./scripts/pi-health-check.sh

# View logs
tail -f /var/log/wise2/api.log
```

### Updates

```bash
# Update application
cd ~/wise2-core
git pull origin main
npm run build
./scripts/deploy-to-pi.sh

# Update system
sudo apt-get update && sudo apt-get upgrade -y
```

### Backups

```bash
# Create backup
~/backup-wise2.sh

# List backups
ls -lh /mnt/backup/wise2/

# Restore database
gunzip < /mnt/backup/wise2/db_20260723_100000.sql.gz | psql wise2_production

# Restore application
tar -xzf /mnt/backup/wise2/app_20260723_100000.tar.gz -C ~
```

---

## Performance Optimization

### Disk I/O

```bash
# Set deadline scheduler
echo deadline | sudo tee /sys/block/mmcblk0/queue/scheduler

# Make permanent
sudo nano /boot/firmware/cmdline.txt
# Add: elevator=deadline
```

### Memory Management

```bash
# Increase swap
sudo nano /etc/dphys-swapfile
# Set: CONF_SWAPSIZE=2048

sudo dphys-swapfile setup
sudo dphys-swapfile swapon
```

### Node.js Settings (in `.env.pi`)

```env
API_WORKERS=2
NODE_OPTIONS=--max-old-space-size=512
```

---

## Troubleshooting

### Disk Full

```bash
# Find large files
du -sh /home/pi/* | sort -hr

# Clean old backups
find /mnt/backup/wise2 -name "*.gz" -mtime +7 -delete

# Clean cache
sudo apt-get clean
sudo apt-get autoclean
```

### High Memory Usage

```bash
# Check what's using memory
ps aux --sort=-%mem | head -10

# Restart service
sudo systemctl restart wise2-api

# Monitor memory
watch -n 5 free -h
```

### Service Not Running

```bash
# Check status
sudo systemctl status wise2-api

# Restart
sudo systemctl restart wise2-api

# View logs
sudo journalctl -u wise2-api -n 50
```

### Database Connection Error

```bash
# Check PostgreSQL
sudo systemctl status postgresql

# Restart
sudo systemctl restart postgresql

# Test connection
psql -U wise2 -d wise2_production -c "SELECT 1;"
```

---

## Maintenance Schedule

### Daily
- [ ] Health check: `./scripts/pi-health-check.sh`
- [ ] Check logs: `tail -f /var/log/wise2/api.log`
- [ ] Disk space: `df -h /`

**Time**: 5 minutes

### Weekly
- [ ] Review backups: `ls -lh /mnt/backup/wise2/`
- [ ] Check updates: `apt list --upgradable`

**Time**: 10 minutes

### Monthly
- [ ] Test backup restore
- [ ] Database vacuum: `sudo -u postgres vacuumdb wise2_production`
- [ ] System updates: `sudo apt-get upgrade -y`

**Time**: 1 hour

### Quarterly
- [ ] Performance audit
- [ ] Disaster recovery test
- [ ] Capacity planning

**Time**: 4 hours

---

## Support & Contact

**Email**: dwise03@gmail.com  
**GitHub**: https://github.com/yourusername/wise2-core/issues

**Resources:**
- Raspberry Pi: https://www.raspberrypi.com/documentation/
- PostgreSQL: https://www.postgresql.org/docs/
- Node.js: https://nodejs.org/docs/

---

**Last Updated**: 2026-07-23  
**Version**: 1.0  
**Maintained By**: dwise03@gmail.com
