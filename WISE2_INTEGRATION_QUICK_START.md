# WISE² COMPLETE INTEGRATION — QUICK START

## 🚀 Get Everything Running in 3 Commands

### LOCAL DEVELOPMENT (Your Mac)

```bash
# 1. One-line setup (installs all services + dependencies)
cd /Users/danielwise/Projects/wise2-core
./scripts/setup-local.sh

# 2. Start backend services (in separate terminals)
cd packages/api && pnpm dev              # Platform API on :3001
cd services/worker && npm start          # Background jobs
cd second-brain && npm start             # Knowledge/RAG API on :3012

# 3. Start frontend apps (in separate terminals)
cd apps/website && pnpm dev              # Landing page
cd apps/dashboard && pnpm dev            # Analytics on :3002
cd apps/command-center && pnpm dev      # Real-time monitoring on :3004
cd apps/studio && pnpm dev               # Creative suite on :3005

# 4. Monitor everything
docker-compose logs -f
```

**Result:** All 20+ services running locally  
**Time:** 30 minutes first time, 5 minutes after

---

### PRODUCTION DEPLOYMENT (VPS)

```bash
# 1. Deploy everything (automated)
./scripts/setup-production.sh

# 2. Monitor deployment
ssh dwise@173.208.147.165
cd /var/wise2
docker-compose -f docker-compose.production.yml logs -f

# 3. Verify everything is working
curl https://api.wise2.net/health
curl https://wise2.net
curl https://dashboard.wise2.net
```

**Result:** All services running on production VPS  
**Time:** 60 minutes (includes backups + migrations)

---

## 📊 SERVICE REFERENCE

### Frontend Applications
| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| Website | 3001 | http://localhost:3001 | Landing/Marketing |
| Dashboard | 3002 | http://localhost:3002 | Analytics/KPIs |
| Command Center | 3004 | http://localhost:3004 | Real-time Monitoring |
| Studio | 3005 | http://localhost:3005 | Creative Suite |
| Admin | 3003 | http://localhost:3003 | Admin Panel |

### Backend APIs
| Service | Port | Purpose | Start |
|---------|------|---------|-------|
| Platform API | 3001 | NestJS REST/GraphQL | `cd packages/api && pnpm dev` |
| Second Brain | 3012 | Knowledge/RAG API | `cd second-brain && npm start` |
| Worker | (bg) | Background jobs | `cd services/worker && npm start` |
| Phone Gateway | 3010 | AI voice calls | `cd apps/phone-gateway && npm start` |

### Databases
| Service | Port | Purpose | Start |
|---------|------|---------|-------|
| PostgreSQL | 5432 | Primary database | `docker-compose up -d postgres` |
| Redis | 6379 | Cache/queues | `docker-compose up -d redis` |
| MongoDB | 27017 | Knowledge documents | `docker-compose up -d mongodb` |

### AI Services
| Service | Port | Purpose | Start |
|---------|------|---------|-------|
| Ollama | 11434 | Local LLM (Mistral) | `docker-compose up -d ollama` |

---

## 🔧 COMMON TASKS

### Start Only Databases (Fast Setup)
```bash
docker-compose up -d postgres redis mongodb
```

### Initialize Database
```bash
cd packages/db
pnpm prisma migrate deploy    # Run migrations
pnpm prisma db seed            # Load sample data
pnpm prisma studio             # Open web UI
```

### Check Service Health
```bash
curl http://localhost:3001/health      # API
docker-compose ps                      # All containers
docker-compose logs -f api              # API logs
```

### Reset Local Database (DANGER - loses data)
```bash
docker volume rm wise2-core_postgres_data
docker-compose up -d postgres
cd packages/db && pnpm prisma migrate deploy
```

### Access Database CLI
```bash
# PostgreSQL
psql -U wise2_local -d wise2_core_dev -h localhost

# MongoDB
mongo --username admin --password admin-dev-password --authenticationDatabase admin localhost:27017/wise2-brain

# Redis
redis-cli -a wise2_redis_dev_password
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f postgres

# On production
ssh dwise@173.208.147.165
cd /var/wise2
docker-compose -f docker-compose.production.yml logs -f
```

---

## 🚨 TROUBLESHOOTING

### Services Won't Start
```bash
# Clean everything and restart
docker-compose down -v
docker-compose up -d

# Check individual service
docker-compose logs postgres
```

### Database Connection Error
```bash
# Verify PostgreSQL is running and healthy
docker-compose exec postgres pg_isready

# Restart if needed
docker-compose restart postgres

# Reconnect from API
docker-compose restart api
```

### API Not Responding
```bash
# Check if it's running
docker-compose ps api

# Check logs
docker-compose logs api

# Restart
docker-compose restart api
```

### Port Already in Use
```bash
# Find what's using port
lsof -i :3001

# Or use different port in .env
API_PORT=3011
docker-compose up -d api
```

---

## 📋 STARTUP CHECKLIST

- [ ] Clone repo: `git clone https://github.com/.../wise2-core.git`
- [ ] Install Node: `pnpm install` or `npm install`
- [ ] Copy env: `cp .env.example .env`
- [ ] Start Docker: `docker-compose up -d` (or `./scripts/setup-local.sh`)
- [ ] Run migrations: `cd packages/db && pnpm prisma migrate deploy`
- [ ] Start API: `cd packages/api && pnpm dev`
- [ ] Start frontend: `cd apps/website && pnpm dev` (in new terminal)
- [ ] Verify: `curl http://localhost:3001/health`

---

## 🎯 PRODUCTION CHECKLIST

- [ ] SSH to VPS: `ssh dwise@173.208.147.165`
- [ ] Setup SSL: `sudo certbot certonly --standalone -d wise2.net`
- [ ] Copy config: `.env.production` with production secrets
- [ ] Deploy: `./scripts/setup-production.sh`
- [ ] Verify: `curl https://api.wise2.net/health`
- [ ] Monitor: `docker-compose -f docker-compose.production.yml logs -f`
- [ ] Create admin: API call to `/auth/register`

---

## 📚 FULL DOCUMENTATION

See **WISE2_SETUP_GUIDE.md** for complete setup instructions including:
- Detailed environment configuration
- SSL/TLS certificate setup
- Nginx reverse proxy configuration
- Database backup & restore procedures
- Health monitoring & alerting
- Deployment automation
- Troubleshooting guide

---

## 🔗 QUICK LINKS

- **Setup Guide**: WISE2_SETUP_GUIDE.md
- **Backend Code**: `packages/api/`
- **Database Schemas**: `packages/db/prisma/schema.prisma`
- **Docker Config**: `docker-compose.yml` and `docker-compose.production.yml`
- **Frontend Apps**: `apps/website`, `apps/dashboard`, etc.
- **Scripts**: `scripts/` directory

---

## ✨ SUCCESS INDICATORS

**Local Development:**
```
✓ API responding on http://localhost:3001
✓ Dashboard on http://localhost:3002
✓ Command Center on http://localhost:3004
✓ PostgreSQL, Redis, MongoDB all healthy
✓ Can log in via website
✓ Can view metrics in dashboard
```

**Production:**
```
✓ API responding on https://api.wise2.net/health
✓ Website loading on https://wise2.net
✓ Dashboard on https://dashboard.wise2.net
✓ Nginx reverse proxy routing correctly
✓ SSL certificate valid
✓ All databases connected
```

---

**Questions?** Check WISE2_SETUP_GUIDE.md or run:
```bash
docker-compose ps              # See all services
docker-compose logs -f         # See all logs
pnpm prisma studio            # Database web UI
```
