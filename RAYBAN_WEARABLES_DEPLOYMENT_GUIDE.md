# Ray-Ban Wearables iOS-to-Dashboard Integration
## Complete Deployment Guide

### Overview

This guide covers the complete production-ready Ray-Ban Wearables system with:
- **iOS App** (SwiftUI, offline-first)
- **Backend API** (NestJS with WebSocket gateway)
- **Real-time Dashboard Sync** (WebSocket + REST)
- **Field Data Capture** (Image/Video/Audio)
- **Offline Queue Management** (SQLite + auto-sync)

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Ray-Ban Wearables iOS App                  │
├─────────────────────────────────────────────────────────────┤
│  UI Layer (SwiftUI)                                           │
│  ├─ WearablesCaptureView (capture interface)                 │
│  └─ SyncQueueView (offline queue display)                    │
├─────────────────────────────────────────────────────────────┤
│  Core Managers (Actor-based)                                  │
│  ├─ LocalDatabaseManager (SQLite)                            │
│  ├─ WebSocketManager (Real-time sync)                        │
│  ├─ APIClient (REST endpoints)                               │
│  └─ SyncCoordinator (Orchestration)                          │
├─────────────────────────────────────────────────────────────┤
│  Local Data (Offline-First)                                   │
│  └─ SQLite Database (captures, devices, sync queue)          │
└─────────────────────────────────────────────────────────────┘
           ↕ WebSocket / REST (Auto-connect, retry logic)
┌─────────────────────────────────────────────────────────────┐
│         WISE² Backend (NestJS on port 3000)                   │
├─────────────────────────────────────────────────────────────┤
│  RayBan Module                                                │
│  ├─ RayBanController (REST endpoints)                        │
│  ├─ RayBanService (business logic)                           │
│  └─ RayBanGateway (WebSocket/Socket.IO)                      │
├─────────────────────────────────────────────────────────────┤
│  External Services                                            │
│  ├─ Hermes AI (analysis)                                     │
│  ├─ Storage (file uploads)                                   │
│  └─ Notifications (alerts)                                   │
└─────────────────────────────────────────────────────────────┘
           ↕
┌─────────────────────────────────────────────────────────────┐
│    Ray-Ban Wearables Web Dashboard (Next.js on port 3001)    │
│    ├─ Overview Tab (real-time device/capture stats)          │
│    ├─ Captures Tab (image gallery with approval workflow)    │
│    └─ Alerts Tab (event stream)                              │
└─────────────────────────────────────────────────────────────┘
```

### iOS App Installation

#### Prerequisites
- Xcode 15.0+
- Swift 6.0+
- iOS 14.0+ target device

#### Build & Install

```bash
# Clone/navigate to project
cd apps/wise2-ios

# Build for simulator
xcodebuild -scheme WISE2 -configuration Debug \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro' \
  build

# Install on simulator
xcrun simctl install booted \
  /path/to/WISE2.app

# Or build & install directly
xcodebuild -scheme WISE2 -configuration Debug \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro' \
  test
```

#### Environment Setup (iOS App)

Create `.env` file in `apps/wise2-ios/WISE2/`:

```bash
API_URL=http://localhost:3000
WS_URL=ws://localhost:3000/socket.io/?transport=websocket
DEVICE_ID=meta-rayban-pro-001
DEVICE_NAME=Ray-Ban Meta Pro
```

#### App Configuration

1. **Launch app** - Triggers automatic device registration
2. **Connect device** - App auto-discovers connected Ray-Ban devices
3. **Start capture** - Select device → Capture image/video
4. **Offline queue** - Automatically queues captures locally
5. **Sync** - App auto-syncs when online via WebSocket + REST

### Backend Setup

#### Prerequisites
- Node.js 18+
- Docker (optional)
- PostgreSQL 14+ (for production)

#### Build API

```bash
# Install dependencies
pnpm install

# Build API package
pnpm --filter @wise2/api build

# Run migrations (if using Prisma)
pnpm prisma migrate deploy

# Start dev server
pnpm --filter @wise2/api dev

# Or with Docker
docker-compose -f docker-compose.prod.yml up api
```

#### Environment Setup (Backend)

Create `packages/api/.env`:

```bash
# API
API_PORT=3000
API_LOG_LEVEL=debug

# Authentication
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=24h

# RayBan Service
RAYBAN_API_KEY=your-rayban-api-key
RAYBAN_DEVICE_TIMEOUT=30000

# WebSocket
WS_CORS_ORIGIN=http://localhost:3000,https://wise2.net

# Hermes AI
HERMES_ENABLED=true
HERMES_API_URL=http://localhost:3012
HERMES_API_KEY=your-hermes-key

# Storage
STORAGE_TYPE=local
STORAGE_PATH=./uploads

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/wise2_rayban

# Logging
LOG_LEVEL=debug
LOG_FORMAT=json
```

#### API Health Check

```bash
curl http://localhost:3000/api/rayban/health

# Expected response:
{
  "status": "ok",
  "service": "ray-ban-integration",
  "timestamp": "2026-09-15T...",
  "version": "1.0.0"
}
```

### WebSocket Integration

#### iOS App WebSocket Connection

```swift
// Automatic in SyncCoordinator
await coordinator.connectToSync(
    wsURL: "wss://api.wise2.net/socket.io/",
    authToken: "your-jwt-token"
)

// Connection auto-retries with exponential backoff
// Reconnect attempts: 1s → 2s → 4s → 8s → 16s → 32s → 300s (max)
```

#### WebSocket Events

**iOS → Backend:**
```json
{
  "type": "capture:create",
  "payload": {
    "deviceId": "meta-rayban-pro-001",
    "type": "image",
    "data": "base64-encoded-image-data",
    "notes": "Captured at installation site"
  }
}
```

**Backend → iOS:**
```json
{
  "type": "capture:synced",
  "payload": {
    "captureId": "cap-123",
    "status": "APPROVED",
    "timestamp": "2026-09-15T12:34:56Z"
  }
}
```

### Offline-First Architecture

#### Local Database Schema

```sql
-- Captures table
CREATE TABLE captures (
  id TEXT PRIMARY KEY,
  deviceId TEXT NOT NULL,
  type TEXT NOT NULL,        -- image, video, audio
  data BLOB,
  status TEXT DEFAULT 'PENDING',  -- PENDING, SYNCED, APPROVED
  syncedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

-- Sync queue table
CREATE TABLE sync_queue (
  id TEXT PRIMARY KEY,
  captureId TEXT UNIQUE,
  operation TEXT,            -- upload_capture
  retryCount INTEGER DEFAULT 0,
  maxRetries INTEGER DEFAULT 3,
  nextRetry TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Devices table
CREATE TABLE devices (
  id TEXT PRIMARY KEY,
  name TEXT,
  status TEXT,              -- connected, disconnected
  battery REAL,
  lastSeen TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics table
CREATE TABLE analytics (
  id TEXT PRIMARY KEY,
  deviceId TEXT NOT NULL,
  metric TEXT NOT NULL,
  value REAL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Sync Flow

1. **Capture Created** → Stored in SQLite (PENDING)
2. **Added to Sync Queue** → Awaiting upload
3. **Online?** → Start sync immediately
4. **Sync Success** → Status → SYNCED, removed from queue
5. **Sync Fail** → Retry with backoff (1s → 32s → 300s)
6. **Max Retries Exceeded** → Status → FAILED, removed from queue
7. **User Approval (Dashboard)** → WebSocket notification → Status → APPROVED

#### Battery Efficiency

- Sync runs every **5 seconds** (configurable)
- Status check every **30 seconds**
- WebSocket auto-reconnect uses **exponential backoff**
- Background sync uses **silent push notifications** (iOS)
- All DB operations use **SQLite transactions**
- Network requests are **cancelled on timeout** (10s default)

### Testing

#### Unit Tests (iOS)

```bash
# Test database operations
xcodebuild -scheme WISE2Tests -configuration Debug test

# Expected test coverage:
# - LocalDatabaseManager: 90%
# - SyncCoordinator: 85%
# - APIClient: 80%
# - WebSocketManager: 75%
```

#### Integration Tests (Backend)

```bash
# Test all RayBan endpoints
pnpm --filter @wise2/api test:e2e rayban

# Test WebSocket events
pnpm --filter @wise2/api test:e2e ws

# Load testing (500+ devices)
npx artillery run packages/api/tests/load.yml
```

#### E2E Tests (Full System)

```bash
# Start backend
pnpm --filter @wise2/api dev

# Start dashboard
pnpm --filter @wise2/website dev

# Run iOS app in simulator
xcodebuild -scheme WISE2 -configuration Debug \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro' \
  test

# Verify flow:
# 1. App connects to WebSocket
# 2. Device registers automatically
# 3. Capture is created locally
# 4. Sync queue item added
# 5. Capture uploads to backend
# 6. Dashboard shows capture in real-time
# 7. Dashboard approves capture
# 8. Approval notification received in iOS app
# 9. Local DB updated with APPROVED status
```

### Production Deployment

#### iOS App (TestFlight/App Store)

```bash
# Create archive
xcodebuild -scheme WISE2 -configuration Release \
  -destination generic/platform=iOS \
  archive -archivePath WISE2.xcarchive

# Export for upload
xcodebuild -exportArchive -archivePath WISE2.xcarchive \
  -exportOptionsPlist ExportOptions.plist \
  -exportPath ./export

# Upload to TestFlight
xcrun altool --upload-app \
  --file ./export/WISE2.ipa \
  --type ios \
  --apiKey $APP_STORE_API_KEY \
  --apiIssuer $APP_STORE_ISSUER_ID
```

#### Backend Deployment

```bash
# Docker deployment
docker-compose -f docker-compose.prod.yml up -d api

# Or Kubernetes
kubectl apply -f k8s/rayban-api.yaml

# Verify deployment
curl https://api.wise2.net/api/rayban/health

# Monitor logs
docker logs wise2-api-container
kubectl logs -f deployment/wise2-api
```

#### SSL/TLS Configuration

```nginx
# Nginx upstream for WebSocket
upstream rayban_api {
  server api.wise2.net:3000;
}

server {
  listen 443 ssl http2;
  server_name api.wise2.net;

  # SSL certificates
  ssl_certificate /etc/ssl/certs/wise2.net.crt;
  ssl_certificate_key /etc/ssl/private/wise2.net.key;

  # WebSocket routing
  location /socket.io/ {
    proxy_pass http://rayban_api;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  # REST API routing
  location /api/ {
    proxy_pass http://rayban_api;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

### Monitoring & Alerts

#### Backend Metrics

```bash
# RayBan API metrics endpoint
GET /api/rayban/metrics
{
  "devices_connected": 15,
  "captures_pending": 42,
  "captures_synced": 1203,
  "avg_sync_time_ms": 234,
  "websocket_connections": 8,
  "failed_syncs_last_hour": 2
}

# Set up Prometheus scraping
# scrape_configs:
#   - job_name: rayban-api
#     static_configs:
#       - targets: ['localhost:3000']
#     metrics_path: '/api/rayban/metrics'
```

#### iOS App Telemetry

```swift
// Automatically collected telemetry:
// - Sync success rate
// - Offline duration
// - Database size
// - Memory usage
// - Battery consumed
// - Network handoff events

// Access in SyncCoordinator:
await coordinator.recordAnalytics(
    deviceId: "meta-rayban-pro-001",
    metric: "sync_success_rate",
    value: 0.98
)
```

### Troubleshooting

#### iOS App Won't Connect

```swift
// Check WebSocket URL
print(ProcessInfo.processInfo.environment["WS_URL"])

// Check device registration
let devices = await coordinator.connectedDevices
print("Devices: \(devices.count)")

// Check sync status
print("Sync Status: \(coordinator.syncStatus)")
print("Is Online: \(coordinator.isOnline)")
```

#### Backend WebSocket Not Responding

```bash
# Check WebSocket gateway is loaded
curl http://localhost:3000/api/rayban/health

# Check Socket.IO namespace
curl http://localhost:3000/socket.io/?transport=polling

# Check WebSocket upgrade
ws://localhost:3000/socket.io/?transport=websocket

# Monitor connections
redis-cli KEYS "*socket*"
```

#### Captures Not Syncing

```bash
# Check database has captures
sqlite3 rayban_wearables.db "SELECT COUNT(*) FROM captures WHERE status='PENDING';"

# Check sync queue
sqlite3 rayban_wearables.db "SELECT * FROM sync_queue;"

# Check retry count
sqlite3 rayban_wearables.db "SELECT retryCount, MAX(retryCount) as max FROM sync_queue GROUP BY captureId;"

# Reset sync queue (development only)
sqlite3 rayban_wearables.db "DELETE FROM sync_queue;"
```

### API Reference

#### Device Management

```
POST   /api/rayban/devices/register          (Auth required)
GET    /api/rayban/devices                   (Auth required)
GET    /api/rayban/devices/:deviceId
POST   /api/rayban/devices/:deviceId/status
```

#### Capture Management

```
POST   /api/rayban/captures
GET    /api/rayban/captures?deviceId=&limit=&offset=
GET    /api/rayban/captures/:captureId
PATCH  /api/rayban/captures/:captureId/approve
```

#### Commands

```
POST   /api/rayban/commands/send
GET    /api/rayban/commands/:commandId
POST   /api/rayban/commands/:commandId/status
```

#### Analytics

```
POST   /api/rayban/analytics/:deviceId
GET    /api/rayban/analytics/:deviceId?metric=
```

#### Dashboard

```
GET    /api/rayban/dashboard
GET    /api/rayban/alerts?limit=&offset=
GET    /api/rayban/health
```

### Support & Documentation

- **iOS Architecture**: See `apps/wise2-ios/WISE2/Core/`
- **Backend Architecture**: See `packages/api/src/rayban/`
- **Dashboard**: See `apps/website/app/wearables/`
- **WebSocket Protocol**: See `rayban.gateway.ts`
- **Database Schema**: See `LocalDatabaseManager.swift`

---

**Version**: 1.0.0  
**Last Updated**: 2026-09-15  
**Status**: Production Ready ✅
