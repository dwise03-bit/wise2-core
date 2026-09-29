---
name: run-wise2-core
description: Launch and drive Wise² Core API service—start Docker stack, API server, verify health checks, run tests
---

# Run Wise² Core

Wise² Core is a TypeScript-based REST API service with PostgreSQL database, Redis cache, and automated testing. This skill launches the complete stack (Docker services + API) and verifies it's running.

## Prerequisites

```bash
# macOS/Linux with Docker
docker --version  # v20+
docker-compose --version  # v2+

# Node.js (local development)
node --version  # v18+
npm --version  # v8+
```

Ensure Docker daemon is running.

## Build & Setup

```bash
# 1. Install dependencies
cd services/api
npm install

# 2. Configure environment
cp .env.example .env
# .env is pre-configured for local development (localhost, test credentials)

# 3. Build TypeScript
npm run build
```

## Run (Agent Path) — Programmatic Driver

Launch via the driver script at `.Codex/skills/run-wise2-core/driver.sh`:

```bash
# Start Docker stack (PostgreSQL, Redis) + API server in background
bash .Codex/skills/run-wise2-core/driver.sh start

# Verify API is responding (retry loop until health check passes)
bash .Codex/skills/run-wise2-core/driver.sh health-check

# Take a screenshot of the running status
bash .Codex/skills/run-wise2-core/driver.sh status

# Stop everything
bash .Codex/skills/run-wise2-core/driver.sh stop
```

**Screenshot location:** `.Codex/skills/run-wise2-core/status.txt` (text output)

## Run (Human Path) — Manual Start

For interactive development:

```bash
# Terminal 1: Start Docker stack
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to be ready (~10 seconds)
sleep 10

# Terminal 2: Start API server (hot-reload mode)
cd services/api
npm run dev

# Terminal 3: Verify health
curl http://localhost:3000/health
```

Press Ctrl-C in Terminal 2 to stop. Run `docker-compose down` to stop services.

## Direct Invocation — Testing Without the Full App

For PRs that modify business logic:

```bash
# Run full test suite (unit + integration)
cd services/api
npm test

# Watch mode for TDD
npm run test:watch

# Coverage report
npm run test:cov

# Type-check (catches TS errors without building)
npm run type-check
```

Tests connect to Docker-provided PostgreSQL/Redis; Docker stack must be running (or start it with `docker-compose up -d`).

## Verify It Works

The driver will output:
```
✓ Docker stack healthy (PostgreSQL, Redis)
✓ API server listening on http://localhost:3000
✓ Health check passing
✓ Ready for testing

Try:
  curl http://localhost:3000/health
  npm test
  npm run test:cov
```

## Gotchas

### Port Already in Use
If `3000` is already in use:
```bash
# Find what's using it
lsof -i :3000
# Kill it or change API_PORT in .env
API_PORT=3001 npm run dev
```

### Docker Containers Won't Start
If `docker-compose up -d` fails with "permission denied":
```bash
# Add your user to docker group (macOS doesn't need this)
sudo usermod -aG docker $USER
# Log out and log back in, or:
newgrp docker
```

### Database Connection Fails
```
error: connect ECONNREFUSED 127.0.0.1:5432
```
Means PostgreSQL container isn't running. Check:
```bash
docker-compose ps  # Should show 'Up' for postgres, redis
```
If down, restart:
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Tests Timeout or Hang
The test database must exist. First time only:
```bash
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE wise2_test;"
```

### Hot-reload (`npm run dev`) Not Detecting Changes
If file changes don't trigger a rebuild:
```bash
# tsx is watching correctly; check that files are actually saved
# If using an editor with atomic writes (VS Code), it's usually fine
# If using a sync tool (Dropbox, iCloud), disable it for the working dir
```

## Troubleshooting

| Error | Fix |
|-------|-----|
| `Cannot find module 'express'` | `cd services/api && npm install` |
| `error: connect ECONNREFUSED` | `docker-compose -f docker-compose.dev.yml up -d` |
| `EADDRINUSE :::3000` | Kill existing process on port 3000 or change `API_PORT` in `.env` |
| `Jest: No tests found` | Tests must be `.test.ts` or `.spec.ts` in `tests/` dir; check glob in `jest.config.js` |
| `Type errors in IDE but `npm run build` succeeds` | Clear IDE cache or reload the TypeScript server |

## Architecture

- **`services/api/`** — Express.js REST API (TypeScript)
- **`infrastructure/database/`** — PostgreSQL schema, migrations, backups
- **`docker-compose.dev.yml`** — Local dev stack (PostgreSQL 15, Redis 7, Prometheus, Grafana)
- **`.env.example`** → **`.env`** — Configuration (copied by setup)
- **`tests/`** — Unit and integration tests (Jest + fixtures)

## Next Steps

1. **Explore the codebase:**
   ```bash
   # API structure
   ls -la services/api/src/
   
   # Database schema
   cat infrastructure/database/schema.sql
   ```

2. **Make a change:**
   ```bash
   # Edit a file, npm run dev will restart automatically
   echo "console.log('Hello')" >> services/api/src/server.ts
   ```

3. **Run tests:**
   ```bash
   cd services/api
   npm test
   ```

4. **Check coverage:**
   ```bash
   npm run test:cov
   open coverage/index.html  # View HTML coverage report
   ```

---

**Driver location:** `.Codex/skills/run-wise2-core/driver.sh`  
**Status check output:** `.Codex/skills/run-wise2-core/status.txt`
