# WISE² Enterprise - API Integrations & Services

**Last Updated**: 2026-07-11  
**Status**: 15 Services Registered | 5 Active | 8 Template | 2 Missing

---

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Active Integrations](#active-integrations)
3. [Template Integrations (Phase 2+)](#template-integrations)
4. [Configuration & Setup](#configuration--setup)
5. [Health Checks & Monitoring](#health-checks--monitoring)
6. [API Manager Endpoints](#api-manager-endpoints)
7. [Security Audit](#security-audit)
8. [Deployment Checklist](#deployment-checklist)

---

## Quick Reference

### Dashboard: Service Status

| Service | Category | Status | Phase | Credentials |
|---------|----------|--------|-------|-------------|
| **Anthropic Claude** | AI | ✅ Active | Phase 1 | `CLAUDE_API_KEY` |
| **PostgreSQL 15** | Database | ✅ Active | Phase 1 | `DB_*` (5 vars) |
| **Redis 7** | Database | ✅ Active | Phase 1 | `REDIS_URL` |
| **Discord Bot** | Communication | ✅ Active | Phase 1 | `DISCORD_BOT_TOKEN`, `DISCORD_GUILD_ID`, `ADMIN_ID` |
| **Prometheus** | Monitoring | ✅ Active | Phase 1 | None (internal) |
| **Ollama Local** | AI | ⚠️ Optional | Phase 1 | `OLLAMA_API_URL` |
| **Grafana** | Monitoring | ✅ Configured | Phase 1 | None (admin/admin) |
| **Email (Resend)** | Communication | ⚠️ Template | Phase 2 | `RESEND_API_KEY` |
| **Email (SendGrid)** | Communication | ⚠️ Template | Phase 2 | `SENDGRID_API_KEY` |
| **Stripe Payments** | Payment | ⚠️ Template | Phase 2 | `STRIPE_*` (3 keys) |
| **YouTube API** | Media | ⚠️ Template | Phase 2+ | `YOUTUBE_API_KEY` |
| **Twitch API** | Media | ⚠️ Template | Phase 2+ | `TWITCH_CLIENT_*` (2 keys) |
| **GitHub Integration** | Developer | ⚠️ Partial | Phase 1+ | `GITHUB_TOKEN` |
| **OpenAI API** | AI | ⚠️ Optional | Phase 2 | `OPENAI_API_KEY` |
| **PostHog Analytics** | Analytics | ⚠️ Optional | Phase 2 | `NEXT_PUBLIC_POSTHOG_KEY` |

---

## Active Integrations

### 1. Anthropic Claude API (AI)

**Status**: ✅ Production Ready  
**Phase**: Phase 1  
**Purpose**: Advanced language model for intelligent features

#### Configuration

```bash
# Environment Variable
CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxx

# Optional
CLAUDE_API_MODEL=claude-3-5-sonnet-20241022
CLAUDE_API_TIMEOUT=30000
```

#### Usage

```typescript
// In any NestJS service
import { Anthropic } from '@anthropic-ai/sdk'

constructor(private configService: ConfigService) {}

async askClaude(prompt: string) {
  const client = new Anthropic({
    apiKey: this.configService.get('CLAUDE_API_KEY'),
  })

  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  return message
}
```

#### Health Check

```bash
# Via API Manager
curl http://localhost:3000/api/v1/system/apis/claude

# Response
{
  "service": "claude",
  "name": "Anthropic Claude API",
  "status": "active",
  "credentials": [
    {
      "name": "API Key",
      "status": "active",
      "required": true,
      "validated": true
    }
  ]
}
```

---

### 2. PostgreSQL 15 Database

**Status**: ✅ Production Ready  
**Phase**: Phase 1  
**Purpose**: Primary relational database

#### Configuration

```bash
# Direct Connection
DATABASE_URL=postgresql://wise2:password@postgres:5432/wise2

# Or Individual Variables
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=wise2
DB_PASSWORD=secure_password_here
DB_NAME=wise2
```

#### Features

- ✅ TypeORM with auto-sync (development only)
- ✅ UUID primary keys
- ✅ Automatic timestamps (createdAt, updatedAt)
- ✅ Full-text search support
- ✅ JSON column support

#### Health Check

```bash
docker-compose exec postgres pg_isready -U wise2
# Expected: "accepting connections"
```

---

### 3. Redis 7 Cache & Queue

**Status**: ✅ Production Ready  
**Phase**: Phase 1  
**Purpose**: In-memory cache, message queue, session store

#### Configuration

```bash
# Connection
REDIS_URL=redis://:password@redis:6379
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=redis-dev

# Optional
REDIS_DB=0
```

#### Features

- ✅ Caching layer for API responses
- ✅ Message queue for background jobs
- ✅ Real-time event subscriptions
- ✅ Session storage
- ✅ Rate limiting

#### Health Check

```bash
docker-compose exec redis redis-cli ping
# Expected: "PONG"
```

---

### 4. Discord Bot (Communication)

**Status**: ✅ Production Ready  
**Phase**: Phase 1  
**Purpose**: Admin bot for alerts, monitoring, and commands

#### Configuration

```bash
# Required
DISCORD_BOT_TOKEN=NzExNzk3...
DISCORD_GUILD_ID=1234567890123456789
ADMIN_ID=987654321

# Optional
DISCORD_LOG_CHANNEL=log_channel_id
```

#### Commands

- `!status` — System health status
- `!update` — Pull and deploy latest code
- `!restart` — Restart services
- `!logs` — Stream service logs

#### Setup

1. Create Discord server
2. Create Discord bot at https://discord.com/developers/applications
3. Add bot to server with Administrator permissions
4. Copy bot token to `DISCORD_BOT_TOKEN`
5. Get server ID and add to `DISCORD_GUILD_ID`

---

### 5. Prometheus Monitoring

**Status**: ✅ Production Ready  
**Phase**: Phase 1  
**Purpose**: Metrics collection and monitoring

#### Configuration

```bash
# Internal (no credentials needed)
PROMETHEUS_ENABLED=true
PROMETHEUS_PORT=9090
PROMETHEUS_SCRAPE_INTERVAL=15s
```

#### Access

```
Local: http://localhost:9090
Endpoints:
  - Metrics: /metrics
  - Health: /-/healthy
  - Ready: /-/ready
```

#### Key Metrics

- `http_requests_total` — Total HTTP requests
- `http_request_duration_seconds` — Request latency
- `process_memory_bytes` — Memory usage
- `process_cpu_seconds_total` — CPU time

---

### 6. Grafana Dashboards

**Status**: ✅ Configured  
**Phase**: Phase 1  
**Port**: 3003 (fixed from 3001 conflict)  
**Purpose**: Metrics visualization and alerts

#### Access

```
URL: http://localhost:3003
Default Credentials: admin/admin
WARNING: Change in production!
```

#### Dashboards Included

- System Overview
- API Performance
- Database Health
- Container Resource Usage

---

## Template Integrations (Phase 2+)

These are configured but not yet actively used in code. Ready to implement when needed.

### Email Services

#### Resend (Recommended)

```bash
RESEND_API_KEY=re_xxxxxxxxxxxx
```

**When to Use**: Modern email infrastructure, best for transactional emails  
**Features**: WYSIWYG templates, good delivery rates, excellent documentation

#### SendGrid (Alternative)

```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxx
```

**When to Use**: Established provider, advanced segmentation, legacy integrations  
**Features**: Dynamic templates, event webhooks, subuser management

### Payment Processing

#### Stripe

```bash
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
```

**Use Cases**:
- Subscription billing
- One-time payments
- Invoicing
- Connect (marketplace)

**Implementation Notes**:
- Payment routes ready in API (not yet connected)
- Webhook handler prepared
- Customer entity defined in database

### Media & Streaming (Phase 2+)

#### YouTube API

```bash
YOUTUBE_API_KEY=AIzaSy...
```

**For**: LIVE Command Center streaming integration

#### Twitch API

```bash
TWITCH_CLIENT_ID=xxx
TWITCH_CLIENT_SECRET=yyy
```

**For**: Alternative streaming, Twitch embed support

### Alternative AI Models

#### OpenAI API

```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxx
```

**Use Case**: Redundancy, model comparison, specific model requirements

---

## Configuration & Setup

### Development Environment

```bash
# Copy template
cp .env.example .env.local

# Edit with your values
nano .env.local

# Required for development
CLAUDE_API_KEY=<your-key>
DISCORD_BOT_TOKEN=<your-token>
DISCORD_GUILD_ID=<your-guild>
ADMIN_ID=<your-discord-id>
```

### Production Environment

Use a secrets management system (AWS Secrets Manager, Vault, etc.):

```bash
# Deploy to VPS or container platform
# Use platform-specific secret management

# Never commit .env.production to git
echo ".env.production" >> .gitignore
```

### Docker Compose Override

For local development with custom ports:

```yaml
# docker-compose.override.yml
version: '3.9'
services:
  grafana:
    ports:
      - "3003:3000"  # Avoid conflict with dashboard on 3001
  
  dashboard:
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3000
```

---

## Health Checks & Monitoring

### API Manager Endpoints

#### 1. Overall Health Status

```bash
GET /api/v1/system/apis/health

# Response
{
  "timestamp": "2026-07-11T12:00:00Z",
  "services": [
    {
      "name": "Anthropic Claude API",
      "status": "healthy",
      "credentialsConfigured": 1,
      "credentialsRequired": 1
    },
    ...
  ]
}
```

#### 2. Complete Integration Inventory

```bash
GET /api/v1/system/apis/inventory

# Response
{
  "summary": {
    "total_services": 15,
    "categories": 8,
    "last_validated": "2026-07-11T12:00:00Z"
  },
  "services": [
    {
      "id": "claude",
      "name": "Anthropic Claude API",
      "category": "AI",
      "status": "active",
      "credentials_count": 1
    },
    ...
  ]
}
```

#### 3. Services by Category

```bash
GET /api/v1/system/apis/by-category/AI

# Response
{
  "category": "AI",
  "services": [...]
}
```

#### 4. Individual Service Details

```bash
GET /api/v1/system/apis/claude

# Response (no secrets)
{
  "service": "claude",
  "name": "Anthropic Claude API",
  "category": "AI",
  "description": "Advanced language model for intelligent features",
  "status": "active",
  "credentials": [
    {
      "name": "API Key",
      "status": "active",
      "required": true,
      "validated": true
    }
  ]
}
```

---

## API Manager Endpoints

### Base Path: `/api/v1/system/apis`

| Method | Endpoint | Purpose | Returns |
|--------|----------|---------|---------|
| GET | `/health` | Overall health status | All services + health |
| GET | `/inventory` | Complete service inventory | Service list + categories |
| GET | `/by-category/:category` | Services in a category | Services + details |
| GET | `/:service` | Single service details | Service config + credentials |
| GET | `/` | List all services | Service names + descriptions |

---

## Security Audit

### Key Findings

✅ **Passed**: No hardcoded secrets found  
✅ **Passed**: All credentials externalized to environment variables  
✅ **Passed**: Secrets never logged in API responses  
✅ **Passed**: Database passwords never exposed  

⚠️ **Issue**: Grafana port conflict (FIXED)  
  - Was: Both Dashboard and Grafana on 3001
  - Now: Grafana on 3003

⚠️ **Issue**: Discord bot admin ID single point of failure  
  - Status: Intended design for admin-only commands
  - Mitigation: Monitor bot logs for unauthorized access attempts

### Credential Masking

All API manager endpoints mask credentials:

```typescript
// ✅ Good - Returns masked status
{
  "status": "active",
  "validated": true
}

// ❌ Never returns actual values
{
  "apiKey": "sk-ant-xxxxx"  // WRONG!
}
```

---

## Deployment Checklist

### Phase 1 (Core - Required)

- [ ] Database
  - [ ] PostgreSQL password set (16+ chars)
  - [ ] Database backup strategy defined
  - [ ] Connection pooling configured

- [ ] Cache
  - [ ] Redis password set (16+ chars)
  - [ ] Max memory policy configured
  - [ ] Persistence enabled

- [ ] Authentication
  - [ ] JWT_SECRET set (32+ chars)
  - [ ] JWT expiration configured
  - [ ] Password hashing (12 rounds default)

- [ ] External APIs
  - [ ] Claude API key obtained
  - [ ] Claude model version verified
  - [ ] Rate limits understood

- [ ] Discord Bot
  - [ ] Bot created in Discord Developer Portal
  - [ ] Bot token copied
  - [ ] Bot added to server with Admin perms
  - [ ] Guild ID and Admin ID configured

### Phase 2+ (Advanced)

- [ ] Email Service
  - [ ] Choose provider (Resend or SendGrid)
  - [ ] API key obtained
  - [ ] Email templates configured
  - [ ] Sender email verified

- [ ] Payment Processing
  - [ ] Stripe account created
  - [ ] Test mode keys obtained
  - [ ] Webhook endpoints configured
  - [ ] Billing models defined

- [ ] Analytics
  - [ ] PostHog workspace created
  - [ ] API key obtained
  - [ ] Dashboard configured
  - [ ] Privacy policy updated

### Infrastructure Verification

```bash
# Run health checks
docker-compose ps                                    # All services running?
curl http://localhost:3000/api/health               # API healthy?
docker-compose exec postgres pg_isready -U wise2    # DB ready?
docker-compose exec redis redis-cli ping            # Cache ready?
curl http://localhost:3000/api/v1/system/apis/health  # All APIs healthy?

# Check logs
docker-compose logs api                 # API errors?
docker-compose logs postgres            # DB errors?
docker-compose logs discord-bot         # Bot errors?
```

---

## Reference Documentation

### Official API Documentation Links

- **Claude**: https://docs.anthropic.com/claude/reference
- **PostgreSQL**: https://www.postgresql.org/docs/15
- **Redis**: https://redis.io/commands
- **Discord.js**: https://discord.js.org/#/docs
- **Stripe**: https://stripe.com/docs/api
- **Resend**: https://resend.com/docs
- **SendGrid**: https://docs.sendgrid.com

### WISE² Internal Documentation

- [API Reference](./API_REFERENCE.md) — All endpoints
- [Architecture](./API_SYSTEM_ARCHITECTURE.md) — System design
- [Security](./SECURITY.md) — Security practices
- [Deployment](./DEPLOYMENT.md) — Deployment guides

---

**Last Updated**: 2026-07-11  
**Next Review**: Phase 2 implementation  
**Maintainer**: Claude Code + DevOps Team
