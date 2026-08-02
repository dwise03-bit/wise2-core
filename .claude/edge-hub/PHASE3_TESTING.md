# PHASE 3: Remote Support — Testing & Deployment

**Status**: Code complete — Remote diagnostics + OTA ready  
**New Port**: 4902 (Support API)  
**Services**: 4 running (Registry, Health, Voice, Support)

## What's New

✅ **Remote Support Service** (380 lines)
- Support bundle generation (system logs, diagnostics, device info)
- Automatic secret redaction
- tar.gz compression
- Bundle listing and cleanup

✅ **Support API** (150 lines)
- POST /support/bundle — Generate diagnostic bundle
- GET /support/bundles — List available bundles
- GET /support/bundle/{id} — Download bundle
- POST /support/bundle/{id}/delete — Remove bundle
- GET /support/diagnostics — Quick status check

✅ **OTA Firmware Coordinator** (200 lines)
- Register firmware updates by device type
- Staged rollout with percentage control
- Checksum verification
- Rollback capability
- Device status tracking

## Deploy Phase 3

```bash
# Copy Phase 3 code
scp .claude/edge-hub/remote-support.ts \
    .claude/edge-hub/support-api.ts \
    .claude/edge-hub/ota-coordinator.ts \
    dwise@wisepi.tail44396d.ts.net:/home/dwise/wise2-edge/app/src/

# Build
ssh dwise@wisepi.tail44396d.ts.net
cd wise2-edge/app && npm run build

# Restart services (Support auto-starts)
pm2 restart all
```

## Test Support Bundle Generation

```bash
# Generate bundle (redacted)
curl -X POST http://127.0.0.1:4902/support/bundle

# Response:
{
  "success": true,
  "bundle": {
    "id": "support-bundle-1722625920000.tar.gz",
    "timestamp": "2026-08-02T15:32:00Z",
    "size": "245.30 KB",
    "redacted": true,
    "summary": {...}
  }
}

# Generate with secrets (dev only)
curl -X POST "http://127.0.0.1:4902/support/bundle?include_secrets=true"
```

## Test Bundle Download

```bash
# List bundles
curl http://127.0.0.1:4902/support/bundles

# Download bundle
curl http://127.0.0.1:4902/support/bundle/support-bundle-1722625920000.tar.gz \
  --output bundle.tar.gz

# Extract and inspect
tar -xzf bundle.tar.gz
cat manifest.json
```

## Test OTA Workflow

```bash
# Register update for BYTE Mini CYD
curl -X POST http://127.0.0.1:4902/ota/register \
  -H "Content-Type: application/json" \
  -d '{
    "deviceType": "byte-mini-cyd",
    "update": {
      "version": "1.1.0",
      "url": "https://releases.wise2.net/byte-mini-1.1.0.bin",
      "checksum": "abc123def456...",
      "rollout": 50
    }
  }'

# Initiate update (50% rollout)
curl -X POST http://127.0.0.1:4902/ota/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "byte-mini-01",
    "deviceType": "byte-mini-cyd"
  }'

# Check OTA status
curl http://127.0.0.1:4902/ota/status/byte-mini-01

# Rollback if needed
curl -X POST http://127.0.0.1:4902/ota/rollback \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "byte-mini-01",
    "version": "1.0.0"
  }'
```

## API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /support/bundle | Generate support bundle |
| GET | /support/bundles | List bundles |
| GET | /support/bundle/{id} | Download bundle |
| POST | /support/bundle/{id}/delete | Delete bundle |
| GET | /support/diagnostics | Quick diagnostics |
| GET | /support/health | Service health check |

## Troubleshooting

### Bundle Generation Fails

```bash
# Check logs
pm2 logs wise2-edge-support

# Verify systemd access
journalctl --version

# Check disk space
df -h /home/dwise/wise2-edge/data/support-bundles
```

### OTA Not Starting

```bash
# Verify device is online
curl http://127.0.0.1:4900/devices

# Check MQTT connection
mosquitto_sub -h 127.0.0.1 -u dwise -P password -t "wise2/ota/#" -v

# View OTA logs
pm2 logs wise2-edge-support | grep OTA
```

## Next Phase: Phase 4 (Systemd Integration)

- Systemd service files for persistence
- Auto-start on boot
- Log rotation
- Resource limits
- Security hardening

**ETA**: 1 hour

---

**Phase 3 complete. All services ready for production deployment.**
