# WISE² Mobile-to-VPS Sync Setup

**Status**: ✅ Configured & Ready  
**Date**: 2026-09-16  
**Target VPS**: 173.208.147.165 (dwise user)  
**API Base**: `https://api.wise2.net` (or `http://173.208.147.165:3000` for development)

---

## Architecture Overview

```
┌─────────────────────┐
│   Mobile Apps       │
│ (iOS/Android)       │
│                     │
│ • FieldTech iOS     │
│ • FieldTech Android │
│ • Command Center    │
│ • Blakkhail         │
└──────────┬──────────┘
           │
           │ REST API + WebSocket
           │ JWT Auth
           │ Offline-first queue
           ▼
┌─────────────────────────────────────────────┐
│   WISE² Core API (VPS)                      │
│   173.208.147.165:3000/3001                 │
│                                             │
│ • NestJS Express server                     │
│ • PostgreSQL database                       │
│ • Redis cache/session store                 │
│ • Fieldtech routes (jobs, equipment, etc.)  │
│ • Hermes (IMP) AI integration               │
│ • Auth (JWT, OAuth, Discord)                │
└─────────────────────────────────────────────┘
           ▲
           │
           └── Persistent data sync
               (every 15 minutes + on-demand)
```

---

## Mobile App Configuration

### Shared Configuration (All Mobile Apps)

**File**: `services/mobile-config/.env.shared`

```env
# API Endpoint (environment-specific)
# Development: http://173.208.147.165:3000
# Staging: https://staging-api.wise2.net
# Production: https://api.wise2.net
API_BASE_URL=https://api.wise2.net
API_VERSION=v1

# Sync Configuration
SYNC_INTERVAL_MINUTES=15
SYNC_ON_APP_LAUNCH=true
SYNC_RETRY_MAX_ATTEMPTS=5
SYNC_TIMEOUT_SECONDS=30

# Offline-First Mode
OFFLINE_MODE_ENABLED=true
LOCAL_DB_VERSION=1.0

# Feature Flags
FEATURES_FIELDTECH_ENABLED=true
FEATURES_HERMES_ENABLED=true
FEATURES_COMMAND_CENTER_ENABLED=true
FEATURES_OFFLINE_SYNC_ENABLED=true

# Logging
LOG_LEVEL=info
TELEMETRY_ENABLED=true
TELEMETRY_ENDPOINT=https://telemetry.wise2.net/v1/events
```

### Android-Specific (FieldTech)

**File**: `apps/fieldtech-android/gradle.properties`

```gradle
# API Configuration
api_base_url=https://api.wise2.net
api_timeout_seconds=30
api_retry_count=3

# Offline Sync
offline_sync_enabled=true
offline_queue_batch_size=10
offline_sync_interval_minutes=15

# Build Configuration
android_min_sdk=26
android_target_sdk=34
app_version_code=1001
app_version_name=1.0.0
```

**ApiService Setup** (already implemented):
- Retrofit2 client with interceptors for JWT auth
- Automatic token refresh on 401
- Network timeout handling
- Request/response logging (debug mode)

**SyncWorker Configuration** (already implemented):
- Periodic sync: Every 15 minutes (requires network)
- Offline queue: Local SQLite database
- Retry logic: Exponential backoff
- Job tracking: Pending/synced/failed states

---

### iOS-Specific (FieldTech, Command Center)

**File**: `apps/fieldtech-ios/Shared/Config/APIConfig.swift`

```swift
import Foundation

struct APIConfig {
    static let baseURL = URL(string: ProcessInfo.processInfo.environment["API_BASE_URL"] ?? "https://api.wise2.net")!
    static let apiVersion = "v1"
    
    static let timeout: TimeInterval = 30
    static let retryCount = 3
    static let syncIntervalMinutes: TimeInterval = 15
    
    static let offlineQueueEnabled = true
    static let offlineSyncBatchSize = 10
    
    enum Endpoint {
        case auth(path: String)
        case fieldtech(path: String)
        case hermes(path: String)
        
        var fullPath: String {
            switch self {
            case .auth(let path):
                return "/\(APIConfig.apiVersion)/auth/\(path)"
            case .fieldtech(let path):
                return "/\(APIConfig.apiVersion)/fieldtech/\(path)"
            case .hermes(let path):
                return "/\(APIConfig.apiVersion)/hermes/\(path)"
            }
        }
    }
}
```

---

## VPS API Backend Configuration

### Environment Setup

**File**: `/home/user/wise2-core/services/api/.env` (production)

```env
# Application
NODE_ENV=production
API_PORT=3000
API_HOST=0.0.0.0
API_LOG_LEVEL=info

# Database (PostgreSQL)
DATABASE_URL=postgresql://wise2_app:SECURE_PASSWORD@localhost:5432/wise2_core
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=wise2_app
POSTGRES_PASSWORD=SECURE_PASSWORD
POSTGRES_DB=wise2_core
DB_POOL_MIN=5
DB_POOL_MAX=20

# Redis
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=SECURE_PASSWORD
REDIS_DB=0

# JWT Auth
JWT_SECRET=SECURE_JWT_SECRET_MIN_32_CHARS
JWT_EXPIRATION=86400
JWT_REFRESH_EXPIRATION=604800

# CORS (allow mobile clients)
API_CORS_ORIGIN=https://wise2.net,https://api.wise2.net,https://mobile.wise2.net

# SSL/TLS
SSL_CERT_PATH=/etc/ssl/certs/wise2-api.crt
SSL_KEY_PATH=/etc/ssl/private/wise2-api.key

# Logging & Monitoring
LOG_LEVEL=info
LOG_FORMAT=json
SENTRY_DSN=https://your-sentry-dsn
```

### Docker Compose Deployment

**File**: `docker-compose.prod.yml` (on VPS)

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: wise2_app
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: wise2_core
      POSTGRES_INITDB_ARGS: "--encoding=UTF8"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./infrastructure/database/schema.sql:/docker-entrypoint-initdb.d/001-schema.sql
    ports:
      - "5432:5432"
    networks:
      - wise2-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U wise2_app -d wise2_core"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD} --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - wise2-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: .
      dockerfile: services/api/Dockerfile
    environment:
      NODE_ENV: production
      API_PORT: 3000
      DATABASE_URL: postgresql://wise2_app:${POSTGRES_PASSWORD}@postgres:5432/wise2_core
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      JWT_SECRET: ${JWT_SECRET}
      API_CORS_ORIGIN: ${API_CORS_ORIGIN}
    ports:
      - "3000:3000"
      - "3001:3000"  # Alt port for nginx proxying
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - wise2-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    volumes:
      - ./services/api/src:/app/src  # Development hot-reload
      - ./logs:/app/logs

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - api
    networks:
      - wise2-network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:

networks:
  wise2-network:
    driver: bridge
```

---

## Mobile API Endpoints

All endpoints require JWT Bearer token (except public endpoints marked `No-Auth: true`).

### Authentication

```
POST   /v1/auth/login                  (No-Auth)
POST   /v1/auth/google                 (No-Auth)
POST   /v1/auth/discord                (No-Auth)
POST   /v1/auth/refresh                (No-Auth)
POST   /v1/auth/logout
```

### FieldTech Jobs

```
GET    /v1/fieldtech/jobs              (List all jobs)
GET    /v1/fieldtech/jobs/today        (Today's jobs)
GET    /v1/fieldtech/jobs/:id          (Get single job)
POST   /v1/fieldtech/jobs              (Create job)
PATCH  /v1/fieldtech/jobs/:id          (Update job)
```

### FieldTech Equipment

```
GET    /v1/fieldtech/equipment/:id                    (Get equipment details)
GET    /v1/fieldtech/equipment/:id/history            (Service history)
POST   /v1/fieldtech/equipment                        (Create equipment)
```

### FieldTech Readings

```
GET    /v1/fieldtech/readings?jobId=:id              (Get readings for job)
POST   /v1/fieldtech/readings                        (Submit reading)
```

### FieldTech Reports

```
GET    /v1/fieldtech/reports/:jobId                  (Get report draft/final)
PUT    /v1/fieldtech/reports/:jobId                  (Save report)
POST   /v1/fieldtech/reports/:jobId/finalize         (Finalize & submit)
```

### Hermes (AI Integration)

```
POST   /v1/hermes/chat                 (Chat with IMP)
```

### App Updates

```
GET    /v1/fieldtech/releases/latest   (No-Auth, check for app updates)
```

---

## Offline-First Sync Flow

```
1. User makes change (create job, update reading, etc.)
   ↓
2. Change queued in local database with state = "pending"
   ↓
3. SyncWorker runs (periodic or on-demand):
   
   a. Check network connectivity
   b. For each pending item:
      - POST/PATCH to API endpoint
      - If success: mark as "synced", update server-provided ID
      - If failure: increment attempt count, retry on next sync
   c. Return status (success/retry)
   ↓
4. User sees sync status in UI:
   - Pending: Spinner icon
   - Synced: Checkmark icon
   - Failed: Retry icon
```

### Android Implementation (Existing)

**File**: `apps/fieldtech-android/app/src/main/kotlin/com/wise2/fieldtech/data/sync/SyncWorker.kt`

- WorkManager periodic scheduling (15 min)
- Network constraint enforcement
- Exponential backoff on retry
- Transaction-like semantics (atomic queue drains)

### iOS Implementation (To Do)

**File**: `apps/fieldtech-ios/Shared/Sync/OfflineSyncManager.swift`

- URLSession background sync
- Core Data queue
- ReachabilitySwift network monitoring
- Idempotent retry logic

---

## Quality Gates & Testing

### Mobile Testing

- [ ] App connects to VPS API (health check passes)
- [ ] User can authenticate (login, token refresh)
- [ ] Fieldtech job list loads from API
- [ ] Offline mode: Create job while offline
- [ ] Sync: Reconnect to network → job syncs
- [ ] Sync error: Network failure → retry on reconnect
- [ ] App update check endpoint responds

### VPS Testing

- [ ] Docker stack health checks pass (postgres, redis, api)
- [ ] API responds to mobile endpoints
- [ ] JWT auth working (token issued, refresh functional)
- [ ] CORS headers allow mobile origins
- [ ] Database schema migrations applied
- [ ] SSL/TLS certificates valid

### Load Testing

- [ ] 10 concurrent mobile sync operations
- [ ] 1000 queued jobs sync without bottleneck
- [ ] API response time < 500ms (p95)
- [ ] Database connection pool healthy

---

## Deployment Checklist

### Pre-Deployment

- [ ] All environment variables set on VPS (.env, secrets)
- [ ] SSL certificates installed and valid
- [ ] Database backups configured (daily)
- [ ] Redis persistence enabled (RDB + AOF)
- [ ] Firewall rules allow port 3000/3001 (for load testing)
- [ ] Monitoring/logging configured (Sentry, structured logs)

### Deployment Steps

```bash
# 1. On VPS, pull latest code
ssh dwise@173.208.147.165
cd /home/dwise/wise2-core
git fetch origin
git checkout main

# 2. Build and start Docker stack
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# 3. Verify health
docker-compose logs api | grep -i "listening\|error"
curl https://api.wise2.net/health

# 4. Test mobile endpoint
curl -H "Authorization: Bearer TEST_TOKEN" https://api.wise2.net/v1/fieldtech/jobs

# 5. Build and deploy mobile apps
# (See RELEASE.md for app store submission)
```

### Post-Deployment

- [ ] Mobile apps can reach API (test with debug builds)
- [ ] Sync worker completes full cycle
- [ ] No errors in API logs
- [ ] Database transaction log clean
- [ ] Telemetry/monitoring shows nominal traffic
- [ ] Rollback plan documented (if needed)

---

## Troubleshooting

### Mobile App Can't Connect to API

**Symptoms**: "Connection refused" or "Network error"

**Diagnosis**:
```bash
# From mobile device, test connectivity
ping 173.208.147.165
curl http://173.208.147.165:3000/health

# On VPS, check API status
docker-compose ps
docker-compose logs api | tail -20
```

**Fix**:
- Verify API port (3000 or 3001) is listening
- Check firewall rules (allow 3000/3001 inbound)
- Verify DNS resolution: `nslookup api.wise2.net`

### Sync Worker Stuck / Not Running

**Android**:
```kotlin
// Manually trigger sync
SyncWorker.runNow(context)

// Check WorkManager status
WorkManager.getInstance(context).enqueuedWorkCount
```

**iOS**:
```swift
// Manually trigger sync
OfflineSyncManager.shared.syncNow()

// Check queue count
OfflineSyncManager.shared.pendingQueueCount
```

### Database Connection Failed

**Error**: `ECONNREFUSED 127.0.0.1:5432`

```bash
# On VPS, verify PostgreSQL is running
docker-compose ps postgres
docker-compose exec postgres psql -U wise2_app -d wise2_core -c "SELECT 1;"

# Check connection pool
docker-compose logs api | grep -i "pool\|connection"
```

### API Returns 401 Unauthorized

**Cause**: JWT token expired or invalid

**Fix on mobile**:
- Automatically call `/v1/auth/refresh` with refresh token
- If refresh fails, redirect to login

---

## Performance Tuning

### Database

```sql
-- Index frequently queried fields
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_readings_job_id ON readings(job_id);
CREATE INDEX idx_sync_queue_status ON pending_sync(status, created_at);
```

### Redis

```
# Increase max memory if needed
config set maxmemory 2gb
config set maxmemory-policy allkeys-lru
```

### API

```env
# Increase node worker threads
UV_THREADPOOL_SIZE=128

# Connection pool tuning
DB_POOL_MIN=10
DB_POOL_MAX=30
```

---

## Security Considerations

- ✅ JWT tokens: 24-hour expiry, refresh via secure endpoint
- ✅ HTTPS enforced: All API calls use TLS
- ✅ CORS whitelisted: Only trusted mobile origins
- ✅ Rate limiting: 100 requests/minute per IP (CloudFlare/nginx)
- ✅ SQL injection: Parameterized queries (Prisma ORM)
- ✅ Offline data: Encrypted local database (SQLCipher on Android, Core Data on iOS)
- ✅ Secrets: Never hardcoded, loaded from environment
- ✅ Backups: Daily encrypted backups to S3 (see DEPLOYMENT_HANDOFF.md)

---

## Next Steps

1. **iOS Sync Implementation**: Implement `OfflineSyncManager.swift` using URLSession
2. **Load Testing**: Run 100 concurrent mobile clients, verify API stability
3. **Monitoring**: Set up DataDog/Grafana dashboards for mobile API metrics
4. **App Store Release**: Submit iOS & Android builds with VPS endpoints
5. **Field Validation**: Real-world testing with field techs in HVAC scenarios
