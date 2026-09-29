# WISE² ENTERPRISE

**ORGANIZED CHAOS** — One Platform. Unlimited Possibilities.

An AI-powered business operating system focused on helping businesses create, manage, and grow their brands.

**Version**: 0.1.0 (Development)  
**Status**: 🔴 In Active Development (Phase 1: Foundation)

---

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm 8+
- Docker & Docker Compose
- PostgreSQL 15
- Redis 7

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env

# 3. Start development services
docker-compose up -d

# 4. Run development environment
pnpm dev

# 5. Open browser
# - Dashboard: http://localhost:3001
# - Admin: http://localhost:3002
# - API Docs: http://localhost:3000/api/docs
```

---

## Project Structure

```
wise2-enterprise/
├── apps/                 # Next.js applications
│   ├── website/         # Public landing page
│   ├── dashboard/       # Customer dashboard
│   ├── studio/          # WISE Sound Labs interface
│   └── admin/           # Admin portal
│
├── packages/            # Shared packages
│   ├── api/             # NestJS backend
│   ├── db/              # Database schema & migrations
│   ├── ui-components/   # Design system & components
│   ├── auth/            # Authentication service
│   ├── ai/              # AI orchestration layer
│   ├── audio/           # Audio processing utilities
│   └── types/           # Shared TypeScript types
│
├── infrastructure/      # DevOps & deployment
│   ├── docker/          # Dockerfiles
│   ├── k8s/             # Kubernetes manifests
│   ├── terraform/       # Infrastructure as Code
│   ├── nginx/           # Reverse proxy config
│   └── monitoring/      # Prometheus, Grafana, Loki
│
├── docs/                # Documentation
│   ├── RUNBOOKS/        # Operational procedures
│   └── DIAGRAMS/        # Architecture diagrams
│
└── config/              # Shared configuration
```

---

## Tech Stack

**Frontend**: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion  
**Backend**: Node.js, NestJS/Express, PostgreSQL, Redis, S3/GCS  
**AI**: Claude API (primary), Ollama (local fallback)  
**Infrastructure**: Docker, Traefik, Prometheus, Grafana, GitHub Actions, Kubernetes  

---

## Key Modules

### 🎵 WISE Sound Labs (Flagship)
Audio branding platform with:
- Brand DNA Engine
- Audio recording & editing
- Professional mixing & mastering
- Brand vault & deliverables
- Subscriptions & analytics

### 🎬 LIVE Command Center
Livestream management:
- YouTube/Twitch embedding
- Real-time viewer stats
- Discord chat integration
- Featured clips & schedule

### 🤝 Community
Discord-integrated community:
- Challenges, events, leaderboards
- Creator showcases
- Feature voting
- Achievements & badges

### Future Modules
- Design Studio
- Video Studio
- Web Studio
- Marketing AI
- Business OS
- AI Workforce
- Marketplace

---

## Development

### Available Commands

```bash
# Development
pnpm dev              # Start all services in dev mode
pnpm dev:api          # Start API only
pnpm dev:dashboard    # Start dashboard only

# Build
pnpm build            # Build all packages
pnpm build:api        # Build API only

# Testing
pnpm test             # Run all tests
pnpm test:watch       # Run tests in watch mode

# Code Quality
pnpm lint             # Lint all packages
pnpm type-check       # TypeScript type checking
pnpm format           # Auto-format code

# Database
pnpm db:migrate       # Run migrations
pnpm db:seed          # Seed database
pnpm db:reset         # Reset database
```

---

## Documentation

**Master Documentation**:
- [WISE2_ENTERPRISE_MASTER.md](./WISE2_ENTERPRISE_MASTER.md) — Full specification
- [WISE2_BUILD_PLAN.md](./WISE2_BUILD_PLAN.md) — 15-step implementation plan
- [PROJECT_BOARD.md](./PROJECT_BOARD.md) — Progress tracking
- [STATUS_REPORT.md](./STATUS_REPORT.md) — Current status

**Architecture**:
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — System architecture
- [docs/DATABASE.md](./docs/DATABASE.md) — Database schema
- [docs/API.md](./docs/API.md) — API specification

**Operations**:
- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) — Deployment procedures
- [docs/OPERATIONS_GUIDE.md](./docs/OPERATIONS_GUIDE.md) — Operational procedures
- [docs/SECURITY.md](./docs/SECURITY.md) — Security guidelines

---

## Design Language

**WISE² "Organized Chaos" Identity**:
- **Colors**: Black, Chrome, Electric Blue, Purple, Red
- **Aesthetic**: Industrial, Cyberpunk, Premium Enterprise
- **Motion**: Motion-first with Framer Motion animations
- **Responsive**: Mobile-first, fully accessible
- **Dark Mode**: Primary (light mode secondary)

See [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) for complete guidelines.

---

## Development Rules

Before implementing every major feature:

1. **Explain the architecture** — How does it fit? What does it use?
2. **Explain the tradeoffs** — Why this vs. alternatives?
3. **Recommend the solution** — What's best and why?
4. **Then implement** — Write production-ready code
5. **Keep docs synchronized** — Update docs with code

---

## Build Order

**Phase 1: Foundation** ← Current
- [ ] Step 1: Initialize repository structure
- [ ] Step 2: Generate documentation
- [ ] Step 3: Create design system

**Phase 2: Core Platform**
- [ ] Step 4: Build landing page
- [ ] Step 5: Implement authentication
- [ ] Step 6: Build shared platform services

**Phase 3: WISE Sound Labs**
- [ ] Step 7: Build Sound Labs core
- [ ] Step 8: Build LIVE command center
- [ ] Step 9: Build community integration

**Phase 4: Expansion**
- [ ] Step 10: Build remaining modules
- [ ] Step 11: Add billing system
- [ ] Step 12: Add analytics

**Phase 5: Production**
- [ ] Step 13: Deployment infrastructure
- [ ] Step 14: Testing framework
- [ ] Step 15: Production release

---

## Environment

**Development**: local machine + Docker services  
**Staging**: Cloud deployment with full stack  
**Production**: DigitalOcean / AWS / Hetzner with Kubernetes

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed setup.

---

## Team

**CTO/Lead Architect**: Claude Code (Permanent)
- All development responsibilities
- All architectural decisions
- All strategic decisions

---

## Support & Contribution

See [docs/DEVELOPMENT_SETUP.md](./docs/DEVELOPMENT_SETUP.md) for development guidelines.

---

## License

Proprietary — Wise Defense LLC

---

## Contact

- **GitHub**: dwise03-bit/wise2-enterprise
- **Email**: dwise03@gmail.com

---

**Last Updated**: 2026-07-11  
**Status**: 🔴 Phase 1 - Initialization  
**Next**: Step 1 complete, proceeding to Step 2
