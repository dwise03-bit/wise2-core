# WISE² Raspberry Pi Deployment Guide

**Version**: 1.0  
**Updated**: 2024-07-23  
**Target Hardware**: Raspberry Pi 3B/4 (32-bit)  
**OS**: Raspberry Pi OS Lite (recommended)

---

## Quick Start

```bash
# 1. Prerequisites
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose curl

# 2. Clone WISE² and navigate to project
cd /home/pi/wise2-core

# 3. Configure environment
cp .env.pi.example .env.pi
nano .env.pi  # Edit with your settings

# 4. Create swap (CRITICAL for Pi 3B)
sudo fallocate -l 2G /var/swap.img
sudo chmod 600 /var/swap.img
sudo mkswap /var/swap.img
sudo swapon /var/swap.img
echo '/var/swap.img none swap sw 0 0' | sudo tee -a /etc/fstab

# 5. Start services
docker-compose -f docker-compose.pi.yml up -d

# 6. Verify
docker-compose -f docker-compose.pi.yml ps
curl http://localhost:3000/health  # Should return 200
```

---

## Detailed Setup Instructions

### 1. Prepare Raspberry Pi

#### OS Installation
```bash
# Use Raspberry Pi Imager to flash microSD card
# Download: https://www.raspberrypi.com/software/
# Select:
#   - OS: Raspberry Pi OS Lite (32-bit for Pi 3B)
#   - Storage: Your microSD card
# Use advanced options:
#   - Enable SSH
#   - Set hostname: wise2-pi
#   - Configure WiFi or use Ethernet

# Boot and SSH in
ssh pi@wise2-pi.local
# Or: ssh pi@<ip-address>
```

#### System Updates
```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y \
    curl \
    wget \
    net-tools \
    htop \
    iotop \
    git \
    vim
```

#### Increase Swap (CRITICAL for Pi 3B)
Pi 3B has only 1GB RAM. Swap allows using SD card as additional memory (slower, but prevents crashes).

```bash
# Create 2GB swap file
sudo fallocate -l 2G /var/swap.img
sudo chmod 600 /var/swap.img
sudo mkswap /var/swap.img
sudo swapon /var/swap.img

# Persist across reboots
echo '/var/swap.img none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify
free -h
# Output should show ~2G Swap

# Monitor swap usage (watch for constant swapping)
vmstat 1 10
```

**Performance Note**: If swap is constantly used, you're running out of memory. Reduce resource limits or add more RAM.

### 2. Install Docker & Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group (avoid sudo)
sudo usermod -aG docker $USER
newgrp docker

# Verify
docker --version
docker run hello-world
```

For Docker Compose, either use pip or download binary:

```bash
# Option A: pip (slower on Pi, but simpler)
sudo apt install -y python3-pip
sudo pip3 install docker-compose

# Option B: Binary download (faster)
RELEASE=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep -o '"tag_name": "[^"]*' | cut -d'"' -f4)
sudo curl -L "https://github.com/docker/compose/releases/download/${RELEASE}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify
docker-compose --version
```

### 3. Clone & Configure WISE²

```bash
# Clone repository
cd /home/pi
git clone https://github.com/yourusername/wise2-core.git
cd wise2-core

# Copy environment template
cp .env.pi.example .env.pi

# Edit configuration
nano .env.pi
```

**Edit `.env.pi` with your settings**:

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_PASSWORD` | PostgreSQL password | `$(openssl rand -base64 32)` |
| `API_BASE_URL` | External API URL | `http://192.168.1.100:3000` |
| `APP_URL` | External app URL | `http://192.168.1.100:3001` |
| `STRIPE_*` | Stripe keys (optional) | Get from Stripe dashboard |
| `SENDGRID_*` | Email keys (optional) | Get from SendGrid dashboard |

### 4. (Optional) Mount External USB for Data

Recommended to reduce SD card wear:

```bash
# Plug in USB drive, then:
lsblk  # Identify device (usually /dev/sda1)

# Format (WARNING: erases all data on device)
sudo mkfs.ext4 /dev/sda1

# Create mount point
sudo mkdir -p /mnt/external-usb

# Mount
sudo mount /dev/sda1 /mnt/external-usb

# Set permissions for Docker
sudo mkdir -p /mnt/external-usb/{postgres,redis}
sudo chown 999:999 /mnt/external-usb/postgres
sudo chown 999:999 /mnt/external-usb/redis

# Persist across reboots
echo '/dev/sda1 /mnt/external-usb ext4 defaults,nofail 0 0' | sudo tee -a /etc/fstab

# Enable in docker-compose.pi.yml:
# Uncomment lines in "volumes:" section under postgres_data and redis_data
```

### 5. Start Services

```bash
# Pull latest images
docker-compose -f docker-compose.pi.yml pull

# Start all services
docker-compose -f docker-compose.pi.yml up -d

# Watch startup logs
docker-compose -f docker-compose.pi.yml logs -f

# Expected startup time: 45-90 seconds
```

### 6. Verify Deployment

```bash
# Check all services are running
docker-compose -f docker-compose.pi.yml ps
# Output should show 4 running containers

# Test API health
curl http://localhost:3000/health
# Should return: {"status":"ok"}

# Test website
curl -I http://localhost:3001
# Should return: HTTP/1.1 200 OK

# Test database
docker-compose -f docker-compose.pi.yml exec postgres \
    psql -U wise2 -d wise2_prod -c "SELECT version();"
# Should return PostgreSQL version info

# Test Redis
docker-compose -f docker-compose.pi.yml exec redis \
    redis-cli PING
# Should return: PONG
```

---

## Resource Tuning & Optimization

### Memory Management

**Current Allocation (Pi 3B: 1GB RAM)**:
```
PostgreSQL:     256-512 MB
Redis:          64-128 MB
API:            256-384 MB
Website:        128-192 MB
System/Docker:  ~100 MB
────────────────────────
Total:          ~900-1200 MB (within 1GB + 2GB swap)
```

**Monitor Memory**:
```bash
# Real-time memory usage by service
docker stats --no-stream --format \
    "table {{.Container}}\t{{.MemUsage}}\t{{.CPUPerc}}"

# System memory
free -h

# Swap usage (should be <100MB normally)
vmstat 1 5 | tail -3
```

**If Memory is Tight**:
```bash
# Option 1: Increase RAM (get Pi 4 with 4GB)
# Option 2: Increase swap
sudo swapoff /var/swap.img
sudo fallocate -l 4G /var/swap.img
sudo mkswap /var/swap.img
sudo swapon /var/swap.img

# Option 3: Reduce service memory limits
# Edit docker-compose.pi.yml, decrease limits in "deploy:" sections

# Option 4: Disable non-essential features
# Comment out services in docker-compose.pi.yml
```

### Disk Performance

Pi SD cards are slow and limited I/O. Optimize:

```bash
# Check disk usage
df -h
du -sh /var/lib/docker/volumes/*

# Check I/O performance
iostat -x 1  # Run for 10 seconds

# If high write I/O, move to external USB (see setup above)
```

**Optimize Log Rotation**:
Already configured in `docker-compose.pi.yml`:
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "50m"    # Rotate after 50MB
    max-file: "3"      # Keep 3 rotated logs
```

### Network Performance

```bash
# Use Ethernet when possible (faster, more stable than WiFi)
ip link show
# Look for "eth0" (Ethernet) - should be "UP"

# Set static IP to avoid DHCP/DNS overhead
# Edit: /etc/dhcpcd.conf
sudo nano /etc/dhcpcd.conf
# Add:
# interface eth0
# static ip_address=192.168.1.100/24
# static routers=192.168.1.1
# static domain_name_servers=8.8.8.8 8.8.4.4

# Test network
ping -c 4 google.com
curl -w "%{time_total}\n" -o /dev/null -s https://google.com
```

### Temperature Management

Pi can throttle CPU if hot:

```bash
# Check current temperature
vcgencmd measure_temp
# Output: temp=45.2'C

# Monitor over time
watch -n 1 vcgencmd measure_temp

# Thermal throttling occurs above 80°C
# Critical shutdown at 85°C

# Solution: Add heatsink or improve ventilation
# https://www.raspberrypi.com/products/raspberry-pi-case/
```

---

## Monitoring & Health Checks

### Service Health

```bash
# All services
docker-compose -f docker-compose.pi.yml ps

# Service logs
docker-compose -f docker-compose.pi.yml logs -f api
docker-compose -f docker-compose.pi.yml logs -f postgres
docker-compose -f docker-compose.pi.yml logs -f redis
docker-compose -f docker-compose.pi.yml logs -f website

# Real-time resource usage
docker stats
```

### Manual Health Checks

```bash
# API
curl http://localhost:3000/health

# Website
curl -I http://localhost:3001

# Database
docker-compose -f docker-compose.pi.yml exec postgres \
    psql -U wise2 -d wise2_prod -c "SELECT NOW();"

# Redis
docker-compose -f docker-compose.pi.yml exec redis \
    redis-cli INFO stats
```

### Alerting (Optional)

Create a monitoring script:

```bash
#!/bin/bash
# /home/pi/check-wise2-health.sh

# Check services
docker-compose -f /home/pi/wise2-core/docker-compose.pi.yml ps | grep -q "wise2-api"
if [ $? -ne 0 ]; then
    echo "ALERT: API container not running"
    # Send email, Slack, etc.
    exit 1
fi

# Check disk space
DISK=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK -gt 90 ]; then
    echo "ALERT: Disk usage at ${DISK}%"
    exit 1
fi

# Check memory swap
SWAP=$(free | grep Swap | awk '{print $3}')
if [ $SWAP -gt 500000 ]; then
    echo "ALERT: High swap usage: ${SWAP}KB"
    exit 1
fi

echo "OK - All checks passed"
exit 0
```

Schedule with cron:
```bash
# Run every 5 minutes
crontab -e
# Add: */5 * * * * /home/pi/check-wise2-health.sh >> /var/log/wise2-health.log 2>&1
```

---

## Backup & Recovery

### Backup Strategy

**Database Backups** (recommended daily):

```bash
# Manual backup
docker-compose -f docker-compose.pi.yml exec postgres \
    pg_dump -U wise2 wise2_prod | \
    gzip > backup-$(date +%Y%m%d-%H%M%S).sql.gz

# Restore
docker-compose -f docker-compose.pi.yml exec -T postgres \
    psql -U wise2 -d wise2_prod < backup.sql
```

**Automated Backup** (cron):

```bash
# Create backup script
cat > /home/pi/backup-wise2.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=/mnt/external-usb/backups
mkdir -p $BACKUP_DIR

# Database backup
docker-compose -f /home/pi/wise2-core/docker-compose.pi.yml exec postgres \
    pg_dump -U wise2 wise2_prod | \
    gzip > $BACKUP_DIR/postgres-$(date +%Y%m%d-%H%M%S).sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "postgres-*.sql.gz" -mtime +7 -delete

echo "Backup completed at $(date)" >> $BACKUP_DIR/backup.log
EOF

chmod +x /home/pi/backup-wise2.sh

# Schedule daily at 2 AM
crontab -e
# Add: 0 2 * * * /home/pi/backup-wise2.sh >> /var/log/wise2-backup.log 2>&1
```

### Recovery Procedure

```bash
# 1. Stop services
docker-compose -f docker-compose.pi.yml down

# 2. Remove corrupted database
docker volume rm wise2_postgres_data

# 3. Restart database container
docker-compose -f docker-compose.pi.yml up -d postgres
docker-compose -f docker-compose.pi.yml exec postgres pg_isready

# 4. Restore from backup
docker-compose -f docker-compose.pi.yml exec -T postgres \
    psql -U wise2 -d wise2_prod < /path/to/backup.sql

# 5. Restart all services
docker-compose -f docker-compose.pi.yml up -d
```

---

## Troubleshooting

### Common Issues & Solutions

#### OOM (Out of Memory) Kills Container

**Symptom**: `docker-compose logs` shows "Killed" or "Exit 137"

**Solution**:
```bash
# 1. Check memory usage
docker stats

# 2. Increase swap
sudo swapoff /var/swap.img
sudo fallocate -l 4G /var/swap.img
sudo mkswap /var/swap.img
sudo swapon /var/swap.img

# 3. Reduce connection pool
# Edit docker-compose.pi.yml:
# DATABASE_POOL_MAX: 3  (instead of 5)

# 4. Reduce Redis memory
# In docker-compose.pi.yml, reduce:
# --maxmemory 64mb  (instead of 128mb)
```

#### PostgreSQL Won't Start

**Symptom**: `docker-compose logs postgres` shows errors

**Solution**:
```bash
# 1. Check logs
docker-compose -f docker-compose.pi.yml logs postgres

# 2. Verify disk space
df -h

# 3. If data corrupted, reset (loses data!)
docker-compose -f docker-compose.pi.yml down
docker volume rm wise2_postgres_data
docker-compose -f docker-compose.pi.yml up -d postgres
```

#### API Responds Slowly

**Symptom**: `curl` takes >2 seconds

**Solution**:
```bash
# 1. Check CPU usage
docker stats

# 2. Check temperature
vcgencmd measure_temp

# 3. If hot, improve ventilation/add heatsink

# 4. Check network latency
ping google.com

# 5. If using WiFi, switch to Ethernet

# 6. Check database performance
docker-compose -f docker-compose.pi.yml logs postgres | grep slow
```

#### High Disk I/O (SD Card Thrashing)

**Symptom**: Slow everything, high I/O in `iostat`

**Solution**:
```bash
# 1. Move data to external USB (see setup)

# 2. Reduce log verbosity
# Edit docker-compose.pi.yml:
# LOG_LEVEL: warn  (instead of info)

# 3. Reduce log rotation size
# In docker-compose.pi.yml:
# max-size: "20m"  (instead of 50m)

# 4. Monitor over time
iostat -x 2 | head -30
```

#### Can't Access from Network

**Symptom**: `curl` from another computer fails

**Solution**:
```bash
# 1. Get Pi IP address
hostname -I
# Example: 192.168.1.100

# 2. Test from another computer
curl http://192.168.1.100:3000/health

# 3. Check firewall
sudo ufw status
# If disabled, enable selectively:
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 3000/tcp  # API
sudo ufw allow 3001/tcp  # Website

# 4. Check Pi is listening
netstat -tuln | grep 3000

# 5. Restart services
docker-compose -f docker-compose.pi.yml restart api
```

---

## Production Deployment Checklist

Before going to production, complete:

- [ ] **Security**
  - [ ] Change all default passwords in `.env.pi`
  - [ ] Enable firewall with selective rules
  - [ ] Configure HTTPS (nginx reverse proxy or Let's Encrypt)
  - [ ] Disable SSH password auth (use keys only)
  - [ ] Rotate Stripe/SendGrid API keys regularly

- [ ] **Monitoring**
  - [ ] Set up health check monitoring (cron script)
  - [ ] Configure disk space alerts
  - [ ] Monitor temperature (alert >75°C)
  - [ ] Check logs regularly for errors

- [ ] **Backup**
  - [ ] Test daily database backups
  - [ ] Verify backup restore procedure
  - [ ] Store backups on separate USB/cloud

- [ ] **Performance**
  - [ ] Performance test with expected traffic load
  - [ ] Monitor resource usage under load
  - [ ] Adjust resource limits if needed
  - [ ] Verify health checks all pass

- [ ] **Operations**
  - [ ] Document Pi IP address and access procedure
  - [ ] Create systemd service for autostart (see below)
  - [ ] Set up log rotation for troubleshooting
  - [ ] Plan hardware upgrade path (Pi 4 option)

---

## Autostart on Boot (Systemd)

Make WISE² start automatically when Pi boots:

```bash
# Create service file
sudo tee /etc/systemd/system/wise2-docker.service > /dev/null << 'EOF'
[Unit]
Description=WISE² Docker Compose Services
After=docker.service network-online.target
Requires=docker.service
Wants=network-online.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/wise2-core
EnvironmentFile=/home/pi/wise2-core/.env.pi
ExecStart=/usr/local/bin/docker-compose -f docker-compose.pi.yml up
ExecStop=/usr/local/bin/docker-compose -f docker-compose.pi.yml down
Restart=on-failure
RestartSec=30

[Install]
WantedBy=multi-user.target
EOF

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable wise2-docker.service
sudo systemctl start wise2-docker.service
sudo systemctl status wise2-docker.service

# View logs
sudo journalctl -u wise2-docker.service -f
```

---

## FAQ

**Q: Can I run WISE² on Pi Zero W?**  
A: Not recommended. Pi Zero has only 512MB RAM, would require aggressive memory limits and would be very slow.

**Q: Should I use Pi 3B or Pi 4?**  
A: Pi 4 is recommended (2GB minimum, 4GB preferred). Pi 3B works but slower, requires aggressive tuning.

**Q: How do I access from outside my network?**  
A: Use VPN (WireGuard), Tailscale, or ngrok. Don't expose port 3000/3001 directly to internet.

**Q: Can I run other services alongside WISE²?**  
A: Yes, but carefully. Reduce WISE² resource limits if adding other services. Monitor memory usage.

**Q: How do I update to a new WISE² version?**  
A: Pull latest code, rebuild images, restart:
```bash
cd /home/pi/wise2-core
git pull origin main
docker-compose -f docker-compose.pi.yml down
docker-compose -f docker-compose.pi.yml up -d
```

**Q: Can I move from Pi to cloud?**  
A: Yes! Use the same docker-compose configuration (resource limits can be relaxed on cloud). Migrate database using pg_dump/restore.

---

## Support & Resources

- **Raspberry Pi Docs**: https://www.raspberrypi.com/documentation/
- **Docker Docs**: https://docs.docker.com/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **WISE² GitHub**: https://github.com/yourusername/wise2-core
- **Pi Forum**: https://forums.raspberrypi.com/

---

**Questions? Issues? Contribute improvements to this guide!**
