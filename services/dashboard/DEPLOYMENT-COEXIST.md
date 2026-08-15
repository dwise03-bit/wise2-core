# Wise² Core Deployment — Coexisting with wise-touch-prompt-shield

**Server:** 173.208.147.165 (Ubuntu 22.04)  
**Existing Project:** wise-touch-prompt-shield (PostgreSQL on 5432)  
**Wise² Core:** Deploying to separate PostgreSQL on port 5433  

---

## Audit Summary

✅ **Port Status:**
- Port 80 (HTTP) — FREE
- Port 443 (HTTPS) — FREE
- Port 3000 (Dashboard) — FREE
- Port 3001 (API) — FREE
- Port 3002 (Admin) — FREE
- Port 5432 (Old Project PostgreSQL) — **IN USE** ← Do not stop
- Port 5433 (Wise² PostgreSQL) — **FREE** ← Assigned to Wise²
- Port 6379 (Redis) — FREE
- Port 9090 (Prometheus) — FREE

✅ **System Resources:**
- Docker: Installed (v29.6.1)
- Disk: 234GB total, 191GB available
- RAM: Sufficient
- Wise² directory: Free (/opt/wise2-core)

✅ **Existing Containers:**
- wise-touch-prompt-shield-postgres-1 (PostgreSQL 16, 22 hours up)
- portainer (3 days up)
- portainer-socket-proxy (3 days up)

---

## Deployment Strategy

### What's Changed

**PostgreSQL Port Mapping:**
- Old project: `5432:5432` (host:container)
- Wise² Core: `5433:5432` (host:container)

**Why this works:**
- Each Docker container internally uses port 5432 (standard PostgreSQL)
- Host port mapping allows external access: old project on 5432, Wise² on 5433
- Services communicate via internal Docker network (no port conflicts)

### Internal vs External Ports

**Inside Docker Network (Services talk to each other):**
```
API → postgres:5432 (internal DNS resolution)
Worker → postgres:5432 (internal DNS resolution)
Bot → postgres:5432 (internal DNS resolution)
```

**From Host Machine (External access):**
```
Old Project: psql -h localhost -p 5432 (wise-touch-prompt-shield-postgres-1)
Wise² Core:  psql -h localhost -p 5433 (wise2-postgres)
```

---

## Deployment Steps

### 1. SSH to Server

```bash
ssh administrator@173.208.147.165
```

### 2. Clone & Setup Wise² Core

```bash
cd /opt
git clone https://github.com/yourusername/wise2-core.git
cd wise2-core
```

### 3. Create Environment File

```bash
cp .env.prod.example .env.prod
nano .env.prod
```

**Required secrets:**
```
DB_PASSWORD=<strong-password-20chars>
JWT_SECRET=<random-string-openssl-rand-base64-32>
RESEND_API_KEY=<from-resend.com>
DISCORD_TOKEN=<from-discord-dev-portal>
GRAFANA_PASSWORD=<admin-password>
```

### 4. Verify Port Availability

```bash
netstat -tuln | grep -E ":(80|443|3000|3001|3002|5433|6379|9090)"
```

All should show FREE except 5432 (old project).

### 5. Build & Start Wise² Services

```bash
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### 6. Verify Wise² Containers Started

```bash
docker ps | grep wise2
```

Should show:
- wise2-postgres (PostgreSQL)
- wise2-redis (Redis)
- wise2-api (API service)
- wise2-dashboard (Frontend)
- wise2-admin (Admin UI)
- wise2-bot (Discord bot)
- wise2-worker (Queue worker)
- wise2-prometheus (Monitoring)
- wise2-grafana (Dashboards)

### 7. Configure Nginx

```bash
sudo cp config/nginx.conf /etc/nginx/sites-available/wise2
sudo ln -s /etc/nginx/sites-available/wise2 /etc/nginx/sites-enabled/wise2
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### 8. Setup SSL Certificates

```bash
sudo certbot certonly --standalone \
  -d wise2.net \
  -d www.wise2.net \
  -d api.wise2.net \
  -d admin.wise2.net \
  --email dwise03@gmail.com \
  --agree-tos \
  --non-interactive
```

### 9. Verify Deployment

```bash
# Check services are running
docker-compose -f docker-compose.prod.yml ps

# Check PostgreSQL on 5433
psql -h localhost -p 5433 -U wise2_user -d wise2 -c "SELECT version();"

# Check API health
curl http://localhost:3001/api/health

# Check Dashboard
curl http://localhost:3000
```

### 10. Update DNS

Point wise2.net A record to **173.208.147.165** (already correct for server)

Verify:
```bash
dig wise2.net
```

---

## Coexistence Checklist

- [ ] Old project (wise-touch-prompt-shield) still running on port 5432
- [ ] Wise² PostgreSQL running on port 5433
- [ ] Wise² API accessible on port 3001
- [ ] Wise² Dashboard accessible on port 3000
- [ ] Nginx reverse proxy configured for wise2.net domain
- [ ] SSL certificates installed and auto-renewing
- [ ] Portainer still accessible on 9443 (unchanged)

---

## Monitoring Both Projects

### Wise² Logs
```bash
docker-compose -f docker-compose.prod.yml logs -f
docker-compose -f docker-compose.prod.yml logs -f api
```

### Old Project Logs
```bash
docker logs -f wise-touch-prompt-shield-postgres-1
```

### Portainer UI
```
https://173.208.147.165:9443
```

---

## Database Isolation

The two PostgreSQL instances are **completely isolated:**
- Old project: Database on port 5432, isolated network
- Wise² Core: Database on port 5433, separate Docker network

No data crossover. No shared credentials. Completely independent deployments.

---

## Rollback Plan

If Wise² Core needs to be removed:

```bash
cd /opt/wise2-core

# Stop all Wise² services
docker-compose -f docker-compose.prod.yml down

# Remove volumes (careful — this deletes all data)
docker-compose -f docker-compose.prod.yml down -v

# Old project remains untouched on port 5432
```

---

## Next Steps

1. Run audit to confirm port 5433 is free
2. Follow deployment steps 1-10
3. Share deployment output for verification
4. Monitor both projects running in parallel

Ready to deploy? Run `/tmp/quick-audit.sh` again to confirm all ports are still available.
