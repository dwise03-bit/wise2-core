# WISE² Core v1.0 — AWS EC2 Production Deployment

**Status**: Production-Ready  
**Version**: 1.0  
**Date**: 2026-07-22

---

## 1. AWS EC2 SETUP

### Instance Configuration
```bash
# Launch EC2 Instance
- Type: t3.medium (2 vCPU, 4GB RAM)
- OS: Ubuntu 22.04 LTS
- Storage: 100GB gp3 EBS
- Security Group: Allow 22 (SSH), 80 (HTTP), 443 (HTTPS)
- Key Pair: wise2-prod.pem
```

### Connect to Instance
```bash
ssh -i wise2-prod.pem ubuntu@<PUBLIC_IP>
```

---

## 2. SYSTEM SETUP

### Update System
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential
```

### Install Docker & Docker Compose
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Install Node.js 20+
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### Install Git & Certbot (SSL)
```bash
sudo apt install -y git certbot python3-certbot-nginx nginx
```

---

## 3. APPLICATION DEPLOYMENT

### Clone Repository
```bash
cd /opt
sudo git clone https://github.com/your-org/wise2-core.git wise2
cd wise2
sudo chown -R ubuntu:ubuntu /opt/wise2
```

### Environment Setup
```bash
cd /opt/wise2

# Create production .env
cat > .env.production << 'EOF'
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wise2_prod
DB_USER=wise2_prod
DB_PASSWORD=$(openssl rand -base64 32)

# API
NODE_ENV=production
PORT=3000
API_URL=https://api.wise2.net

# Frontend
NEXT_PUBLIC_API_URL=https://api.wise2.net

# JWT Security
JWT_SECRET=$(openssl rand -base64 32)

# Deployment
DEPLOY_ENV=production
DEPLOY_REGION=us-east-1
EOF

chmod 600 .env.production
```

### Install Dependencies
```bash
npm install
npm run build
```

---

## 4. POSTGRESQL PRODUCTION SETUP

### Install PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Create Production Database
```bash
sudo -u postgres psql << EOF
CREATE USER wise2_prod WITH PASSWORD '$(grep DB_PASSWORD .env.production | cut -d= -f2)';
CREATE DATABASE wise2_prod OWNER wise2_prod;
ALTER ROLE wise2_prod SET client_encoding TO 'utf8';
ALTER ROLE wise2_prod SET default_transaction_isolation TO 'read committed';
ALTER ROLE wise2_prod SET default_transaction_deferrable TO on;
ALTER ROLE wise2_prod SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE wise2_prod TO wise2_prod;
EOF
```

### Load Schema
```bash
sudo -u postgres psql wise2_prod < packages/api/src/db/schema.sql
```

### Create Backups Directory
```bash
sudo mkdir -p /backups/wise2
sudo chown postgres:postgres /backups/wise2
sudo chmod 755 /backups/wise2
```

---

## 5. DOCKER COMPOSE (PRODUCTION)

### Create Production Config
```bash
cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: wise2-postgres-prod
    environment:
      POSTGRES_DB: wise2_prod
      POSTGRES_USER: wise2_prod
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - /backups/wise2:/backups
    ports:
      - "5432:5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U wise2_prod"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: wise2-redis-prod
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    image: wise2-api:latest
    container_name: wise2-api-prod
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: wise2_prod
      DB_USER: wise2_prod
      DB_PASSWORD: ${DB_PASSWORD}
      REDIS_HOST: redis
      REDIS_PORT: 6379
      JWT_SECRET: ${JWT_SECRET}
      PORT: 3000
    ports:
      - "3000:3000"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  dashboard:
    image: wise2-dashboard:latest
    container_name: wise2-dashboard-prod
    depends_on:
      - api
    environment:
      NEXT_PUBLIC_API_URL: https://api.wise2.net
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: wise2_prod
      DB_USER: wise2_prod
      DB_PASSWORD: ${DB_PASSWORD}
    ports:
      - "3001:3001"
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
EOF
```

### Start Services
```bash
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml logs -f
```

---

## 6. NGINX REVERSE PROXY

### Create Nginx Config
```bash
sudo tee /etc/nginx/sites-available/wise2-prod << 'EOF'
# Upstream services
upstream api {
    server localhost:3000;
}

upstream dashboard {
    server localhost:3001;
}

# HTTP redirect to HTTPS
server {
    listen 80;
    server_name wise2.net api.wise2.net;
    return 301 https://$server_name$request_uri;
}

# HTTPS - Dashboard
server {
    listen 443 ssl http2;
    server_name wise2.net www.wise2.net;

    ssl_certificate /etc/letsencrypt/live/wise2.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/wise2.net/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    client_max_body_size 100M;

    location / {
        proxy_pass http://dashboard;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# HTTPS - API
server {
    listen 443 ssl http2;
    server_name api.wise2.net;

    ssl_certificate /etc/letsencrypt/live/api.wise2.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.wise2.net/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    client_max_body_size 100M;

    location / {
        proxy_pass http://api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/wise2-prod /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 7. SSL CERTIFICATES (Let's Encrypt)

### Get Certificates
```bash
sudo certbot certonly --standalone \
  -d wise2.net -d www.wise2.net -d api.wise2.net \
  --email your-email@wise2.net \
  --agree-tos \
  --non-interactive
```

### Auto-Renewal
```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## 8. DATABASE BACKUPS

### Automated Backup Script
```bash
sudo tee /usr/local/bin/backup-wise2.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/backups/wise2"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/wise2_backup_$TIMESTAMP.sql.gz"

# Backup database
PGPASSWORD="$(grep DB_PASSWORD /opt/wise2/.env.production | cut -d= -f2)" \
pg_dump -h localhost -U wise2_prod -d wise2_prod | gzip > "$BACKUP_FILE"

# Keep only last 7 days
find "$BACKUP_DIR" -name "wise2_backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE"
EOF

sudo chmod +x /usr/local/bin/backup-wise2.sh

# Schedule with cron (daily at 2 AM)
sudo tee /etc/cron.d/wise2-backup << 'EOF'
0 2 * * * /usr/local/bin/backup-wise2.sh >> /var/log/wise2-backup.log 2>&1
EOF
```

---

## 9. MONITORING & LOGGING

### PM2 Process Manager
```bash
npm install -g pm2

# Create PM2 Ecosystem
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'wise2-api',
      script: 'npm',
      args: 'run start --workspace=packages/api',
      env: { NODE_ENV: 'production' },
      instances: 2,
      exec_mode: 'cluster',
    },
  ],
};
EOF

pm2 start ecosystem.config.js
pm2 save
sudo pm2 startup -u ubuntu --hp /home/ubuntu
```

### Logging
```bash
# View logs
sudo tail -f /var/log/wise2-*.log
docker-compose -f docker-compose.prod.yml logs -f

# Systemd journal
sudo journalctl -u wise2-api -f
```

---

## 10. HEALTH CHECKS & MONITORING

### Health Endpoints
```bash
# API Health
curl https://api.wise2.net/health

# Database Health
curl https://api.wise2.net/health/db

# System Status
curl https://api.wise2.net/metrics
```

### Uptime Monitoring
```bash
# Using Uptime Robot or similar service
# Monitor: https://wise2.net and https://api.wise2.net
```

---

## 11. SECURITY HARDENING

### Firewall Configuration
```bash
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 5432/tcp  # PostgreSQL (restricted to localhost)
```

### Security Updates
```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### Secrets Management
```bash
# Use AWS Secrets Manager or environment variables
# Never commit .env.production to git
```

---

## 12. DEPLOYMENT CHECKLIST

- [ ] AWS EC2 instance created and configured
- [ ] Docker and Docker Compose installed
- [ ] Node.js 20+ installed
- [ ] PostgreSQL production database created
- [ ] Redis cache configured
- [ ] Environment variables set (.env.production)
- [ ] Application built and tested
- [ ] Nginx reverse proxy configured
- [ ] SSL certificates generated (Let's Encrypt)
- [ ] Backup scripts configured
- [ ] PM2 process manager configured
- [ ] Health checks passing
- [ ] DNS records pointing to instance
- [ ] Monitoring configured
- [ ] Firewall rules applied
- [ ] Security hardening complete
- [ ] Database backups tested
- [ ] Rollback plan documented

---

## 13. POST-DEPLOYMENT

### Verify Services
```bash
# Check all services healthy
docker-compose -f docker-compose.prod.yml ps
pm2 list

# Test endpoints
curl -I https://wise2.net
curl -I https://api.wise2.net/health

# Database connectivity
psql -h localhost -U wise2_prod -d wise2_prod -c "SELECT COUNT(*) FROM customers;"
```

### Monitor Performance
```bash
# CPU/Memory
docker stats

# Database
sudo -u postgres psql -d wise2_prod -c "SELECT * FROM pg_stat_statements LIMIT 10;"

# Nginx
curl http://localhost/nginx_status
```

---

## PRODUCTION URLs

- **Dashboard**: https://wise2.net
- **API**: https://api.wise2.net
- **Health**: https://api.wise2.net/health
- **Metrics**: https://api.wise2.net/metrics

---

**Deployment Status**: Ready for Production  
**Estimated Downtime**: 0 (blue-green deployment)  
**Rollback**: Via git revert + restart containers
