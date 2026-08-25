# WISE² Creative Engine — Complete Setup Guide

This document covers setting up and deploying the WISE² Free-First AI Creative Engine.

## Overview

The Creative Engine is an AI generation orchestration system that automatically:
1. Routes requests to the most cost-effective provider
2. Generates content using selected provider
3. Evaluates quality against brand standards
4. Tracks costs and saves money
5. Stores results in asset library

**Stack:**
- Backend: NestJS (`packages/api`)
- Core Logic: TypeScript (`packages/creative-engine`)
- Frontend: Next.js (`apps/command-center`)
- Providers: Kling, Hailuo, ComfyUI (local), OpenAI
- Database: PostgreSQL (via Prisma)

## Architecture

```
User Request (Discord/API/Dashboard)
    ↓
API Controller (packages/api/src/creative)
    ↓
CreativeOrchestrator (Main Logic)
    ├─ ModelRouter (Select Provider)
    ├─ ProviderAdapter (Execute)
    ├─ QualityEvaluator (Validate)
    └─ CreditWallet (Track Cost)
    ↓
Asset Library (Database)
```

## Installation

### 1. Prerequisites

- Node.js 20+
- pnpm 8.15+
- PostgreSQL 14+
- ComfyUI (local GPU setup, optional but recommended)
- API keys for cloud providers (Kling, Hailuo, etc.)

### 2. Install Dependencies

```bash
cd wise2-core
pnpm install
```

### 3. Environment Configuration

Create `.env` in project root:

```bash
# Creative Engine Providers
COMFYUI_URL=http://localhost:8188
COMFYUI_ENABLED=true

KLING_API_KEY=sk_live_xxxxxxxxxxxxx
KLING_ENABLED=true

HAILUO_API_KEY=hailuo_xxxxxxxxxxxxx
HAILUO_ENABLED=true

PIXVERSE_API_KEY=xxxxxxxxxxxxx
PIXVERSE_ENABLED=false

PIKA_API_KEY=xxxxxxxxxxxxx
PIKA_ENABLED=false

OPENAI_API_KEY=sk-xxxxxxxxxxxxx
OPENAI_ENABLED=true

# Quality Settings
QUALITY_THRESHOLD=70  # Minimum acceptable quality score (0-100)
MAX_RETRIES=3         # Retry count before escalating to premium

# Cost Limits (optional)
MAX_MONTHLY_SPEND=100  # Stop generation if monthly spend exceeds this

# Local GPU (ComfyUI)
COMFYUI_VRAM_MONITOR=true
COMFYUI_QUEUE_MONITOR=true

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/wise2_creative
```

### 4. Database Setup

```bash
# Run migrations
pnpm migration:run

# Generate Prisma client
pnpm --filter @wise2/db prisma:generate
```

### 5. Build Packages

```bash
# Build creative-engine package
pnpm --filter @wise2/creative-engine build

# Build all packages
pnpm build
```

### 6. Start Services

**Development:**

```bash
# Terminal 1: ComfyUI (if using local GPU)
cd ~/wise2-core && python -m comfyui.main

# Terminal 2: Backend API
pnpm --filter @wise2/api dev

# Terminal 3: Dashboard
pnpm --filter @wise2/command-center dev

# Terminal 4: Discord bot (if configured)
pnpm --filter @wise2/discord-bot dev
```

**Production:**

```bash
pnpm build
pnpm start
```

## Configuration Details

### Provider Credentials

**Kling:**
1. Go to https://klingai.com/developer
2. Create API key
3. Set `KLING_API_KEY` in environment

**Hailuo:**
1. Go to https://hailuo.ai/console
2. Create API key
3. Set `HAILUO_API_KEY` in environment

**ComfyUI (Local):**
1. Install ComfyUI: https://github.com/comfyanonymous/ComfyUI
2. Start ComfyUI server on port 8188
3. Ensure SDXL model is available: `checkpoints/sd_xl_base_1.0.safetensors`

### Brand Profiles

Define brand assets in database or config:

```typescript
const wise2HvacBrand: BrandAssets = {
  brand: BrandProfile.WISE2_HVAC,
  logos: ['s3://wise2-assets/hvac-logo.png'],
  referenceImages: [
    's3://wise2-assets/hvac-diagnostic-ui.jpg',
    's3://wise2-assets/hvac-field-tech.jpg',
  ],
  colors: ['#000000', '#4a4a4a', '#b0b0b0', '#00a8ff', '#ff6b35'],
  typography: 'Inter, -apple-system, sans-serif',
};
```

## Dashboard Access

### Creative Command Center

```
http://localhost:3000/creative
```

Features:
- **Dashboard** — Real-time monitoring of all systems
- **Generate** — Create new generations with form
- **History** — View past generations and performance
- **Assets** — Brand asset library management

### Monitoring Tabs

**Dashboard Tab:**
- Local GPU status (VRAM, temperature, models)
- Provider status (online/offline, free credits available)
- Generation queue (in-progress jobs)
- Credit wallet (monthly spend, savings)

**Generate Tab:**
- Type selector (image/video/image-to-video)
- Brand profile picker
- Prompt input
- Quality level (draft/standard/premium)
- Submit and track job

## API Endpoints

### Create Generation

```bash
POST /api/v1/creative/generate
Content-Type: application/json

{
  "type": "video",
  "brand": "wise2-hvac",
  "prompt": "HVAC diagnostic system in action",
  "style": "cinematic professional",
  "duration": 30,
  "quality": "standard"
}

Response (202 Accepted):
{
  "id": "job-abc123",
  "status": "queued",
  "progress": 0
}
```

### Get Generation Status

```bash
GET /api/v1/creative/generations/:jobId

Response:
{
  "id": "job-abc123",
  "status": "complete",
  "progress": 100,
  "provider": "kling",
  "estimatedCost": 0.05,
  "actualCost": 0.05,
  "resultsCount": 1,
  "qualityScore": 87,
  "errors": [],
  "createdAt": "2026-08-25T10:30:00Z",
  "completedAt": "2026-08-25T10:35:00Z"
}
```

### Check Credit Status

```bash
GET /api/v1/creative/credits

Response:
{
  "userId": "user-123",
  "totalFreeCredits": 42,
  "totalPaidCredits": 12.50,
  "monthlyCost": 12.50,
  "estimatedRetailValue": 156.75,
  "generationCount": 24,
  "successCount": 23,
  "failedCount": 1,
  "successRate": 96
}
```

### Provider Status

```bash
GET /api/v1/creative/providers/status

Response:
{
  "providers": [
    {
      "name": "local-comfyui",
      "online": true,
      "freeCredits": "unlimited"
    },
    {
      "name": "kling",
      "online": true,
      "freeCredits": 50
    },
    {
      "name": "hailuo",
      "online": true,
      "freeCredits": 30
    }
  ]
}
```

## Discord Integration (Optional)

### Setup Bot

1. Create Discord bot at https://discord.com/developers/applications
2. Copy token to `.env` as `DISCORD_BOT_TOKEN`
3. Invite bot to server with these permissions:
   - Send Messages
   - Use Slash Commands
   - Attach Files

### Available Commands

```
/create-generation
  type: image|video|image-to-video (required)
  brand: wise2-core|wise2-hvac|wise-defense|wise2-soundlab (required)
  prompt: Your generation prompt (required)
  style: Optional style descriptor
  quality: draft|standard|premium (default: standard)
  duration: Duration in seconds (for video, default: 10)

/generation-status <job-id>
  Shows current generation progress and status

/credit-balance
  Shows your credit wallet and monthly spend

/provider-status
  Shows all provider availability and credits
```

### Example

```
/create-generation 
  type: video
  brand: wise2-hvac
  prompt: HVAC technician diagnosing a residential system
  style: photorealistic instructional video
  quality: standard
  duration: 30

→ "✅ Generation job job-abc123 queued! (Estimated: $0.05 via Kling)"
```

## Monitoring & Health Checks

### Dashboard Metrics

Access at `http://localhost:3000/creative`:
- GPU utilization and temperature
- Provider uptime and credit availability
- Queue depth and estimated completion times
- Monthly cost trends

### API Health

```bash
GET /api/v1/creative/health

Response:
{
  "status": "ok",
  "providers": {
    "comfyui": "online",
    "kling": "online",
    "hailuo": "online"
  },
  "uptime": "72h 15m"
}
```

### Logging

Logs go to:
- Console (development)
- `logs/creative-engine.log` (production)
- `logs/provider-errors.log` (API failures)

Set log level in `.env`:
```
LOG_LEVEL=debug|info|warn|error
```

## Scaling

### Horizontal Scaling (Multiple Instances)

The system supports multiple API instances behind a load balancer:

```yaml
# docker-compose.yml
api-1:
  image: wise2/api:latest
  environment:
    INSTANCE_ID: 1

api-2:
  image: wise2/api:latest
  environment:
    INSTANCE_ID: 2

load-balancer:
  image: nginx:latest
  ports:
    - "3000:80"
  upstream api {
    server api-1:3000;
    server api-2:3000;
  }
```

### Local GPU Scaling

For multiple GPUs on same machine:
```bash
COMFYUI_QUEUE_WORKERS=4  # Use 4 worker threads
COMFYUI_CUDA_DEVICES=0,1  # Use GPUs 0 and 1
```

## Troubleshooting

### ComfyUI Connection Failed

```
Error: ECONNREFUSED 127.0.0.1:8188
```

**Solution:**
1. Ensure ComfyUI is running: `python -m comfyui.main`
2. Check port: `lsof -i :8188`
3. Verify `COMFYUI_URL` in `.env` matches actual address

### Out of Free Credits

```
Error: Kling free credits exhausted
```

**Solution:**
1. Check Kling account for credit reset date (usually monthly)
2. Temporarily use paid tier or another provider
3. Use local GPU (ComfyUI) for drafts/testing

### Quality Score Too Low

Generation output doesn't meet commercial quality threshold.

**Solution:**
1. Improve prompt specificity and detail
2. Add style descriptors (cinematic, professional, etc.)
3. Lower quality threshold in `.env` temporarily
4. Retry with different provider

### GPU Memory Full

```
Error: CUDA out of memory
```

**Solution:**
1. Reduce batch size: `COMFYUI_BATCH_SIZE=1`
2. Use smaller model: `COMFYUI_MODEL=sdxl-turbo`
3. Close other GPU processes
4. Scale to additional GPU

## Performance Tuning

### Fast Generation Mode

```bash
# Use draft models for speed
COMFYUI_MODEL=sdxl-turbo
QUALITY_THRESHOLD=50
```

### High Quality Mode

```bash
# Use premium models for quality
QUALITY_THRESHOLD=85
USE_PREMIUM_UPSCALING=true
```

### Cost Optimization

```bash
# Strict cost controls
MAX_MONTHLY_SPEND=50
PREFER_LOCAL_GPU=true
SKIP_PREMIUM_RETRIES=true
```

## Production Checklist

- [ ] All environment variables set in `.env.production`
- [ ] Database backed up and replicated
- [ ] API keys secured in secrets manager (not `.env`)
- [ ] ComfyUI running with auto-restart enabled
- [ ] Monitoring and alerting configured
- [ ] Discord bot invited to server (if using)
- [ ] Subdomain configured for dashboard access
- [ ] HTTPS/SSL configured for API
- [ ] Rate limiting enabled on endpoints
- [ ] Backup/restore procedures documented

## Support

For issues:
1. Check logs: `tail -f logs/creative-engine.log`
2. Check provider status: `GET /api/v1/creative/providers/status`
3. Visit docs: `docs/CREATIVE_ENGINE_SETUP.md`
4. Open issue: https://github.com/dwise03-bit/wise2-core/issues

## Next Steps

1. **Deploy to production** — Run full test suite before deploy
2. **Set up monitoring** — Alert on generation failures and cost spikes
3. **Integrate with existing workflow** — Link asset library to marketing tools
4. **Train team** — Show dashboard and Discord commands to users
5. **Optimize costs** — Monitor monthly spend and adjust thresholds
