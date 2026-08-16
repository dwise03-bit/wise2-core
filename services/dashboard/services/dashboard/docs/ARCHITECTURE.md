# SYSTEM ARCHITECTURE

**WISE² Enterprise**  
**Version**: 10.0  
**Date**: 2026-07-11

---

## ARCHITECTURE OVERVIEW

WISE² Enterprise is a cloud-native, AI-powered business operating system built as a distributed monorepo with clear separation between frontend, backend, and infrastructure layers.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   CDN & Static Assets                   │
│              (CloudFront / Cloudflare)                  │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│              Load Balancer & Reverse Proxy              │
│                  (Traefik / Nginx)                      │
│          SSL/TLS, Rate Limiting, Routing                │
└────────────────────────┬────────────────────────────────┘
                         │
      ┌──────────────────┼──────────────────┐
      │                  │                  │
┌─────▼──────┐   ┌──────▼───────┐   ┌─────▼──────┐
│  Website   │   │  Dashboard   │   │   Studio   │
│ (Next.js)  │   │  (Next.js)   │   │ (Next.js)  │
│ Port 3001  │   │  Port 3002   │   │ Port 3003  │
└─────┬──────┘   └──────┬───────┘   └─────┬──────┘
      │                  │                  │
      └──────────────────┼──────────────────┘
                         │
                    API Gateway
                   (Express/NestJS)
                     Port 3000
                    ┌────┬────┐
              ┌─────▼─┐ ┌─▼────────┐
              │ Auth  │ │ Business │
              │ Logic │ │ Services │
              └─────┬─┘ └─┬────────┘
                    │    │
      ┌─────────────┼────┼──────────────┐
      │             │    │              │
┌─────▼──┐   ┌──────▼──┐ │  ┌───────────▼──┐
│PostgreSQL│ │  Redis  │ │  │  S3/Object   │
│ Database │ │  Cache  │ │  │  Storage     │
└──────────┘ └─────────┘ │  └──────────────┘
                         │
                    ┌────▼────┐
                    │    AI    │
                    │ Services │
                    │ (Hermes) │
                    └─────────┘
```

---

## CORE COMPONENTS

### 1. Frontend Applications (Next.js 14+)

**Website** (`apps/website`)
- Public landing page
- Marketing content
- SEO optimized
- Static Generation (SSG) where possible
- Dynamic routes for CMS content

**Dashboard** (`apps/dashboard`)
- Customer portal
- Project management
- User settings
- Analytics dashboard
- Real-time updates via WebSocket

**Studio** (`apps/studio`)
- WISE Sound Labs interface
- Audio editing & mixing
- Real-time collaboration
- WebRTC for recording
- Tone.js for Web Audio API

**Admin** (`apps/admin`)
- Admin operations console
- User management
- Analytics
- System health
- Billing management

**Shared Components** (`packages/ui-components`)
- Reusable React components
- Design system implementation
- Accessibility built-in
- Dark mode support

### 2. Backend API (NestJS or Express)

**Location**: `packages/api`

**Modules**:
- **Authentication** — JWT, OAuth2, MFA
- **Users** — User management, profiles
- **Projects** — Project CRUD, versioning
- **Audio** — Audio processing, storage
- **Billing** — Stripe integration, subscriptions
- **Analytics** — Event tracking, reporting
- **Community** — Discord integration, social features
- **AI** — Hermes orchestration, agent routing

**API Style**: REST with JSON  
**Real-time**: Socket.IO for live updates  
**Performance**: Response < 200ms (p95)  

### 3. Database Layer (PostgreSQL)

**Location**: `packages/db`

**Purpose**:
- Relational data modeling
- ACID transactions
- Complex queries
- Audit trails
- Backup & recovery

**Key Tables**:
- users, sessions, oauth_accounts
- projects, tracks, versions
- subscriptions, invoices, credit_transactions
- events, audit_logs
- community_events, achievements

**Indexing Strategy**:
- User lookups (email, ID)
- Project queries (owner_id, status)
- Time-series queries (created_at, updated_at)
- Full-text search (name, description)

### 4. Caching Layer (Redis)

**Purpose**:
- Session storage
- Real-time data
- Rate limiting
- Message queue
- Cache invalidation

**Usage**:
- User sessions (TTL: 7 days)
- Project cache (TTL: 1 hour)
- Rate limit counters (TTL: 1 minute)
- WebSocket state
- Job queues

### 5. Object Storage (S3/GCS/MinIO)

**Purpose**:
- Audio file storage
- Video file storage
- Backup storage
- Deliverables
- Asset library

**Structure**:
```
s3://wise2-enterprise/
├── projects/
│   ├── {project_id}/
│   │   ├── tracks/
│   │   ├── versions/
│   │   └── exports/
├── users/
│   ├── {user_id}/
│   │   └── avatars/
├── assets/
│   ├── samples/
│   ├── presets/
│   └── effects/
└── backups/
    └── {date}/
```

### 6. AI Orchestration Layer (Hermes)

**Location**: `packages/ai`

**Components**:
- **Hermes Core** — Request routing & coordination
- **Creative Director** — Audio brand guidance
- **Brand Strategist** — Strategic direction
- **Marketing Assistant** — Content & campaign
- **Project Coordinator** — Workflow management
- **Customer Success** — Support & onboarding
- **Quality Reviewer** — Quality assurance

**Architecture**:
- Tool-calling pattern (Anthropic SDK)
- Function definitions for each agent capability
- Context persistence across turns
- Human review gates for client work

### 7. Message Queue & Job Processing

**Technology**: Redis Streams or RabbitMQ

**Jobs**:
- Email sending
- Audio processing (FFmpeg)
- Report generation
- Webhook dispatching
- Backup operations
- Analytics aggregation

**Worker Service**: `packages/worker` (Node.js)

---

## DATA FLOW

### Authentication Flow

```
User Input
    ↓
[Next.js Auth Page]
    ↓
[POST /api/auth/login]
    ↓
[NestJS Auth Service] ← PostgreSQL (user lookup)
    ↓
[Generate JWT Token]
    ↓
[Set HttpOnly Cookie]
    ↓
[Redirect to Dashboard]
    ↓
[Dashboard uses JWT for API calls]
```

### Project Creation Flow

```
User Clicks "New Project"
    ↓
[Studio UI Form]
    ↓
[POST /api/projects]
    ↓
[NestJS Projects Service]
    ↓
[Insert into PostgreSQL]
    ↓
[Cache in Redis]
    ↓
[Emit WebSocket event]
    ↓
[Update Studio UI in real-time]
```

### Audio Processing Flow

```
User Uploads Audio File
    ↓
[S3 Presigned URL Upload]
    ↓
[File stored in S3]
    ↓
[Queue processing job]
    ↓
[Worker: FFmpeg analysis]
    ↓
[Extract metadata (duration, bitrate, etc.)]
    ↓
[Store in PostgreSQL]
    ↓
[Update Redis cache]
    ↓
[WebSocket notification to client]
    ↓
[Display in Studio UI]
```

---

## DEPLOYMENT ARCHITECTURE

### Development Environment

```
Local Machine:
├── Docker Compose (all services)
├── PostgreSQL + Redis (containerized)
├── pnpm dev (monorepo)
└── http://localhost:3000-3004
```

### Staging Environment

```
Cloud Deployment (DigitalOcean / AWS):
├── Docker containers (each service)
├── Managed PostgreSQL
├── Managed Redis
├── Traefik (reverse proxy)
├── GitHub Actions CI/CD
└── https://staging.wise2.dev
```

### Production Environment

```
Cloud Deployment (Kubernetes or Docker Swarm):
├── API Pods (3+ replicas)
├── Frontend Services (CDN + origin)
├── PostgreSQL (managed, backups)
├── Redis (managed cluster)
├── S3 Storage (multi-region)
├── Load Balancer (AWS ALB / Traefik)
├── Monitoring (Prometheus + Grafana)
├── Logging (ELK / Loki)
└── https://wise2.com
```

---

## SCALABILITY CONSIDERATIONS

### Horizontal Scaling

**Stateless Services**:
- API can scale to N replicas
- Load balancer distributes traffic
- Database connections pooled

**Database Scaling**:
- Read replicas for analytics queries
- Connection pooling (PgBouncer)
- Query optimization & indexing

**Cache Scaling**:
- Redis cluster for high throughput
- Consistent hashing for distribution
- TTL strategy for memory efficiency

### Performance Optimization

**Frontend**:
- Code splitting (dynamic imports)
- Image optimization
- CSS-in-JS minimization
- Lazy loading

**Backend**:
- Database query optimization
- Caching strategies
- Async/await patterns
- Connection pooling

**Infrastructure**:
- CDN caching
- Gzip compression
- HTTP/2
- Autoscaling policies

---

## RELIABILITY & REDUNDANCY

### High Availability

- Multi-region deployment
- Automated failover
- Health checks (HTTP, TCP)
- Circuit breakers for external APIs

### Disaster Recovery

- Database point-in-time recovery
- S3 cross-region replication
- Backup retention (30 days)
- Restore procedures documented

### Monitoring & Alerting

- Prometheus metrics
- Grafana dashboards
- Alert rules (CPU, memory, latency)
- Incident response procedures

---

## SECURITY ARCHITECTURE

See [SECURITY.md](./SECURITY.md) for detailed security guidelines.

### Key Security Features

- End-to-end encryption (TLS)
- Database encryption at rest
- Secrets management (Vault / AWS Secrets Manager)
- Audit logging
- Role-based access control (RBAC)
- API rate limiting
- DDoS protection

---

## INTEGRATION POINTS

### External Services

- **Claude API** (AI models)
- **Stripe** (payments)
- **Resend / SendGrid** (email)
- **Discord API** (community)
- **YouTube API** (LIVE)
- **Twitch API** (LIVE)

### Communication Patterns

- REST for CRUD operations
- WebSocket for real-time
- Webhooks for event delivery
- Message queues for async jobs

---

## TECHNOLOGY DECISIONS

### Why Next.js?
- Full-stack React framework
- Built-in optimization
- API routes
- Deployment-ready
- Excellent DX

### Why NestJS/Express?
- TypeScript-first
- Modular architecture
- Excellent middleware ecosystem
- Strong typing (NestJS)
- Battle-tested (Express)

### Why PostgreSQL?
- ACID compliance
- Complex queries
- Full-text search
- Proven scalability
- Rich data types

### Why Redis?
- In-memory speed
- Session management
- Message queuing
- Atomic operations
- Cluster support

### Why S3/Object Storage?
- Unlimited scalability
- Multi-region replication
- Cost-effective
- Standard format
- Easy integration

---

## TRADE-OFFS & DECISIONS

### Monorepo vs. Microservices
**Decision**: Monorepo (Turborepo)  
**Rationale**: Single team, shared code, simpler deployment initially  
**Trade-off**: Eventually may migrate to microservices if team grows

### REST vs. GraphQL
**Decision**: REST  
**Rationale**: Simpler to implement, cache-friendly, standard practice  
**Trade-off**: Over-fetching some data, but acceptable

### SQL vs. NoSQL
**Decision**: PostgreSQL (SQL)  
**Rationale**: Complex relational data, ACID compliance needed  
**Trade-off**: Less flexible schema, but better for data integrity

### Real-time via WebSocket vs. Polling
**Decision**: WebSocket (Socket.IO)  
**Rationale**: Lower latency, better UX, efficient  
**Trade-off**: Stateful connections, harder to scale

---

## FUTURE ARCHITECTURE EVOLUTION

### Year 1
- Monolithic backend
- Single region
- PostgreSQL + Redis
- Basic monitoring

### Year 2
- Service decomposition
- Multi-region consideration
- Read replicas
- Advanced monitoring

### Year 3+
- Microservices architecture
- Global distribution
- Advanced caching
- AI/ML infrastructure

---

**Owner**: Wise Defense LLC (PROJECT GENESIS)  
**Maintained By**: CTO + Architecture Team  
**Last Updated**: 2026-07-11  
**Next Review**: 2026-10-11 (quarterly)
