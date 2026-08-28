# WISE² System Architecture Map

**Last Updated**: 2026-08-20  
**Version**: 1.0  
**Repository**: dwise03-bit/wise2-core  
**Primary Domain**: https://wise2.net  

---

## Executive Summary

WISE² is an AI-native business operating system built as a **pnpm monorepo with Turbo orchestration**. It comprises:
- Frontend applications (Next.js)
- Backend API (NestJS)
- Shared packages and libraries
- Edge appliance services
- AI/ML integration layers
- Multi-tenant infrastructure

---

## Monorepo Structure

```
wise2-core/
├── apps/                          # Frontend applications
│   ├── admin/                     # Admin dashboard
│   ├── command-center/            # Command center UI
│   ├── dashboard/                 # Main dashboard (Next.js)
│   ├── studio/                    # Content studio
│   ├── website/                   # Landing page (Next.js)
│   ├── getdown-demo/              # Demo application
│   ├── jo-credit-os-demo/         # Credit OS demo
│   ├── podcast-music/             # Podcast generation
│   └── wise-hvac-demo/            # HVAC demo
│
├── packages/                      # Shared libraries
│   ├── api/                       # NestJS backend API
│   ├── db/                        # Prisma database layer
│   ├── design-system/             # WISE² design system
│   ├── ui-components/             # Reusable React components
│   ├── types/                     # TypeScript type definitions
│   ├── ai/                        # AI integration helpers
│   ├── agent-framework/           # Agent-based orchestration
│   ├── shared/                    # Shared utilities
│   ├── sync-engine/               # Data synchronization
│   ├── auth/                      # Authentication
│   ├── api-gateway/               # API gateway
│   ├── dashboard-shell/           # Dashboard shell
│   ├── audio/                     # Audio processing
│   ├── aether-trader/             # Trader integration
│   └── xiao-imps-firmware/        # Firmware packages
│
├── services/                      # Microservices
│   ├── api/                       # Primary API service
│   ├── worker/                    # Background job worker
│   ├── edge-appliance/            # Raspberry Pi/edge devices
│   ├── bot/                       # Bot services
│   ├── discord-ecosystem/         # Discord integrations
│   ├── knowledge-graph/           # Knowledge management
│   ├── voice-assistant/           # Voice capabilities
│   ├── memory-engine/             # Memory & context
│   ├── ai-orchestrator/           # AI coordination
│   ├── integration-tests/         # Test suite
│   └── [other specialized services]
│
├── infrastructure/                # Infrastructure as code
├── scripts/                       # Utility scripts
├── .claude/                       # Claude Code configuration
└── docs/                          # Documentation
```

---

## Applications & Ports

| Application | Container | Port (Local) | Port (Container) | Purpose | Tech |
|---|---|---|---|---|---|
| API | wise2-api-prod | 3010 | 3001 | Backend API (NestJS) | Node.js/NestJS |
| Website | wise2-website-prod | 3011 | 3000 | Landing page | Next.js |
| Dashboard | wise2-dashboard-prod | 3002 | 3000 | Main dashboard | Next.js |
| Admin | wise2-admin-prod | 3003 | 3000 | Admin panel | Next.js |
| Studio | wise2-studio-prod | 3005 | 3003 | Content studio | Next.js |
| Command-Center | wise2-command-center-prod | 3004 | 3000 | Central command UI | Next.js |
| Open WebUI | wise2-open-webui-prod | 3020 | 8080 | Ollama WebUI | Python/FastAPI |

---

## Infrastructure & Services

### Databases

| Service | Container | Port | Purpose | Tech |
|---|---|---|---|---|
| PostgreSQL | wise2-postgres-prod | 5432 | Primary database | PostgreSQL 15 |
| Redis | wise2-redis-prod | 6379 | Cache & queue | Redis 7 |
| MongoDB | wise2-mongodb | 27017 | Document store | MongoDB 7 |

### AI & ML

| Service | Container | Port | Purpose |
|---|---|---|---|
| Ollama | wise2-ollama-prod | 11434 | Local LLM inference |
| Open WebUI | wise2-open-webui-prod | 3020 | LLM chat interface |

### Observability

| Service | Container | Port | Purpose |
|---|---|---|---|
| Prometheus | wise2-prometheus-prod | 9090 | Metrics collection |
| Grafana | wise2-grafana-prod | 3100 | Metrics dashboards |

### Background Jobs

| Service | Container | Purpose | Tech |
|---|---|---|---|
| Worker | wise2-worker-content-prod | Content rendering, async tasks | Node.js + BullMQ |

---

## Development Tools & Configuration

### Package Manager
- **Tool**: pnpm (8.15.9+)
- **Reason**: Speed, disk efficiency, monorepo support
- **Workspace Layout**: Defined in root `package.json` workspaces

### Build Orchestration
- **Tool**: Turbo 1.10.16+
- **Purpose**: Parallel builds, caching, dependency graph visualization
- **Config**: `turbo.json`

### Database ORM
- **Tool**: Prisma
- **Config**: `packages/db/prisma/schema.prisma`
- **Migrations**: `packages/db/prisma/migrations/`
- **Command**: `pnpm --filter @wise2/db prisma:generate`

### Node Version
- **Required**: Node.js >= 20.0.0
- **TypeScript**: >= 5.3.0

---

## Key Environments

### Development
- Local database (Docker compose or localhost)
- Hot-reload frontend apps
- API running on port 3010
- Ollama available locally for inference

### Production (Docker Compose)
- All services in `docker-compose.production.yml`
- Healthchecks on all services
- Environment variables from `.env.production`
- Volumes mounted for persistent data

### VPS Deployment
- Server: 173.208.147.165 (as user `dwise`)
- Container orchestration via docker-compose
- Auto-deploy on main branch via GitHub Actions
- Health monitoring via Prometheus/Grafana

---

## Important Directories

| Path | Purpose |
|---|---|
| `.claude/` | Claude Code configuration |
| `docs/claude/` | Claude engineering documentation |
| `infrastructure/` | Docker, nginx, Traefik, CI/CD configs |
| `scripts/` | Utility scripts for build, test, deploy |
| `packages/db/prisma/` | Database schema and migrations |
| `services/api/src/` | NestJS API source |
| `apps/website/` | Landing page source |
| `apps/dashboard/` | Dashboard source |
| `apps/admin/` | Admin panel source |
| `apps/studio/` | Studio application source |

---

## Critical Configuration Files

| File | Purpose | Critical Settings |
|---|---|---|
| `docker-compose.production.yml` | Production orchestration | All service definitions, ports, env vars |
| `.env.example` | Environment template | Database, API keys, secrets |
| `.env.prod.example` | Production env template | Production-specific settings |
| `packages/db/prisma/schema.prisma` | Database schema | All entities, relationships |
| `packages/api/src/main.ts` | API entry point | Port 3001, health endpoint |
| `turbo.json` | Build orchestration | Tasks, caching, dependencies |

---

## Health Checks

All production services include health checks:

```yaml
api:           GET http://localhost:3001/api/health
website:       GET http://localhost:3000/
dashboard:     GET http://localhost:3000/
admin:         GET http://localhost:3000/
studio:        GET http://localhost:3003/
command-center: GET http://localhost:3000/api/health
postgres:      pg_isready -U postgres
redis:         redis-cli incr ping
mongodb:       mongosh ping
ollama:        GET http://localhost:11434/api/tags
open-webui:    GET http://localhost:8080/health
prometheus:    wget --spider http://localhost:9090/-/healthy
grafana:       (no specific check defined)
```

---

## API Endpoints

**Base URL** (local): `http://localhost:3010`  
**Base URL** (production): `https://api.wise2.net`

Typical endpoints:
- `GET /api/health` — Health status
- `POST /api/auth/login` — Authentication
- `GET /api/users` — User management
- `POST /api/content` — Content creation
- `GET /api/analytics` — Analytics

(Full API spec: `API_REFERENCE.md`)

---

## Deployment Flow

```
Local Development
    ↓
Git Push (claude/wise2-claude-code-install-*)
    ↓
GitHub Actions (optional)
    ↓
Manual Deploy via docker-compose
    ↓
VPS (173.208.147.165)
    ↓
Health Check Verification
```

---

## Known Issues & Workarounds

| Issue | Workaround | Reference |
|---|---|---|
| Port mismatch (API default 3000 vs nginx 3001) | Use 3010 in docker-compose | OUTSTANDING_ISSUES.md |
| Sudo requires password (no TTY) | Use explicit password in scripts | Memory |
| Admin service CSS build errors | Disabled in current MVP | OUTSTANDING_ISSUES.md |

See `OUTSTANDING_ISSUES.md` for full list.

---

## Git & Deployment

### Branches
- **main** — Production-ready code
- **claude/wise2-claude-code-install-*** — Development branch (current)

### Remote
- **origin** — https://github.com/dwise03-bit/wise2-core

### Deployment
- Push to main → GitHub Actions → VPS deployment
- Current branch is development branch; always push here unless explicitly told otherwise

---

## CLI Commands (Quick Reference)

```bash
# Development
pnpm install              # Install dependencies
pnpm dev                  # Start all apps in dev mode
pnpm build                # Build all packages
pnpm type-check           # TypeScript checking
pnpm lint                 # Lint all code

# Database
pnpm --filter @wise2/db prisma:generate    # Generate Prisma client
pnpm migration:run        # Run pending migrations
pnpm migration:revert     # Revert last migration

# Docker (Production)
docker-compose -f docker-compose.production.yml up -d    # Start services
docker-compose -f docker-compose.production.yml ps        # Service status
docker-compose -f docker-compose.production.yml logs api  # View logs
```

---

## Contact & Attribution

- **Project Owner**: dwise (dwise03@gmail.com)
- **Repository**: https://github.com/dwise03-bit/wise2-core
- **Documentation**: This file, `CLAUDE.md`, API_REFERENCE.md
- **Monitoring**: Grafana (localhost:3100)
- **Logs**: Docker container logs, Prometheus (localhost:9090)

---

**This map is the source of truth for WISE² architecture. Update it when major infrastructure changes occur.**
