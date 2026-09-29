# WISE² Meta Quest HVAC Integration — Phase 1 Foundation

**Date:** 2026-09-06  
**Status:** Architecture & Plan Approved  
**Scope:** Phase 1 foundation across three parallel streams: Native Quest App, Companion Mode, Live Streaming Foundation

---

## Executive Summary

WISE² HVAC Field Tech is extending into immersive spatial workflows via Meta Quest 3/3S. Phase 1 establishes production-ready foundations for:

1. **Native Quest App (Kotlin/Java)** — Immersive HVAC repair workflow with hand tracking and spatial UI
2. **Companion Mode (Web ↔ Quest WebSocket)** — Real-time state sync between hvac.wise2.net and Quest headset
3. **Live Streaming Foundation** — Architecture for Phase 2 passthrough camera + Agora RTC integration

**MVP Scope:** One technician in field, one headset, one supervisor monitoring from web/tablet.

---

## Architecture Overview

### System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Meta Quest 3/3S (Technician)             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Immersive Workspace                                   │  │
│  │  • Spatial UI (3D equipment, gauges, work orders)    │  │
│  │  • Hand/gesture controls for diagnostics             │  │
│  │  • Voice-based note capture                          │  │
│  │  • Offline capability (QR token resolution)          │  │
│  │  • IMP results rendering in 3D                       │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Companion Mode WebSocket Client                      │  │
│  │  • Real-time state sync with web app                │  │
│  │  • Measurement streaming from web → Quest           │  │
│  │  • Voice notes → web report sync                     │  │
│  │  • JWT/OAuth token refresh loop                      │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                    ↓ WebSocket (wss://)
        ┌───────────────────────────────────────┐
        │  Companion Mode WebSocket Server      │
        │  • Event pump (work orders, jobs)     │
        │  • Measurement broadcast              │
        │  • Voice note ingestion                │
        │  • Token validation + rate limiting   │
        └───────────────────────────────────────┘
         ↓                        ↓              ↓
    ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
    │ HVAC    │  │ Phase 2  │  │ Command  │  │ Database │
    │ API     │  │ Live     │  │ Center   │  │ (HVAC    │
    │ Routes  │  │ Streaming│  │ (OAuth)  │  │ Jobs)    │
    └─────────┘  └──────────┘  └──────────┘  └──────────┘

┌─────────────────────────────────────────────────────────┐
│           Web Dashboard (hvac.wise2.net)                │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Technician View                                   │  │
│  │  • Work order list + active job detail            │  │
│  │  • Live measurements from Quest                   │  │
│  │  • Voice notes feed (from Quest)                  │  │
│  │  • Start/end work session                         │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Supervisor/Tablet View (Remote)                  │  │
│  │  • Technician location (GPS if available)         │  │
│  │  • Real-time measurements stream                  │  │
│  │  • Voice notes transcription feed                 │  │
│  │  • Approve/reject field decisions                 │  │
│  │  • View live camera stream (Phase 2)              │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Companion Mode WebSocket Client                  │  │
│  │  • JWT auth flow + refresh                        │  │
│  │  • Bidirectional state sync with Quest            │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Stream 1: Native Quest App

### Scope

Production-ready Kotlin/Android app with:
- OAuth login flow (Google/WISE² credentials)
- Spatial 3D UI for HVAC equipment visualization
- Hand tracking + gesture controls
- Real-time IMP diagnostic results
- Voice-based note capture
- Offline token caching (QR resolve without internet)
- WebSocket companion mode integration

### Structure

```
apps/quest-hvac-fieldtech/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/wise2/quest/
│   │   │   │   ├── QuestHvacApp.kt               (Main entry)
│   │   │   │   ├── auth/
│   │   │   │   │   ├── OAuthManager.kt           (Google/WISE2 OAuth)
│   │   │   │   │   ├── TokenStore.kt             (Encrypted credential cache)
│   │   │   │   │   └── TokenRefreshWorker.kt     (Background JWT refresh)
│   │   │   │   ├── ui/
│   │   │   │   │   ├── MainActivity.kt           (OpenXR context + nav)
│   │   │   │   │   ├── screens/
│   │   │   │   │   │   ├── LoginScreen.kt
│   │   │   │   │   │   ├── WorkspaceScreen.kt
│   │   │   │   │   │   ├── WorkOrderListScreen.kt
│   │   │   │   │   │   ├── ActiveJobScreen.kt    (Main immersive view)
│   │   │   │   │   │   ├── ImpVisualizerScreen.kt
│   │   │   │   │   │   └── VoiceNoteScreen.kt
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── SpatialUIPanel.kt     (3D layout)
│   │   │   │   │   │   ├── EquipmentGauge.kt     (3D compressor, condenser)
│   │   │   │   │   │   ├── GestureController.kt  (Hand tracking)
│   │   │   │   │   │   ├── VoiceController.kt    (Speech input/output)
│   │   │   │   │   │   └── ImpRenderer.kt        (3D results)
│   │   │   │   ├── network/
│   │   │   │   │   ├── CompanionModeClient.kt    (WebSocket state sync)
│   │   │   │   │   ├── HvacApiClient.kt          (REST API client)
│   │   │   │   │   ├── OfflineTokenResolver.kt   (QR token cache)
│   │   │   │   │   └── RetryPolicy.kt            (Resilience patterns)
│   │   │   │   ├── data/
│   │   │   │   │   ├── models/
│   │   │   │   │   │   ├── WorkOrder.kt
│   │   │   │   │   │   ├── ImpResult.kt
│   │   │   │   │   │   ├── Measurement.kt
│   │   │   │   │   │   └── VoiceNote.kt
│   │   │   │   │   ├── db/
│   │   │   │   │   │   └── OfflineDatabase.kt    (Room/SQLite for caching)
│   │   │   │   │   └── store/
│   │   │   │   │       ├── WorkOrderStore.kt
│   │   │   │   │       └── SessionStore.kt
│   │   │   │   └── util/
│   │   │   │       ├── Logger.kt
│   │   │   │       ├── ErrorHandler.kt
│   │   │   │       └── QrTokenCodec.kt
│   │   │   └── AndroidManifest.xml
│   │   └── test/
│   │       └── java/com/wise2/quest/
│   │           ├── auth/OAuthManagerTest.kt
│   │           ├── network/CompanionModeClientTest.kt
│   │           └── data/OfflineTokenResolverTest.kt
│   ├── build.gradle.kts
│   └── local.properties (git-ignored)
├── gradle/
├── settings.gradle.kts
└── README.md
```

### Key Components

**1. OAuthManager.kt** — Google OAuth + WISE² OAuth login
- Redirect flow: App → Browser → Google/WISE2 → Callback → Token store
- Scopes: email, profile, work_orders read
- Token lifecycle management

**2. CompanionModeClient.kt** — WebSocket bridge
- Real-time work order syncing
- Measurement streaming from web
- Voice note upload to web
- JWT token refresh loop

**3. SpatialUIPanel.kt** — Immersive spatial layout
- 3D work order list (spatial cards floating)
- Equipment visualization (compressor, condenser, condenser fan)
- Active job detail panel with measurements

**4. GestureController.kt** — Hand tracking
- Pinch to select work order
- Grab to rotate 3D equipment
- Swipe for voice note trigger

**5. ImpRenderer.kt** — 3D diagnostic results
- Real-time IMP (Intelligent Measurement Platform) gauge visualization
- Pressure/temperature/superheat in 3D space

### Deliverables (Phase 1)

- [ ] Quest SDK setup + build configuration
- [ ] OAuth login flow (native flow + web fallback)
- [ ] Offline token caching (encrypted, QR-resolvable)
- [ ] WebSocket companion mode client
- [ ] Spatial work order list screen
- [ ] 3D equipment visualization (basic mesh)
- [ ] Hand tracking + gesture controls (pinch, grab, swipe)
- [ ] Voice note capture (Android speech recognition)
- [ ] IMP result rendering (3D gauge)
- [ ] Offline support (cached work orders)
- [ ] Tests: OAuth, WebSocket, offline state

---

## Stream 2: Companion Mode (Web ↔ Quest WebSocket)

### Scope

Production-ready WebSocket bridge between hvac.wise2.net (web) and Quest app:
- Real-time work order push
- Live measurement streaming (web → Quest → web loop)
- Voice note ingestion (Quest → web)
- Remote supervisor view (tablet/web)
- JWT token validation + rate limiting
- Graceful offline fallback

### WebSocket Server Implementation

**Location:** `apps/command-center/app/api/companion/` (or `packages/api/src/routes/companion/`)

```typescript
// apps/command-center/app/api/companion/websocket/route.ts

import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';

const companionWss = new WebSocketServer({ port: 3016 });

companionWss.on('connection', (ws, req) => {
  // 1. Validate JWT from query param or header
  const token = extractToken(req);
  const user = validateAndDecodeToken(token);
  
  if (!user) {
    ws.close(4001, 'Unauthorized');
    return;
  }
  
  // 2. Subscribe user to work order channel
  const workOrderChannelId = `workorders:${user.accountId}`;
  redis.subscribe(workOrderChannelId, (message) => {
    ws.send(JSON.stringify({
      type: 'WORK_ORDER_UPDATE',
      payload: message,
      timestamp: Date.now()
    }));
  });
  
  // 3. Handle incoming messages from Quest
  ws.on('message', (data) => {
    const event = JSON.parse(data);
    
    switch (event.type) {
      case 'MEASUREMENT_READING':
        handleMeasurementReading(user, event.payload);
        broadcastToSupervisors(workOrderChannelId, event);
        break;
      
      case 'VOICE_NOTE':
        handleVoiceNote(user, event.payload);
        break;
      
      case 'WORK_SESSION_START':
        handleSessionStart(user, event.payload);
        break;
      
      case 'WORK_SESSION_END':
        handleSessionEnd(user, event.payload);
        break;
    }
  });
  
  // 4. Heartbeat + token refresh
  const heartbeat = setInterval(() => {
    ws.ping();
  }, 30000);
  
  ws.on('close', () => {
    clearInterval(heartbeat);
    redis.unsubscribe(workOrderChannelId);
  });
});
```

### Event Flow

**Web → Quest (Push)**
```json
{
  "type": "WORK_ORDER_ASSIGNED",
  "payload": {
    "id": "wo_123",
    "customer": "ABC Cooling",
    "address": "123 Main St",
    "service": "Compressor replacement",
    "priority": "high",
    "equipment": {
      "make": "Carrier",
      "model": "25HPA636A003"
    }
  },
  "timestamp": 1693987200000
}
```

**Quest → Web (Measurement)**
```json
{
  "type": "MEASUREMENT_READING",
  "sessionId": "session_456",
  "workOrderId": "wo_123",
  "payload": {
    "pressure": { "suction": 75, "discharge": 250, "unit": "psi" },
    "temperature": { "suction": 45, "discharge": 120, "ambient": 92, "unit": "°F" },
    "superheat": 15,
    "subcooling": 8,
    "electricalMeasurement": { "amperage": 12.3, "voltage": 230 },
    "signalStrength": -65,
    "connectionQuality": "good"
  },
  "timestamp": 1693987210000
}
```

**Quest → Web (Voice Note)**
```json
{
  "type": "VOICE_NOTE",
  "sessionId": "session_456",
  "workOrderId": "wo_123",
  "payload": {
    "audioBase64": "SUQzBAAAJmFhYV9qb2luKCJK...",
    "duration": 45,
    "transcription": "Found a refrigerant leak on the suction line"
  },
  "timestamp": 1693987220000
}
```

### API Routes (REST + WebSocket)

**REST Routes (for web UI state management)**

```typescript
// apps/command-center/app/api/hvac/

POST /sessions/start
  body: { workOrderId, technicianId }
  response: { sessionId, workOrderDetails, initialMeasurements }

POST /sessions/{sessionId}/end
  body: { completedAt, notes, signature }
  response: { sessionSummary }

GET /sessions/{sessionId}/measurements
  query: { limit=100, offset=0 }
  response: { measurements[], pageInfo }

GET /sessions/{sessionId}/voice-notes
  response: { voiceNotes[] }

POST /measurements/{sessionId}/reading
  body: { pressure, temperature, superheat, subcooling, ... }
  response: { stored, analysis }

GET /ws/token
  query: { expiresIn=3600 }
  response: { token, wssUrl }
```

### WebSocket Companion Mode Architecture

```typescript
// apps/quest-hvac-fieldtech/app/src/main/java/com/wise2/quest/network/CompanionModeClient.kt

class CompanionModeClient(
  private val context: Context,
  private val userId: String,
  private val accountId: String
) {
  private val webSocket: WebSocket? = null
  private val tokenStore: TokenStore = TokenStore(context)
  private val measurementQueue = mutableListOf<MeasurementReading>()
  
  suspend fun connect() {
    val token = getOrRefreshToken()
    val wssUrl = "wss://api.wise2.net/companion?token=$token"
    
    webSocket = OkHttpClient()
      .newWebSocket(
        Request.Builder().url(wssUrl).build(),
        CompanionWebSocketListener(this)
      )
  }
  
  fun sendMeasurement(reading: MeasurementReading) {
    if (isConnected()) {
      webSocket?.send(Json.encodeToString(reading))
    } else {
      measurementQueue.add(reading)
      queueMeasurementForLater(reading)
    }
  }
  
  fun onMeasurementReceived(event: MeasurementEvent) {
    // Broadcast to UI layers
    uiUpdateChannel.send(event)
  }
  
  private suspend fun getOrRefreshToken(): String {
    val stored = tokenStore.getToken()
    if (stored.isExpired()) {
      return tokenStore.refreshToken()
    }
    return stored.token
  }
}
```

### Web Companion Mode UI

**Technician View (`/hvac/session/[sessionId]`)**
```tsx
export function TechnicianSessionView() {
  const { sessionId } = useParams();
  const [isConnected, setIsConnected] = useState(false);
  const [measurements, setMeasurements] = useState([]);
  const [voiceNotes, setVoiceNotes] = useState([]);
  const ws = useWebSocketCompanion(sessionId);
  
  useEffect(() => {
    ws?.on('MEASUREMENT_READING', (data) => {
      setMeasurements(prev => [data, ...prev]);
    });
    
    ws?.on('VOICE_NOTE', (data) => {
      setVoiceNotes(prev => [data, ...prev]);
    });
  }, [ws]);
  
  return (
    <div className="grid grid-cols-3 gap-4">
      <div>
        <MeasurementGauges measurements={measurements[-1]} />
      </div>
      <div>
        <LiveMeasurementsTrend measurements={measurements} />
      </div>
      <div>
        <VoiceNotesFeed notes={voiceNotes} />
      </div>
    </div>
  );
}
```

**Supervisor View (`/hvac/supervision`)**
```tsx
export function SupervisorMonitoringView() {
  const [activeSessions, setActiveSessions] = useState([]);
  const ws = useWebSocketCompanion('supervisor');
  
  useEffect(() => {
    ws?.on('WORK_SESSION_STARTED', (session) => {
      setActiveSessions(prev => [...prev, session]);
    });
    
    ws?.on('MEASUREMENT_READING', (reading) => {
      // Update specific session's latest measurement
      setActiveSessions(prev => prev.map(s => 
        s.id === reading.sessionId 
          ? { ...s, latestMeasurement: reading.payload }
          : s
      ));
    });
  }, [ws]);
  
  return (
    <div className="space-y-4">
      {activeSessions.map(session => (
        <SessionMonitorCard key={session.id} session={session} />
      ))}
    </div>
  );
}
```

### Deliverables (Phase 1)

- [ ] WebSocket server implementation + tests
- [ ] REST API routes for session management
- [ ] JWT token generation + validation
- [ ] Redis pub/sub for event broadcasting
- [ ] Technician view UI (measurements + voice notes)
- [ ] Supervisor view UI (multi-session monitoring)
- [ ] Connection resilience (auto-reconnect, queue offline messages)
- [ ] Rate limiting + backpressure handling
- [ ] Tests: WebSocket connect/disconnect, event broadcasting, offline queue

---

## Stream 3: Live Streaming Foundation

### Scope (Phase 1)

Architecture and groundwork for Phase 2 live streaming:
- Passthrough camera permission handling (Quest)
- Agora RTC SDK integration plan
- Video frame capture from Quest
- H264 encoding setup
- Phase 2 JWT auth + room creation
- Supervisor view (web/Quest) architecture

### Phase 1 Deliverables

- [ ] Quest passthrough camera integration
- [ ] H264 video encoder configuration
- [ ] Agora SDK initialization plan
- [ ] Phase 2 streaming API routes (stubs)
- [ ] Web supervisor live-view UI (placeholder)
- [ ] Architecture doc: streaming frame flow
- [ ] Tests: camera permissions, frame capture format

### Phase 2 Timeline (Estimate)

- Week 1: Agora SDK integration in native Quest app
- Week 2: Passthrough camera → Agora stream
- Week 3: Web supervisor view + annotation overlay
- Week 4: Integration testing + performance optimization
- Week 5: Live streaming deployment + load testing

---

## Security & Privacy

### Authentication Flow

```
1. User opens Quest app
2. OAuth redirect to browser (Google/WISE2)
3. Browser redirects back to app with auth code
4. App exchanges code for JWT + refresh token
5. JWT stored in encrypted storage (Android Keystore)
6. Refresh token refreshed before expiry (background worker)
7. WebSocket uses JWT from storage
```

### Data Boundaries

- **Quest app:** Never stores work order details in persistent DB (except offline cache)
- **WebSocket server:** Validates JWT, authorizes by user role + account
- **Measurements:** Validated at ingestion (schema, units, ranges)
- **Voice notes:** Encrypted in transit (wss://), transcribed server-side
- **Commands:** Always require explicit confirmation (no auto-execution on Quest)

### Rate Limiting

```
Measurement readings: 10/sec per technician
Voice notes: 1/sec per technician
WebSocket connections: 5 per user account
```

---

## Testing Strategy

### Phase 1 Test Coverage

**Unit Tests**
- OAuth token lifecycle (refresh, expiry, revocation)
- Measurement validation (schema, units, ranges)
- Voice note encoding/decoding
- Offline queue serialization

**Integration Tests**
- WebSocket connect → auth → subscribe → receive message
- Measurement flow: Quest → WebSocket → web UI
- Voice note ingestion: Quest → storage → transcription
- Token refresh without disconnecting WebSocket

**Manual Tests (on physical Quest 3)
- Login flow (Google OAuth, WISE2 OAuth)
- Hand tracking gesture controls
- Voice note capture (SpeechRecognizer)
- WebSocket resilience (kill network, reconnect)
- Offline token caching (QR scan without network)

---

## Deployment & Rollout

### MVP Deployment (Phase 1)

1. **Pre-production Testing** (1 technician, 1 supervisor)
   - End-to-end: login → work order → measurements → voice notes
   - Offline simulation: cached work orders, queued measurements
   - WebSocket stability: 8-hour continuous session

2. **Production Rollout** (Phased)
   - Week 1: Limited beta (2-3 technicians)
   - Week 2: Expand to 10 technicians
   - Week 3: Full field team (~50 technicians)
   - Ongoing: Monitor crash rates, WebSocket uptime, measurement latency

### Build & Distribution

```bash
# Build APK for testing
./gradlew :app:assembleDebug

# Build signed APK for Play Store
./gradlew :app:bundleRelease

# Install on Quest (USB or Play Store)
adb install -r app/build/outputs/apk/debug/quest-hvac-fieldtech-debug.apk
```

---

## Known Limitations & Future Work

### Phase 1 Limitations

- No live video streaming (Phase 2)
- No annotation overlay on passthrough (Phase 2)
- No remote equipment control (future phase)
- No multi-headset coordination (future phase)
- Voice notes require manual transcription review (Phase 2: AI transcription)

### Future Phases

- **Phase 2:** Live streaming + passthrough annotations
- **Phase 3:** Remote diagnosis tools (supervisor drawing on technician's view)
- **Phase 4:** Equipment 3D model library (parts catalog in AR)
- **Phase 5:** Automated report generation from voice notes + measurements

---

## Verification Checklist

- [ ] Native Quest app builds without errors
- [ ] OAuth login flow works end-to-end
- [ ] WebSocket server accepts connections + validates JWT
- [ ] Measurements sync bidirectionally (web ↔ Quest)
- [ ] Voice notes captured and ingested
- [ ] Offline token caching resolves QR codes
- [ ] Web UI updates in real-time as measurements arrive
- [ ] Supervisor can see active technician sessions
- [ ] WebSocket reconnects after network dropout
- [ ] All unit + integration tests pass
- [ ] Manual testing on physical Quest 3 verifies hand tracking
- [ ] Passthrough camera access granted + frames captured

---

## Success Criteria

- **Availability:** 99.5% WebSocket uptime during work hours
- **Latency:** Measurement sync within 500ms (Quest → web → all supervisors)
- **Reliability:** Zero lost measurements (queue + retry on offline)
- **User Experience:** Login → first work order visible in <10 seconds
- **Security:** Zero credential leaks; all data encrypted in transit
- **Observability:** Full audit trail of technician actions + measurements

