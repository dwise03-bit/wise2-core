# WISE² Complete Build & Deploy Plan

## Phase 1: Finalize Infrastructure ✅

- [x] Deal model multi-tenancy fix
- [x] Telnyx webhook signature verification  
- [x] Google Maps service
- [x] Unified Tools service (20+ tools)
- [x] Tools API controller

## Phase 2: Integrate Tools Into Services

### 2.1 Wire Tools Into Telnyx Service
**File**: `/packages/api/src/webhooks/telnyx.service.ts`
- Import ToolsService
- On `handleCallInitiated`: Identify customer, create lead
- On `handleCallEnded`: Record call note, trigger post-call workflow
- Add tool execution to voice AI pipeline

### 2.2 Wire Tools Into AI Router
**File**: `/src/services/model-orchestrator.ts`
- Add tool execution capability to routing decisions
- Pass tools to LLM as function calling
- Route tool results back to conversation

### 2.3 Create Tools Module in API
**File**: `/packages/api/src/tools/tools.module.ts`
```typescript
@Module({
  providers: [ToolsService, GoogleMapsService],
  controllers: [ToolsController],
  exports: [ToolsService],
})
export class ToolsModule {}
```

## Phase 3: Fix Side Menu & UI Buttons

### 3.1 Verify All Routes Work
- `/dashboard` - Main command center
- `/crm` - Lead/deal pipeline
- `/receptionist` - Voice AI interface
- `/studio` - Content creation
- `/hermes-control` - AI settings
- `/settings` - Configuration
- `/demo` - Demo mode
- `/xr` - VR/XR interface

### 3.2 Add Click Handlers to All Navigation
- Navigation items → useRouter.push()
- Tool buttons → POST /tools/execute
- Modal buttons → Tool execution

## Phase 4: Android APK Build & OTA

### 4.1 Build Android APK
**Framework**: React Native / Kotlin
**Targets**:
- Motorola Razr (base)
- Samsung Galaxy (fallback)
- Pixel devices

### 4.2 OTA Update System
**Components**:
- Version manifest (version.json)
- Delta updates (reduce 100MB → 5MB)
- Rollback capability
- Staging/canary deployments

### 4.3 Update Server
**Path**: `/api/v1/mobile/updates`
**Routes**:
- GET `/updates/check?device=razr&version=1.0.0`
- GET `/updates/download?version=1.0.1`
- POST `/updates/report?success=true`

## Phase 5: Testing

### 5.1 API Tests
```bash
curl -X POST http://localhost:3000/tools/execute \
  -H 'x-tenant-id: tenant-123' \
  -d '{"tool":"get_directions","args":{"origin":"123 Main","destination":"456 Oak"}}'
```

### 5.2 End-to-End Tests
- [ ] Inbound call → identify customer → create lead
- [ ] Lead escalation → create deal
- [ ] Dispatch technician → send ETA
- [ ] Call transfer → route to human

### 5.3 APK Tests
- [ ] Install on Razr device
- [ ] All menu buttons functional
- [ ] OTA update check works
- [ ] Update downloads & installs
- [ ] Rollback works

## Phase 6: Deploy

### 6.1 Database Migration
```bash
pnpm prisma migrate dev --name add_deal_tenantid
```

### 6.2 Docker Build
```bash
docker build -f packages/api/Dockerfile -t wise2-api:latest .
docker push wise2-api:latest
```

### 6.3 Deploy to VPS
```bash
ssh dwise@173.208.147.165
cd /home/dwise/wise2-core
git pull origin main
docker-compose -f docker-compose.prod.yml up -d
```

### 6.4 Deploy APK to Razr
```bash
adb connect 192.168.1.X
adb install -r build/app/outputs/bundle/release/app-release.aab
```

## Phase 7: Verify Everything Works

### 7.1 Health Checks
- [ ] API /health returns 200
- [ ] All /tools/* endpoints respond
- [ ] Telnyx webhooks verified
- [ ] Database queries scoped to tenant

### 7.2 Feature Verification
- [ ] Side menu all clickable
- [ ] Dashboard loads
- [ ] CRM pipeline visible
- [ ] Receptionist voice working
- [ ] Maps routing functional

### 7.3 APK Verification
- [ ] App installs on Razr
- [ ] All screens render
- [ ] OTA update detected
- [ ] Update downloads cleanly
- [ ] Rollback works

## Estimated Effort
- **Phase 2**: 2 hours (integration)
- **Phase 3**: 1 hour (UI fixes)
- **Phase 4**: 3 hours (APK build + OTA)
- **Phase 5**: 1.5 hours (testing)
- **Phase 6**: 1 hour (deployment)
- **Phase 7**: 1 hour (verification)

**Total**: ~9.5 hours to production-ready

## Critical Path
1. Phase 2 (Tools wiring) — blocks Phase 3 & 7
2. Phase 3 (UI fixes) — must complete before Phase 5
3. Phase 4 (APK) — parallel with Phase 2/3
4. Phase 6 (Deploy) — last step before Phase 7

## Success Criteria
- ✅ All side menu buttons clickable
- ✅ Tools API endpoints responding
- ✅ Telnyx calls creating leads automatically
- ✅ APK installs and runs on Razr
- ✅ OTA updates download and install
- ✅ All data tenant-scoped
- ✅ Multi-tenant isolation verified
