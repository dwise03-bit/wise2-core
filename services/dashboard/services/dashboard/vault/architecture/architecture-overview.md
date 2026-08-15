---
type: architecture-overview
date: 2026-07-07
tags: [wise2, infrastructure, services, deployment]
ai-first: true
---

# Wise² Core Architecture Overview

## For future Claude

Wise² Core is a production-ready infrastructure system with 5 pre-configured services deployed via Docker to DigitalOcean. The system includes PostgreSQL, Redis, monitoring (Prometheus + Grafana), daily backups, and 30+ production alert rules. Deploy from zero to production in 10 minutes.

---

## System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Wise² Core Services                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐         │
│  │     API     │  │  Dashboard  │  │ Admin Panel  │         │
│  │  (Node.js)  │  │  (React 19) │  │  (React 19)  │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬───────┘         │
│         │                │                 │                  │
│         └────────────────┴─────────────────┘                 │
│                          │                                    │
│                   ┌──────▼──────┐                            │
│                   │ PostgreSQL   │  Databases + Backups      │
│                   └──────┬──────┘                            │
│                          │                                    │
│                   ┌──────▼──────┐                            │
│                   │    Redis    │  Cache + Sessions          │
│                   └──────┬──────┘                            │
│                          │                                    │
│   ┌──────────────────────┼──────────────────────┐            │
│   │                      │                      │             │
│ ┌─▼────┐  ┌──────────┐ ┌─▼────┐  ┌──────────┐ │            │
│ │Discord│  │Prometheus│ │Worker│  │  Grafana │ │            │
│ │ Bot   │  │          │ │Queue │  │Dashboard │ │            │
│ └───────┘  └──────────┘ └──────┘  └──────────┘ │            │
│                                                   │             │
└─────────────────────────────────────────────────┘             │
                                                                 │
         🌐 Public: wise2.net (Landing Page)                    │
         📊 Internal: Monitoring + Alerts                       │
         💾 Backups: Daily snapshots, restore-tested            │
```

---

## 5 Core Services

### 1. API Service (Node.js/Next.js)
- REST endpoints for core operations
- Real-time data processing
- WebSocket support for live updates
- Rate limiting and auth

**Port:** 3000  
**Status:** [[Deployment Status - API]]  
**Metrics:** [[API Performance Metrics]]

### 2. Dashboard (React 19 + TypeScript)
- Founder-facing interface
- Neon cyberpunk UI with floating holographic panels
- Real-time metrics and status
- Configuration management

**URL:** wise2.net  
**Status:** [[Landing Page Status]]  
**Design:** [[Brand Decision - Neon Cyberpunk]]

### 3. Admin Dashboard (React 19)
- Internal operations console
- User management
- System configuration
- Deployment controls

**Port:** 3001  
**Status:** [[Admin Dashboard Development]]

### 4. Discord Bot
- Automation and notifications
- Command processing
- Alert relay
- Team integrations

**Status:** [[Discord Bot Status]]

### 5. Worker Queue
- Async job processing
- Email sending
- Report generation
- Background tasks

**Status:** [[Worker Queue Status]]

---

## Data Layer

### PostgreSQL
- Primary database
- 5,300+ lines of migration scripts
- Daily automated backups
- Restore-tested every week

**Backup schedule:** Daily at 2am UTC  
**Retention:** 30 days  
**Restore testing:** Weekly

### Redis
- Session store
- Cache layer
- Pub/sub for real-time
- Rate limit buckets

**Memory:** 256MB allocated  
**Eviction policy:** LRU (least recently used)

---

## Observability

### Prometheus
- Metrics collection
- Custom instrumentation
- 30+ production alert rules
- 15-second scrape interval

**Port:** 9090  
**Metrics:** [[Prometheus Metrics List]]

### Grafana
- Dashboard visualization
- Alert management
- User-facing metrics
- SLA tracking

**Port:** 3000 (separate instance)  
**Dashboards:** [[Grafana Dashboards]]  
**Alerts:** [[Alert Configuration]]

---

## Deployment Stack

### Infrastructure
- **Host:** DigitalOcean (51.81.80.252)
- **OS:** Ubuntu 22.04
- **Container:** Docker + Docker Compose
- **SSL:** Let's Encrypt + Nginx

### Environment
- **dev** — Local development
- **staging** — Pre-production validation
- **production** — Live (wise2.net)

---

## Key Statistics

| Metric | Value | Notes |
|--------|-------|-------|
| Deployment time | 10 minutes | Zero to production |
| Monthly cost | $15–20 | Infrastructure only |
| Uptime SLA | 99.9% | Monthly target |
| Backup frequency | Daily | Automated, restore-tested |
| Alert rules | 30+ | Production-grade coverage |
| Documentation | 5,300+ lines | Complete runbooks |

---

## Technology Stack

```
Frontend:     React 19 + TypeScript + Tailwind CSS v4
Backend:      Node.js + Next.js (full-stack)
Database:     PostgreSQL 15
Cache:        Redis 7
Container:    Docker + Docker Compose
Monitoring:   Prometheus + Grafana
Observability: Structured logging
Deployment:   DigitalOcean
CDN:          Cloudflare (optional)
```

---

## Architecture Decisions

- **[[ADR-001: Full-Stack Next.js]]** — Why we chose Next.js over separate API/frontend
- **[[ADR-002: PostgreSQL + Redis]]** — Database and cache design
- **[[ADR-003: Docker Deployment]]** — Containerization approach
- **[[ADR-004: Prometheus/Grafana]]** — Monitoring stack
- **[[ADR-005: Neon Cyberpunk Brand]]** — Visual identity decision

---

## Related Notes

- [[Deployments]] — Launch timeline and status
- [[Infrastructure Setup]] — On-server configuration
- [[Monitoring and Alerts]] — Alert configuration and runbooks
- [[Backup and Disaster Recovery]] — Backup procedures

---

**Status:** 🟢 Production-ready  
**Last reviewed:** 2026-07-07  
**Next review:** 2026-07-14  
**Owner:** Daniel Wise  
**Confidence:** high
