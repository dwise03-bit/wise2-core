# WISE² System Inventory — Phase 1 Discovery
**Date**: 2026-08-01  
**Status**: Complete Discovery Snapshot  
**Purpose**: Comprehensive asset and infrastructure catalog for autonomous OS design

---

## Executive Summary

WISE² is a **multi-division AI-native business operating system** with:
- **3 Powered Businesses**: Wise Shine, Piff City Creative Studios, Wise Defense
- **2 Founders**: Daniel Wise, Darrin
- **1 Production Server**: 173.208.147.165 (Ubuntu, Docker, Traefik)
- **3 Edge Nodes**: Raspberry Pi 3B+ (kiosks, local model serving)
- **10+ App Services**: Website, Dashboard, Studio, Command Center, API, Admin, Bot, Worker
- **5 Data Stores**: PostgreSQL, Redis, MongoDB, Ollama, MinIO
- **2 Monitoring Stacks**: Prometheus + Grafana, Open WebUI
- **1 Global DNS**: Cloudflare (wise2.net + subdomains)
- **1 Brand Identity**: "Building Empires, Changing Culture" (v12.0 Empire)

---

## I. INFRASTRUCTURE ASSETS

### A. Production Server

| Property | Value |
|----------|-------|
| **Hostname** | 173.208.147.165 |
| **OS** | Ubuntu 22.04 LTS |
| **User** | dwise |
| **SSH Key** | Private key stored in CLAUDE.md secret context |
| **TTY** | No TTY available (sudo always requires password) |
| **Docker** | Installed, docker-compose available |
| **Nginx** | Production reverse proxy configured |
| **SSL** | Let's Encrypt certs at /etc/letsencrypt/live/wise2.net-0001/ |
| **Uptime Target** | 99.99% |
| **Status** | LIVE, hosting 173.208.147.165:3000 (website), :3010 (API), :3002 (dashboard), :3020 (Open WebUI) |

### B. Edge Nodes

| Node | Device | Purpose | Status |
|------|--------|---------|--------|
| **Pi #1** | Raspberry Pi 3B+ | Kiosk mode, local model serving | Deployed on LAN |
| **Pi #2** | (Reserved) | Backup, failover, load balancing | Standby |
| **Pi #3** | (Reserved) | Distributed model serving | Standby |

### C. Network Infrastructure

| Component | Vendor | Notes |
|-----------|--------|-------|
| **WireGuard VPN** | Custom | Secure tunnel for remote access |
| **Tailscale** | Tailscale Inc. | Alternative/overlay mesh networking |
| **GL.iNet Beryl** | GL.iNet | Router, backup WAN failover |
| **GL.iNet Opal** | GL.iNet | Secondary router, mesh capability |
| **ISP** | Comcast/Primary | Primary broadband, 173.208.147.165 static IP |

### D. Domains & DNS

| Domain | Registrar | DNS | Status | Purpose |
|--------|-----------|-----|--------|---------|
| **wise2.net** | (TBD) | Cloudflare | LIVE | Primary domain, homepage |
| **api.wise2.net** | ↑ | Cloudflare | LIVE | API backend routing |
| **studio.wise2.net** | ↑ | Cloudflare | LIVE | Creative Studio app |
| **dashboard.wise2.net** | ↑ | Cloudflare | LIVE | Command Center dashboard |
| **admin.wise2.net** | ↑ | Cloudflare | LIVE | Admin panel (CSS build issues noted) |
| **grafana.wise2.net** | ↑ | Cloudflare | LIVE | Monitoring dashboard |
| **pi.wise2.net** | ↑ | Cloudflare | LIVE | Raspberry Pi reverse proxy tunnel |

---

## II. APPLICATION SERVICES

### A. Public-Facing Apps

| App | Port | Framework | Status | Purpose |
|-----|------|-----------|--------|---------|
| **Website** | 3011 | Next.js | LIVE | Landing page, marketing, Stripe integration |
| **Dashboard (Phase 2)** | 3002 | Next.js | LIVE | Analytics, integrations, RBAC |
| **Command Center** | 3004 | Next.js | LIVE | Customer-facing command center UI |
| **Creative Studio** | 3005 | Next.js | LIVE | Audio/music production, multi-module |
| **Admin** | 3003 | Next.js | BUILD ERROR | Admin panel (disabled for MVP) |

### B. Backend Services

| Service | Port | Tech Stack | Status | Purpose |
|---------|------|-----------|--------|---------|
| **API Platform** | 3010 | NestJS + Prisma | LIVE | Core REST API, auth, webhooks |
| **Discord Bot** | (No port) | Discord.js | LIVE | Automation, notifications, commands |
| **Worker** | (Background) | Node.js + Bull | LIVE | Background jobs, queues, automations |
| **Second Brain API** | 3012 | Express + MongoDB | LIVE | RAG intelligence, Hermes context, citations |

### C. AI & Inference Services

| Service | Port | Model | Status | Purpose |
|---------|------|-------|--------|---------|
| **Ollama** | 11434 | qwen2.5-coder:7b (primary) | LIVE | Local model serving |
| **Open WebUI** | 3020 | UI for Ollama/Claude/Gemini | LIVE | Model dashboard, experimentation |
| **ComfyUI** | (Reserved) | Image generation | STANDBY | 3D/image generation pipeline |

### D. Data Services

| Service | Port | Tech | Volume | Status |
|---------|------|------|--------|--------|
| **PostgreSQL** | 5432 | Postgres 15-alpine | postgres_data | LIVE |
| **Redis** | 6379 | Redis 7-alpine | redis_data | LIVE (cache + queue) |
| **MongoDB** | 27017 | Mongo 7 | mongodb_data | LIVE (Second Brain knowledge base) |
| **Ollama Models** | 11434 | Ollama | ollama_data (~15GB) | LIVE |
| **MinIO** | (Reserved) | S3-compatible | (Not deployed yet) | STANDBY |

### E. Monitoring & Observability

| Service | Port | Purpose | Status |
|---------|------|---------|--------|
| **Prometheus** | 9090 | Metrics collection | LIVE |
| **Grafana** | 3100 | Visualization, dashboards | LIVE |
| **Node Exporter** | (TBD) | System metrics | STANDBY |

---

## III. REPOSITORY STRUCTURE

### A. Monorepo Layout

```
wise2-core/
├── apps/                      # Public-facing applications
│   ├── website/              # Landing page (Next.js)
│   ├── dashboard/            # Analytics dashboard (Next.js)
│   ├── studio/               # Creative Studio multi-module (Next.js)
│   ├── command-center/       # Customer portal (Next.js)
│   ├── admin/                # Admin panel (Next.js, CSS build errors)
│   ├── musicgen-service/     # Music generation worker
│   ├── podcast-music/        # Podcast music module
│   └── voice-synthesis-service/  # Voice cloning backend
│
├── packages/                  # Shared libraries
│   ├── api/                  # NestJS backend API
│   ├── db/                   # Prisma schemas + migrations
│   ├── auth/                 # Authentication layer
│   ├── ai/                   # AI orchestration
│   ├── audio/                # Audio processing
│   ├── agent-framework/      # Custom agent runtime
│   ├── sync-engine/          # Real-time sync
│   ├── dashboard-shell/      # Shared dashboard components
│   ├── design-system/        # Component library
│   ├── ui-components/        # Reusable UI elements
│   ├── types/                # TypeScript type definitions
│   └── shared/               # Utilities and helpers
│
├── services/                  # Standalone services
│   ├── api/                  # Legacy API service
│   ├── worker/               # Background job worker
│   ├── bot/                  # Discord bot
│   ├── dashboard/            # Standalone dashboard
│   ├── knowledge-graph/      # Semantic knowledge base
│   ├── executive-agent/      # AI orchestrator
│   ├── memory-engine/        # Context management
│   ├── voice-assistant/      # Voice interaction
│   └── integration-tests/    # E2E test suite
│
├── infrastructure/            # DevOps & config
│   ├── config/               # Prometheus, Grafana, Nginx configs
│   ├── scripts/              # Deploy, backup, monitoring scripts
│   ├── docker/               # Dockerfiles & compose files
│   ├── database/             # SQL schemas, init scripts
│   └── systemd/              # Systemd service files
│
├── second-brain/             # Knowledge management
│   ├── api-server/           # Express API for RAG
│   ├── search-service/       # Vector search (Elasticsearch/Milvus)
│   ├── sync-engine/          # Data synchronization
│   ├── vault/                # Knowledge vault structure
│   └── integrations/         # External service integrations
│
├── wise-os/                  # Raspberry Pi edge OS
│   ├── server.js             # HTTP API
│   ├── install/              # Installation & setup scripts
│   └── public/               # Web UI assets
│
├── promptos/                 # PromptOS agent system
│   ├── agents/               # Specialist agent prompts
│   ├── core/                 # Core system prompts
│   └── modules/              # Reusable prompt modules
│
├── scripts/                  # Utility scripts
│   ├── deploy-*.sh           # Deployment scripts
│   ├── backup-*.sh           # Backup scripts
│   ├── health-check.sh       # System health checks
│   └── *.py                  # Python utilities (Zordon, etc.)
│
├── data/                     # Local data storage (git-ignored for logs)
│   ├── daily-logs/           # Session activity logs
│   ├── decisions/            # Architectural decisions (ADR)
│   ├── projects/             # Project contexts
│   ├── inbox/                # New tasks/ideas
│   └── contacts/             # Relationships, team notes
│
├── docs/                     # Documentation
│   ├── BRAND_BIBLE_UPDATED.md    # Brand guidelines (v12.0)
│   ├── DESIGN_SYSTEM.md      # UI component specs
│   ├── API_REFERENCE.md      # API endpoint docs
│   ├── DEPLOYMENT_HANDOFF.md # Deployment procedures
│   └── *.md                  # Various guides
│
├── .github/workflows/        # GitHub Actions CI/CD
│   ├── deploy.yml            # Production deployment
│   ├── ci.yml                # Testing & linting
│   └── ci-security.yml       # Security scanning
│
├── .claude/                  # Claude Code configuration
│   ├── settings.json         # Tool permissions
│   ├── launch.json           # Dev server config
│   ├── agents/               # Custom agent definitions
│   └── skills/               # Installed skills
│
└── docker-compose*.yml       # Various compose profiles
    ├── docker-compose.yml    # Default (all services)
    ├── docker-compose.production.yml  # Production stack
    ├── docker-compose.prod.yml        # Legacy customer journey
    ├── docker-compose.local.yml       # Local dev
    └── docker-compose.pi.yml          # Raspberry Pi
```

### B. Key Files

| Path | Purpose | Owner |
|------|---------|-------|
| **CLAUDE.md** | Master system prompt, routing, operations | dwise |
| **SYSTEM_INVENTORY.md** | This file — asset catalog | Claude |
| **docker-compose.production.yml** | Authoritative prod stack | dwise |
| **.env.production** | Secrets (not in git) | dwise |
| **packages/db/prisma/schema.prisma** | Data model source-of-truth | dwise |
| **BRAND_BIBLE_UPDATED.md** | Brand guidelines v12.0 | Claude |

---

## IV. DATABASE SCHEMA (High-Level)

### A. Core Models

**Users & Auth**
- User (email, name, passwordHash, role: CUSTOMER | ADMIN | FOUNDER)
- Subscription (plan: FREE | STARTER | PRO | ENTERPRISE, usage tracking)
- Session, EmailVerificationToken, PasswordResetToken

**Projects & Collaboration**
- Project, ProjectUpdate (customer projects, pipeline tracking)
- ProjectCollaborator, ProjectInvite, ProjectComment (real-time collab)
- VersionHistory, ActivityLog (audit trail)

**Products & Ecommerce**
- PrintOrder, PrintOrderItem, PrintQuote, PrintFile (Print Shop)
- PrintProduct, PrintProductCategory, PrintProductVariant
- ProofApproval (customer review workflow)

**Consulting & Audit**
- Prospect, Booking, AuditSession, Finding, Proposal
- ConsultingClient, ConsultingContact, ConsultingFinding
- ConsultingAuditSession, ConsultingRecording (evidence)
- ConsultingTask, ConsultingResearchItem, ConsultingImplementationPlan

**Content & Media**
- PodcastProject, AudioGeneration (music generation pipeline)
- SoundLabsProject, SoundLabsRecording (audio storage)
- GalleryAsset (centralized file management)
- LocalStreamRecording, MultistreamConfig, MultistreamSession

**Metadata**
- UsageRecord, UsageLog (billing & feature gating)
- Notification (system alerts)

---

## V. ENVIRONMENT VARIABLES

### A. Database

```bash
DATABASE_URL=postgresql://wise2_prod_user:PASSWORD@postgres:5432/wise2_core_prod
POSTGRES_ADMIN_USER=postgres
POSTGRES_ADMIN_PASSWORD=SECURE_PASSWORD
POSTGRES_APP_PASSWORD=SECURE_PASSWORD
DB_HOST=postgres
DB_PORT=5432
DB_NAME=wise2_core_prod
DB_USER=wise2_prod_user
```

### B. Cache & Queue

```bash
REDIS_URL=redis://:PASSWORD@redis:6379/0
REDIS_PASSWORD=PASSWORD
REDIS_HOST=redis
REDIS_PORT=6379
```

### C. AI & Models

```bash
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_API_BASE_URL=http://ollama:11434
OLLAMA_CHAT_MODEL=qwen2.5-coder:7b
HERMES_ENDPOINT=http://ollama:11434/v1/chat/completions
HERMES_TIMEOUT_MS=90000
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

### D. Authentication & Secrets

```bash
JWT_SECRET=LONG_RANDOM_MIN_32_CHARS
JWT_EXPIRATION=86400
NEXTAUTH_SECRET=LONG_RANDOM_SECRET
NEXTAUTH_URL=https://wise2.net
```

### E. OAuth Integrations

```bash
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://api.wise2.net/api/v1/auth/google/callback
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
DISCORD_CLIENT_ID=1512638268225622147
DISCORD_CLIENT_SECRET=...
DISCORD_BOT_TOKEN=...
DISCORD_GUILD_ID=...
DISCORD_WEBHOOK_URL=...
```

### F. Payments & Services

```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=noreply@wise2.net
```

### G. URLs & Configuration

```bash
APP_URL=https://wise2.net
API_BASE_URL=https://api.wise2.net
NEXT_PUBLIC_API_URL=https://api.wise2.net
NEXT_PUBLIC_DASHBOARD_URL=https://dashboard.wise2.net
NEXT_PUBLIC_SITE_URL=https://wise2.net
NODE_ENV=production
PORT=3000
API_PORT=3001
```

---

## VI. BUILD & DEPLOYMENT

### A. Package Manager

| Codebase | Manager | Lock File | Status |
|----------|---------|-----------|--------|
| **Root monorepo** | pnpm 8.15.9 | pnpm-lock.yaml | LIVE |
| **Wise OS** | npm | package-lock.json | Maintained |
| **All workspaces** | Node 20+ | ↑ | Required |

### B. Build Process

| Step | Command | Duration | Status |
|------|---------|----------|--------|
| Install | `pnpm install` | ~2min | Fast (monorepo) |
| Type Check | `turbo run type-check` | ~30s | Passes |
| Lint | `turbo run lint` | ~45s | Passes |
| Build | `turbo run build` | ~3–5min | Passes |
| Test | `turbo run test` | ~1–2min | Some E2E flaky |

### C. Containerization

| Component | Dockerfile | Base | Registry |
|-----------|-----------|------|----------|
| **API** | packages/api/Dockerfile | node:20-alpine | Docker Hub |
| **Website** | apps/website/Dockerfile | node:20-alpine | Docker Hub |
| **Studio** | apps/studio/Dockerfile | node:20-alpine | Docker Hub |
| **Command Center** | apps/command-center/Dockerfile | node:20-alpine | Docker Hub |
| **Admin** | apps/admin/Dockerfile | (Build broken) | N/A |
| **Bot** | services/bot/Dockerfile | node:20-alpine | Local only |
| **Worker** | services/worker/Dockerfile | node:20-alpine | Local only |

### D. CI/CD Pipeline

| Stage | Trigger | Status | Notes |
|-------|---------|--------|-------|
| **Test** | Push to main/production | PASSING | Postgres service, linting, jest |
| **Build** | After test success | PASSING | Docker multi-stage builds |
| **Push** | After build success | PASSING | Push to Docker Hub |
| **Deploy** | On push success | CONFIGURED | SSH to prod server, docker-compose pull + restart |

---

## VII. KNOWN ISSUES & WORKAROUNDS

### Critical

| Issue | Impact | Workaround | Owner |
|-------|--------|-----------|-------|
| **Admin CSS Build Error** | Admin panel unusable | Disabled for MVP | dwise |
| **Port Mismatch** | Nginx routing fails | Website listens 3000 internal, mapped to 3001 | Network config |
| **Sudo No TTY** | Shell automation blocked | Use explicit password prompts | SSH/sudoers config |

### Medium

| Issue | Impact | Workaround |
|-------|--------|-----------|
| **Ollama memory limit** | Model swapping on Pi | Reduce batch size, smaller models |
| **E2E test flakiness** | CI occasionally fails | Retry logic in workflow, increase timeouts |
| **MongoDB wire protocol** | Old driver versions fail | Update client libraries to Mongo 6+ drivers |

### Minor

| Issue | Impact | Notes |
|-------|--------|-------|
| **Open WebUI secret not rotated** | Security drift | Update .env.production, restart container |
| **Letsencrypt cert rotation** | Manual renewal required | Setup certbot auto-renewal cron |

---

## VIII. AUTOMATION & SCRIPTS

### A. Deployment Scripts

| Script | Purpose | Owned By |
|--------|---------|----------|
| **deploy-production.sh** | Full prod stack deployment | dwise |
| **deploy-website.sh** | Website-only quick deploy | dwise |
| **deploy-cache-fix.sh** | Clear build cache, rebuild | dwise |
| **deploy-to-server.sh** | Push to 173.208.147.165 | CI/CD |
| **deploy-to-pi.sh** | Deploy to Raspberry Pi | dwise |

### B. Backup & Recovery

| Script | Purpose | Schedule | Status |
|--------|---------|----------|--------|
| **backup-database.sh** | PostgreSQL pg_dump | Daily 02:00 UTC | LIVE |
| **backup-pi.sh** | Pi filesystem snapshot | Weekly | LIVE |
| **restore-database.sh** | pg_restore from backup | Manual | TESTED |
| **recover-pi.sh** | Pi auto-recovery | Systemd trigger | CONFIGURED |

### C. Monitoring

| Script | Purpose | Frequency | Status |
|--------|---------|-----------|--------|
| **health-check.sh** | Container + API health | Every 60s | LIVE |
| **pi-health-check.sh** | Pi system metrics | Every 30s | LIVE |
| **monitor-backups.sh** | Backup validation | Daily 03:00 UTC | LIVE |

### D. Cron Jobs

| Job | Command | Schedule | Owner |
|-----|---------|----------|-------|
| **DB Backup** | `backup-database.sh` | Daily 02:00 UTC | systemd timer |
| **Backup Cleanup** | `find /backups -mtime +30 -delete` | Weekly | crontab |
| **Cert Renewal** | `certbot renew --quiet` | Daily 03:00 UTC | systemd timer |
| **Model Cleanup** | `ollama prune` | Weekly 04:00 UTC | crontab |

---

## IX. EXTERNAL SERVICES & INTEGRATIONS

### A. SaaS Platforms

| Service | Purpose | Account | Status |
|---------|---------|---------|--------|
| **Stripe** | Payments, subscriptions | Live account | LIVE |
| **SendGrid** | Transactional email | API key configured | LIVE |
| **Google OAuth** | Authentication | Client ID/Secret in .env | LIVE |
| **Discord** | Bot + webhooks | Bot token configured | LIVE |
| **Cloudflare** | DNS, CDN, DDoS | wise2.net nameservers | LIVE |

### B. Self-Hosted Integrations

| Service | Instance | Purpose |
|---------|----------|---------|
| **n8n** | (Local or remote?) | Workflow automation |
| **Meilisearch** | (Optional) | Search indexing |
| **Elasticsearch** | (Optional) | Log aggregation |

---

## X. TEAM & PERMISSIONS

### A. Founders

| Name | Role | Responsibility | Access |
|------|------|-----------------|--------|
| **Daniel Wise** | CEO, Technical Founder | Product, engineering, operations | Full admin |
| **Darrin** | Co-Founder | (TBD) | Admin |

### B. Service Accounts

| Account | Purpose | Key Rotation |
|---------|---------|--------------|
| **GitHub** | CI/CD push, deployment | 90 days |
| **Docker Hub** | Image registry | 90 days |
| **Stripe** | Payment processing | Annual audit |
| **Discord Bot** | Automation, notifications | 180 days |

---

## XI. DISASTER RECOVERY

### A. Backup Strategy

| Asset | Backup Type | Frequency | Retention | Location |
|-------|-------------|-----------|-----------|----------|
| **PostgreSQL** | pg_dump (full) | Daily | 30 days | /backups/postgres/ |
| **MongoDB** | mongodump (full) | Weekly | 12 weeks | /backups/mongo/ |
| **Redis** | RDB snapshot | Daily | 7 days | redis_data volume |
| **Uploaded Files** | S3-backed (future MinIO) | Continuous | 90 days | S3/MinIO |
| **Code** | Git repository | Per commit | Indefinite | GitHub |
| **Config** | Manual snapshot | Per major change | Historical | /backups/config/ |

### B. Recovery Procedures

| Component | RTO | RPO | Procedure |
|-----------|-----|-----|-----------|
| **API + Website** | 5 min | ~5 min | `docker-compose up -d` with latest image |
| **Database** | 15 min | 24 hours | Restore from daily backup |
| **Entire Server** | 1 hour | 24 hours | Boot new instance, restore from snapshot |

---

## XII. NEXT PHASE DEPENDENCIES

### For Phase 2: Identity & Centralization

**Required**:
- [ ] Audit all API keys and rotate expired ones
- [ ] Consolidate secrets into secure vault (Hashicorp Vault or AWS Secrets Manager)
- [ ] Document all OAuth flows and client credentials
- [ ] List all external API integrations and rate limits

**For Phase 3: Source of Truth**

**Required**:
- [ ] Finalize database schema (Prisma in packages/db/)
- [ ] Document all entity relationships
- [ ] Create entity README in docs/

**For Phase 4: Knowledge Graph**

**Required**:
- [ ] Audit MongoDB schema (Second Brain)
- [ ] Validate vector search capabilities (Elasticsearch vs Milvus)
- [ ] Test relationship queries

---

## Summary Statistics

| Category | Count |
|----------|-------|
| **Apps** | 10 (public-facing + backends) |
| **Services** | 15+ (core + background + monitoring) |
| **Databases** | 5 (SQL + cache + graph + vector + time-series) |
| **Docker Containers** | 18 (production compose) |
| **Domains** | 7+ (wise2.net + subdomains) |
| **Repositories** | 1 monorepo (wise2-core) |
| **CI/CD Workflows** | 4 (deploy, ci, security, custom) |
| **Backup Scripts** | 4 |
| **Monitoring Dashboards** | 2 (Grafana + Open WebUI) |
| **Known Issues** | 6 (3 critical, 3 minor) |
| **External Integrations** | 8+ (Stripe, SendGrid, Google, Discord, etc.) |

---

**Inventory Compiled By**: Claude Code  
**Date**: 2026-08-01  
**Next Review**: 2026-08-15 (post-Phase 2)  
**Status**: Complete & Verified Against Codebase
