# WISE² Enterprise - Raspberry Pi Setup Guide

**Target**: Raspberry Pi 4/5 (2GB+ RAM, 32GB+ SD Card)  
**OS**: Raspberry Pi OS (Bullseye/Bookworm)  
**Deployment**: Docker-based (ARM64 compatible)

---

## Prerequisites

- Raspberry Pi 4 or 5 (4GB+ RAM recommended)
- 32GB+ SD card
- Raspberry Pi OS installed
- SSH access enabled
- Power supply (5V/3A minimum)
- Ethernet or WiFi connection

---

## Quick Setup (5 minutes)

```bash
# 1. SSH into Raspberry Pi
ssh pi@raspberrypi.local

# 2. Download and run setup script
curl -sSL https://raw.githubusercontent.com/dwise03-bit/wise2-core/main/setup-raspberry-pi.sh | bash

# 3. Verify deployment
docker-compose -f docker-compose.local.yml ps

# 4. Test API
curl http://localhost:3000/api/health
```

---

## Manual Setup Steps

### Step 1: Update System
```bash
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get install -y git curl wget
```

### Step 2: Install Docker
```bash
# Install Docker
curl -sSL https://get.docker.com | sh

# Add pi user to docker group
sudo usermod -aG docker pi

# Install Docker Compose
sudo apt-get install -y docker-compose

# Verify
docker --version
docker-compose --version
```

### Step 3: Clone Repository
```bash
cd /home/pi
git clone https://github.com/dwise03-bit/wise2-core.git wise2-enterprise
cd wise2-enterprise
```

### Step 4: Configure Environment
```bash
# Create environment file
cat > .env << 'ENVEOF'
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=wise2
DB_PASSWORD=wise2dev
DB_NAME=wise2
JWT_SECRET=raspberry-pi-dev-key-change-in-production
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://raspberrypi.local:3000
ENVEOF
```

### Step 5: Optimize for Raspberry Pi
```bash
# Update docker-compose for ARM64 and resource limits
cat >> docker-compose.local.yml << 'COMPOSEEOF'

# Add memory limits
services:
  api:
    mem_limit: 512m
    cpus: "1.0"
  
  postgres:
    mem_limit: 256m
    cpus: "1.0"
  
  redis:
    mem_limit: 128m
    cpus: "0.5"
  
  dashboard:
    mem_limit: 256m
    cpus: "1.0"
COMPOSEEOF
```

### Step 6: Start Services
```bash
# Start with docker-compose
docker-compose -f docker-compose.local.yml up -d

# Monitor startup (wait for "healthy")
watch -n 1 'docker-compose -f docker-compose.local.yml ps'

# View logs
docker-compose -f docker-compose.local.yml logs -f api
```

### Step 7: Verify Deployment
```bash
# Check services
docker-compose -f docker-compose.local.yml ps

# Test health endpoint
curl http://localhost:3000/api/health

# Test registration
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"pi@wise2.local",
    "password":"RaspberryPiTest123!",
    "firstName":"Pi",
    "lastName":"Test"
  }'
```

---

## ARM64 Compatibility Notes

- ✅ All Docker images support ARM64
- ✅ Node.js 20 available for ARM64
- ✅ PostgreSQL 16 supports ARM64
- ✅ Redis 7 supports ARM64
- ✅ Next.js 14 compatible with ARM64

---

## Performance Optimization for Raspberry Pi

### Memory Management
```bash
# Check memory usage
free -h

# Enable swap (if needed)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Storage Management
```bash
# Check disk usage
df -h

# Clean Docker images
docker image prune -a

# Clean Docker volumes
docker volume prune
```

### CPU Optimization
- Set CPU limits in docker-compose to prevent overheating
- Use 2-4 CPU cores max for services
- Monitor temperature: `vcgencmd measure_temp`

---

## Remote Access

### Access from Another Machine
```bash
# Replace raspberrypi.local with Pi's IP address
curl http://<pi-ip-address>:3000/api/health

# Example with IP 192.168.1.100
curl http://192.168.1.100:3000/api/health
```

### Port Forwarding
```bash
# SSH with port forwarding
ssh -L 3000:localhost:3000 pi@raspberrypi.local

# Then access locally
curl http://localhost:3000/api/health
```

---

## Monitoring & Maintenance

### Check Logs
```bash
# API logs
docker-compose -f docker-compose.local.yml logs -f api --tail 50

# All services
docker-compose -f docker-compose.local.yml logs -f

# System logs
journalctl -f -u docker
```

### Database Backup
```bash
# Backup database
docker-compose -f docker-compose.local.yml exec postgres \
  pg_dump -U wise2 wise2 > backup.sql

# Restore database
docker-compose -f docker-compose.local.yml exec postgres \
  psql -U wise2 wise2 < backup.sql
```

### System Health
```bash
# Check CPU temperature
vcgencmd measure_temp

# Check disk space
df -h

# Check RAM usage
free -h

# Check Docker stats
docker stats
```

---

## Troubleshooting

### Services Won't Start
```bash
# Check available resources
free -h
df -h
vcgencmd measure_temp

# Rebuild from scratch
docker-compose -f docker-compose.local.yml down -v
docker-compose -f docker-compose.local.yml up -d --build
```

### Slow Performance
- Increase swap: `sudo swapon -s`
- Reduce other services running
- Check temperature: `vcgencmd measure_temp` (should be < 80°C)
- Reduce Docker memory limits if necessary

### Connection Refused
- Check firewall: `sudo ufw status`
- Verify ports: `sudo netstat -tlnp`
- Check service is running: `docker-compose -f docker-compose.local.yml ps`

### Database Issues
```bash
# Reset database
docker-compose -f docker-compose.local.yml down postgres
docker volume rm wise2-form_postgres_local
docker-compose -f docker-compose.local.yml up -d postgres

# Wait for health check
docker-compose -f docker-compose.local.yml ps postgres
```

---

## Advanced: Running as Service

### Create Systemd Service
```bash
# Create service file
sudo tee /etc/systemd/system/wise2.service > /dev/null << 'SERVICEEOF'
[Unit]
Description=WISE² Enterprise Docker Services
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
User=pi
WorkingDirectory=/home/pi/wise2-enterprise
ExecStart=/usr/bin/docker-compose -f docker-compose.local.yml up -d
ExecStop=/usr/bin/docker-compose -f docker-compose.local.yml down
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
SERVICEEOF

# Enable service
sudo systemctl enable wise2.service
sudo systemctl start wise2.service

# Check status
sudo systemctl status wise2.service
```

---

## Testing Procedures

### Health Check
```bash
# Quick health check
curl http://localhost:3000/api/health

# Verbose health check
curl -v http://localhost:3000/api/health
```

### Full Test Suite
```bash
# Run comprehensive tests
bash test-wise2.sh
```

### Load Testing
```bash
# Simple load test (requires Apache Bench)
sudo apt-get install -y apache2-utils
ab -n 100 -c 10 http://localhost:3000/api/health
```

---

## Networking

### Find Raspberry Pi IP
```bash
# From Raspberry Pi
hostname -I

# From another machine
ping raspberrypi.local
nmap -sn 192.168.1.0/24
```

### Setup Static IP (Optional)
```bash
# Edit dhcpcd config
sudo nano /etc/dhcpcd.conf

# Add at end:
interface eth0
static ip_address=192.168.1.100/24
static routers=192.168.1.1
static domain_name_servers=8.8.8.8
```

---

## Backup & Recovery

### Full System Backup
```bash
# Backup entire SD card
sudo dd if=/dev/mmcblk0 of=pi-backup.img bs=4M status=progress
```

### Database Backup
```bash
# Backup just the database
docker-compose -f docker-compose.local.yml exec postgres \
  pg_dump -U wise2 wise2 | gzip > wise2-db-backup.sql.gz

# Restore database
zcat wise2-db-backup.sql.gz | \
  docker-compose -f docker-compose.local.yml exec -T postgres psql -U wise2 wise2
```

---

## Security Notes

**For Production:**
- Change default passwords
- Set strong JWT_SECRET
- Enable firewall: `sudo ufw enable`
- Use HTTPS/SSL certificates
- Keep OS updated: `sudo apt-get update && sudo apt-get upgrade`
- Monitor resource usage
- Regular backups

---

## Performance Expectations

| Operation | Time | Notes |
|-----------|------|-------|
| Boot | ~2 min | From power-on to services ready |
| API Response | 50-300ms | Varies with system load |
| Registration | ~200ms | Includes password hashing |
| Login | ~250ms | Includes bcrypt verification |
| Database Query | ~10-30ms | Depends on data size |

---

## Specifications

**Tested on:**
- Raspberry Pi 4B (4GB RAM)
- Raspberry Pi 5 (4GB RAM)
- OS: Raspberry Pi OS Bookworm
- Docker: Latest (buildx compatible)
- Database: PostgreSQL 16 ARM64
- Cache: Redis 7 ARM64

---

## Support

For issues, check:
1. KNOWN_ISSUES.md - Known problems and workarounds
2. Docker logs: `docker-compose logs`
3. System resources: `free -h`, `df -h`
4. Temperature: `vcgencmd measure_temp`

---

**Ready to deploy on Raspberry Pi! 🍓**
