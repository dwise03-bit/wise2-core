# VPS Installation Guide — Wise² Core

Complete guide for deploying Wise² Core to a Virtual Private Server (VPS).

---

## Prerequisites

### Hardware Requirements

**Minimum**:
- CPU: 2 cores
- RAM: 2GB
- Disk: 20GB
- Bandwidth: 10Mbps

**Recommended**:
- CPU: 4 cores
- RAM: 4GB
- Disk: 50GB
- Bandwidth: 100Mbps

**Optimal**:
- CPU: 8 cores
- RAM: 8GB
- Disk: 100GB+
- Bandwidth: 1Gbps

### Operating System

Recommended: **Ubuntu 22.04 LTS** (Debian-based)

Also works on:
- Ubuntu 20.04 LTS
- Debian 11
- CentOS 8 / Rocky Linux 8

---

## Step 1: Initial Server Setup

### 1.1 Connect to VPS

```bash
# SSH to your VPS
ssh root@your-vps-ip

# Or if using SSH key
ssh -i /path/to/key.pem root@your-vps-ip
```

### 1.2 Update System

```bash
# Update package lists
apt update

# Upgrade packages
apt upgrade -y

# Install essential tools
apt install -y curl wget git build-essential
```

### 1.3 Create Non-Root User

```bash
# Create user
useradd -m -s /bin/bash wise2

# Add to sudo group
usermod -aG sudo wise2

# Set password
passwd wise2

# Switch to new user
su - wise2
```

### 1.4 Configure Firewall

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Verify
sudo ufw status
```

---

## Step 2: Install Docker

### 2.1 Install Docker Engine

```bash
# Remove old Docker versions
sudo apt remove -y docker docker.io containerd runc

# Add Docker repository
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

### 2.2 Configure Docker User

```bash
# Add current user to docker group
sudo usermod -aG docker $USER

# Apply group membership
newgrp docker

# Verify
docker run hello-world
```

### 2.3 Install Docker Compose

```bash
# Install Docker Compose v2 (latest)
sudo apt install -y docker-compose-plugin

# Verify
docker compose version
```

---

## Step 3: Clone Repository

### 3.1 Clone wise2-core

```bash
# Create app directory
mkdir -p ~/apps
cd ~/apps

# Clone repository
git clone https://github.com/dwise03-bit/wise2-core.git

# Navigate to directory
cd wise2-core

# Verify files
ls -la
```

### 3.2 Verify Structure

```bash
# Check key directories
ls -la services/
ls -la infrastructure/
ls -la docs/

# Should show: api, dashboard, admin-dashboard, bot, worker
```

---

## Step 4: Configure Environment

### 4.1 Create .env File

```bash
# Copy example to .env
cp .env.example .env

# Edit configuration
nano .env
```

### 4.2 Essential Environment Variables

```bash
# Database
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@postgres:5432/wise2_core
POSTGRES_PASSWORD=YOUR_SECURE_PASSWORD

# Redis
REDIS_PASSWORD=YOUR_REDIS_PASSWORD
REDIS_URL=redis://:YOUR_REDIS_PASSWORD@redis:6379

# Application
NODE_ENV=production
ENVIRONMENT=production

# API Configuration
API_PORT=3000
API_HOST=0.0.0.0

# JWT
JWT_SECRET=YOUR_LONG_RANDOM_SECRET_KEY

# External APIs (if using)
CLAUDE_API_KEY=sk-... (your Claude API key)
GITHUB_TOKEN=ghp_... (your GitHub token)

# Discord Bot (if using)
DISCORD_BOT_TOKEN=your-bot-token
DISCORD_GUILD_ID=your-guild-id

# Optional: Monitoring
GRAFANA_PASSWORD=YOUR_GRAFANA_PASSWORD
```

### 4.3 Generate Secure Secrets

```bash
# Generate random secrets
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For POSTGRES_PASSWORD
openssl rand -base64 32  # For REDIS_PASSWORD

# Copy these into .env
```

---

## Step 5: Configure Domain & SSL

### 5.1 Point Domain to VPS

```bash
# In your domain registrar:
A record: example.com → your-vps-ip
A record: www.example.com → your-vps-ip
A record: api.example.com → your-vps-ip (if needed)
```

Wait 5-10 minutes for DNS propagation:

```bash
# Verify DNS
nslookup example.com
# Should show your VPS IP
```

### 5.2 Install Certbot (Let's Encrypt SSL)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Create certificate
sudo certbot certonly --standalone -d example.com -d www.example.com

# Choose email and agree to terms
# Certificates saved to: /etc/letsencrypt/live/example.com/
```

### 5.3 Copy SSL Certificates

```bash
# Make certificates accessible to docker
sudo cp /etc/letsencrypt/live/example.com/fullchain.pem ~/apps/wise2-core/certs/
sudo cp /etc/letsencrypt/live/example.com/privkey.pem ~/apps/wise2-core/certs/

# Set permissions
sudo chown $USER:$USER ~/apps/wise2-core/certs/*
```

### 5.4 Auto-Renew SSL Certificates

```bash
# Create renewal script
nano ~/apps/wise2-core/infrastructure/scripts/renew-ssl.sh
```

```bash
#!/bin/bash
# Renew SSL certificates
certbot renew --quiet --post-hook "systemctl reload nginx"
```

```bash
# Make executable
chmod +x ~/apps/wise2-core/infrastructure/scripts/renew-ssl.sh

# Add to crontab (runs monthly)
crontab -e

# Add line:
# 0 2 1 * * ~/apps/wise2-core/infrastructure/scripts/renew-ssl.sh
```

---

## Step 6: Configure Reverse Proxy (Nginx)

### 6.1 Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 6.2 Create Nginx Configuration

```bash
# Create nginx config
sudo nano /etc/nginx/sites-available/wise2-core
```

```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name example.com www.example.com api.example.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS configuration
server {
    listen 443 ssl http2;
    server_name example.com www.example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Proxy to Dashboard
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# API subdomain (optional)
server {
    listen 443 ssl http2;
    server_name api.example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    # Proxy to API
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 6.3 Enable Configuration

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/wise2-core /etc/nginx/sites-enabled/

# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

---

## Step 7: Deploy Services

### 7.1 Build Docker Images

```bash
cd ~/apps/wise2-core

# Build all services
docker compose build

# This takes 5-10 minutes
```

### 7.2 Start Services

```bash
# Start all services
docker compose up -d

# Verify
docker compose ps

# Expected: 9 services running
```

### 7.3 Verify Deployment

```bash
# Check logs
docker compose logs api

# Health check
curl http://localhost:3000/health

# Expected: {"status":"ok","service":"api",...}

# Dashboard
curl http://localhost:3001

# Expected: HTML response
```

---

## Step 8: Initialize Database

### 8.1 Wait for Services

```bash
# Wait 30 seconds for database startup
sleep 30

# Check database is running
docker compose ps postgres
```

### 8.2 Run Migrations (if needed)

```bash
# Connect to database
docker compose exec postgres psql -U postgres -d wise2_core

# Inside psql:
SELECT version();
\dt

# Exit
\q
```

### 8.3 Verify Database

```bash
docker compose exec postgres psql -U postgres -d wise2_core -c "SELECT 1;"

# Expected: (1 row)
```

---

## Step 9: Configure Monitoring & Backups

### 9.1 Verify Monitoring

```bash
# Check Prometheus
curl http://localhost:9090

# Check Grafana
curl http://localhost:3001/api/health

# Should respond with OK
```

### 9.2 Configure Backups

```bash
# Create backup directory
mkdir -p ~/backups/production

# Run first backup
./infrastructure/scripts/backup.sh ~/backups/production

# Verify backup
ls -lh ~/backups/production/

# Schedule daily backups
crontab -e

# Add line (2 AM daily):
# 0 2 * * * ~/apps/wise2-core/infrastructure/scripts/backup.sh ~/backups/production
```

### 9.3 Test Backup Restoration

```bash
# List backups
ls -lh ~/backups/production/

# Extract backup
cd /tmp
tar -xzf ~/backups/production/wise2_backup_*.tar.gz

# Verify files
ls -la backup/
```

---

## Step 10: Health Checks & Monitoring

### 10.1 Verify All Services

```bash
# Container status
docker compose ps

# All should show "Up"

# Service health checks
curl https://example.com/api/health        # API
curl https://example.com/                  # Dashboard
curl https://example.com:9090              # Prometheus

# Database
docker compose exec postgres pg_isready -U postgres

# Redis
docker compose exec redis redis-cli -a $REDIS_PASSWORD ping

# Expected: PONG
```

### 10.2 Monitor System Resources

```bash
# Check container stats
docker stats

# Check disk usage
df -h

# Expected: >10GB free

# Check memory
free -h
```

### 10.3 View Logs

```bash
# All logs
docker compose logs -f

# Specific service
docker compose logs -f api

# Last 50 lines
docker compose logs --tail=50
```

---

## Step 11: Post-Deployment

### 11.1 Access Services

**Dashboard**: https://example.com  
**API**: https://api.example.com (if configured)  
**Prometheus**: http://your-vps-ip:9090  
**Grafana**: http://your-vps-ip:3001  

### 11.2 First-Time Setup

```bash
# Create admin user (if needed)
docker compose exec api npm run create-admin

# Configure Discord bot (if using)
# Get bot token from Discord Developer Portal
# Update .env with DISCORD_BOT_TOKEN

# Restart services
docker compose restart
```

### 11.3 Set Up SSH Key Authentication

```bash
# Copy SSH key to VPS (on your local machine)
ssh-copy-id -i ~/.ssh/id_rsa wise2@your-vps-ip

# Test
ssh wise2@your-vps-ip

# Should not prompt for password
```

---

## Troubleshooting

### Services Won't Start

```bash
# Check logs
docker compose logs api

# Common issues:
# - Port already in use: Change in docker-compose.yml
# - Database not ready: Wait 30 seconds, try again
# - Memory issues: Check available RAM (free -h)

# Restart services
docker compose down
docker compose up -d
```

### SSL Certificate Issues

```bash
# Check certificate
sudo openssl x509 -in /etc/letsencrypt/live/example.com/fullchain.pem -text -noout

# Renew certificate
sudo certbot renew --force-renewal

# Reload nginx
sudo systemctl reload nginx
```

### Database Connection Errors

```bash
# Check database
docker compose ps postgres

# Restart database
docker compose restart postgres

# Wait 10 seconds
sleep 10

# Test connection
docker compose exec postgres pg_isready -U postgres
```

### High Resource Usage

```bash
# Check what's using resources
docker stats

# Restart high-usage service
docker compose restart SERVICE_NAME

# Check logs for memory leaks
docker compose logs SERVICE_NAME | grep -i memory
```

---

## Maintenance

### Daily Tasks

```bash
# Check status
docker compose ps

# View logs
docker compose logs --since 24h | grep -i error

# Monitoring
# Check Grafana dashboards for anomalies
```

### Weekly Tasks

```bash
# Review performance metrics
docker stats

# Check disk space
df -h

# Verify backups
ls -lh ~/backups/production/ | head -5
```

### Monthly Tasks

```bash
# Test backup restoration
cd /tmp
tar -xzf ~/backups/production/wise2_backup_*.tar.gz

# Review security
# Check firewall rules
sudo ufw status

# Update system
sudo apt update && sudo apt upgrade -y

# Restart services
docker compose restart
```

---

## Security Best Practices

### 1. Use SSH Keys Only

```bash
# Disable password authentication
sudo nano /etc/ssh/sshd_config

# Change:
# PasswordAuthentication yes → PasswordAuthentication no
# PermitRootLogin yes → PermitRootLogin no

# Restart SSH
sudo systemctl restart ssh
```

### 2. Keep Secrets Secure

```bash
# Never commit .env to git
echo ".env" >> ~/.gitignore

# Use strong passwords
# API Keys stored in .env, not in code
# Rotate keys periodically
```

### 3. Regular Backups

```bash
# Automated daily backups (configured in cron)
crontab -l | grep backup

# Off-site backup (recommended)
# Consider: AWS S3, Google Cloud Storage, Dropbox
```

### 4. Monitor Logs

```bash
# Check for security issues
docker compose logs | grep -i "unauthorized\|error\|failed"

# Monitor access logs
tail -f /var/log/nginx/access.log
```

### 5. Keep Software Updated

```bash
# System updates
sudo apt update && sudo apt upgrade -y

# Docker images
docker pull wise2-core-api:latest
docker compose pull
docker compose up -d
```

---

## Summary

**Installation Complete When:**
- ✅ Docker running with all 9 services
- ✅ Domain pointing to VPS
- ✅ SSL certificate installed
- ✅ Nginx reverse proxy working
- ✅ Health checks passing
- ✅ Backups scheduled
- ✅ Monitoring active

**Access Points:**
- Dashboard: https://example.com
- API: https://api.example.com
- Monitoring: http://your-vps-ip:9090
- Grafana: http://your-vps-ip:3001

**Next Steps:**
- Follow OPERATIONS_GUIDE.md for day-to-day operations
- Configure monitoring dashboards
- Set up alert notifications
- Train team on procedures

---

**VPS Installation Guide Version**: 1.0
**Last Updated**: 2026-07-07
**Owner**: DevOps / Infrastructure Team
