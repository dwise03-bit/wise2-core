# API Startup Fixes - Verification Checklist

## Code Changes Verification

### ✅ 1. main.ts - Error Handling & Port Configuration
- [x] Added try-catch block around bootstrap function
- [x] Added Logger for startup messages
- [x] Added validation for required env vars (DATABASE_URL)
- [x] Port configuration: reads `PORT` or `API_PORT` with default 3001
- [x] Proper error handling with exit(1) on failures
- [x] File: `/packages/api/src/main.ts`

**Verification Command:**
```bash
grep -n "process.env.PORT\|process.env.API_PORT" /Users/danielwise/Projects/wise2-core/packages/api/src/main.ts
```
Expected: Line 39 shows: `const port = process.env.PORT || process.env.API_PORT || 3001;`

---

### ✅ 2. app.module.ts - DATABASE_URL Parsing
- [x] Supports DATABASE_URL parsing (postgresql://...)
- [x] Fallback to individual DB_* variables
- [x] Handles both DB_USERNAME and DB_USER variants
- [x] Proper error handling for invalid URLs
- [x] File: `/packages/api/src/app.module.ts`

**Verification Command:**
```bash
grep -n "DATABASE_URL\|new URL" /Users/danielwise/Projects/wise2-core/packages/api/src/app.module.ts
```
Expected: Should show URL parsing logic

---

### ✅ 3. Dockerfile - Runtime Dependencies
- [x] Curl installed for health checks
- [x] File: `/packages/api/Dockerfile`

**Verification Command:**
```bash
grep -n "curl" /Users/danielwise/Projects/wise2-core/packages/api/Dockerfile
```
Expected: Line showing `RUN apk add --no-cache curl`

---

### ✅ 4. docker-compose.prod.yml - Configuration
- [x] API section has correct environment variables
- [x] DATABASE_URL set with proper default
- [x] Both PORT and API_PORT set to 3001
- [x] Health check endpoint: `/api/health`
- [x] Port mapping: 3010:3001
- [x] Depends on postgres with health check
- [x] File: `/docker-compose.prod.yml`

**Verification Command:**
```bash
grep -A 25 "api:" /Users/danielwise/Projects/wise2-core/docker-compose.prod.yml | grep -E "PORT|DATABASE_URL|health"
```
Expected:
- PORT: 3001
- API_PORT: 3001
- DATABASE_URL: postgresql://postgres:postgres@postgres:5432/wise2_core
- Health check: /api/health

---

### ✅ 5. .env.production - Environment Configuration
- [x] PORT and API_PORT both set to 3001
- [x] DATABASE_URL configured
- [x] Individual DB_* variables as fallback
- [x] All required variables documented
- [x] File: `/.env.production`

**Verification Command:**
```bash
grep -E "^(PORT|API_PORT|DATABASE_URL|DB_)" /Users/danielwise/Projects/wise2-core/.env.production | head -10
```
Expected: Shows PORT=3001, API_PORT=3001, DATABASE_URL, DB_* variables

---

## Pre-Deployment Checklist

### Database Setup
- [ ] PostgreSQL service configured in docker-compose.prod.yml
- [ ] Database initialization script ready (if needed)
- [ ] Credentials match in `.env.production`

### Environment Variables
- [ ] DATABASE_URL format verified: `postgresql://user:password@host:port/database`
- [ ] Special characters in password URL-encoded (e.g., `+` → `%2B`, `/` → `%2F`)
- [ ] JWT_SECRET set to strong random value
- [ ] CORS_ORIGIN configured for your domains
- [ ] OAuth credentials (Google, GitHub) configured if using social auth

### Docker Build
- [ ] No build errors: `docker build -f packages/api/Dockerfile .`
- [ ] Curl successfully installed in runtime image
- [ ] Node dependencies installed without errors

---

## Runtime Verification Checklist

### Container Startup
```bash
# 1. Build the Docker image
docker-compose -f docker-compose.prod.yml build api

# Expected: Build completes without errors
```

```bash
# 2. Start the API service
docker-compose -f docker-compose.prod.yml up -d api postgres redis

# Expected: Services start without errors
```

```bash
# 3. Wait for postgres to be healthy
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U postgres

# Expected: "accepting connections" message
```

### Health Check Verification
```bash
# 4. Test the health endpoint
curl -v http://localhost:3010/api/health

# Expected response: 200 OK
# {
#   "status": "ok",
#   "timestamp": "2024-01-01T00:00:00.000Z"
# }
```

### Container Status
```bash
# 5. Verify container health
docker-compose -f docker-compose.prod.yml ps

# Expected: API container status should be "Up" with "(healthy)"
# api    | status: Up 2 seconds (health: starting)
```

### Logging Verification
```bash
# 6. Check startup logs
docker-compose -f docker-compose.prod.yml logs api

# Expected messages:
# [Bootstrap] Starting WISE² API initialization...
# [Bootstrap] NestJS application created successfully
# [Bootstrap] WISE² API listening on port 3001
# [Bootstrap] Environment: production
```

### Database Connection Test
```bash
# 7. Verify database connection
docker-compose -f docker-compose.prod.yml logs api | grep -i "database\|connected"

# Expected: Should see connection success messages (depends on app logging)
```

---

## Troubleshooting Quick Reference

### Issue: API container exits immediately
```bash
# Solution: Check logs
docker-compose -f docker-compose.prod.yml logs api --tail=50

# Common causes:
# 1. Missing DATABASE_URL → Add to .env.production
# 2. Invalid DATABASE_URL format → Check postgresql://user:password@host:port/database
# 3. Database not ready → Ensure postgres service started first
```

### Issue: Health check fails (unhealthy)
```bash
# Solution: Test endpoint directly
docker-compose -f docker-compose.prod.yml exec api curl -v http://localhost:3001/api/health

# Common causes:
# 1. App not listening yet → Wait 40+ seconds (start_period)
# 2. Database connection issue → Check DATABASE_URL and postgres status
# 3. Curl not found → Verify Dockerfile has curl install
```

### Issue: Database connection timeout
```bash
# Solution: Verify postgres is running
docker-compose -f docker-compose.prod.yml ps postgres

# Test postgres connectivity
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -c "SELECT 1"

# Check DATABASE_URL format and host (must be 'postgres' in Docker)
```

### Issue: CORS errors
```bash
# Solution: Verify CORS_ORIGIN in docker-compose
docker-compose -f docker-compose.prod.yml exec api printenv CORS_ORIGIN

# Should include your frontend domains
# If empty or wrong, update .env.production or docker-compose.prod.yml
```

---

## Performance & Production Readiness

### Before Production Deployment
- [ ] DATABASE_URL uses strong password (minimum 16 chars, mix of types)
- [ ] JWT_SECRET is cryptographically random (use: `openssl rand -hex 32`)
- [ ] CORS_ORIGIN restricted to specific domains (not wildcard)
- [ ] LOG_LEVEL set to 'info' or 'warn' (not 'debug')
- [ ] NODE_ENV set to 'production'
- [ ] All OAuth/third-party keys configured
- [ ] Database backup strategy in place
- [ ] Monitoring/observability configured (Prometheus/Grafana)

### Resource Limits (from docker-compose.prod.yml)
- Postgres: 2 CPU / 2GB RAM limit, 1 CPU / 1GB reserved
- API: Should have similar limits configured
- Redis: Configure memory management if needed

---

## Success Indicators

All of the following should be true:

1. ✅ API container starts without errors
2. ✅ Logs show: "WISE² API listening on port 3001"
3. ✅ Health endpoint responds: `curl http://localhost:3010/api/health`
4. ✅ Docker `ps` shows API as "(healthy)"
5. ✅ Database connection established (check logs for success)
6. ✅ No error messages in logs related to env vars or configuration
7. ✅ Website/Dashboard can reach API at http://localhost:3010/api/...

---

## Related Documentation

- **Detailed Fixes**: See `API_STARTUP_FIXES.md`
- **Configuration Reference**: See `.env.production`
- **Docker Configuration**: See `docker-compose.prod.yml`
- **NestJS Docs**: https://docs.nestjs.com/
- **TypeORM Docs**: https://typeorm.io/
