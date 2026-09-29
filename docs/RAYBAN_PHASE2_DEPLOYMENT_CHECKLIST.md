# Ray-Ban Phase 2 Deployment Checklist

**Date Started:** 2026-09-15  
**Target Completion:** 2026-09-22  
**Environment:** 173.208.147.165 (VPS)

---

## Pre-Deployment Verification

### Code Quality
- [ ] All TypeScript compiles without errors
  ```bash
  cd packages/api && npm run build
  cd apps/dashboard && npm run build
  cd apps/fieldtech-ios && xcodebuild build
  ```
- [ ] All tests pass
  ```bash
  npm run test -- streaming.spec.ts
  ```
- [ ] No console warnings or errors
- [ ] ESLint passes
  ```bash
  npm run lint
  ```

### Git Status
- [ ] All changes committed
  ```bash
  git status
  ```
- [ ] Commits follow convention
  ```bash
  git log --oneline -5
  ```
- [ ] Branch is up to date with origin/main
  ```bash
  git pull origin main
  ```

### API Endpoint Verification
- [ ] `POST /jobs/:jobId/stream/start` — Start stream endpoint exists and compiles
- [ ] `POST /jobs/:jobId/stream/subscribe` — Subscriber endpoint
- [ ] `POST /jobs/:jobId/stream/annotate` — Annotation endpoint
- [ ] `POST /jobs/:jobId/stream/audio/send` — Audio upload endpoint
- [ ] `GET /jobs/:jobId/stream/stats` — Stats endpoint
- [ ] `POST /jobs/:jobId/stream/record/start|stop` — Recording endpoints
- [ ] `GET /jobs/:jobId/stream/viewers` — Viewer list endpoint
- [ ] `POST /jobs/:jobId/stream/ice-candidate` — ICE trickle endpoint
- [ ] WebSocket SignalingGateway compiles with `@nestjs/websockets`

---

## Database Deployment

### Backup Current Database
```bash
ssh dwise@173.208.147.165 "docker exec wise2-db pg_dump -U postgres wise2_core > /tmp/wise2-backup-$(date +%s).sql"
```
- [ ] Backup file created
- [ ] Backup size > 1MB (indicates data present)

### Run Migration
```bash
ssh dwise@173.208.147.165 "cd /home/dwise/wise2-core && \
  mysql -h localhost -u root -p"wise2" < packages/db/migrations/005_add_streaming_tables.sql"
```
- [ ] Migration runs without errors
- [ ] Check new tables created:
  ```bash
  mysql> SHOW TABLES LIKE 'stream_%';
  ```
- [ ] Verify table structure:
  ```bash
  mysql> DESCRIBE stream_sessions;
  mysql> DESCRIBE stream_recordings;
  mysql> DESCRIBE stream_viewers;
  mysql> DESCRIBE stream_annotations;
  mysql> DESCRIBE stream_audio;
  mysql> DESCRIBE stream_stats;
  ```
- [ ] All 18 indexes present
- [ ] Triggers for cleanup are active

### Seed Test Data (Optional)
```sql
INSERT INTO stream_sessions (id, job_id, technician_id, status, started_at)
VALUES ('session-test-1', 'job-123', 'tech-456', 'live', NOW());

INSERT INTO stream_recordings (id, job_id, format, codec, status, started_at)
VALUES ('rec-test-1', 'job-123', 'webm', 'vp9/opus', 'recording', NOW());
```
- [ ] Test insert succeeds
- [ ] SELECT queries work
- [ ] Cleanup triggers fire (wait 24h or simulate)

---

## API Server Deployment

### Build Docker Image
```bash
cd /Users/danielwise/Projects/wise2-core && \
docker build \
  --target api \
  --tag wise2-api:latest \
  --tag wise2-api:phase2 \
  -f docker/Dockerfile .
```
- [ ] Build succeeds with no errors
- [ ] Image size reasonable (< 1GB)
- [ ] Can list layers: `docker inspect wise2-api:latest`

### Deploy to VPS
```bash
ssh dwise@173.208.147.165 "cd /home/dwise/wise2-core && \
  docker-compose pull && \
  docker-compose up -d api"
```
- [ ] Container starts
- [ ] Health check passes: `curl http://localhost:3000/health`
- [ ] Logs show no errors: `docker logs -f wise2-api`

### Register Streaming Module
Verify in `packages/api/src/app.module.ts`:
```typescript
imports: [
  // ... other modules ...
  StreamingModule,  // ← Added
]
```
- [ ] Module imported in AppModule
- [ ] No dependency injection errors on startup

### Verify API Endpoints
```bash
# Test endpoint availability
curl -X POST http://localhost:3000/api/jobs/test-job/stream/start \
  -H "Content-Type: application/json" \
  -d '{"rtpParameters": {}}'

# Should return stream session or 401/403 (auth error is OK)
# Should NOT return 404 or 500
```
- [ ] Endpoints respond (even with auth errors)
- [ ] No 404 errors (endpoint exists)
- [ ] No 500 errors (no crashes)

---

## WebRTC Server (Mediasoup) Deployment

### Port Allocation
- [ ] Ports 40000-49999 are available on VPS
  ```bash
  ssh dwise@173.208.147.165 "netstat -tlnp | grep -E ':(40|41|42|43|44|45|46|47|48|49)'"
  ```
- [ ] No conflicts with existing services
- [ ] Firewall allows UDP/TCP on this range (AWS/cloud provider)

### Mediasoup Configuration
Verify in `MediasoupService.onModuleInit()`:
```typescript
this.worker = await mediasoup.createWorker({
  logLevel: 'warn',
  rtcMinPort: 40000,
  rtcMaxPort: 49999,
  numWorkerThreads: 4,
});
```
- [ ] Worker initializes on API startup
- [ ] 4 threads allocated (check with `ps aux | grep mediasoup`)
- [ ] No "permission denied" errors for ports

### Test Mediasoup
```bash
# From API container, verify worker is running
docker exec wise2-api node -e "
  const mediasoup = require('mediasoup');
  (async () => {
    const worker = await mediasoup.createWorker();
    console.log('Worker created:', worker.pid);
    process.exit(0);
  })();
"
```
- [ ] Worker creates successfully
- [ ] PID is returned

---

## Dashboard Deployment

### Build & Deploy
```bash
cd apps/dashboard && npm run build && npm run export
# Deploy to wise2-dashboard or reverse proxy
```
- [ ] Build succeeds
- [ ] No TypeScript errors
- [ ] LiveStreamViewer component compiles

### Verify Component Loads
```bash
# Open dashboard, check console for errors
curl https://dashboard.wise2.net/components/rayban/live-stream-viewer
```
- [ ] Component loads without 404
- [ ] Styles render correctly
- [ ] Canvas element renders

---

## iOS App Deployment

### Build for iOS
```bash
cd apps/fieldtech-ios && \
xcodebuild -scheme FieldTech \
  -configuration Release \
  -destination generic/platform=iOS \
  -derivedDataPath DerivedData
```
- [ ] Build succeeds with no errors
- [ ] .ipa file created: `DerivedData/Build/Products/Release-iphoneos/FieldTech.ipa`
- [ ] Size is reasonable (< 200MB)

### Deploy to TestFlight
```bash
# Using Xcode or xcrun
xcrun altool --upload-app \
  --file FieldTech.ipa \
  --type ios \
  --username dwise03@gmail.com \
  --password @keychain:"aso"
```
- [ ] Upload succeeds
- [ ] Build appears in App Store Connect
- [ ] Testflight link works
- [ ] Internal testers can download

### Test on Physical Device
- [ ] Install from TestFlight
- [ ] Launch app
- [ ] Grant camera permission
- [ ] Grant microphone permission
- [ ] StreamingManager initializes without crashes
- [ ] Can connect to test stream

---

## Integration Testing

### Test Scenario 1: Single Technician + Supervisor
1. Technician starts stream (iOS):
   - [ ] `POST /stream/start` called
   - [ ] Session created in database
   - [ ] Mediasoup router created
   - [ ] Producer initialized

2. Supervisor subscribes (Dashboard):
   - [ ] `POST /stream/subscribe` called
   - [ ] Viewer record created
   - [ ] Mediasoup consumer created
   - [ ] Video feed received

3. Supervisor annotates:
   - [ ] Draw circle on canvas
   - [ ] `POST /stream/annotate` called
   - [ ] Annotation stored in database
   - [ ] Appears on live stream

4. Start recording:
   - [ ] `POST /stream/record/start` called
   - [ ] Recording session created
   - [ ] Buffer starts collecting chunks

5. Stop & cleanup:
   - [ ] `POST /stream/stop` called
   - [ ] Resources cleaned up
   - [ ] Recording flushed to S3
   - [ ] Database records complete

### Test Scenario 2: Multiple Supervisors
- [ ] 5 supervisors subscribe simultaneously
- [ ] Each receives video independently
- [ ] Annotations visible to all
- [ ] Recording captures all
- [ ] No performance degradation

### Test Scenario 3: Network Degradation
- [ ] Simulate 4G connection
- [ ] Bitrate adapts (measure via stats endpoint)
- [ ] FPS remains stable
- [ ] No disconnections

### Test Scenario 4: Recording Integrity
- [ ] 5-minute stream recorded
- [ ] Download from S3
- [ ] Verify video plays
- [ ] Check audio present
- [ ] No corruption detected

---

## Performance Verification

### Latency Check
```bash
# From dashboard, check stats display
# Should show latency (ms) < 500
curl http://api.wise2.net/api/jobs/test-job/stream/stats | jq '.latency'
```
- [ ] Latency < 500ms
- [ ] Measured via RTT in WebRTC stats

### Bitrate Monitoring
```bash
# Check stats endpoint periodically
for i in {1..60}; do
  curl http://api.wise2.net/api/jobs/test-job/stream/stats | jq '.videoBitrate'
  sleep 1
done
```
- [ ] Bitrate stable (within ±10% of target)
- [ ] No sustained bitrate drops
- [ ] Adaptive if network changes

### Viewer Scalability
- [ ] 1 viewer: ✅ Expected
- [ ] 5 viewers: ✅ All receive video
- [ ] 10 viewers: ✅ Performance acceptable
- [ ] 15 viewers: ⚠️ Monitor for degradation

### Recording Performance
- [ ] Upload 100MB chunk: < 5 seconds
- [ ] Concurrent recording + streaming: stable
- [ ] 24-hour cleanup job executes

---

## Production Monitoring

### Health Checks
Enable these in production:
```bash
# API health
curl https://api.wise2.net/health

# Mediasoup worker
curl https://api.wise2.net/api/streaming/health

# Database connectivity
curl https://api.wise2.net/api/db/health
```
- [ ] All health checks return 200
- [ ] Set up monitoring (Datadog/New Relic)

### Error Logging
```bash
# Tail API logs
docker logs -f wise2-api | grep -E "ERROR|WARN"

# Tail Mediasoup logs
docker logs -f wise2-api | grep "Mediasoup"
```
- [ ] No persistent errors
- [ ] Worker restarts on death < 5s
- [ ] No memory leaks

### Metrics to Track
- [ ] Average latency per stream
- [ ] Bitrate distribution
- [ ] Concurrent viewer count
- [ ] Recording upload success rate
- [ ] Database query performance
- [ ] WebSocket connection count

---

## Rollback Plan

If deployment fails:

1. **Restore Database:**
   ```bash
   mysql -u root -p"wise2" < /tmp/wise2-backup-XXXXX.sql
   ```

2. **Revert API Container:**
   ```bash
   docker-compose up -d api --no-build  # Uses last good image
   ```

3. **Revert Git:**
   ```bash
   git revert HEAD
   git push origin main
   ```

4. **Verify Rollback:**
   ```bash
   curl https://api.wise2.net/health  # Should be up
   curl https://dashboard.wise2.net  # Should be stable
   ```

---

## Sign-Off

| Component | Status | Tester | Date |
|-----------|--------|--------|------|
| Database | [ ] OK | | |
| API | [ ] OK | | |
| Mediasoup | [ ] OK | | |
| Dashboard | [ ] OK | | |
| iOS App | [ ] OK | | |
| Integration | [ ] OK | | |
| Performance | [ ] OK | | |
| Monitoring | [ ] OK | | |

**Final Approval:** [ ] Ready for Production

---

## Post-Deployment

- [ ] Notify supervisors stream is live
- [ ] Share iOS TestFlight link
- [ ] Monitor logs for 24 hours
- [ ] Collect user feedback
- [ ] Document any issues found
- [ ] Plan Phase 2.5 enhancements (optional features)

---

**Deployment Target:** 2026-09-22  
**Estimated Duration:** 4-6 hours (including testing)  
**Risk Level:** Medium (new infrastructure, verified in stages)
