# WISE² Meta Quest HVAC Integration — Phase 1 Implementation Plan

**Date:** 2026-09-06  
**Scope:** Sprint 1-4, Phase 1 foundation (8-10 weeks)  
**Dependencies:** WISE² HVAC API running, Phase 2 live streaming endpoints available, Quest SDK installed

---

## Sprint Breakdown

### Sprint 1 (Week 1-2): Foundation & OAuth

**Goals**
- [ ] Quest app project setup + build configuration
- [ ] OAuth login flow (Google + WISE2)
- [ ] Token store (encrypted Android Keystore)
- [ ] CI/CD pipeline for APK builds

**Tasks**

1. **Quest SDK Setup** (Day 1-2)
   - Initialize new Gradle project: `apps/quest-hvac-fieldtech/`
   - Add dependencies: OpenXR SDK, OkHttp, Retrofit, Room, Jetpack Compose
   - Configure build variants (debug, staging, release)
   - Set up signing configuration for Play Store

2. **OAuth Implementation** (Day 3-5)
   - Create `OAuthManager.kt` (Google + WISE2 redirect flows)
   - Implement `TokenStore.kt` (encrypted Android Keystore storage)
   - Build `LoginScreen.kt` (Compose UI)
   - Write unit tests: token lifecycle, token refresh, expiry handling

3. **Initial Navigation** (Day 6)
   - Create `MainActivity.kt` with Compose navigation
   - Stub screens: LoginScreen, WorkspaceScreen, WorkOrderListScreen

4. **Build + CI** (Day 7)
   - GitHub Actions workflow for APK builds
   - Fastlane integration for Play Store beta builds
   - Automated signing configuration

**Deliverables**
- Quest app builds and runs in emulator
- OAuth login flow tested end-to-end
- Tokens stored securely and refresh automatically
- CI/CD pipeline builds signed APKs

**Testing**
```kotlin
class OAuthManagerTest {
  @Test
  fun tokenRefreshUpdatesExpiry() { ... }
  
  @Test
  fun tokenStoreEncryptsInKeystore() { ... }
  
  @Test
  fun oauthRedirectFlowCompletesLogin() { ... }
}
```

---

### Sprint 2 (Week 3-4): WebSocket Foundation & Session Management

**Goals**
- [ ] WebSocket companion mode server (Node.js/ws)
- [ ] REST API for session management
- [ ] Redis pub/sub event broadcasting
- [ ] Offline message queue

**Tasks**

1. **WebSocket Server** (Day 1-3)
   - Create `apps/command-center/app/api/companion/websocket/route.ts`
   - Implement `WebSocketHandler` (JWT validation, event routing)
   - Add Redis pub/sub for work order channels
   - Write heartbeat + auto-reconnect logic
   - Tests: auth flow, event broadcasting, cleanup on disconnect

2. **Session API Routes** (Day 4-5)
   - `POST /api/hvac/sessions/start` (work order assignment)
   - `POST /api/hvac/sessions/{id}/end` (session completion)
   - `GET /api/hvac/sessions/{id}/measurements` (paginated list)
   - `GET /api/hvac/sessions/{id}/voice-notes` (list notes)
   - Database schema: sessions, measurements, voice_notes tables

3. **Offline Queue** (Day 6)
   - Implement `MeasurementQueue.kt` (SQLite-backed queue)
   - Add sync logic (upload queued measurements on reconnect)
   - Write tests: queue persistence, ordered delivery

4. **Measurement Validation** (Day 7)
   - Schema validation (pressure, temperature, superheat, etc.)
   - Unit validation (psi vs bar, °F vs °C)
   - Range checks (pressure 0-500 psi, temp 0-200°F, etc.)
   - Tests: invalid measurements rejected, valid ones stored

**Deliverables**
- WebSocket server accepts connections + validates JWT
- Session API creates/updates/queries sessions
- Measurements queued offline and synced on reconnect
- All measurements validated at ingestion

**Testing**
```typescript
describe('WebSocket Server', () => {
  it('accepts connections with valid JWT', async () => { ... });
  it('broadcasts measurements to subscribers', async () => { ... });
  it('reconnects and replays missed messages', async () => { ... });
});
```

---

### Sprint 3 (Week 5-6): Immersive UI & Hand Tracking

**Goals**
- [ ] Spatial work order list (3D cards)
- [ ] Hand tracking + gesture controls (pinch, grab)
- [ ] Equipment visualization (basic 3D mesh)
- [ ] Measurement gauge (3D pressure/temp display)

**Tasks**

1. **Spatial UI Framework** (Day 1-2)
   - Create `SpatialUIPanel.kt` (Compose 3D layout)
   - Implement spatial card rendering (work orders as floating rectangles)
   - Add depth sorting (closest to camera)
   - Write tests: layout calculations, depth ordering

2. **Hand Tracking** (Day 3-4)
   - Implement `GestureController.kt` (OpenXR hand API integration)
   - Pinch detection (select work order)
   - Grab detection (rotate 3D object)
   - Swipe detection (trigger voice note)
   - Tests: gesture detection accuracy, gesture → action mapping

3. **3D Equipment Visualization** (Day 5)
   - Create basic compressor mesh (3D model or procedural)
   - Condenser mesh
   - Condenser fan mesh
   - Implement rotation + zoom controls
   - Write tests: mesh loading, rotation calculations

4. **Measurement Gauge** (Day 6-7)
   - Create 3D gauge for pressure/temperature/superheat
   - Needle animation (smooth interpolation to current value)
   - Color coding (green = good, yellow = caution, red = critical)
   - Tests: value interpolation, color range mapping

**Deliverables**
- Work orders display as 3D spatial cards
- Hand tracking recognizes pinch/grab/swipe
- Equipment displayed as 3D mesh (can rotate)
- Measurements visualized in 3D gauge

**Testing**
```kotlin
class GestureControllerTest {
  @Test
  fun pinchGestureSelectsWorkOrder() { ... }
  
  @Test
  fun grabGestureRotates3dMesh() { ... }
  
  @Test
  fun swipeGestureTriggersVoiceNote() { ... }
}
```

---

### Sprint 4 (Week 7-8): Voice & Offline Capabilities

**Goals**
- [ ] Voice note capture (Android speech recognition)
- [ ] Voice note upload to web
- [ ] Offline token caching (QR resolution)
- [ ] Integration tests (end-to-end)

**Tasks**

1. **Voice Note Capture** (Day 1-3)
   - Create `VoiceController.kt` (SpeechRecognizer integration)
   - Implement `VoiceNoteScreen.kt` (UI for recording)
   - Audio recording + WAV encoding
   - Upload to backend (multipart form data)
   - Tests: audio encoding, upload retry logic

2. **Voice Note Web Sync** (Day 4-5)
   - Create `POST /api/hvac/voice-notes` endpoint (store notes)
   - Implement voice note display in web UI (list + playback)
   - Add transcription webhook trigger (Phase 2: AI transcription)
   - Tests: note storage, retrieval, audio playback

3. **Offline Token Caching** (Day 6)
   - Implement QR token codec (encode JWT into QR)
   - Add QR scanner to login flow
   - Cache decoded token in Keystore (expires in 7 days)
   - Tests: QR encode/decode, expiry handling

4. **End-to-End Testing** (Day 7)
   - Manual test: login → work order → measurements → voice notes
   - Manual test: offline mode (kill network, queue data, reconnect)
   - Manual test: 8-hour continuous session on Quest
   - Load test: 10 concurrent sessions, 100 measurements/sec

**Deliverables**
- Voice notes captured + uploaded + audible in web UI
- QR token scanner works (offline login)
- Offline measurements queued + synced
- 8-hour manual test passes

**Testing**
```kotlin
class VoiceControllerTest {
  @Test
  fun speechRecognizerCapturesAudio() { ... }
  
  @Test
  fun voiceNoteUploadsSuccessfully() { ... }
  
  @Test
  fun offlineTokenCacheResolvesQr() { ... }
}
```

---

### Sprint 5 (Week 9-10): Web Companion UI & Documentation

**Goals**
- [ ] Technician view (measurements + voice notes)
- [ ] Supervisor view (multi-session monitoring)
- [ ] Live streaming foundation (stubs)
- [ ] Architecture documentation

**Tasks**

1. **Technician View** (Day 1-3)
   - Create `/hvac/session/[sessionId]` page
   - Implement `MeasurementGauges` component (real-time values)
   - Implement `LiveMeasurementsTrend` component (chart)
   - Implement `VoiceNotesFeed` component (list + playback)
   - Tests: WebSocket integration, data updates

2. **Supervisor View** (Day 4-5)
   - Create `/hvac/supervision` page
   - Implement `SessionMonitorCard` component (one technician)
   - Display: current work order, latest measurement, voice notes
   - Location map (GPS if available)
   - Tests: multi-session sync, real-time updates

3. **Live Streaming Foundation** (Day 6)
   - Create stubs: `/api/hvac/streaming/rooms`, `/api/hvac/streaming/tokens`
   - Add passthrough camera permission request (Quest app)
   - Create live-view placeholder in supervisor UI
   - Document streaming frame flow (architecture doc)

4. **Documentation** (Day 7)
   - Architecture overview (diagram + text)
   - Deployment guide (Quest app + web backend)
   - Troubleshooting guide (common issues + fixes)
   - API reference (all endpoints, examples)

**Deliverables**
- Technician view shows live measurements + voice notes
- Supervisor view monitors multiple technicians
- Live streaming placeholders ready for Phase 2
- Complete architecture + deployment docs

**Testing**
```typescript
describe('Technician Session View', () => {
  it('displays live measurements from WebSocket', async () => { ... });
  it('plays voice notes with correct timestamps', async () => { ... });
});

describe('Supervisor Monitoring View', () => {
  it('displays all active sessions', async () => { ... });
  it('updates measurements in real-time', async () => { ... });
});
```

---

## Key Technical Decisions

### 1. Native Android (Kotlin) vs Unity

**Decision:** Native Kotlin app for Field Tech, keep Unity for Command Center.

**Rationale:**
- Hand tracking + gesture controls simpler in native Kotlin
- Faster iteration (no Unity compile cycles)
- Better camera access (passthrough camera)
- Smaller APK size

---

### 2. WebSocket vs Polling

**Decision:** WebSocket for real-time sync, REST for state queries.

**Rationale:**
- WebSocket enables 500ms latency (measurements to supervisor)
- Polling would require 1-5 sec intervals (too slow for technician feedback)
- Hybrid approach: WebSocket for events, REST for backfill on disconnect

---

### 3. Offline Storage Strategy

**Decision:** SQLite (Room) for measurements queue, Keystore for credentials.

**Rationale:**
- Room provides structured queries (pagination, filtering)
- Keystore provides hardware-backed encryption (better than SharedPreferences)
- Measurements synced in order on reconnect

---

### 4. Token Refresh Mechanism

**Decision:** Background Worker + refresh before expiry.

**Rationale:**
- WorkManager handles edge case (app backgrounded before expiry)
- Refresh happens 5 min before expiry (grace period)
- Zero user interruption

---

## Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| OpenXR/hand tracking not available on some Quest hardware | Medium | High | Test on Quest 3 + 3S early; add fallback to controller input |
| WebSocket drops during field work | Low | High | Implement auto-reconnect + offline queue (already planned) |
| Voice recognition accuracy poor in noisy environment | Medium | Medium | Transcription review UI; manual correction in web |
| OAuth token refresh fails (network down) | Medium | Medium | Use offline token cache (QR) as fallback |
| Measurement validation too strict (rejects valid data) | Low | Medium | Feedback loop during beta; adjust ranges based on telemetry |
| H264 encoding not available (Phase 2) | Low | High | Fallback to VP8/VP9 encoding |

---

## Resource Requirements

### Hardware
- Meta Quest 3 or 3S (testing)
- Development Mac/Linux for Unity + Android builds
- Server with 2GB RAM + 10GB storage (WebSocket server, database)

### Software
- Android Studio + Android SDK 31+
- Meta Quest SDK (XR Plugin for Unity + Android)
- Node.js 18+ (WebSocket server)
- PostgreSQL 14+ (session/measurement storage)
- Redis 7+ (pub/sub event broadcasting)

### Team
- 1-2 Full-stack engineers (native Kotlin + Node.js backend)
- QA (manual testing on Quest, load testing)
- DevOps (CI/CD, deployment, monitoring)

---

## Deployment Checklist

### Pre-release Testing
- [ ] OAuth works with Google + WISE2
- [ ] WebSocket connects and stays connected for 8+ hours
- [ ] Measurements sync bidirectionally
- [ ] Voice notes upload + display
- [ ] Hand tracking responds accurately
- [ ] App launches in <5 seconds
- [ ] Battery usage reasonable (8-hour workday)
- [ ] WiFi + cellular both work

### Production Deployment
- [ ] APK signed + submitted to Play Store beta
- [ ] Web companion UI deployed to staging
- [ ] Load testing: 50 concurrent technicians
- [ ] Monitoring: WebSocket uptime, measurement latency, error rates
- [ ] Rollout plan: 2-3 beta users → 10 → 50 → full team
- [ ] Rollback plan: previous APK version + feature flags

---

## Success Metrics (After Phase 1)

| Metric | Target | Measurement |
|--------|--------|-------------|
| WebSocket uptime | 99.5% | CloudWatch + custom alerts |
| Measurement sync latency (Quest → supervisor) | <500ms | Timestamp comparison (quest.sent vs supervisor.received) |
| Lost measurements | 0% | Count discrepancies between Quest queue + web DB |
| App startup time | <5sec | APK profiling on Quest 3 |
| Battery drain | <20% per 8hr workday | Manual testing + telemetry |
| User adoption (beta) | 100% of 10 beta users | Login attempts, session count |
| Crash rate | <0.1% | Firebase Crashlytics |

---

## Open Questions for Review

1. **Agora SDK availability for Quest:** Confirm Agora RTC SDK supports Quest 3 or if we need custom H264 → RTMP bridge (Phase 2).
2. **Voice transcription provider:** Use Google Cloud Speech-to-Text or open-source (Whisper)?
3. **Geographic distribution:** Deploy WebSocket server globally or single-region?
4. **Equipment 3D models:** License vs. procedural mesh generation?
5. **Audit trail:** Log all actions (measurements, approvals, commands) to single audit table?

---

## Approval Signatures

- Architecture approved: YES (2026-09-06)
- Implementation plan approved: [awaiting user sign-off]
- Ready to build: [awaiting user confirmation]

