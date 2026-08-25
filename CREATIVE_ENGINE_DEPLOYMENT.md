# WISE² Creative Engine — Deployment Guide

## Quick Start (5 minutes)

The Creative Engine is already integrated into your codebase. Deploy with existing infrastructure:

```bash
# On production server (173.208.147.165)
cd /home/dwise/wise2-core

# 1. Update code
git pull origin main

# 2. Update docker-compose.prod.yml with creative services
# (See "Adding to Docker Compose" below)

# 3. Rebuild and deploy
sudo docker-compose -f docker-compose.prod.yml down
sudo docker-compose -f docker-compose.prod.yml up -d --build

# 4. Verify
sudo docker-compose -f docker-compose.prod.yml ps
curl http://localhost:3000/api/v1/creative/providers/status
curl http://localhost:3003/creative  # Command center dashboard
```

## Architecture

The Creative Engine integrates into existing WISE² stack:

```
User
  ↓
nginx (reverse proxy)
  ├─ /api/v1/creative → API (port 3010)
  └─ /creative → Dashboard (port 3003)
  ↓
API Service (packages/api)
  ├─ CreativeModule (new)
  └─ CreativeController → CreativeOrchestrator
  ↓
@wise2/creative-engine (core logic)
  └─ Provider Adapters → Kling, Hailuo, ComfyUI
  ↓
Database (PostgreSQL)
```

## Adding to Docker Compose

Update `docker-compose.prod.yml` to include Creative Engine services:

### 1. Command Center Service

Add this to the `services:` section:

```yaml
  # Creative Command Center Dashboard
  creative-dashboard:
    build:
      context: .
      dockerfile: apps/command-center/Dockerfile
    image: wise2-creative-dashboard:latest
    container_name: wise2-creative-dashboard
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 3003
      HOSTNAME: 0.0.0.0
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:-https://api.wise2.net}
      NEXT_PUBLIC_CREATIVE_API: ${NEXT_PUBLIC_CREATIVE_API:-https://api.wise2.net/api/v1/creative}
    ports:
      - "127.0.0.1:3003:3003"
    depends_on:
      - api
    networks:
      - wise2
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://127.0.0.1:3003/creative', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### 2. API Environment Variables

Add to your `.env.production`:

```bash
# Creative Engine Providers
COMFYUI_URL=http://172.17.0.1:8188
COMFYUI_ENABLED=true

KLING_API_KEY=sk_live_xxxxxxxxxxxxx
KLING_ENABLED=true

HAILUO_API_KEY=hailuo_xxxxxxxxxxxxx
HAILUO_ENABLED=true

OPENAI_API_KEY=sk-xxxxxxxxxxxxx
OPENAI_ENABLED=true

# Quality Settings
QUALITY_THRESHOLD=70
MAX_RETRIES=3

# Cost Controls (optional)
MAX_MONTHLY_SPEND=100

# Creative Engine Database
CREATIVE_DATABASE_URL=postgresql://wise2:${DATABASE_PASSWORD:-wise2}@postgres:5432/wise2_prod
```

### 3. Update API Dockerfile

Ensure `Dockerfile.api` includes creative-engine package in build:

```dockerfile
# ... existing content ...
FROM node:20-alpine

WORKDIR /app

# Copy entire monorepo
COPY . .

# Install dependencies
RUN npm install -g pnpm@8.15.9
RUN pnpm install

# Build packages
RUN pnpm --filter @wise2/creative-engine build
RUN pnpm --filter @wise2/api build

CMD ["node", "dist/main.js"]
```

### 4. Update nginx.conf

Add routing for creative API and dashboard:

```nginx
# Inside upstream api block (existing)
upstream creative_api {
    server api:3000;
}

upstream creative_dashboard {
    server creative-dashboard:3003;
}

# Add to server block (port 80)
# Creative Engine API
location /api/v1/creative/ {
    proxy_pass http://creative_api;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# Creative Dashboard
location /creative {
    proxy_pass http://creative_dashboard;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## Database Migrations

The Creative Engine needs database tables for job tracking and credit wallet:

```bash
# 1. Create migrations in packages/db/prisma/migrations/
cd packages/db

# 2. Run migrations
pnpm prisma migrate deploy

# 3. Verify schema
pnpm prisma db push
```

**Required Prisma Schema** (add to `schema.prisma`):

```prisma
model Generation {
  id                String    @id @default(cuid())
  userId            String
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  requestType       String
  brand             String
  prompt            String    @db.Text
  provider          String
  
  status            String    @default("queued")
  progress          Int       @default(0)
  qualityScore      Int       @default(0)
  
  estimatedCost     Float     @default(0)
  actualCost        Float     @default(0)
  
  resultUrl         String?
  resultMetadata    Json?
  
  errors            String[]
  
  createdAt         DateTime  @default(now())
  completedAt       DateTime?
  
  @@index([userId])
  @@index([status])
  @@index([provider])
}

model CreditWallet {
  id                    String    @id @default(cuid())
  userId                String    @unique
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  totalFreeCredits      Int       @default(0)
  totalPaidCredits      Float     @default(0)
  monthlyCost           Float     @default(0)
  estimatedRetailValue  Float     @default(0)
  
  generationCount       Int       @default(0)
  successCount          Int       @default(0)
  failedCount           Int       @default(0)
  
  lastReset             DateTime  @default(now())
  lastUpdated           DateTime  @updatedAt
  
  @@index([userId])
}

model BrandAsset {
  id            String    @id @default(cuid())
  brand         String
  assetType     String    // "logo" | "reference" | "template" | "approved"
  name          String
  url           String
  description   String?
  metadata      Json?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([brand])
  @@index([assetType])
}
```

## Deployment Steps

### Step 1: Prepare Code

```bash
cd /home/dwise/wise2-core
git pull origin claude/wise2-creative-engine-sw4nih

# Merge to main
git checkout main
git merge claude/wise2-creative-engine-sw4nih
git push origin main
```

### Step 2: Update Configuration

```bash
# Copy production environment template
cp .env .env.production

# Edit with provider keys
nano .env.production
# Add: KLING_API_KEY, HAILUO_API_KEY, COMFYUI_URL, etc.
```

### Step 3: Update Docker Compose

Edit `docker-compose.prod.yml`:
- Add `creative-dashboard` service (see above)
- Update `api` dependencies to include creative-dashboard
- Ensure all environment variables are set

### Step 4: Update nginx

```bash
# Backup existing config
cp nginx.conf nginx.conf.backup

# Update with creative routes (see nginx.conf section above)
nano nginx.conf
```

### Step 5: Run Migrations

```bash
# If running migrations in container:
sudo docker-compose -f docker-compose.prod.yml exec api pnpm --filter @wise2/db prisma migrate deploy
```

### Step 6: Deploy

```bash
# Navigate to project
cd /home/dwise/wise2-core

# Stop existing services
sudo docker-compose -f docker-compose.prod.yml down

# Build and start
sudo docker-compose -f docker-compose.prod.yml up -d --build

# Wait 30 seconds for services to start
sleep 30

# Check status
sudo docker-compose -f docker-compose.prod.yml ps

# Check logs
sudo docker-compose -f docker-compose.prod.yml logs -f creative-dashboard
sudo docker-compose -f docker-compose.prod.yml logs -f api
```

### Step 7: Verify Deployment

```bash
# API health
curl https://wise2.net/api/v1/creative/providers/status

# Dashboard access
curl -L https://wise2.net/creative

# Check specific endpoints
curl https://wise2.net/api/v1/creative/health
curl https://wise2.net/api/v1/creative/credits
```

## Environment Variables Reference

```bash
# Providers
COMFYUI_URL=http://localhost:8188              # Local GPU URL
COMFYUI_ENABLED=true                           # Enable/disable
COMFYUI_VRAM_MONITOR=true                      # Monitor VRAM usage

KLING_API_KEY=sk_live_xxxxx                    # Kling video API key
KLING_ENABLED=true

HAILUO_API_KEY=hailuo_xxxxx                    # Hailuo video API key
HAILUO_ENABLED=true

OPENAI_API_KEY=sk-xxxxx                        # OpenAI API key
OPENAI_ENABLED=true

# Quality & Cost Control
QUALITY_THRESHOLD=70                           # Min quality score (0-100)
MAX_RETRIES=3                                  # Retries before failing
MAX_MONTHLY_SPEND=100                          # Optional cost limit ($)

# Dashboard
NEXT_PUBLIC_API_URL=https://api.wise2.net
NEXT_PUBLIC_CREATIVE_API=https://api.wise2.net/api/v1/creative

# Logging
LOG_LEVEL=info                                 # debug|info|warn|error
```

## Production Checklist

- [ ] API keys obtained from all providers
- [ ] Environment variables configured in `.env.production`
- [ ] Database migrations created and tested locally
- [ ] Docker images built successfully
- [ ] nginx configuration updated and validated
- [ ] docker-compose.prod.yml updated with creative services
- [ ] Health checks passing for all services
- [ ] API endpoints responding correctly
- [ ] Dashboard accessible at /creative route
- [ ] Logs reviewed for errors
- [ ] Monitoring configured (optional)
- [ ] Backup created before deployment

## Rollback Plan

If deployment fails:

```bash
# Stop new deployment
sudo docker-compose -f docker-compose.prod.yml down

# Restore previous code
git checkout HEAD~1

# Rebuild previous version
sudo docker-compose -f docker-compose.prod.yml up -d --build

# Restore previous nginx config if changed
cp nginx.conf.backup nginx.conf
sudo docker-compose -f docker-compose.prod.yml restart nginx
```

## Monitoring After Deployment

### View Logs

```bash
# All services
sudo docker-compose -f docker-compose.prod.yml logs -f

# Just creative services
sudo docker-compose -f docker-compose.prod.yml logs -f creative-dashboard api
```

### Health Checks

```bash
# API health
curl https://wise2.net/api/v1/creative/health

# Provider status
curl https://wise2.net/api/v1/creative/providers/status

# Sample generation request (for testing)
curl -X POST https://wise2.net/api/v1/creative/generate \
  -H "Content-Type: application/json" \
  -d '{
    "type": "image",
    "brand": "wise2-core",
    "prompt": "WISE² logo",
    "quality": "draft"
  }'
```

### Monitor Resource Usage

```bash
# Docker stats
sudo docker stats wise2-api wise2-creative-dashboard wise2-db

# Disk space
df -h /home/dwise/wise2-core

# Memory on server
free -h
```

## Support

**If something fails:**

1. Check logs: `sudo docker-compose logs creative-dashboard`
2. Check provider status: `curl https://wise2.net/api/v1/creative/providers/status`
3. Verify env vars: `sudo docker-compose -f docker-compose.prod.yml exec api env | grep CREATIVE`
4. Restart service: `sudo docker-compose restart creative-dashboard`

**For issues:**
- Review CREATIVE_ENGINE_SETUP.md for detailed setup
- Check CREATIVE_ENGINE_IMPLEMENTATION.md for what's implemented
- Review packages/creative-engine/README.md for integration details
