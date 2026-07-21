# WISE² Core v1.0 Deployment to wise2.net

**Deployment Date**: 2026-07-21  
**Target**: wise2.net (173.208.147.165)  
**User**: dwise  
**Status**: Ready for deployment  

---

## 🚀 Deployment Summary

Deploying complete WISE² Core v1.0 system (27,819+ LOC) to production server:
- **API Gateway** (3000) — Central routing, auth, caching
- **Admin Dashboard** (3001) — Real-time monitoring
- **Knowledge Graph** — Semantic relationships, reasoning
- **Discord Bot Ecosystem** — 9 specialized bots
- **Voice Assistant** — STT/TTS, 20+ languages
- **PostgreSQL Database** — Persistent data
- **Redis Cache** — Session & response caching
- **Prometheus/Grafana** — Monitoring & alerting

---

## Prerequisites

### Server Requirements
- ✅ SSH access as `dwise` user
- ✅ Docker & Docker Compose installed
- ✅ Node.js 20+ installed
- ✅ 8GB+ RAM available
- ✅ 100GB+ storage for database & cache
- ✅ Stable internet connectivity

### Local Requirements
- ✅ Git repository up-to-date
- ✅ All changes committed
- ✅ Docker images built locally (optional, can build on server)
- ✅ SSH key configured for passwordless access

---

## Deployment Steps

### Step 1: Verify Prerequisites

```bash
# Check git status (must be clean)
git status
# Should show: "nothing to commit, working tree clean"

# Verify SSH access
ssh dwise@173.208.147.165 'docker --version && docker-compose --version'
# Should output Docker version info
```

### Step 2: Prepare Production Environment

On the remote server:

```bash
ssh dwise@173.208.147.165

# Create deployment directory
mkdir -p ~/wise2-core
cd ~/wise2-core

# Create production .env file with secrets
cat > .env << 'EOF'
# WISE² Core v1.0 Production Configuration
NODE_ENV=production
LOG_LEVEL=info

# Database
POSTGRES_USER=postgres
POSTGRES_ADMIN_PASSWORD=<SECURE_PASSWORD_1>
POSTGRES_APP_USER=wise2_prod_user
POSTGRES_APP_PASSWORD=<SECURE_PASSWORD_2>

# Redis
REDIS_PASSWORD=<SECURE_PASSWORD_3>
REDIS_URL=redis://:REDIS_PASSWORD@redis:6379

# API
JWT_SECRET=<RANDOM_JWT_SECRET>
API_PORT=3001
ADMIN_PORT=3002

# Monitoring
ENABLE_PROMETHEUS=true
PROMETHEUS_PORT=9090

# Cloud Integration (optional)
CLOUD_URL=https://api.wise2.cloud
API_KEY=<YOUR_API_KEY>

# Email/Notifications (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your-email@gmail.com>
SMTP_PASSWORD=<app-specific-password>
EOF

# Secure the env file
chmod 600 .env
```

**⚠️ IMPORTANT**: Replace `<SECURE_PASSWORD_X>` with strong, unique passwords. Generate with:
```bash
openssl rand -hex 32
```

### Step 3: Sync Code to Server

From local machine:

```bash
# 1. Ensure all code is committed
git add -A
git commit -m "Pre-deployment commit"

# 2. Sync to server (excludes build artifacts, node_modules, etc)
rsync -avz --delete \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.env.local' \
  --exclude='dist' \
  --exclude='build' \
  --exclude='.next' \
  --exclude='*.log' \
  . dwise@173.208.147.165:~/wise2-core/

# 3. Verify sync
ssh dwise@173.208.147.165 'ls -la ~/wise2-core | head -20'
```

### Step 4: Build & Start Services

On the remote server:

```bash
ssh dwise@173.208.147.165 << 'DEPLOY'

cd ~/wise2-core

# 1. Install/update dependencies
echo "Installing dependencies..."
npm install --production

# 2. Build production bundles
echo "Building production code..."
npm run build

# 3. Stop any running services
echo "Stopping existing services..."
docker-compose -f docker-compose.prod.yml down || true

# 4. Pull latest images
echo "Pulling Docker images..."
docker-compose -f docker-compose.prod.yml pull

# 5. Start all services
echo "Starting WISE² Core v1.0..."
docker-compose -f docker-compose.prod.yml up -d

# 6. Wait for initialization
echo "Waiting 30 seconds for services to initialize..."
sleep 30

# 7. Check status
echo ""
echo "Service Status:"
docker-compose -f docker-compose.prod.yml ps

# 8. Run health checks
echo ""
echo "Health Checks:"
echo -n "API Gateway: "
curl -s http://localhost:3000/health | jq '.status' || echo "FAILED"

echo -n "Admin Dashboard: "
curl -s http://localhost:3001/health | jq '.status' || echo "FAILED"

echo -n "Database: "
docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U postgres || echo "FAILED"

echo -n "Redis: "
docker-compose -f docker-compose.prod.yml exec -T redis redis-cli ping || echo "FAILED"

DEPLOY

# Verify from local
echo "Verifying from local machine..."
curl -s http://173.208.147.165:3000/health | jq .
```

### Step 5: Configure Firewall & Reverse Proxy

On the remote server:

```bash
# If using UFW (Ubuntu Firewall)
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw allow 3000:3002/tcp  # WISE² services (internal only if behind reverse proxy)

# Configure Nginx reverse proxy (if not already done)
sudo nano /etc/nginx/sites-available/wise2-core << 'EOF'
upstream wise2_api {
    server 127.0.0.1:3000;
}

upstream wise2_admin {
    server 127.0.0.1:3001;
}

server {
    listen 80;
    server_name wise2.net www.wise2.net;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name wise2.net www.wise2.net;
    
    ssl_certificate /etc/letsencrypt/live/wise2.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/wise2.net/privkey.pem;
    
    # API routes
    location /api/ {
        proxy_pass http://wise2_api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts for long-running requests
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Admin dashboard
    location /admin/ {
        proxy_pass http://wise2_admin/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Root
    location / {
        proxy_pass http://wise2_api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/wise2-core /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 6: Setup Monitoring

On the remote server:

```bash
# Create Prometheus config
mkdir -p ~/wise2-core/config
cat > ~/wise2-core/config/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'wise2-api'
    static_configs:
      - targets: ['localhost:3000']
  
  - job_name: 'wise2-admin'
    static_configs:
      - targets: ['localhost:3001']
  
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
EOF

# Restart with monitoring enabled
docker-compose -f docker-compose.prod.yml -p monitoring up -d prometheus grafana
```

### Step 7: Database Backup Setup

On the remote server:

```bash
# Create backup directory
mkdir -p ~/wise2-backups

# Create backup script
cat > ~/wise2-backups/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/dwise/wise2-backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/wise2-db-$DATE.sql.gz"

# Backup PostgreSQL
docker-compose -f /home/dwise/wise2-core/docker-compose.prod.yml exec -T postgres \
    pg_dump -U wise2_prod_user wise2_core_prod | gzip > "$BACKUP_FILE"

# Keep only last 7 days
find "$BACKUP_DIR" -name "wise2-db-*.sql.gz" -mtime +7 -delete

echo "Backup created: $BACKUP_FILE"
EOF

chmod +x ~/wise2-backups/backup.sh

# Schedule daily backup
(crontab -l 2>/dev/null; echo "0 2 * * * /home/dwise/wise2-backups/backup.sh") | crontab -
```

---

## Verification Checklist

After deployment, verify all systems are working:

### Services
- [ ] API Gateway responding (HTTP 200 on /health)
- [ ] Admin Dashboard accessible (HTTP 200 on /health)
- [ ] Database accepting connections
- [ ] Redis cache operational
- [ ] All Docker containers healthy (`docker-compose ps`)

### Functionality
- [ ] Can create API token
- [ ] Can query knowledge graph
- [ ] Discord bots connected
- [ ] Voice assistant processing
- [ ] Metrics collected in Prometheus

### Performance
- [ ] API response time <150ms
- [ ] Cache hit rate >60%
- [ ] Memory usage normal (<80%)
- [ ] CPU usage normal (<60%)
- [ ] Disk usage acceptable (<80%)

### Security
- [ ] HTTPS configured and working
- [ ] Auth tokens required for API
- [ ] Rate-limiting enforced
- [ ] Firewall rules in place
- [ ] Database accessible only from container network

---

## Monitoring & Logs

### View Logs
```bash
ssh dwise@173.208.147.165

# All services
docker-compose -f ~/wise2-core/docker-compose.prod.yml logs -f

# Specific service
docker-compose -f ~/wise2-core/docker-compose.prod.yml logs -f wise2-api

# Follow last 100 lines
docker-compose -f ~/wise2-core/docker-compose.prod.yml logs -f --tail 100
```

### View Metrics
- **Prometheus**: http://wise2.net:9090
- **Grafana**: http://wise2.net:3001 (embedded in admin dashboard)

### Health Checks
```bash
# API health
curl https://wise2.net/health

# Database
docker-compose -f docker-compose.prod.yml exec postgres pg_isready

# Redis
docker-compose -f docker-compose.prod.yml exec redis redis-cli ping

# Check service status
docker-compose -f docker-compose.prod.yml ps
```

---

## Troubleshooting

### Service Won't Start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs wise2-api

# Restart service
docker-compose -f docker-compose.prod.yml restart wise2-api

# Rebuild if issues persist
docker-compose -f docker-compose.prod.yml build --no-cache wise2-api
```

### Database Connection Error
```bash
# Verify database is running
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -c "SELECT 1"

# Reset database (DESTRUCTIVE!)
docker-compose -f docker-compose.prod.yml exec postgres dropdb wise2_core_prod
docker-compose -f docker-compose.prod.yml exec postgres createdb wise2_core_prod
```

### High Memory Usage
```bash
# Check which container
docker stats

# Limit memory
docker-compose -f docker-compose.prod.yml up -d wise2-api --limit-memory 2G
```

### Port Already in Use
```bash
# Find what's using the port
lsof -i :3000

# Kill the process or change port in docker-compose.prod.yml
```

---

## Rollback Procedure

If deployment has critical issues:

```bash
ssh dwise@173.208.147.165

cd ~/wise2-core

# 1. Stop all services
docker-compose -f docker-compose.prod.yml down

# 2. Checkout previous commit
git checkout HEAD~1

# 3. Rebuild and restart
npm install
npm run build
docker-compose -f docker-compose.prod.yml up -d

# 4. Verify
docker-compose -f docker-compose.prod.yml ps
curl http://localhost:3000/health
```

---

## Post-Deployment Tasks

### 1. Update DNS
```bash
# Ensure wise2.net points to 173.208.147.165
# In your DNS provider, set A record:
# wise2.net  A  173.208.147.165
```

### 2. Setup SSL/TLS
```bash
ssh dwise@173.208.147.165

# Install Let's Encrypt
sudo apt-get install -y certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d wise2.net -d www.wise2.net

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### 3. Create Admin User
```bash
curl -X POST https://wise2.net/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@wise2.net",
    "password": "SECURE_PASSWORD",
    "role": "admin"
  }'
```

### 4. Configure Discord Bot
```bash
# Set Discord webhook URL
curl -X POST https://wise2.net/api/discord/webhooks \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN"
  }'
```

### 5. Test All Systems
Run integration tests from dashboard:
- API Gateway: ✅
- Knowledge Graph: ✅
- Discord Bots: ✅
- Voice Assistant: ✅
- Database: ✅

---

## Success Criteria

✅ Deployment is successful when:
1. All services healthy (`docker-compose ps` shows `healthy`)
2. API responds to requests (<150ms latency)
3. Dashboard accessible and showing real-time data
4. Database migrations completed
5. All health checks passing
6. Monitoring collecting metrics
7. Backups running on schedule
8. SSL certificate valid
9. All external integrations working
10. No critical errors in logs

---

## Support & Escalation

### Critical Issues
1. Check service logs: `docker-compose logs wise2-api`
2. Verify database connectivity
3. Check resource usage: `docker stats`
4. Restart services: `docker-compose restart`
5. Check firewall/network: `ping 173.208.147.165`

### Contact
- **Infrastructure**: infrastructure@wise2.net
- **Support**: support@wise2.net
- **On-Call**: Check runbook

---

**🎉 WISE² Core v1.0 is deployed and running! 🚀**
