# WISE² Raspberry Pi Architecture

Technical architecture and system design for WISE² running on Raspberry Pi 3B+.

## Overview Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   WISE² Enterprise (Pi Edition)             │
│              Optimized for Raspberry Pi 3B+                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
                   ┌──────────────────────┐
                   │   Traefik Reverse    │
                   │  Proxy & Load Bal    │
                   │  (Port 80, 443)      │
                   └──────────────────────┘
                      ↙                 ↘
            ┌──────────────────┐  ┌─────────────────┐
            │  WISE² API       │  │  Dashboard UI   │
            │  (Port 3000)     │  │  (Port 3001)    │
            │                  │  │                 │
            │ • REST API       │  │ • React/Next.js │
            │ • WebSockets     │  │ • Real-time UI  │
            │ • NestJS         │  │ • Responsive    │
            │ • Business Logic │  │ • Command Ctr   │
            └──────────────────┘  └─────────────────┘
                      ↓                   ↓
            ┌──────────────────────────────────────┐
            │       Shared Data & Cache Layer      │
            ├──────────────────────────────────────┤
            │  • SQLite DB (/data/wise2.db)        │
            │  • Redis Cache (256MB, LRU)          │
            │  • Persistent Volumes                │
            └──────────────────────────────────────┘
```

## Service Breakdown

### 1. Traefik Reverse Proxy

**Purpose**: HTTP/HTTPS routing, load balancing, and service discovery

**Specifications**:
- Image: `traefik:v2.11-alpine`
- Ports: 80 (HTTP), 443 (HTTPS), 8080 (Dashboard)
- Network: Bridge (172.20.0.0/16)

**Key Features**:
- Automatic Docker container discovery
- TLS/SSL with Let's Encrypt support
- mDNS integration (wise.local)
- Request routing via labels
- Built-in health monitoring
- Dashboard at http://localhost:8080

**Resource Usage**: < 50MB RAM

### 2. WISE² API

**Purpose**: Core business logic, REST APIs, and WebSocket server

**Specifications**:
- Base Image: `node:20-alpine` (ARM64)
- Port: 3000 (internal), routed via Traefik
- Memory Limit: 384MB

**Technologies**:
- Framework: NestJS 10.x
- Database: SQLite 3 (embedded)
- Cache: Redis 7
- Auth: JWT + API Keys

**Capabilities**:
```
API Endpoints:
├── Authentication
│   ├── Login
│   ├── Register
│   └── Token refresh
├── Customers
│   ├── CRUD operations
│   ├── Search & filter
│   └── History
├── Invoices & Sales
│   ├── Create/manage
│   ├── Payments
│   └── Reports
├── Tasks & Automation
│   ├── Task management
│   ├── Workflows
│   └── Scheduling
├── Analytics
│   ├── Dashboard metrics
│   ├── Historical data
│   └── Export reports
└── System
    ├── Health checks
    ├── Config management
    └── Backup/Restore
```

**Database Connection**:
```
DATABASE_URL="file:/data/wise2.db"
DB_TYPE="sqlite"
```

### 3. Dashboard UI

**Purpose**: Web-based user interface and real-time interactions

**Specifications**:
- Base Image: `node:20-alpine` (ARM64)
- Port: 3001 (internal), routed via Traefik
- Memory Limit: 256MB

**Technologies**:
- Framework: Next.js 14 (React)
- Styling: Tailwind CSS
- Design System: WISE² brand

**Modules**:
```
UI Sections:
├── Dashboard Home
│   ├── Key metrics
│   └── Quick actions
├── Customers
│   ├── Customer list
│   ├── Profiles
│   └── Interactions
├── Sales & Invoices
│   ├── Invoice management
│   ├── Sales pipeline
│   └── Reports
├── Analytics
│   ├── Charts & metrics
│   └── Historical data
├── Tasks
│   ├── Task list
│   ├── Workflows
│   └── Automation
└── Settings
    ├── System config
    ├── Network setup
    ├── Backup/restore
    └── User management
```

**Communication**:
- REST API calls to http://localhost:3000
- WebSocket connections for real-time updates
- Environment: `NEXT_PUBLIC_API_URL=http://wise.local/api`

### 4. Redis Cache

**Purpose**: Session storage, caching, and real-time event distribution

**Specifications**:
- Image: `redis:7-alpine`
- Port: 6379
- Memory Limit: 256MB (configurable)

**Configuration**:
```bash
maxmemory 256mb
maxmemory-policy allkeys-lru
requirepass ${REDIS_PASSWORD}
```

**Usage**:
- User sessions (7-day TTL)
- API response cache (1-hour TTL)
- Rate limiting counters
- Real-time event streaming
- Temporary data storage

**Performance**: LRU eviction when full (no data loss)

## Data Architecture

### SQLite Database

**Location**: `/data/wise2.db` (single file)

**Design Rationale**:
- ✅ No separate database service (lower resource overhead)
- ✅ Single file storage (simple backups)
- ✅ Embedded in API container
- ✅ ACID transactions
- ✅ Sufficient for small businesses
- ✅ Can migrate to PostgreSQL later

**Capacity Limits**:
- Records: Up to ~1M
- Concurrent connections: ~100 (Pi limitation)
- File size: 200MB+ possible
- Ideal user base: 5-50 concurrent

**Table Structure** (planned):
```sql
users              -- Authentication & roles
customers          -- Contact & relationship data
invoices           -- Billing & transactions
tasks              -- Workflow & automation
analytics          -- Metrics & KPIs
settings           -- System configuration
audit_log          -- Compliance & history
```

### Backup Strategy

**Backup Process**:
1. Stop services (for consistency)
2. Copy SQLite database
3. Backup Redis snapshot
4. Archive configuration
5. Compress and store
6. Clean old backups (keep 7)

**Backup Location**: `/backups/wise2_backup_YYYYMMDD_HHMMSS.tar.gz`

**Backup Contents**:
- SQLite database (wise2.db)
- Configuration files (.env)
- Redis persistence file
- System metadata

**Restore Process**:
1. Verify backup integrity
2. Stop services
3. Extract files
4. Restore database
5. Restore configuration
6. Start services
7. Verify health

## Network Architecture

### mDNS (Multicast DNS)

**Service**: Avahi daemon (installed automatically)

**Access**:
```
http://wise.local/         -- Dashboard
http://wise.local/api/     -- API
http://wise.local:8080/    -- Traefik Dashboard
```

**Benefits**:
- No DNS configuration needed
- Works on local network
- Automatic Pi discovery
- Compatible with all devices

**Fallback**:
```bash
# If mDNS fails, use IP:
hostname -I
http://192.168.1.x:80/
```

### Routing (Traefik)

**Routing Rules**:
```yaml
# Dashboard routing
Host(`wise.local`) && PathPrefix(`/`)
  └─> http://dashboard:3001

# API routing
Host(`wise.local`) && PathPrefix(`/api`)
  └─> http://api:3000

# Traefik dashboard
Host(`wise.local`) && PathPrefix(`/traefik`)
  └─> http://traefik:8080
```

**Port Forwarding**:
- Port 80 (HTTP) → Traefik
- Port 443 (HTTPS) → Traefik (if TLS enabled)
- Port 8080 → Traefik Dashboard (internal only)

## Storage Architecture

### Docker Volumes

**Persistent Storage**:
```
wise2_redis_data
  └─ Redis data dump (optional)

wise2_api_data
  └─ /data/
     ├─ wise2.db (SQLite)
     └─ configuration

wise2_config
  └─ Traefik ACME certificates
```

**Host Locations**:
```
/var/lib/docker/volumes/wise2-redis-data/_data/
/var/lib/docker/volumes/wise2-api-data/_data/
/var/lib/docker/volumes/wise2-config/_data/
```

### SD Card Storage

**Recommended Setup**:
- OS + Docker: ~10GB
- Database: 100-500MB (grows with data)
- Backups: 100-700MB (7 backups)
- **Total**: 64GB SD card (future-proof)

## Security Architecture

### Authentication & Authorization

**JWT Authentication**:
- 7-day token expiration
- Refresh token rotation
- Secure httpOnly cookies
- Signed with `JWT_SECRET`

**API Keys**:
- Per-integration keys
- Rate limited
- Revocable

**Session Management**:
- Redis-backed sessions
- 7-day default TTL
- SameSite=Strict cookies
- CSRF protection

### Secret Management

**Secrets Storage** (`.env` file):
```bash
JWT_SECRET=<256-bit random hex>
API_KEY=<256-bit random hex>
REDIS_PASSWORD=<128-bit random hex>
```

**Generation**:
```bash
openssl rand -hex 32  # JWT_SECRET
openssl rand -hex 32  # API_KEY
openssl rand -hex 16  # REDIS_PASSWORD
```

**File Permissions**: 600 (owner read/write only)

### Rate Limiting

**Configuration** (in Traefik):
- 100 requests/minute per IP
- 1000 requests/minute per API key
- Burst window: 10 seconds
- Implemented via Redis counters

### HTTPS/TLS

**Default**: Self-signed certificate (local network only)

**Production**: Let's Encrypt with domain

**Certificate Storage**: `/pi/config/traefik-acme.json`

## Performance Characteristics

### Target Resource Usage

**Idle System**:
- RAM: < 500MB
- CPU: < 5%
- Network: Idle
- Disk: Minimal I/O

**Under Load** (typical small business):
- RAM: 600-800MB
- CPU: 20-40%
- Network: < 1 Mbps sustained
- Disk: Variable I/O

### Scalability

**Capacity Limits**:
- Concurrent users: 5-50 (recommended)
- Simultaneous API calls: ~100
- Database records: Up to ~1M
- Dashboard sessions: ~50

**When to Upgrade**:
- Users > 50 → Consider load balancing
- Records > 1M → Migrate to PostgreSQL
- RAM < 256MB free → Disable optional services
- Disk < 10% free → Archive old backups

### Boot Performance

**Cold Start**: 30-60 seconds
- Service start: ~20 seconds
- Health checks: ~10 seconds
- Ready for traffic: 30-45 seconds

**Warm Start**: < 10 seconds
- Services restarting
- No database initialization

## Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Container Orchestration** | Docker Compose | v2 | Service management |
| **Reverse Proxy** | Traefik | v2.11 | Routing & TLS |
| **Backend API** | NestJS | 10.x | Business logic |
| **Frontend UI** | Next.js | 14.x | Web interface |
| **Database** | SQLite | 3.x | Data persistence |
| **Cache/Sessions** | Redis | 7.x | Performance |
| **Container Runtime** | Docker | 20.x+ | Virtualization |
| **Base OS** | Debian | Trixie | Host OS |
| **Runtime** | Node.js | 20.x | JS execution |
| **Optional: AI** | Ollama | Latest | Local inference |

## Deployment Model

### Single Machine Deployment

**Architecture**: All services on one Raspberry Pi 3B+

**Advantages**:
- Simplicity
- No network dependency between services
- Minimal network overhead
- Easy backup/restore

**Limitations**:
- No high availability (single point of failure)
- Shared resources (RAM, CPU)
- No load balancing

### Future: Multi-Node

**Phase 2 Plan**:
- Leader/follower architecture
- PostgreSQL for shared database
- NFS for shared storage
- Traefik load balancing

## Deployment Workflow

### Installation
1. Flash Debian Trixie to SD card
2. Run `pi/scripts/install.sh`
3. Script handles: Docker, Compose, secrets, databases, systemd
4. Access at `http://wise.local`

### Updates
1. `git pull` to latest code
2. `docker-compose -f pi/docker-compose.yml build`
3. `docker-compose -f pi/docker-compose.yml up -d`
4. Health check via `pi/scripts/health-check.sh`

### Backup Workflow
1. `bash pi/scripts/backup.sh` (auto-stops services)
2. Creates encrypted archive
3. Stores in `/backups/`
4. Keeps last 7 backups
5. Automatic daily schedule (2 AM)

### Recovery Workflow
1. `bash pi/scripts/restore.sh --file backup.tar.gz`
2. Verifies backup integrity
3. Confirms before restoring
4. Restores database and config
5. Restarts services
6. Verifies health

## Monitoring & Logging

### Service Health

**Health Checks** (built-in):
```bash
# API health
curl http://localhost:3000/health

# Dashboard health
curl http://localhost:3001/health

# Traefik health
curl http://localhost:8080/api/overview
```

**Comprehensive Diagnostics**:
```bash
bash pi/scripts/health-check.sh        # Summary
bash pi/scripts/health-check.sh --detailed  # Full analysis
```

### Logging

**Log Driver**: JSON-file (Docker standard)

**Log Locations**:
```bash
# All services
docker-compose -f pi/docker-compose.yml logs -f

# Specific service
docker-compose -f pi/docker-compose.yml logs -f [service]

# System logs
sudo journalctl -u wise2 -f
```

**Log Rotation**: Automatic via logrotate

## Design Principles

1. **Simplicity**: Minimal services, clear responsibilities
2. **Performance**: Alpine images, multi-stage builds, memory limits
3. **Reliability**: Health checks, auto-restart, persistent volumes
4. **Security**: Non-root execution, encrypted secrets, rate limiting
5. **Maintainability**: Clear configs, comprehensive logging, automation

## Future Evolution

### Phase 2 (Next)
- PostgreSQL support for larger datasets
- Multi-Pi clustering
- Advanced monitoring (Prometheus/Grafana)
- Mobile app (React Native)

### Phase 3 (Later)
- GraphQL API
- Advanced AI features
- Real-time collaboration
- Kubernetes support

---

**This architecture delivers production-grade reliability and security while optimized specifically for Raspberry Pi 3B+ efficiency.**
