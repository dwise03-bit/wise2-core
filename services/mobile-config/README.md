# WISE² Mobile Configuration

This directory contains environment configuration templates for WISE² mobile apps connecting to the VPS backend.

## Quick Start

### 1. Copy configuration template

```bash
cp .env.example .env.development
# Edit for your local setup
nano .env.development
```

### 2. Configure for your environment

**Development** (local API server):
```bash
cp .env.example .env.development
# Update API_BASE_URL to http://localhost:3000
# Set LOG_LEVEL=debug for verbose output
```

**Staging** (staging server):
```bash
cp .env.example .env.staging
# Update API_BASE_URL to https://staging-api.wise2.net
# Disable debug logging
```

**Production** (production server):
```bash
cp .env.example .env.production
# Update API_BASE_URL to https://api.wise2.net
# Enable certificate pinning
# Use minimal logging
```

## Configuration Reference

### API Endpoint

```env
API_BASE_URL=https://api.wise2.net     # Production
API_BASE_URL=http://localhost:3000     # Development
API_BASE_URL=https://staging-api.wise2.net  # Staging
```

### Sync Configuration

```env
SYNC_INTERVAL_MINUTES=15               # Periodic sync interval
SYNC_ON_APP_LAUNCH=true               # Sync when app opens
SYNC_RETRY_MAX_ATTEMPTS=5             # Retry failed syncs
SYNC_TIMEOUT_SECONDS=30               # API timeout
OFFLINE_MODE_ENABLED=true             # Queue writes locally
```

### Feature Flags

Enable/disable features per environment:

```env
FEATURES_FIELDTECH_ENABLED=true       # Job scheduling, equipment
FEATURES_HERMES_ENABLED=true          # AI integration (IMP)
FEATURES_COMMAND_CENTER_ENABLED=true  # Command center UI
FEATURES_OFFLINE_SYNC_ENABLED=true    # Offline queue drain
FEATURES_DEBUG_MENU_ENABLED=false     # Dev-only debug UI
FEATURES_TELEMETRY_ENABLED=true       # Analytics
```

### Logging

Development debugging:
```env
LOG_LEVEL=debug                       # Verbose logs
API_DEBUG_LOGGING=true               # HTTP request/response logs
SYNC_DEBUG_LOGGING=true              # Sync operation details
```

Production minimal:
```env
LOG_LEVEL=warn                       # Only warnings/errors
API_DEBUG_LOGGING=false
SYNC_DEBUG_LOGGING=false
```

### Security (Production)

```env
CERTIFICATE_PINNING_ENABLED=true     # Pin API certificate
CERTIFICATE_PIN_HASH=sha256/xxxxx    # Certificate hash
```

## Integration with Mobile Apps

### Android (FieldTech)

In `build.gradle.kts`:

```gradle
android {
    buildTypes {
        debug {
            resValue "string", "api_base_url", 
                project.properties['api.base.url'] ?: 'http://localhost:3000'
        }
        release {
            resValue "string", "api_base_url", 'https://api.wise2.net'
        }
    }
}
```

Usage in code:
```kotlin
val apiBaseUrl = context.getString(R.string.api_base_url)
val apiClient = ApiService(apiBaseUrl)
```

### iOS (FieldTech, Command Center)

In `Config.swift`:

```swift
struct AppConfig {
    static let apiBaseURL = URL(string: 
        Bundle.main.infoDictionary?["API_BASE_URL"] as? String 
        ?? "https://api.wise2.net"
    )!
}
```

In `Info.plist`:
```xml
<key>API_BASE_URL</key>
<string>https://api.wise2.net</string>
```

Or load from build configuration:
```swift
#if DEBUG
let apiURL = URL(string: "http://localhost:3000")!
#else
let apiURL = URL(string: "https://api.wise2.net")!
#endif
```

## File Structure

```
services/mobile-config/
├── README.md                 # This file
├── .env.example             # Template (commit to repo)
├── .env.development         # Local dev (NOT committed, see .gitignore)
├── .env.staging             # Staging (NOT committed)
└── .env.production          # Production (NOT committed)
```

**Note**: Only `.env.example` is committed to version control.  
All actual `.env.*` files are ignored by `.gitignore` to protect secrets.

## VPS Backend Endpoints

### Available Routes

```
GET    /health                        # Health check (no auth)
POST   /v1/auth/login                 # Email/password login
POST   /v1/auth/google               # Google OAuth
POST   /v1/auth/refresh              # Token refresh
POST   /v1/auth/logout               # Logout

GET    /v1/fieldtech/jobs            # List jobs
GET    /v1/fieldtech/jobs/today      # Today's jobs
POST   /v1/fieldtech/jobs            # Create job
PATCH  /v1/fieldtech/jobs/:id        # Update job

GET    /v1/fieldtech/equipment/:id           # Get equipment
POST   /v1/fieldtech/equipment              # Create equipment
GET    /v1/fieldtech/readings?jobId=:id    # Job readings
POST   /v1/fieldtech/readings               # Submit reading

GET    /v1/fieldtech/reports/:jobId         # Get report
PUT    /v1/fieldtech/reports/:jobId         # Save report
POST   /v1/fieldtech/reports/:jobId/finalize # Finalize

POST   /v1/hermes/chat                # AI chat (IMP)
GET    /v1/fieldtech/releases/latest # App update check (no auth)
```

### Authentication

All endpoints (except marked "no auth") require JWT Bearer token:

```bash
curl -H "Authorization: Bearer eyJhbGc..." https://api.wise2.net/v1/fieldtech/jobs
```

Token obtained from `/v1/auth/login`:
```bash
curl -X POST https://api.wise2.net/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"..."}'

# Response
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "expiresIn": 86400
}
```

## Troubleshooting

### "Connection refused"

Check API is running and accessible:
```bash
curl http://173.208.147.165:3000/health
```

Verify firewall allows port 3000:
```bash
sudo ufw allow 3000
```

### "401 Unauthorized"

Token may be expired. Check:
```bash
# Refresh token
curl -X POST https://api.wise2.net/v1/auth/refresh \
  -d '{"refreshToken":"..."}'
```

### "Sync stuck / not running"

Check configuration:
- SYNC_INTERVAL_MINUTES set
- OFFLINE_MODE_ENABLED = true
- Network connectivity available
- Local database not locked

### "Certificate pinning error" (production)

Verify certificate hash:
```bash
openssl s_client -connect api.wise2.net:443 | \
  openssl x509 -pubkey -noout | \
  openssl pkey -pubin -outform der | \
  openssl dgst -sha256 -binary | \
  openssl enc -base64
```

Update CERTIFICATE_PIN_HASH in config if it changed.

## See Also

- [MOBILE_VPS_SYNC_SETUP.md](./../.claude/skills/wise2-mobile/MOBILE_VPS_SYNC_SETUP.md) — Full architecture
- [MOBILE_VPS_SYNC_QUICKSTART.md](./../.claude/skills/wise2-mobile/MOBILE_VPS_SYNC_QUICKSTART.md) — Implementation guide
- [services/api/README.md](./../services/api/README.md) — API server setup
- [docker-compose.prod.yml](./../docker-compose.prod.yml) — VPS deployment

## Support

For issues or questions, check:
1. API logs: `docker-compose logs api`
2. Mobile app logs: Android Studio logcat / Xcode console
3. Database: `docker-compose exec postgres psql -U wise2_app -d wise2_core`
4. Redis: `docker-compose exec redis redis-cli`
