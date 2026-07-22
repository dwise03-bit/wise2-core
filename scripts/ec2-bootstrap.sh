#!/bin/bash

# WISE² EC2 Bootstrap Script
# Automatically configures production environment on EC2 instance

set -e

echo "=========================================="
echo "WISE² Core v1.0 - EC2 Bootstrap"
echo "=========================================="

# Log everything
exec > >(tee -a /var/log/wise2-bootstrap.log)
exec 2>&1

echo "[$(date)] Starting bootstrap..."

# ============================================================================
# 1. SYSTEM UPDATES
# ============================================================================
echo "[$(date)] Updating system..."
apt-get update
apt-get upgrade -y
apt-get install -y curl wget git build-essential htop net-tools

# ============================================================================
# 2. INSTALL DOCKER
# ============================================================================
echo "[$(date)] Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker ubuntu
rm get-docker.sh

# ============================================================================
# 3. INSTALL DOCKER COMPOSE
# ============================================================================
echo "[$(date)] Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# ============================================================================
# 4. INSTALL NODE.JS
# ============================================================================
echo "[$(date)] Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# ============================================================================
# 5. INSTALL NGINX & CERTBOT
# ============================================================================
echo "[$(date)] Installing Nginx & Certbot..."
apt-get install -y nginx certbot python3-certbot-nginx

# ============================================================================
# 6. INSTALL POSTGRESQL & REDIS TOOLS
# ============================================================================
echo "[$(date)] Installing PostgreSQL and Redis tools..."
apt-get install -y postgresql-client redis-tools

# ============================================================================
# 7. CLONE REPOSITORY
# ============================================================================
echo "[$(date)] Cloning WISE² repository..."
mkdir -p /opt
cd /opt
git clone https://github.com/your-org/wise2-core.git wise2 2>/dev/null || git -C wise2 pull
cd wise2
chown -R ubuntu:ubuntu /opt/wise2

# ============================================================================
# 8. CREATE DIRECTORIES
# ============================================================================
echo "[$(date)] Creating directories..."
mkdir -p /backups/wise2
mkdir -p /var/log/wise2
chown ubuntu:ubuntu /backups/wise2
chown ubuntu:ubuntu /var/log/wise2

# ============================================================================
# 9. ENVIRONMENT SETUP
# ============================================================================
echo "[$(date)] Setting up environment..."
cat > /opt/wise2/.env.production << 'EOF'
# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=wise2_prod
DB_USER=wise2_prod
DB_PASSWORD=${DATABASE_PASSWORD}

# API
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=https://api.wise2.net

# JWT
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRY=7d

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# AWS
AWS_REGION=us-east-1
S3_BUCKET_BACKUP=wise2-backups-prod-${AWS_ACCOUNT_ID}

# Logging
LOG_LEVEL=info
SENTRY_DSN=

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Feature Flags
FEATURE_MFA=false
FEATURE_SSO=false
EOF

chmod 600 /opt/wise2/.env.production

# ============================================================================
# 10. BUILD DOCKER IMAGES
# ============================================================================
echo "[$(date)] Building Docker images..."
cd /opt/wise2
docker-compose -f docker-compose.prod.yml build 2>&1 | head -50

# ============================================================================
# 11. START SERVICES
# ============================================================================
echo "[$(date)] Starting Docker services..."
docker-compose -f docker-compose.prod.yml up -d
sleep 10

# Wait for database
echo "[$(date)] Waiting for database to be ready..."
max_attempts=30
attempt=0
while ! docker exec wise2-postgres-prod pg_isready -U wise2_prod > /dev/null 2>&1; do
  if [ $attempt -eq $max_attempts ]; then
    echo "❌ Database failed to start"
    exit 1
  fi
  sleep 1
  ((attempt++))
done
echo "✅ Database ready"

# ============================================================================
# 12. LOAD DATABASE SCHEMA
# ============================================================================
echo "[$(date)] Loading database schema..."
docker exec wise2-postgres-prod psql -U wise2_prod -d wise2_prod < packages/api/src/db/schema.sql

# ============================================================================
# 13. CONFIGURE NGINX
# ============================================================================
echo "[$(date)] Configuring Nginx..."
cp infrastructure/nginx/wise2-prod.conf /etc/nginx/sites-available/wise2-prod
ln -sf /etc/nginx/sites-available/wise2-prod /etc/nginx/sites-enabled/wise2-prod
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# ============================================================================
# 14. SETUP SSL (Let's Encrypt)
# ============================================================================
echo "[$(date)] Setting up SSL certificates..."
certbot certonly --nginx \
  -d wise2.net -d www.wise2.net -d api.wise2.net \
  --email ops@wise2.net \
  --agree-tos \
  --non-interactive \
  --skip-oop || echo "⚠️ SSL setup requires manual intervention"

# ============================================================================
# 15. ENABLE SSL AUTO-RENEWAL
# ============================================================================
echo "[$(date)] Enabling SSL auto-renewal..."
systemctl enable certbot.timer
systemctl start certbot.timer

# ============================================================================
# 16. SETUP CRON JOBS
# ============================================================================
echo "[$(date)] Setting up cron jobs..."

# Database backups daily at 2 AM
echo "0 2 * * * /opt/wise2/scripts/backup-database.sh >> /var/log/wise2/backup.log 2>&1" | crontab -

# Health checks every 5 minutes
echo "*/5 * * * * /opt/wise2/scripts/health-check.sh >> /var/log/wise2/health.log 2>&1" | crontab -

# ============================================================================
# 17. SETUP MONITORING
# ============================================================================
echo "[$(date)] Setting up CloudWatch monitoring..."
# CloudWatch agent setup (optional)
# wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
# dpkg -i -E ./amazon-cloudwatch-agent.deb

# ============================================================================
# 18. VERIFY DEPLOYMENT
# ============================================================================
echo "[$(date)] Verifying deployment..."
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "=========================================="
echo "✅ Bootstrap Complete!"
echo "=========================================="
echo ""
echo "Dashboard: https://wise2.net"
echo "API: https://api.wise2.net"
echo "Health: https://api.wise2.net/health"
echo ""
echo "Logs:"
echo "  Bootstrap: /var/log/wise2-bootstrap.log"
echo "  Docker: docker-compose logs -f"
echo "  Nginx: tail -f /var/log/nginx/error.log"
echo "  Database: docker exec wise2-postgres-prod psql ..."
echo ""
echo "Backups: /backups/wise2/ (and S3)"
echo "=========================================="

echo "[$(date)] Bootstrap finished successfully"
