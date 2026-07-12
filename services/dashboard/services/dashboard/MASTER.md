# Wise² Core — Master Architecture

## System Overview

Wise² Core is the unified operating system orchestrating all Wise² technology, infrastructure, and business automation. It is designed to be:

- **Scalable** — grows with the organization
- **Reliable** — redundancy and failover built in
- **Automated** — minimizes manual intervention
- **Documented** — every decision is recorded
- **Secure** — credentials and secrets properly managed
- **Maintainable** — clear structure and conventions

## Core Components

### 1. Raspberry Pi Node (Primary Orchestrator)
The heart of Wise² Core. Runs:
- Docker daemon (containerized services)
- Ollama (local LLM inference)
- Git synchronization
- Monitoring and alerting
- Service orchestration
- Backup and disaster recovery

**Status**: To be deployed
**Location**: Primary datacenter (TBD)

### 2. Wise OS
Desktop operating system for primary workflows.
**Status**: Planning phase
**Repository**: Separate

### 3. Wise Touch
Touch-based interfaces and mobile workflows.
**Status**: Planning phase
**Repository**: Separate

### 4. Cloud Infrastructure
- VPS instances
- Cloud services
- CDN and static hosting
- Backup storage

**Status**: To be architected

### 5. GitHub Repositories
- wise2-core (this repository)
- wise-os
- wise-touch
- Client projects
- AI agents

**Principle**: GitHub is the single source of truth. All configuration, documentation, and code lives here.

### 6. AI & Automation
- Claude API integration
- Local Ollama models
- Automation workflows
- Business logic orchestration

**Status**: To be integrated

### 7. Hardware Integration
- 3D printing (Bambu Lab, Prusa)
- IoT devices
- Sensors and monitoring
- Device management

**Status**: To be architected

### 8. Documentation
- Runbooks and procedures
- Architecture diagrams
- Decision logs
- Change history

**Principle**: Documentation is never optional. Every feature, change, and decision is recorded.

## Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│          External Services (Cloud)              │
│  GitHub | Claude API | Cloud Storage | CDN     │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼──────────────────────────────┐
│     Raspberry Pi (Primary Orchestrator)        │
│  ┌──────────────────────────────────────────┐ │
│  │ Docker (Service Container Orchestration) │ │
│  │  - App Services                          │ │
│  │  - Database Services                     │ │
│  │  - Monitoring & Logging                  │ │
│  │  - Automation Workers                    │ │
│  └──────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────┐ │
│  │ Ollama (Local LLM Services)              │ │
│  │  - Text Generation                       │ │
│  │  - Embeddings                            │ │
│  │  - Local AI Inference                    │ │
│  └──────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────┐ │
│  │ Git Synchronization & Storage             │ │
│  │  - Repository Mirror                      │ │
│  │  - Offline Access                         │ │
│  │  - Change Notification                    │ │
│  └──────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────┐ │
│  │ Monitoring & Observability                │ │
│  │  - Health Checks                          │ │
│  │  - Metrics Collection                     │ │
│  │  - Alerting                               │ │
│  └──────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
                 │
        ┌────────┼────────┐
        │        │        │
   ┌────▼─┐ ┌───▼──┐ ┌──▼────┐
   │ Wise │ │Wise  │ │Local  │
   │  OS  │ │Touch │ │Clients│
   └──────┘ └──────┘ └───────┘
```

## Design Principles

### 1. Single Source of Truth
- GitHub is authoritative
- All configuration in code
- No manual configuration outside the repository
- Every change is tracked and reviewed

### 2. Infrastructure as Code
- Docker Compose for service orchestration
- Configuration files in repository
- Deployment is reproducible
- Infrastructure is versionable

### 3. Automation First
- Manual tasks are exceptions
- Workflows are automated and logged
- Monitoring is proactive
- Alerts drive action

### 4. Security by Default
- Secrets in .env files (not committed)
- Minimal credentials in code
- Audit trails for all changes
- Regular security review

### 5. Documentation Driven
- Every feature has documentation
- Every decision is recorded
- New team members can onboard from docs
- Architecture is visible

### 6. Modular Architecture
- Components are loosely coupled
- Each component has a clear responsibility
- Services communicate via APIs
- Easy to replace or upgrade components

## Technology Stack

### Infrastructure
- **Orchestration**: Docker & Docker Compose
- **OS**: Linux (Raspberry Pi, VPS)
- **Monitoring**: Prometheus + Grafana (or similar)
- **Logging**: ELK Stack or similar

### Services
- **AI**: Claude API + Local Ollama
- **Database**: PostgreSQL (primary), Redis (cache)
- **Message Queue**: RabbitMQ or Redis Streams
- **Git**: GitHub

### Development
- **Language**: TypeScript/JavaScript (Node.js)
- **Frontend**: React/Next.js for web
- **Mobile**: iOS/Android (or React Native)
- **IaC**: Docker Compose, Terraform (for cloud)

## Roadmap

### Phase 1: Foundation (Current)
- [ ] Initialize repository structure
- [ ] Set up Raspberry Pi as orchestrator
- [ ] Basic Docker infrastructure
- [ ] Documentation framework

### Phase 2: Core Services
- [ ] Implement service orchestration
- [ ] Set up monitoring and alerting
- [ ] Implement Git synchronization
- [ ] Basic automation workflows

### Phase 3: AI Integration
- [ ] Integrate Claude API
- [ ] Deploy Ollama models
- [ ] Implement AI-driven automation
- [ ] Build AI agent framework

### Phase 4: Applications
- [ ] Wise OS development
- [ ] Wise Touch development
- [ ] Business automation apps
- [ ] Hardware integration

### Phase 5: Scale & Optimize
- [ ] Multi-node orchestration
- [ ] Geographic redundancy
- [ ] Performance optimization
- [ ] Cost optimization

## Key Decisions

See [DECISIONS.md](DECISIONS.md) for detailed decision logs.

### Current Key Decisions
1. Raspberry Pi as primary orchestrator
2. Docker for service containerization
3. GitHub as single source of truth
4. Infrastructure as Code approach
5. Documentation-first development

## Next Steps

1. Read [CURRENT_STATE.md](CURRENT_STATE.md) for current status
2. Read [NEXT_TASK.md](NEXT_TASK.md) for immediate work
3. Review [ROADMAP.md](ROADMAP.md) for long-term vision

---

**Document Version**: 1.0
**Last Updated**: 2026-07-07
**Owner**: CTO / Lead Systems Engineer
