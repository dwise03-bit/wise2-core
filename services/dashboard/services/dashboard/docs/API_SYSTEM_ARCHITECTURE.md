# WISE² Enterprise - API System Architecture

**Last Updated**: 2026-07-11  
**Architecture Status**: Phase 1 Complete | Phase 2+ Planned  
**Total Services**: 15 Registered | 5 Active | 8 Template | 2 Missing

---

## Architecture Overview

WISE² Enterprise is a modular, cloud-native architecture with centralized API management, comprehensive monitoring, and zero hardcoded secrets.

```
┌─────────────────────────────────────────────────────────────────┐
│                     WISE² ENTERPRISE PLATFORM                    │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                       CLIENT LAYER (Port 3001-3002)              │
├──────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  Dashboard   │  │ Admin Panel  │  │ Community    │           │
│  │  (Next.js)   │  │  (Next.js)   │  │  Features    │           │
│  │  :3001       │  │  :3002       │  │              │           │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘           │
└─────────┼──────────────────┼──────────────────┼──────────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                    ┌────────▼─────────┐
                    │  HTTP/REST API   │
                    │  (Port 3000)     │
                    └────────┬─────────┘
│
├──────────────────────────────────────────────────────────────────┐
│                    API GATEWAY & AUTH (Port 3000)                │
├──────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Global Middleware (Validation, Auth, Logging)             │ │
│  │  - JWT Bearer Token Validation                             │ │
│  │  - Input Validation (class-validator)                      │ │
│  │  - CORS & Security Headers                                 │ │
│  │  - Request Logging & Metrics                               │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  API Manager (Central Credential & Health Management)       │ │
│  │  - Service Registry (15 services)                           │ │
│  │  - Credential Validation                                   │ │
│  │  - Health Checks                                           │ │
│  │  - Integration Inventory                                   │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
          │
          ├─────────────────────────────────────────┐
          │                                         │
    ┌─────▼────────┐                         ┌──────▼────────┐
    │   API Routes │                         │   External    │
    │   (6 Modules)│                         │   Services    │
    │              │                         │               │
    ├──────────────┤                         ├───────────────┤
    │ • Auth       │                         │ • Claude API  │
    │ • Projects   │                         │ • Discord     │
    │ • Analytics  │                         │ • Stripe      │
    │ • Billing    │                         │ • Email       │
    │ • Community  │                         │ • GitHub      │
    │ • Modules    │                         │ • YouTube     │
    └──────┬───────┘                         └───────────────┘
           │
           └─────────────────────┬──────────────────────┐
                                 │                      │
                        ┌────────▼──────────┐   ┌───────▼────────┐
                        │  Data Services    │   │  Infrastructure│
                        ├───────────────────┤   ├────────────────┤
                        │ • PostgreSQL 15   │   │ • Prometheus   │
                        │ • Redis 7         │   │ • Grafana      │
                        │ • TypeORM         │   │ • AlertManager │
                        └───────────────────┘   │ • Ollama       │
                                                └────────────────┘
```

---

## Core Services

### 1. API Service (NestJS)

**Port**: 3000  
**Status**: ✅ Production Ready  
**Framework**: NestJS 10.2 with TypeScript  

**Responsibilities**:
- HTTP request handling and routing
- JWT authentication and authorization
- Input validation and sanitization
- Business logic execution
- Database transaction management
- API response formatting

**Modules** (6 core modules):

```
packages/api/src/
├── auth/              # User authentication & JWT
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   ├── user.entity.ts
│   ├── dto/
│   └── strategies/
├── projects/          # Project management
├── analytics/         # Metrics & insights
├── billing/           # Payment & subscriptions
├── community/         # User engagement
├── modules/           # Plugin system
└── config/            # API Manager & configuration
    ├── api-manager.ts
    ├── api-status.controller.ts
    └── configuration/
```

**Key Features**:
- Global input validation pipeline
- JWT-based authentication (HS256)
- Bcrypt password hashing (12 rounds)
- Request logging with JSON format
- Prometheus metrics collection
- TypeORM with PostgreSQL

---

### 2. Dashboard Service (Next.js)

**Port**: 3001  
**Status**: ✅ Production Ready  
**Framework**: Next.js 14 with React 19  

**Responsibilities**:
- User interface for core features
- Real-time data display
- User authentication flow
- Form submission and validation
- API integration and data fetching

**Pages**:
- `/` — Home dashboard
- `/live` — LIVE Command Center (Phase 2+)
- `/community` — Community features
- `/settings` — User settings
- `/analytics` — Analytics dashboard

---

### 3. Admin Dashboard

**Port**: 3002  
**Status**: ✅ Production Ready  
**Framework**: Next.js 14 with React 19  

**Responsibilities**:
- System administration
- User management
- Service monitoring
- Configuration management
- Audit log viewing

---

### 4. Discord Bot Service

**Status**: ✅ Production Ready  
**Type**: Discord.js bot (no port exposed)  

**Commands**:
- `!status` — System health check
- `!update` — Deploy latest code
- `!restart` — Restart services
- `!logs` — Stream service logs
- `!metrics` — System metrics

**Integration Points**:
- Directly calls API service
- Reads from PostgreSQL
- Sends to Prometheus metrics
- Posts to configured log channel

---

### 5. Worker Service

**Status**: ✅ Implemented  
**Type**: Background job processor  

**Responsibilities**:
- Scheduled task execution (cron jobs)
- Background email sending
- Data processing and cleanup
- Report generation
- Cache invalidation

**Job Queue**: Redis-based with Bull/Arena

---

## Data Layer

### PostgreSQL 15

**Status**: ✅ Production Ready  
**Port**: 5432 (internal) / 5434 (external in local)  
**Database**: `wise2_core`  

**Features**:
- Full ACID compliance
- UUID primary keys
- Automatic timestamps
- JSON column support
- Full-text search
- Role-based access control

**Schemas**:
```sql
-- Core
users
projects
modules

-- Analytics
events
metrics
reports

-- Billing
subscriptions
invoices
payments

-- Community
posts
comments
likes

-- System
audit_logs
sessions
refresh_tokens
```

**Backup Strategy**:
- Daily automated backups
- 30-day retention
- Point-in-time recovery enabled
- Backup verification jobs

---

### Redis 7

**Status**: ✅ Production Ready  
**Port**: 6379 (internal) / 6381 (external in local)  
**Max Memory**: 256MB (configurable)  

**Use Cases**:
- Application caching (1-hour TTL)
- Session storage (24-hour TTL)
- Message queue for workers
- Real-time subscriptions
- Rate limiting counters
- Leaderboard caching

**Key Patterns**:
```
Cache Keys:
- user:{id}:profile
- project:{id}:data
- session:{token}

Queue Names:
- jobs:email
- jobs:reports
- jobs:cleanup

Rate Limits:
- api:ratelimit:{endpoint}:{userId}
```

---

## External Services Integration

### AI Services

#### Anthropic Claude API (Primary)
- **Status**: ✅ Active
- **Purpose**: Intelligent feature generation
- **Rate Limits**: Dependent on plan
- **Fallback**: Ollama (local)

#### OpenAI API (Alternative)
- **Status**: ⚠️ Template
- **Purpose**: Model redundancy
- **When Enabled**: Phase 2+

#### Ollama (Local Fallback)
- **Status**: ⚠️ Optional
- **Purpose**: Offline AI capability
- **Use Case**: Development/testing

---

### Communication Services

#### Discord Bot
- **Status**: ✅ Active
- **Purpose**: Admin alerts & commands
- **Permissions**: Administrator
- **Availability**: 24/7 monitoring

#### Email Services (To Implement)

**Resend** (Recommended):
- Modern infrastructure
- WYSIWYG templates
- Good deliverability
- Webhook support

**SendGrid** (Alternative):
- Established provider
- Advanced features
- Event tracking
- Subuser management

---

### Payment Processing (To Implement)

#### Stripe
- **Status**: ⚠️ Framework Ready
- **Features**:
  - Subscription management
  - One-time payments
  - Invoicing
  - Connect (marketplace)
- **Webhook**: Configured
- **Testing**: Use test keys first

---

### Developer Services

#### GitHub Integration
- **Status**: ⚠️ Partial
- **Purpose**: Repository automation
- **Current**: Manual deployment

#### YouTube API (Phase 2+)
- **Purpose**: LIVE Command Center streaming

#### Twitch API (Phase 2+)
- **Purpose**: Alternative streaming

---

## Monitoring & Infrastructure

### Prometheus (Metrics Collection)

**Port**: 9090  
**Status**: ✅ Active  

**Scraped Metrics**:
- API server metrics
- Database pool stats
- Redis connection stats
- Container resource usage
- Custom application metrics

**Retention**: 15 days  
**Scrape Interval**: 15 seconds  

```
Available Metrics:
- http_requests_total
- http_request_duration_seconds
- process_memory_bytes
- process_cpu_seconds_total
- postgres_up
- redis_connected_clients
```

---

### Grafana (Visualization)

**Port**: 3003 (changed from 3001)  
**Status**: ✅ Configured  
**Default Credentials**: admin/admin  

**Dashboards**:
1. System Overview
2. API Performance
3. Database Health
4. Container Resources
5. Error Tracking

**Alert Rules**:
- High latency (>500ms)
- High error rate (>5%)
- Database connection issues
- Out of memory conditions
- Disk space warnings

---

### AlertManager

**Status**: ✅ Configured  
**Purpose**: Alert routing and deduplication  

**Notification Channels**:
- Discord (bot notifications)
- Email (critical only)
- Webhook (custom integrations)

---

## Dependency Graph

```
┌─────────────────────────────────────────────────────────────┐
│                   DEPENDENCY FLOW                            │
└─────────────────────────────────────────────────────────────┘

Dashboard (3001)
    ↓ (HTTP/REST)
    └─→ API Service (3000)
        ├─→ Auth Module
        │   ├─→ PostgreSQL (users table)
        │   ├─→ Redis (sessions)
        │   └─→ JWT validation
        │
        ├─→ Projects Module
        │   ├─→ PostgreSQL (projects table)
        │   └─→ Redis (cache)
        │
        ├─→ Analytics Module
        │   ├─→ PostgreSQL (events table)
        │   └─→ Prometheus (metrics)
        │
        ├─→ Billing Module
        │   ├─→ PostgreSQL (subscriptions)
        │   ├─→ Stripe API (when enabled)
        │   └─→ Worker (async jobs)
        │
        ├─→ Community Module
        │   ├─→ PostgreSQL (posts, comments)
        │   └─→ Redis (counters)
        │
        └─→ External Services
            ├─→ Claude API (AI features)
            ├─→ GitHub API (partial)
            └─→ Discord Bot (alerts)

Discord Bot
    ├─→ Discord API
    ├─→ API Service (status calls)
    └─→ PostgreSQL (audit logs)

Worker Service
    ├─→ Redis (job queue)
    ├─→ PostgreSQL (state)
    ├─→ Email Service (when enabled)
    └─→ Ollama/Claude (processing)

Monitoring Stack
    ├─→ Prometheus (metrics)
    ├─→ Grafana (3003)
    ├─→ AlertManager
    └─→ API metrics endpoint

PostgreSQL (5432)
    └─→ Regular backups to S3
        └─→ MinIO (local) or AWS S3

Redis (6379)
    └─→ Session store
    └─→ Cache layer
    └─→ Message queue
```

---

## Data Flow Examples

### User Registration Flow

```
1. Dashboard → POST /api/v1/auth/register
2. API Service
   ├─ Validate input
   ├─ Hash password (bcrypt)
   ├─ Check duplicate email
   ├─ Create user in PostgreSQL
   ├─ Store session in Redis
   └─ Generate JWT tokens
3. Return tokens to Dashboard
4. Discord Bot notified (if enabled)
5. Prometheus metrics updated
```

### API Request Flow

```
1. Client → HTTP Request with JWT Bearer token
2. API Gateway
   ├─ Validate JWT signature
   ├─ Check token expiration
   ├─ Extract user context
   ├─ Validate input (class-validator)
   └─ Log request metadata
3. Route Handler
   ├─ Check authorization
   ├─ Query/modify PostgreSQL
   ├─ Update Redis cache
   ├─ Call external APIs (Claude, etc.)
   └─ Format response
4. Prometheus
   ├─ Record HTTP request metric
   ├─ Record latency
   ├─ Record any errors
   └─ Update aggregated statistics
5. Return HTTP Response
6. Client receives result
```

### Background Job Flow

```
1. API Service → Enqueue job in Redis
2. Worker Service
   ├─ Poll Redis queue
   ├─ Fetch job details
   ├─ Process (email, report, cleanup)
   ├─ Update job status in PostgreSQL
   └─ Record metrics in Prometheus
3. Success/Failure notification
4. Cleanup old job records
```

---

## API Manager Architecture

```
┌──────────────────────────────────────────────────────────────┐
│              API MANAGER (Centralized Registry)              │
└──────────────────────────────────────────────────────────────┘

Components:
1. Service Registry (15 services)
2. Credential Validator
3. Health Check Engine
4. Integration Mapper
5. Configuration Loader

Features:
✅ Automatic startup validation
✅ Masked credential logging
✅ Hot reload support (future)
✅ Health check endpoints
✅ Integration inventory
✅ Dependency graph

Exposed Endpoints:
GET /api/v1/system/apis/health        → All services health
GET /api/v1/system/apis/inventory     → Service registry
GET /api/v1/system/apis/by-category/:cat → Services by type
GET /api/v1/system/apis/:service      → Single service details
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   SECURITY LAYERS                            │
└─────────────────────────────────────────────────────────────┘

Layer 1: Network Security
├─ Docker internal networks
├─ No external port exposure (except API, dashboards)
├─ Health checks on internal endpoints
└─ Firewall rules (production)

Layer 2: Application Security
├─ JWT Bearer token authentication
├─ Global input validation pipeline
├─ Password hashing (bcrypt 12 rounds)
├─ CORS configuration
├─ Rate limiting (Redis-based)
└─ Request logging & audit trail

Layer 3: Data Security
├─ PostgreSQL role-based access
├─ Redis password protection
├─ SSL/TLS for external APIs
├─ Encrypted credentials in environment
└─ No secrets in version control

Layer 4: Infrastructure Security
├─ API Manager credential validation
├─ Health checks on startup
├─ Secrets never logged
├─ Credentials masked in API responses
└─ Audit logging for all operations

Layer 5: External Service Security
├─ API key rotation support
├─ OAuth2 ready (Phase 2)
├─ Webhook signature validation
└─ Rate limit compliance
```

---

## Scaling Strategy

### Horizontal Scaling

**API Service**:
- Run multiple instances behind load balancer
- Stateless design (all state in PostgreSQL/Redis)
- Share PostgreSQL and Redis across instances

**Worker Service**:
- Run multiple workers pulling from same Redis queue
- Automatic load balancing via Redis

**Database**:
- PostgreSQL: Add read replicas for read-heavy queries
- Redis: Sentinel for high availability

### Vertical Scaling

**For Raspberry Pi**:
- Reduce memory limits
- Decrease Prometheus retention
- Single instance deployment

**For VPS/Cloud**:
- Increase memory allocations
- Add connection pooling
- Enable database indexing

---

## Monitoring & Observability

**Key Metrics Tracked**:
- Request rate and latency (API)
- Database query performance
- Cache hit/miss rates
- Worker job duration
- External API call latency
- Error rates by endpoint
- Memory and CPU usage
- Disk space and I/O

**Log Aggregation** (Phase 2):
- CloudWatch (AWS)
- Datadog
- ELK Stack
- Sentry (error tracking)

---

## Deployment Models

### Local Development
```
All services in docker-compose.local.yml
Ports: 5434 (postgres), 6381 (redis), 3000 (api), 3001-3002 (dashboards)
```

### Raspberry Pi
```
Single node deployment
Memory-optimized configuration
systemd service integration
```

### VPS/Cloud
```
Docker on Linux
Persistent volumes for databases
Reverse proxy (Nginx/Traefik)
SSL/TLS termination
```

---

**Architecture Version**: 1.0  
**Last Updated**: 2026-07-11  
**Next Review**: Phase 2 implementation
