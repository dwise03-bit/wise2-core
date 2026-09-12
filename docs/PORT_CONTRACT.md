# WISE² Port Contract

**Status**: Production  
**Last Updated**: 2026-08-20  
**Owner**: dwise (dwise03@gmail.com)

---

## Overview

This document defines the port allocation contract for all WISE² services across all environments.

Every service has an assigned port. Changes to port assignments require approval and coordination.

---

## MAC LOCAL ENVIRONMENT

### Hermes & iMessage

| Service | Port | Protocol | Proxy Route | Notes |
|---------|------|----------|-------------|-------|
| **Hermes Gateway** | 9000 | HTTP | (none - local) | Primary gateway |
| **Photon Sidecar** | 9001 | HTTP | (none - localhost) | iMessage messaging |
| **WISE² IMP API** | 9002 | HTTP | (none - local) | Intent router |

### Development & AI

| Service | Port | Protocol | Proxy Route | Notes |
|---------|------|----------|-------------|-------|
| **Claude Code Daemon** | 9100 | HTTP | (none) | Local dev interface |
| **Ollama (Local)** | 11434 | HTTP | (none) | Local AI models |
| **Ollama Web UI** | 11435 | HTTP | (none) | Optional UI |
| **Codex** | 9101 | HTTP | (none) | Debugging assistant |

### WISE² Core

| Service | Port | Protocol | Proxy Route | Notes |
|---------|------|----------|-------------|-------|
| **WISE² Website (Dev)** | 3000 | HTTP | (none) | Local dev server |
| **Command Center (Dev)** | 3002 | HTTP | (none) | Local dev |
| **Second Brain API** | 3012 | HTTP | (none) | Knowledge base |
| **Admin Dashboard (Dev)** | 3020 | HTTP | (none) | Admin panel |

### Infrastructure (Local)

| Service | Port | Protocol | Notes |
|---------|------|----------|-------|
| **Postgres** | 5432 | TCP | Local dev database |
| **Redis** | 6379 | TCP | Local cache/queue |
| **MongoDB** | 27017 | TCP | Second-brain knowledge |

---

## VPS PRODUCTION ENVIRONMENT

### Production APIs

| Service | Port | Internal | Reverse Proxy | Public | Notes |
|---------|------|----------|---------------|--------|-------|
| **WISE² API** | 3010 | yes | :80/:443 | https://api.wise2.io | Main API |
| **WISE² Website** | 3011 | yes | :80/:443 | https://wise2.io | Landing page |
| **Command Center** | 3002 | yes | :80/:443 | https://command.wise2.io | Ops dashboard |
| **Dashboard** | 3001 | yes | :80/:443 | https://dashboard.wise2.io | User portal |
| **Second Brain** | 3012 | yes | :80/:443 | https://brain.wise2.io | Knowledge API |

### Hermes & Automation

| Service | Port | Internal | Notes |
|---------|------|----------|-------|
| **Hermes Gateway** | 9000 | yes | VPS always-on node |
| **WISE² IMP (VPS)** | 9002 | yes | VPS intent router |
| **Worker** | 9090 | yes | Background jobs |
| **Scheduler** | 9091 | yes | Cron jobs |

### Infrastructure

| Service | Port | Internal | Notes |
|---------|------|----------|-------|
| **Postgres** | 5432 | (private) | Production database |
| **Redis** | 6379 | (private) | Cache & job queue |
| **Nginx** | 80 | (public) | HTTP listener |
| **Nginx** | 443 | (public) | HTTPS listener |
| **Traefik** | 8080 | (private) | Reverse proxy |

---

## GPU SERVER ENVIRONMENT

### AI & Inference

| Service | Port | Internal | Notes |
|---------|------|----------|-------|
| **Ollama** | 11434 | yes | Heavy model inference |
| **Ollama Web UI** | 11435 | yes | Optional UI |
| **vLLM** | 8000 | yes | (if used) Fast inference |
| **Embedding Server** | 9200 | yes | Vector embeddings |

---

## RASPBERRY PI EDGE NODES

### Local Control & Automation

| Service | Port | Internal | Notes |
|---------|------|----------|-------|
| **Edge Hermes** | 9000 | yes | Local automation |
| **WISE² Display** | 3000 | yes | Kiosk interface |
| **Hardware Control** | 8080 | yes | GPIO/sensors |
| **Meshtastic** | 4403 | yes | (Defense mode) |

---

## Reverse Proxy Routes

### Nginx Configuration

```
http {
    upstream api_backend {
        server 127.0.0.1:3010;
    }
    
    upstream website_backend {
        server 127.0.0.1:3011;
    }
    
    upstream command_backend {
        server 127.0.0.1:3002;
    }
    
    upstream dashboard_backend {
        server 127.0.0.1:3001;
    }
    
    # Public routes
    server {
        listen 80;
        server_name api.wise2.io;
        location / {
            proxy_pass http://api_backend;
        }
    }
    
    server {
        listen 80;
        server_name wise2.io www.wise2.io;
        location / {
            proxy_pass http://website_backend;
        }
    }
    
    # Internal routes (behind VPN)
    server {
        listen 80;
        server_name command.wise2.io;
        location / {
            proxy_pass http://command_backend;
        }
    }
    
    server {
        listen 80;
        server_name dashboard.wise2.io;
        location / {
            proxy_pass http://dashboard_backend;
        }
    }
}
```

---

## Port Collision Prevention

### Reserved Ranges

- **3000-3099**: WISE² applications (React/Next.js apps)
- **5432**: Postgres (standard)
- **6379**: Redis (standard)
- **8000-8099**: Web servers / proxies
- **9000-9999**: WISE² services (Hermes, IMP, workers)
- **11434**: Ollama (standard)
- **27017**: MongoDB (standard)

### Conflict Detection

Before deploying a new service:

```bash
# Check if port is in use
lsof -i :PORT

# Verify no conflicts in docker-compose
grep -r "PORT:" docker-compose*.yml

# Audit all service ports
wise2 audit ports
```

---

## Environment-Specific Overrides

### Development `.env`

```
# Mac local development
API_URL=http://localhost:3010
HERMES_URL=http://localhost:9000
WEBSITE_URL=http://localhost:3011
```

### Staging `.env`

```
# VPS staging
API_URL=https://staging-api.wise2.io
HERMES_URL=https://staging-hermes.wise2.io
WEBSITE_URL=https://staging.wise2.io
```

### Production `.env`

```
# VPS production
API_URL=https://api.wise2.io
HERMES_URL=https://hermes.wise2.io (internal only)
WEBSITE_URL=https://wise2.io
```

---

## Change Process

### To Add a New Service

1. **Check availability**: `wise2 audit ports`
2. **Reserve port**: Update this file
3. **Update docker-compose**: Add port mapping
4. **Update reverse proxy**: Add route if public
5. **Commit & deploy**: Test in staging first
6. **Document**: Update environment configs

### To Change an Existing Port

1. **Impact analysis**: What depends on this port?
2. **Notify stakeholders**: Team, monitoring, docs
3. **Update configs**: All `.env` files
4. **Update proxy**: If reverse-proxy route exists
5. **Rolling restart**: Minimize downtime
6. **Verify**: Health checks pass
7. **Document**: Update this file

---

## Health Checks

### Port Availability Check

```bash
# Verify all expected ports are listening
wise2 health --check ports

# Expected output:
3001: ✅ Dashboard
3002: ✅ Command Center
3010: ✅ API
3011: ✅ Website
3012: ✅ Second Brain
5432: ✅ Postgres
6379: ✅ Redis
9000: ✅ Hermes (Mac)
9000: ✅ Hermes (VPS)
11434: ✅ Ollama
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find what's using the port
lsof -i :PORT

# Kill the process (if safe)
kill -9 PID

# Or restart the service
systemctl restart <service>
```

### Wrong Port Listening

Check environment variables:

```bash
# Mac
env | grep PORT

# VPS
ssh wise-vps "env | grep PORT"
```

Update config and restart:

```bash
# Local
docker-compose restart service-name

# VPS
ssh wise-vps "docker-compose restart service-name"
```

---

## Summary

**Total Services**: 30+  
**Ports Used**: 3000-3099, 5432, 6379, 8000-8099, 9000-9999, 11434, 27017  
**Public Endpoints**: https://wise2.io, https://api.wise2.io  
**Internal Endpoints**: Accessible via Tailscale/VPN only  

This contract is the single source of truth for WISE² port allocation.

Violations of this contract may cause service disruptions.

---

**Maintain this document. Update it before deploying new services.**
