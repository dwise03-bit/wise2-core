# WISE² FULL STACK SETUP — LOCAL & PRODUCTION

**Status:** Complete setup guide for all 20+ services across local development and production VPS  
**Target Deployment:** Local Mac + Production VPS (173.208.147.165)  
**Estimated Time:** 30 min (local), 60 min (production)

---

## PHASE 1: LOCAL DEVELOPMENT SETUP

### Step 1.1: Environment Configuration

```bash
cd /Users/danielwise/Projects/wise2-core

# Copy environment files
cp .env.example .env.local
cp .env.local .env  # Use local for development

# Edit .env with your settings
nano .env
```

**Required .env variables (LOCAL):**
```env
# Database
DB_USER=wise2_local
DB_PASSWORD=wise2_local_dev_password
DB_NAME=wise2_core_dev
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_PASSWORD=wise2_redis_dev_password
REDIS_URL=redis://:wise2_redis_dev_password@localhost:6379

# MongoDB
MONGODB_PASSWORD=admin-dev-password
MONGODB_URL=mongodb://admin:admin-dev-password@localhost:27017/wise2-brain

# API Configuration
API_URL=http://localhost:3001
API_PORT=3001
NODE_ENV=development

# JWT & Auth
JWT_SECRET=your-local-dev-jwt-secret-key-change-in-production
JWT_EXPIRATION=86400

# OAuth (optional for local dev)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Stripe (optional)
STRIPE_API_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# OpenAI/Claude API (optional, falls back to Ollama)
OPENAI_API_KEY=sk_your_key
ANTHROPIC_API_KEY=sk_ant_your_key

# Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral

# Phone Service (optional)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
```

### Step 1.2: Start Docker Services (Infrastructure)

```bash
# Start only database + infrastructure (fastest)
docker-compose -f docker-compose.infra-only.yml up -d

# OR start all services including API (complete setup)
docker-compose up -d

# Monitor startup
docker-compose logs -f

# Verify all services are healthy
docker-compose ps
# Status should show "healthy" for postgres, redis, mongodb, ollama
```

**Expected Services Running (Local):**
```
wise2-postgres    5432  ✓ Healthy
wise2-redis       6379  ✓ Healthy
wise2-mongodb     27017 ✓ Healthy
wise2-ollama      11434 ✓ (Optional, downloading model on first start)
```

### Step 1.3: Database Initialization

```bash
# Run Prisma migrations
cd packages/db
pnpm prisma migrate deploy

# Seed database with sample data (optional)
pnpm prisma db seed

# Verify schema
pnpm prisma studio  # Opens web UI at http://localhost:5555
```

### Step 1.4: Start Backend Services

**Terminal 1 - Platform API:**
```bash
cd packages/api
pnpm install
pnpm dev
# Listens on http://localhost:3001
# GraphQL playground: http://localhost:3001/graphql
```

**Terminal 2 - Worker Service (background jobs):**
```bash
cd services/worker
npm install
npm start
# Processes Redis job queue
```

**Terminal 3 - Second Brain API (RAG/Knowledge):**
```bash
cd second-brain
npm install
npm start
# Listens on http://localhost:3012
```

### Step 1.5: Start Frontend Applications

**Terminal 4 - Website (Marketing/Landing):**
```bash
cd apps/website
pnpm dev
# http://localhost:3001 (after API starts)
```

**Terminal 5 - Dashboard (Analytics):**
```bash
cd apps/dashboard
pnpm dev
# http://localhost:3002
```

**Terminal 6 - Command Center (Real-time Monitoring):**
```bash
cd apps/command-center
pnpm dev
# http://localhost:3004
```

**Terminal 7 - Studio (Creative Suite):**
```bash
cd apps/studio
pnpm dev
# http://localhost:3005
```

### Step 1.6: Verify Local Setup

**Quick Health Check:**
```bash
# Check all services
curl http://localhost:3001/health     # API
curl http://localhost:3002/           # Dashboard (will redirect to login)
curl http://localhost:3004/           # Command Center
curl http://localhost:3005/           # Studio
curl http://localhost:3012/health     # Second Brain API

# Check databases
psql -U wise2_local -d wise2_core_dev -h localhost
mongo --username admin --password admin-dev-password --authenticationDatabase admin localhost:27017/wise2-brain
redis-cli -a wise2_redis_dev_password PING
```

**Expected Outputs:**
```
API /health:           {"status":"ok","database":"connected"}
Databases:             All return pong/ping responses
Services:              All return 200 status with HTML/JSON
```

---

## PHASE 2: PRODUCTION DEPLOYMENT (VPS)

### Step 2.1: VPS Preparation

**On your VPS (173.208.147.165):**

```bash
# SSH into VPS
ssh dwise@173.208.147.165

# Verify Docker is installed
docker --version
docker-compose --version

# Create deployment directory
mkdir -p /var/wise2
cd /var/wise2

# Clone or pull latest code
git clone https://github.com/yourusername/wise2-core.git .
# OR if already cloned:
git pull origin main
```

### Step 2.2: Production Environment Configuration

**On VPS:**

```bash
# Copy production env template
cp .env.production.example .env.production

# Edit with production secrets
nano .env.production
```

**Required .env.production variables:**
```env
# Domain & SSL
DOMAIN=wise2.net
API_DOMAIN=api.wise2.net
SSL_CERT_PATH=/etc/letsencrypt/live/wise2.net/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/wise2.net/privkey.pem

# Database (Production)
DB_USER=wise2_prod_user
DB_PASSWORD=STRONG_RANDOM_PASSWORD_HERE
DB_NAME=wise2_prod
DB_HOST=postgres  # Docker service name
DB_PORT=5432

# Redis (Production)
REDIS_PASSWORD=STRONG_REDIS_PASSWORD_HERE
REDIS_URL=redis://:STRONG_REDIS_PASSWORD_HERE@redis:6379

# MongoDB (Production)
MONGODB_PASSWORD=STRONG_MONGODB_PASSWORD_HERE
MONGODB_URL=mongodb://admin:STRONG_MONGODB_PASSWORD_HERE@mongodb:27017/wise2-prod?authSource=admin

# API Configuration
API_URL=https://api.wise2.net
API_PORT=3001
NODE_ENV=production

# JWT & Security
JWT_SECRET=VERY_LONG_RANDOM_JWT_SECRET_MINIMUM_32_CHARS
JWT_EXPIRATION=604800  # 7 days

# OAuth (Production credentials)
GOOGLE_CLIENT_ID=your-prod-google-client-id
GOOGLE_CLIENT_SECRET=your-prod-google-client-secret
GITHUB_CLIENT_ID=your-prod-github-client-id
GITHUB_CLIENT_SECRET=your-prod-github-client-secret

# Stripe (Production)
STRIPE_API_KEY=sk_live_your_stripe_live_key
STRIPE_WEBHOOK_SECRET=whsec_your_prod_webhook_secret

# AI Services
OPENAI_API_KEY=sk_your_prod_key
ANTHROPIC_API_KEY=sk_ant_your_prod_key
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=mistral

# Phone Service (Production)
TWILIO_ACCOUNT_SID=your_prod_twilio_sid
TWILIO_AUTH_TOKEN=your_prod_twilio_token

# Logging & Monitoring
LOG_LEVEL=info
SENTRY_DSN=your-sentry-dsn
DATADOG_API_KEY=your-datadog-key

# Email Service
SENDGRID_API_KEY=your-sendgrid-key
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-key

# Database Backups
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *  # Daily at 2 AM UTC
BACKUP_RETENTION_DAYS=30
```

### Step 2.3: SSL Certificate Setup

```bash
# Install Let's Encrypt certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx -y

# Generate SSL certificates
sudo certbot certonly --standalone -d wise2.net -d api.wise2.net

# Certificate paths will be:
# /etc/letsencrypt/live/wise2.net/fullchain.pem
# /etc/letsencrypt/live/wise2.net/privkey.pem

# Auto-renewal (cron)
sudo certbot renew --dry-run  # Test first
```

### Step 2.4: Deploy with Docker Compose (Production)

```bash
# On VPS
cd /var/wise2

# Use production docker-compose
docker-compose -f docker-compose.production.yml up -d

# Monitor deployment
docker-compose -f docker-compose.production.yml logs -f

# Verify all services are running
docker-compose -f docker-compose.production.yml ps
```

**Expected Production Services:**
```
wise2-postgres       5432  ✓ Healthy
wise2-redis         6379  ✓ Healthy
wise2-mongodb       27017 ✓ Healthy
wise2-ollama        11434 ✓ Healthy
wise2-api           3001  ✓ Running
wise2-website       3001  ✓ Running (behind nginx)
wise2-dashboard     3002  ✓ Running (behind nginx)
wise2-command-center 3004  ✓ Running (behind nginx)
wise2-studio        3005  ✓ Running (behind nginx)
wise2-worker        (bg)  ✓ Running
wise2-nginx         80,443 ✓ Running
```

### Step 2.5: Nginx Configuration

**Nginx Reverse Proxy Setup:**

```bash
# Copy Nginx config
sudo cp infrastructure/config/nginx.conf /etc/nginx/sites-available/wise2

# Enable site
sudo ln -s /etc/nginx/sites-available/wise2 /etc/nginx/sites-enabled/wise2

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

**Expected Nginx Routing:**
```
wise2.net          → Container (3001) / Website
api.wise2.net      → Container (3001) / API
dashboard.wise2.net → Container (3002) / Dashboard
command.wise2.net  → Container (3004) / Command Center
studio.wise2.net   → Container (3005) / Studio
```

### Step 2.6: Database Backup & Restore

```bash
# Create backup directory
mkdir -p /var/wise2/backups

# Backup PostgreSQL
docker-compose exec postgres pg_dump -U wise2_prod_user wise2_prod > /var/wise2/backups/postgres_backup_$(date +%Y%m%d_%H%M%S).sql

# Backup MongoDB
docker-compose exec mongodb mongodump --username admin --password $MONGODB_PASSWORD --authenticationDatabase admin --out /var/wise2/backups/mongo_backup_$(date +%Y%m%d_%H%M%S)

# Set up automated backups (crontab)
crontab -e
# Add:
# 0 2 * * * cd /var/wise2 && docker-compose exec postgres pg_dump -U wise2_prod_user wise2_prod > backups/postgres_$(date +\%Y\%m\%d).sql
```

### Step 2.7: Health Monitoring

```bash
# Set up health checks script
cat > /var/wise2/health-check.sh << 'EOF'
#!/bin/bash
API_URL="https://api.wise2.net"
DASHBOARD_URL="https://dashboard.wise2.net"

echo "Checking API..."
curl -s $API_URL/health | jq '.'

echo "Checking Database..."
docker-compose exec postgres pg_isready -U wise2_prod_user

echo "Checking Redis..."
docker-compose exec redis redis-cli PING

echo "Checking All Containers..."
docker-compose ps
EOF

chmod +x /var/wise2/health-check.sh

# Run health check
/var/wise2/health-check.sh

# Schedule periodic checks (every 5 minutes)
(crontab -l; echo "*/5 * * * * /var/wise2/health-check.sh") | crontab -
```

### Step 2.8: Deployment Automation

**Create deployment script:**

```bash
cat > /var/wise2/deploy.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 WISE² Deployment Starting..."

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Update environment
echo "⚙️  Loading environment..."
source .env.production

# Build images
echo "🔨 Building Docker images..."
docker-compose -f docker-compose.production.yml build

# Stop old containers
echo "🛑 Stopping old services..."
docker-compose -f docker-compose.production.yml down

# Start new services
echo "▶️  Starting services..."
docker-compose -f docker-compose.production.yml up -d

# Run migrations
echo "🔄 Running database migrations..."
docker-compose exec api npx prisma migrate deploy

# Wait for services to be healthy
echo "⏳ Waiting for services to stabilize..."
sleep 30

# Run health checks
echo "✅ Running health checks..."
./health-check.sh

echo "🎉 Deployment Complete!"
EOF

chmod +x /var/wise2/deploy.sh
```

**Deploy:**
```bash
/var/wise2/deploy.sh
```

---

## PHASE 3: POST-DEPLOYMENT VERIFICATION

### 3.1: Test All Services

**Local Testing:**
```bash
# API Health
curl http://localhost:3001/health

# Database Connection
npm run db:check  # from packages/api

# Run test suite
pnpm test

# E2E tests
pnpm test:e2e
```

**Production Testing:**
```bash
# From your local machine
curl https://api.wise2.net/health
curl https://wise2.net/
curl https://dashboard.wise2.net/
curl https://command.wise2.net/
curl https://studio.wise2.net/

# Check SSL certificate
openssl s_client -connect wise2.net:443

# Monitor logs on VPS
ssh dwise@173.208.147.165
cd /var/wise2
docker-compose logs -f
```

### 3.2: Initialize Admin User (Production)

```bash
# On VPS, create first admin
docker-compose exec api npx ts-node scripts/create-admin.ts --email admin@wise2.net --password STRONG_PASSWORD

# Or via API
curl -X POST https://api.wise2.net/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@wise2.net",
    "password": "STRONG_PASSWORD",
    "name": "Admin"
  }'
```

### 3.3: Enable Services Monitoring

```bash
# Prometheus (metrics)
# Access at http://localhost:9090 (local) or https://prometheus.wise2.net (prod)

# Grafana (dashboards)
# Access at http://localhost:3003 (local) or https://grafana.wise2.net (prod)

# Set up alerts
# Configure alerting rules in infrastructure/config/prometheus.yml
```

---

## TROUBLESHOOTING

### Docker Issues

```bash
# Clean up all containers (WARNING: loses data)
docker-compose down -v

# Restart Docker daemon
sudo systemctl restart docker

# Check Docker logs
docker logs <container-name>

# Exec into container
docker-compose exec <service> /bin/bash
```

### Database Issues

```bash
# Reconnect PostgreSQL
docker-compose exec postgres pg_isready
docker-compose restart postgres

# Reset database (LOCAL ONLY - WARNING: DATA LOSS)
docker volume rm wise2-core_postgres_data
docker-compose up -d postgres
cd packages/db && pnpm prisma migrate deploy
```

### Network Issues

```bash
# Check network connectivity
docker network ls
docker network inspect wise2-network

# Test service-to-service communication
docker-compose exec api ping redis
docker-compose exec api ping postgres
```

---

## MAINTENANCE SCHEDULE

| Task | Frequency | Command |
|------|-----------|---------|
| Database Backup | Daily (2 AM) | `./backups/backup.sh` |
| SSL Renewal | Auto (certbot) | `certbot renew` |
| Update Dependencies | Weekly | `pnpm update` |
| Security Patches | As needed | `docker pull` + redeploy |
| Health Checks | Every 5 min | `./health-check.sh` |
| Database Optimization | Monthly | `VACUUM; ANALYZE;` |
| Log Rotation | Daily | `logrotate` |

---

## QUICK COMMANDS REFERENCE

```bash
# LOCAL DEVELOPMENT
docker-compose up -d              # Start all services
docker-compose down               # Stop all services
docker-compose logs -f            # Follow logs
npm run dev                        # Start dev servers (turbo)
pnpm prisma studio                # Database UI

# PRODUCTION DEPLOYMENT
/var/wise2/deploy.sh               # Full deployment
docker-compose -f docker-compose.production.yml ps  # Status
docker-compose -f docker-compose.production.yml logs -f  # Logs
/var/wise2/health-check.sh         # Health check

# DATABASE
pnpm prisma migrate deploy        # Run migrations
pnpm prisma db seed                # Seed data
pnpm prisma studio                 # Web UI

# TESTING
pnpm test                          # Unit tests
pnpm test:e2e                      # E2E tests
npm run db:check                   # DB connection test
```

---

**Setup Complete!** All 20+ WISE² services are now integrated and ready for local development + production deployment.
