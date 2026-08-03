# Project Index — Wise² Core

Complete catalog of all components, services, and repositories within Wise² Core ecosystem.

---

## Overview

Wise² Core is composed of multiple interconnected systems:

```
Wise² Core (Orchestration & Infrastructure)
├── Wise OS (Desktop Environment)
├── Wise Touch (Mobile/Touch Interfaces)
├── Infrastructure Services
├── AI & Automation
├── Business Logic & Workflows
├── Hardware Integration
└── Documentation & Knowledge Base
```

---

## Core Repositories

### 1. wise2-core (This Repository)
**Purpose**: Central orchestration system, infrastructure, and documentation
**Status**: In development (Phase 1 — Foundation)
**Owner**: CTO / Lead Systems Engineer
**Repository**: https://github.com/dwise03-bit/wise2-core
**Technology**: Docker, Node.js, TypeScript (proposed)
**Key Files**:
- MASTER.md — Architecture specification
- ROADMAP.md — Development timeline
- DECISIONS.md — Architectural decisions
- docker-compose.yml — Service definitions
- README.md — Quick start

**Components in this repository**:
- Raspberry Pi orchestration
- Docker infrastructure
- CI/CD automation
- Monitoring and alerting
- Database services
- API gateways
- Message queues
- Authentication services
- Core documentation

---

### 2. wise-os (Desktop Environment) [To Be Created]
**Purpose**: Desktop operating system for primary workflows
**Status**: Planned (Phase 4)
**Owner**: TBD
**Repository**: https://github.com/dwise03-bit/wise-os (to be created)
**Technology**: TBD (proposed: Electron, TypeScript, React)
**Description**:
User-facing desktop application providing:
- File management
- Application launcher
- System settings
- Local service access
- Wise OS integration
- Offline capabilities

**Integration Points**:
- Connects to wise2-core API
- Syncs data with Wise Touch
- Accesses local Ollama
- Receives updates from GitHub

---

### 3. wise-touch (Mobile/Tablet Interfaces) [To Be Created]
**Purpose**: Touch-based interfaces for mobile and tablet
**Status**: Planned (Phase 4)
**Owner**: TBD
**Repository**: https://github.com/dwise03-bit/wise-touch (to be created)
**Technology**: TBD (proposed: React Native or native iOS/Android)
**Description**:
Cross-platform mobile application providing:
- Synchronization with Wise OS
- Touch-optimized interfaces
- Offline access to data
- Notifications and alerts
- Quick actions
- Push notifications

**Integration Points**:
- Connects to wise2-core API
- Syncs with Wise OS
- Backup to cloud storage
- Receives push notifications

---

## Service Architecture

### Infrastructure Services (Wise² Core)

#### Container Orchestration
| Component | Purpose | Status | Technology |
|-----------|---------|--------|------------|
| Docker Daemon | Container runtime | Planned | Docker |
| Docker Compose | Service orchestration | Planned | Docker Compose |
| Network Overlay | Inter-container communication | Planned | Docker networking |
| Volume Management | Persistent storage | Planned | Docker volumes |

#### Data Services
| Component | Purpose | Status | Technology |
|-----------|---------|--------|------------|
| PostgreSQL | Primary database | Planned | PostgreSQL |
| Redis | Caching & sessions | Planned | Redis |
| Message Queue | Event processing | Planned | Redis Streams or RabbitMQ |
| Search Index | Full-text search | Planned | Elasticsearch or similar |

#### Core Services
| Component | Purpose | Status | Technology |
|-----------|---------|--------|------------|
| API Gateway | HTTP request routing | Planned | Kong or Express |
| Authentication | User identity & access | Planned | JWT + PostgreSQL |
| Authorization | Permission management | Planned | Role-based access control |
| Configuration Server | Centralized configuration | Planned | File-based or etcd |
| Service Registry | Service discovery | Planned | Consul or in-memory |

#### AI Services
| Component | Purpose | Status | Technology |
|-----------|---------|--------|------------|
| Claude API Client | Claude AI integration | Planned | TypeScript SDK |
| Ollama Wrapper | Local LLM inference | Planned | Ollama |
| Vector Database | Embeddings & RAG | Planned | Pinecone, Weaviate, or Milvus |
| AI Agent Framework | Multi-step reasoning | Planned | Custom or LangChain |

#### Operations Services
| Component | Purpose | Status | Technology |
|-----------|---------|--------|------------|
| Git Synchronization | GitHub sync daemon | Planned | Git + Node.js |
| Backup Service | Automated backups | Planned | Custom backup tool |
| Monitoring Agent | Metrics collection | Planned | Prometheus |
| Log Aggregator | Centralized logging | Planned | Filebeat + ELK |
| Health Checker | Service monitoring | Planned | Custom health service |

#### Automation Services
| Component | Purpose | Status | Technology |
|-----------|---------|--------|------------|
| Workflow Engine | DAG-based orchestration | Planned | Apache Airflow or custom |
| Scheduler | Cron-like job scheduling | Planned | Node-cron or similar |
| Notification Service | Multi-channel alerts | Planned | Custom service |
| Integration Platform | External API connectors | Planned | Zapier-like engine |

#### Hardware Services
| Component | Purpose | Status | Technology |
|-----------|---------|--------|------------|
| 3D Printer API | Printer control & monitoring | Planned | Bambu Lab API + Prusa API |
| IoT Device Manager | IoT device management | Planned | Custom MQTT broker |
| Sensor Data Ingestion | Sensor data collection | Planned | InfluxDB or time-series DB |
| Hardware Automation | Automated hardware workflows | Planned | Custom automation engine |

---

## Documentation System

### Documentation Repositories

#### Main Documentation
**Location**: `/docs` in wise2-core
**Contents**:
- Architecture guides
- Deployment procedures
- Configuration documentation
- Troubleshooting guides
- API documentation
- Runbooks and playbooks

**Key Documents**:
- README.md — Project overview
- MASTER.md — System architecture
- CURRENT_STATE.md — Project status
- NEXT_TASK.md — Immediate priorities
- ROADMAP.md — Long-term roadmap
- DECISIONS.md — Architectural decisions
- CHANGELOG.md — Version history

#### Wiki & Guides [To Be Created]
**Location**: GitHub Wiki
**Contents**:
- Getting started guide
- Developer guide
- Operations guide
- Troubleshooting
- FAQ

#### Runbooks [To Be Created]
**Location**: `/docs/runbooks`
**Contents**:
- Deployment procedures
- Incident response
- Recovery procedures
- Maintenance tasks
- Troubleshooting steps

---

## External Services & Integrations

### Third-Party Services

| Service | Purpose | Status | Link |
|---------|---------|--------|------|
| GitHub | Source control & CI/CD | Active | https://github.com/dwise03-bit |
| Claude API | AI language model | Planned | https://console.anthropic.com |
| Ollama | Local LLM inference | Planned | https://ollama.ai |
| Bambu Lab Cloud | 3D printer integration | Planned | https://cloud.bambulab.com |
| Prusa Connect | 3D printer integration | Planned | https://connect.prusa3d.com |

### Cloud Services [To Be Determined]

| Service | Purpose | Status | Provider |
|---------|---------|--------|----------|
| VPS Hosting | Cloud infrastructure | TBD | AWS / DigitalOcean / Linode |
| Object Storage | File storage | TBD | AWS S3 / DigitalOcean Spaces |
| CDN | Static content delivery | TBD | Cloudflare / AWS CloudFront |
| DNS | Domain management | TBD | Route 53 / Cloudflare |
| Email Service | Transactional email | TBD | SendGrid / AWS SES |

---

## Dependency Graph

### Core Dependencies

```
External Services
    ├── GitHub (source control, CI/CD)
    ├── Claude API (AI inference)
    └── Cloud Infrastructure (storage, compute)
         ↓
    Raspberry Pi (Orchestrator)
         ├── Docker Daemon
         │    ├── PostgreSQL
         │    ├── Redis
         │    ├── Message Queue
         │    ├── API Gateway
         │    ├── Auth Service
         │    ├── AI Services
         │    ├── Workflow Engine
         │    ├── Monitoring Stack
         │    └── Other Services
         └── Ollama (Local AI)
             ↓
    Clients
    ├── Wise OS (Desktop)
    ├── Wise Touch (Mobile)
    ├── Web Dashboard
    └── External APIs
```

### Service Dependencies

| Service | Depends On | Required For |
|---------|-----------|--------------|
| API Gateway | PostgreSQL, Redis | All client access |
| Auth Service | PostgreSQL, Redis | All authenticated requests |
| Workflow Engine | Message Queue, Database | Automation execution |
| AI Services | Claude API, Ollama, Vector DB | Intelligence features |
| Monitoring | Prometheus, Grafana | System visibility |
| Backup Service | Database, Storage | Disaster recovery |

---

## Development Priorities

### Phase 1: Foundation (Current)
- [x] Project charter and vision
- [ ] Repository structure
- [ ] Documentation framework
- [ ] Docker infrastructure templates
- [ ] Raspberry Pi setup plan
- [ ] CI/CD baseline

### Phase 2: Core Services
- [ ] Database services
- [ ] Caching layer
- [ ] Message queue
- [ ] Service orchestration
- [ ] API gateway
- [ ] Authentication

### Phase 3: AI Integration
- [ ] Claude API client
- [ ] Ollama deployment
- [ ] Vector database
- [ ] AI agent framework
- [ ] Automation workflows

### Phase 4: Applications
- [ ] Wise OS development
- [ ] Wise Touch development
- [ ] Web dashboard
- [ ] Data synchronization

### Phase 5+: Scale & Optimize
- [ ] Multi-node orchestration
- [ ] Cloud infrastructure
- [ ] Performance optimization
- [ ] Hardware integration

---

## Team & Responsibilities

| Role | Responsibility | Status |
|------|-----------------|--------|
| CTO / Lead Systems Engineer | Overall architecture, infrastructure | Active (Claude Code) |
| Raspberry Pi Admin | Pi setup and maintenance | TBD |
| Backend Developer | Core services and APIs | TBD |
| Frontend Developer | Wise OS and Wise Touch | TBD |
| DevOps Engineer | CI/CD, monitoring, deployment | TBD |
| Hardware Engineer | 3D printing, IoT integration | TBD |
| Documentation | Runbooks, guides, procedures | Shared |

---

## File Organization

```
wise2-core/
├── README.md                   # Project overview
├── MASTER.md                   # System architecture
├── CURRENT_STATE.md            # Project status
├── NEXT_TASK.md                # Immediate priorities
├── ROADMAP.md                  # Long-term roadmap
├── DECISIONS.md                # Architectural decisions
├── CHANGELOG.md                # Version history
├── PROJECT_INDEX.md            # This file
│
├── docs/                       # Documentation
│   ├── README.md
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── CONFIGURATION.md
│   ├── runbooks/               # Operational procedures
│   │   ├── deployment.md
│   │   ├── disaster-recovery.md
│   │   ├── maintenance.md
│   │   └── troubleshooting.md
│   └── guides/
│       ├── getting-started.md
│       ├── development-setup.md
│       └── operations-guide.md
│
├── infrastructure/             # Infrastructure as Code
│   ├── docker-compose.yml      # Service definitions
│   ├── docker-compose.override.yml # Local dev overrides
│   ├── .dockerignore
│   ├── Dockerfile              # Custom images
│   ├── docker/                 # Dockerfile directory
│   │   ├── app.Dockerfile
│   │   ├── worker.Dockerfile
│   │   └── ...
│   ├── config/                 # Configuration templates
│   │   ├── nginx.conf
│   │   ├── postgresql.conf
│   │   └── ...
│   └── scripts/                # Deployment scripts
│       ├── deploy.sh
│       ├── backup.sh
│       └── ...
│
├── raspberry-pi/               # Raspberry Pi specific
│   ├── setup-os.sh             # OS installation
│   ├── setup-docker.sh         # Docker setup
│   ├── setup-services.sh       # Service setup
│   ├── configuration/          # Pi configuration
│   └── README.md               # Pi documentation
│
├── wise-os/                    # Desktop environment
│   ├── README.md
│   ├── src/
│   └── ... (will be populated in Phase 4)
│
├── wise-touch/                 # Mobile interfaces
│   ├── README.md
│   ├── src/
│   └── ... (will be populated in Phase 4)
│
├── automation/                 # Business automation
│   ├── workflows/              # Workflow definitions
│   ├── scripts/                # Automation scripts
│   ├── templates/              # Workflow templates
│   └── README.md
│
├── hardware/                   # Hardware integration
│   ├── 3d-printing/            # 3D printing configs
│   │   ├── bambu-lab/
│   │   ├── prusa/
│   │   └── designs/
│   ├── iot/                    # IoT configurations
│   ├── sensors/                # Sensor configurations
│   └── README.md
│
├── ai/                         # AI integrations
│   ├── agents/                 # AI agent definitions
│   ├── prompts/                # Prompt templates
│   ├── models/                 # Model configurations
│   └── README.md
│
├── github/                     # GitHub automation
│   ├── workflows/              # GitHub Actions
│   │   ├── ci.yml              # CI pipeline
│   │   ├── deploy.yml          # Deploy pipeline
│   │   └── ...
│   ├── templates/              # Issue/PR templates
│   ├── hooks/                  # GitHub webhooks
│   └── README.md
│
├── config/                     # Configuration
│   ├── .env.example            # Environment template
│   ├── .gitignore              # Git ignore rules
│   ├── .editorconfig           # Editor settings
│   └── ...
│
└── tests/                      # Testing
    ├── unit/                   # Unit tests
    ├── integration/            # Integration tests
    ├── e2e/                    # End-to-end tests
    └── performance/            # Performance tests
```

---

## Getting Started

### For New Contributors
1. Read MASTER.md for architecture overview
2. Read CURRENT_STATE.md for current status
3. Review NEXT_TASK.md for immediate work
4. Follow docs/getting-started.md for setup
5. See DECISIONS.md for architectural context

### For Operators
1. Review raspberry-pi/README.md for Pi setup
2. Read docs/runbooks/deployment.md for deployment
3. Follow docs/runbooks/maintenance.md for ops
4. Consult docs/runbooks/troubleshooting.md for issues

### For Developers
1. Read docs/development-setup.md for environment
2. Review MASTER.md for architecture
3. Consult API.md for available endpoints
4. Follow CONTRIBUTING.md for code standards

---

## Related Projects & References

- Claude Code — Development platform used for this project
- Anthropic Claude API — AI inference backend
- Ollama — Local LLM inference engine
- Docker — Container platform
- PostgreSQL — Database system
- Redis — Caching and messaging
- GitHub — Version control and CI/CD
- Prometheus + Grafana — Monitoring stack

---

**Document Version**: 1.0
**Last Updated**: 2026-07-07
**Owner**: CTO / Lead Systems Engineer
**Next Review**: 2026-08-07
