# Production Deployment Checklist

**Complete pre-launch validation for WISE² AR/VR applications**

---

## Phase 1: Infrastructure & Backend (Week 1)

### Ollama & Inference Engine

- [ ] **Model Selection**
  - [ ] qwen2.5-coder loaded and tested
  - [ ] Alternative model (neural-chat) as fallback
  - [ ] Model inference latency <2000ms confirmed
  - [ ] Memory requirements <4GB
  - [ ] GPU support verified (if available)

- [ ] **Load Testing**
  - [ ] Single request: <1500ms RTT ✅ VERIFIED
  - [ ] 5 concurrent requests: <2000ms each
  - [ ] 10 concurrent requests: <2500ms each
  - [ ] 100 RPS sustained: No timeouts

- [ ] **Monitoring**
  - [ ] Health endpoint active: `/health`
  - [ ] Metrics exported: `docker exec ollama stats`
  - [ ] Error logging configured
  - [ ] Crash recovery enabled

### Router Service

- [ ] **Deployment**
  - [ ] Running on port 3100 ✅ VERIFIED
  - [ ] Bound to 127.0.0.1 (secure)
  - [ ] Systemd service configured (auto-restart)
  - [ ] Docker resource limits set
  - [ ] Volume mounts persistent

- [ ] **Configuration**
  - [ ] OLLAMA_URL points to localhost:11434 ✅
  - [ ] SECOND_BRAIN_URL configured (port 3012) ✅
  - [ ] DATABASE_URL set for telemetry
  - [ ] API key validation enabled
  - [ ] CORS headers correct

- [ ] **Health Checks**
  - [ ] `/health` returns 200 ✅
  - [ ] `providers.ollama.healthy = true` ✅
  - [ ] `dependencies.database = true` ✅
  - [ ] Response time <500ms

### Second Brain (Knowledge Base)

- [ ] **Deployment**
  - [ ] Running on port 3012 ✅
  - [ ] MongoDB connection healthy
  - [ ] RAG pipeline initialized
  - [ ] Vector search enabled

- [ ] **Content**
  - [ ] Knowledge base seeded with documentation
  - [ ] Example queries tested
  - [ ] Relevance rankings verified
  - [ ] Fallback behavior tested (no knowledge → pass-through)

### Database & Telemetry

- [ ] **PostgreSQL**
  - [ ] Tables created (telemetry, budget, users)
  - [ ] Backups configured (daily)
  - [ ] Connection pool size optimized
  - [ ] Slow query logging enabled

- [ ] **Redis Cache**
  - [ ] Running and healthy
  - [ ] Memory limits set
  - [ ] TTL policies configured
  - [ ] Eviction policy: LRU

---

## Phase 2: SDKs & Applications (Week 2)

### Ray-Ban Meta SDK

- [ ] **TypeScript Build**
  - [ ] `npm run build` succeeds
  - [ ] Types exported correctly
  - [ ] ESM and CommonJS builds work
  - [ ] Bundle size <50KB

- [ ] **API Testing**
  - [ ] `processFrame()` works end-to-end
  - [ ] `sendResponse()` delivers to device
  - [ ] `getDeviceHealth()` returns data
  - [ ] Error handling catches failures

- [ ] **Integration Testing**
  - [ ] Frame capture → Router → Response
  - [ ] AR overlay renders correctly
  - [ ] Audio plays without delay
  - [ ] Gesture detection latency <50ms

### Meta Quest SDK

- [ ] **TypeScript Build**
  - [ ] `npm run build` succeeds
  - [ ] Types exported correctly
  - [ ] All 4 gesture types detectable
  - [ ] Spatial math correct (no Z-fighting)

- [ ] **API Testing**
  - [ ] `processFrame()` works with hand tracking
  - [ ] `sendResponse()` creates spatial objects
  - [ ] `streamSpatialAudio()` positions correctly
  - [ ] `getDeviceHealth()` reports tracking quality

- [ ] **Integration Testing**
  - [ ] Hand skeleton visible in VR
  - [ ] Gesture → Router → 3D response
  - [ ] Spatial audio positions correctly
  - [ ] No latency spikes (72 FPS steady)

### Field Service App (Ray-Ban)

- [ ] **Build**
  - [ ] React Native app builds for iOS/Android
  - [ ] APK/IPA size <100MB
  - [ ] All permissions requested
  - [ ] Camera access working

- [ ] **Functionality**
  - [ ] Equipment capture → AI diagnosis
  - [ ] Repair steps displayed correctly
  - [ ] Service report generates
  - [ ] Offline mode works (cached responses)

- [ ] **Performance**
  - [ ] Camera FPS stable (30+)
  - [ ] Memory usage <150MB
  - [ ] Battery drain <10%/hour
  - [ ] No crashes in 1-hour session

### VR Workspace App (Quest)

- [ ] **Build**
  - [ ] Unity APK builds successfully
  - [ ] APK size 127MB ✅
  - [ ] Manifest configured correctly
  - [ ] All permissions in place

- [ ] **Functionality**
  - [ ] Hand tracking detects all gestures
  - [ ] Pinch → AI response appears
  - [ ] Spatial audio plays correctly
  - [ ] 3D objects render at gaze point

- [ ] **Performance**
  - [ ] FPS = 72 steady (no drops)
  - [ ] Gesture latency <100ms
  - [ ] Memory <600MB
  - [ ] Battery drain <5%/hour
  - [ ] 30-min session stable

---

## Phase 3: Real Hardware Testing (Week 2-3)

### Ray-Ban Meta Glasses Testing

- [ ] **Device Setup**
  - [ ] Glasses updated to latest firmware
  - [ ] Wi-Fi connected (same network as Router)
  - [ ] Camera calibration verified
  - [ ] Developer mode enabled

- [ ] **Functional Testing**
  - [ ] [ ] Tap to capture → frame received by Router
  - [ ] [ ] AR overlay appears within 2 seconds
  - [ ] [ ] Voice guidance plays audibly
  - [ ] [ ] 5 consecutive captures work
  - [ ] [ ] Network loss handled gracefully

- [ ] **Edge Cases**
  - [ ] [ ] Different lighting conditions (bright/dark)
  - [ ] [ ] Different equipment types (HVAC, electrical, plumbing)
  - [ ] [ ] Rapid captures (5 taps in 10 seconds)
  - [ ] [ ] Extended session (30+ minutes)
  - [ ] [ ] Battery depletion (test at <20% battery)

### Meta Quest 3S Testing

- [ ] **Device Setup**
  - [ ] Quest updated to latest OS
  - [ ] Hand tracking enabled: Settings → Developer → Hand Tracking
  - [ ] Wi-Fi connected (same network)
  - [ ] Storage space: >500MB free

- [ ] **Functional Testing**
  - [ ] [ ] Hand skeleton visible and tracked
  - [ ] [ ] Pinch gesture → 3D text appears (2 sec)
  - [ ] [ ] Point gesture → gaze logged
  - [ ] [ ] Grab gesture → selection confirmed
  - [ ] [ ] Palm gesture → cancel works
  - [ ] [ ] FPS stays at 72 throughout

- [ ] **Extended Testing**
  - [ ] [ ] 10-minute session: no crashes
  - [ ] [ ] 20-minute session: battery <10% drain
  - [ ] [ ] 30-minute session: frame rate stable
  - [ ] [ ] Rapid gestures (5/second): all detected
  - [ ] [ ] Hand size variations: all work (small/large hands)

---

## Phase 4: Load Testing (Week 3)

### Concurrent User Testing

- [ ] **Dual Device Test**
  - [ ] Ray-Ban + Quest connected simultaneously ✅
  - [ ] Both receive AI responses
  - [ ] No interference between devices
  - [ ] Budget enforcement working

- [ ] **Multiple Users**
  - [ ] 3 Ray-Bans: all get responses <2500ms
  - [ ] 3 Quests: all at 72 FPS
  - [ ] Mixed (2 Ray-Ban + 2 Quest): stable
  - [ ] 5 concurrent: <3000ms latency

### Budget Testing

- [ ] **Daily Budget Enforcement**
  - [ ] Counter increments correctly
  - [ ] 4-tier thresholds trigger:
    - [ ] 50% → warning logged
    - [ ] 70% → compression active
    - [ ] 85% → local-only enforced
    - [ ] 100% → requests blocked
  - [ ] Can reset budget manually

- [ ] **Cost Accuracy**
  - [ ] Actual cost vs estimated cost <5% variance
  - [ ] No double-charging for device broadcasts
  - [ ] Regional pricing correct (if applicable)

---

## Phase 5: Security & Compliance (Week 3)

### API Security

- [ ] **Authentication**
  - [ ] API keys required for all endpoints
  - [ ] Invalid keys return 401 Unauthorized
  - [ ] Key rotation tested
  - [ ] Rate limiting enforced (100 RPS per key)

- [ ] **Data Privacy**
  - [ ] Telemetry excludes raw video/audio
  - [ ] Device IDs anonymized in logs
  - [ ] PII redaction enabled
  - [ ] No credential exposure in logs

- [ ] **Network Security**
  - [ ] HTTPS enforced (via Nginx reverse proxy)
  - [ ] SSL certificate valid and renewed
  - [ ] TLS 1.2+ only
  - [ ] No mixed content

### Compliance

- [ ] **GDPR (if EU users)**
  - [ ] Data processing agreement signed
  - [ ] Data deletion policy implemented
  - [ ] User consent tracking
  - [ ] Right to access/export working

- [ ] **Device Manufacturer Requirements**
  - [ ] Ray-Ban terms of service reviewed
  - [ ] Quest publishing requirements met
  - [ ] Manifest permissions minimal
  - [ ] No backdoor access

---

## Phase 6: Documentation & Support (Week 4)

### Documentation Complete

- [ ] **User Guides**
  - [ ] Quick start guides for both apps
  - [ ] Video tutorials (30-60 sec each)
  - [ ] FAQ and troubleshooting
  - [ ] Known issues documented

- [ ] **Developer Documentation**
  - [ ] API reference complete
  - [ ] SDK examples (5+ use cases)
  - [ ] Integration guides
  - [ ] Architecture diagrams

- [ ] **Operations Guides**
  - [ ] Deployment procedures
  - [ ] Monitoring & alerting setup
  - [ ] Incident response playbook
  - [ ] Rollback procedures

### Support Infrastructure

- [ ] **Monitoring**
  - [ ] Prometheus metrics collecting
  - [ ] Grafana dashboards set up
  - [ ] Alerts configured (latency, errors, budget)
  - [ ] SLA defined: 99.9% uptime

- [ ] **Logging**
  - [ ] Centralized log aggregation (ELK/Splunk)
  - [ ] Request/response logging
  - [ ] Error tracking (Sentry/similar)
  - [ ] Retention policy: 30+ days

- [ ] **Feedback Loop**
  - [ ] User feedback mechanism (in-app or email)
  - [ ] Issue tracking system (GitHub/Jira)
  - [ ] Prioritization process
  - [ ] Response SLA: <24 hours

---

## Phase 7: Go-Live (Week 4)

### Pre-Launch Verification

- [ ] **Final Checklist**
  - [ ] All tests passing (100%)
  - [ ] Security audit completed
  - [ ] Performance targets met
  - [ ] Documentation reviewed
  - [ ] Support team trained

- [ ] **Soft Launch** (Beta)
  - [ ] 50 beta testers sign up
  - [ ] Bugs reported and triaged
  - [ ] Performance benchmarks verified
  - [ ] 2-week beta period

- [ ] **Production Launch**
  - [ ] Infrastructure scaling verified
  - [ ] Backup systems tested
  - [ ] Rollback plan ready
  - [ ] On-call team briefed

### Launch Day

- [ ] **Pre-Launch**
  - [ ] All systems green (health checks)
  - [ ] Database backed up
  - [ ] Team on standby (first 24 hours)
  - [ ] Communication channels open

- [ ] **During Launch**
  - [ ] Monitor error rates (target: <0.1%)
  - [ ] Monitor latency (target: <2000ms P95)
  - [ ] Monitor budget burn (target: <$5/hour)
  - [ ] User feedback monitored

- [ ] **Post-Launch** (First Week)
  - [ ] Daily standups (first 7 days)
  - [ ] Performance trending (improving)
  - [ ] Zero critical bugs
  - [ ] User adoption rate >80%

---

## Success Criteria

### Technical Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Uptime | 99.9% | 🟡 Testing |
| Error rate | <0.1% | 🟡 Testing |
| Latency (P95) | <2000ms | 🟡 Testing |
| FPS (Quest) | 72 | ✅ 72 |
| Battery (Quest) | <5%/hr | 🟡 Testing |
| Gesture latency | <100ms | 🟡 Testing |

### User Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Daily active users | 100+ | 🟡 Launch |
| Session duration | 15+ min | 🟡 Launch |
| Error reports | <1% | 🟡 Launch |
| NPS score | >40 | 🟡 Launch |
| Retention (1 week) | >70% | 🟡 Launch |

---

## Rollback Plan

**If critical issues arise:**

1. **Immediate** (0-5 min)
   - [ ] Pause new deployments
   - [ ] Scale down to 50% capacity
   - [ ] Enable read-only mode if needed

2. **Short-term** (5-30 min)
   - [ ] Identify root cause (logs/metrics)
   - [ ] Revert to previous version
   - [ ] Test rollback in isolated environment

3. **Restoration** (30+ min)
   - [ ] Deploy previous version
   - [ ] Verify all systems healthy
   - [ ] Communicate to users
   - [ ] Post-mortem scheduled

---

## Sign-Off

- [ ] Product Manager: ____________________
- [ ] Engineering Lead: ____________________
- [ ] QA Lead: ____________________
- [ ] Operations Lead: ____________________
- [ ] Security Review: ____________________

---

**Deployment Date**: TBD  
**Status**: 🟡 Pre-Launch (Week 1-2)  
**Next Review**: 2026-09-20

---

**Last Updated**: 2026-09-13  
**Maintained By**: dwise03@gmail.com
