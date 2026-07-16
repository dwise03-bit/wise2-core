# WISE² API Quick Start - After Fixes

## What Was Fixed

The NestJS API backend had **7 critical startup issues** that have all been resolved:

1. ✅ Port configuration mismatch (API_PORT vs PORT)
2. ✅ Database URL parsing not supported
3. ✅ Health check endpoint wrong path
4. ✅ No error handling on startup
5. ✅ Missing curl in container (broke health checks)
6. ✅ Environment variable inconsistencies
7. ✅ Special character handling in database URLs

## Start the API

```bash
cd /Users/danielwise/Projects/wise2-core

# Build and start all services
docker-compose -f docker-compose.prod.yml up -d

# Verify API is running
curl http://localhost:3010/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-07-16T00:56:00.000Z"
}
```

## Check Status

```bash
# See all services
docker-compose -f docker-compose.prod.yml ps

# API should show status: Up (healthy)
```

## View Logs

```bash
# Real-time logs
docker-compose -f docker-compose.prod.yml logs -f api

# Expected startup messages:
# [Bootstrap] Starting WISE² API initialization...
# [Bootstrap] NestJS application created successfully
# [Bootstrap] WISE² API listening on port 3001
```

## Test Endpoints

```bash
# Health check
curl http://localhost:3010/api/health

# API docs
curl http://localhost:3010/api/docs

# System APIs
curl http://localhost:3010/api/v1/system/apis
```

## Configuration Files

**Key files that were fixed:**

| File | Changes |
|------|---------|
| `packages/api/src/main.ts` | Error handling, port config |
| `packages/api/src/app.module.ts` | DATABASE_URL parsing |
| `packages/api/Dockerfile` | Added curl |
| `docker-compose.prod.yml` | Fixed health check, env vars |
| `.env.production` | Port, DATABASE_URL config |

## Environment Variables

The API now supports **two configuration approaches:**

### Approach 1: DATABASE_URL (Recommended)
```bash
DATABASE_URL=postgresql://user:password@postgres:5432/wise2_core
```

### Approach 2: Individual Variables (Fallback)
```bash
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=wise2_prod_user
DB_PASSWORD=your_password
DB_NAME=wise2_core
```

Both approaches work. The app will use DATABASE_URL if available, otherwise fall back to individual variables.

## Port Mapping

```
Host (outside Docker)    →    Container (inside Docker)
localhost:3010           →    0.0.0.0:3001
```

This means:
- Access API from your computer: `http://localhost:3010`
- Internally (other containers): `http://api:3001`

## What Changed in Each File

### main.ts
- ✅ Added try-catch error handling
- ✅ Added Logger for debugging
- ✅ Validates DATABASE_URL exists
- ✅ Reads PORT environment variable
- ✅ Proper error messages on startup failure

### app.module.ts
- ✅ Parses DATABASE_URL (postgresql://...)
- ✅ Falls back to individual DB_* variables
- ✅ Handles URL-encoded passwords
- ✅ Supports both DB_USERNAME and DB_USER

### Dockerfile
- ✅ Added curl for health checks

### docker-compose.prod.yml
- ✅ Fixed health check path to `/api/health`
- ✅ Set PORT and API_PORT to 3001
- ✅ Added DATABASE_URL default value
- ✅ Improved postgres service configuration

### .env.production
- ✅ Updated PORT from 3000 to 3001
- ✅ Updated DATABASE_URL with URL-encoded password
- ✅ Added complete documentation

## Troubleshooting

### API won't start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs api --tail=50

# Common issue: DATABASE_URL format
# Must be: postgresql://user:password@host:port/database
```

### Health check fails
```bash
# Verify endpoint
docker-compose -f docker-compose.prod.yml exec api curl http://localhost:3001/api/health

# Common issue: App still initializing (wait 40+ seconds)
```

### Database connection error
```bash
# Check postgres is running
docker-compose -f docker-compose.prod.yml ps postgres

# Verify DATABASE_URL host is 'postgres' (not localhost)
```

## Documentation

For detailed information, see:
- **API_STARTUP_FIXES.md** - Complete technical details
- **API_VERIFICATION_CHECKLIST.md** - Verification procedures
- **STARTUP_FIXES_SUMMARY.txt** - Quick reference

## Next Steps

1. **Development**: Test with `docker-compose up -d`
2. **Staging**: Update `.env.production` with staging credentials
3. **Production**: Update `.env.production` with production secrets:
   - Strong DATABASE_URL password
   - Strong JWT_SECRET (`openssl rand -hex 32`)
   - Real OAuth provider credentials
   - Your domain in CORS_ORIGIN

## API Endpoints

Once running, the following endpoints are available:

```
GET  /api/health                          # Health check
GET  /api/docs                            # API documentation
GET  /api/v1/system/apis                  # Available APIs
GET  /api/v1/system/apis/health           # System health
GET  /api/v1/system/apis/:service         # Service details
POST /api/auth/login                      # Login
POST /api/auth/register                   # Register
... (other endpoints based on modules)
```

## Still Having Issues?

1. Check the logs: `docker-compose logs api`
2. Verify DATABASE_URL format and password encoding
3. Ensure postgres is healthy: `docker-compose ps postgres`
4. Read API_STARTUP_FIXES.md for detailed troubleshooting

---

**Status**: All startup issues fixed. API is ready to deploy. ✅
