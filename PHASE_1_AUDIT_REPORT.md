# WISE² HVAC + PHONE SERVICES — PHASE 1 AUDIT REPORT
**Date**: 2026-08-23  
**Status**: AUDIT IN PROGRESS  
**Scope**: Integrate phone service layer + Field Tech + IMP TECH + CRM into one closed-loop HVAC operating system

---

## EXECUTIVE SUMMARY

**CURRENT STATE:**
- ✅ Core WISE² infrastructure exists (PostgreSQL, Redis, NestJS API, Next.js websites)
- ✅ Authentication system in place
- ✅ HVAC demo app (Next.js + Capacitor/Android)
- ✅ Dashboard/command center UI
- ✅ Field Tech Android app framework
- ❌ **Phone service layer NOT IMPLEMENTED**
- ❌ **Phone data models NOT IMPLEMENTED**
- ❌ **Phone API routes NOT IMPLEMENTED**
- ❌ **Telephony provider abstraction NOT IMPLEMENTED**
- ❌ **STT/TTS integration NOT IMPLEMENTED**
- ❌ **HVAC-specific CRM models NOT IMPLEMENTED** (Property, Equipment, Technician, WorkOrder, etc.)
- ❌ **Call transcript system NOT IMPLEMENTED**
- ❌ **Phone command center UI NOT IMPLEMENTED**

**WORK REQUIRED:**
Approximately **12 sequential phases** as outlined in the master prompt, with estimated scope:
- Backend services: ~3,000-4,000 lines
- Database models & migrations: ~400-600 lines
- API routes: ~2,500-3,500 lines
- Frontend phone UI: ~3,000-4,000 lines
- Worker/queue infrastructure: ~1,000-1,500 lines
- Tests: ~2,000-3,000 lines
- **TOTAL: ~12,000-17,000 lines of production code**

---

## EXISTING SYSTEMS (REUSABLE)

### ✅ INFRASTRUCTURE
| Component | Status | Location | Notes |
|-----------|--------|----------|-------|
| PostgreSQL | LIVE | 5432 | wise2_prod database ready |
| Redis | LIVE | 6379 | Cache + queue infrastructure ready |
| Docker Compose | LIVE | docker-compose.prod.yml | Production orchestration |
| Nginx | LIVE | nginx.conf | Reverse proxy + SSL ready |
| NestJS API | LIVE | apps/api | Backend framework ready |

### ✅ DATABASE MODELS (EXISTING)
| Model | Status | Purpose | Notes |
|-------|--------|---------|-------|
| User | LIVE | Authentication | Email, password, roles |
| Subscription | LIVE | Billing | Stripe integration ready |
| Account | LIVE | OAuth | Multi-provider auth |
| Session | LIVE | Auth sessions | JWT-based |
| Customer | LIVE | CRM base | businessName, email, phone, status |
| Prospect | LIVE | Sales pipeline | leadSource, status tracking |

### ✅ EXISTING FEATURES
- User authentication (email/OAuth/Google)
- Stripe billing integration
- Multi-user project management
- Real-time collaboration (via SoundLabs models)
- Audit trail system (ActivityLog, VersionHistory)
- File upload/asset management (GalleryAsset)
- Consulting system (Booking, Consultant, CalendarAvailability)

### ✅ FRONTEND APPS
| App | Status | Tech | Purpose | Port |
|-----|--------|------|---------|------|
| Website | LIVE | Next.js | Marketing/landing | 3000 |
| Dashboard | LIVE | Next.js | Command center | 3005 |
| Studio | LIVE | Next.js | Creative studio | 3005 |
| HVAC Demo | LIVE | Next.js + Capacitor | Field Tech + IMP TECH | 3001 |
| Prompt Shop | LIVE | Next.js | Prompt marketplace | 3002 |
| Android | LIVE | Capacitor | Field Tech native | Play Store |

---

## MISSING SYSTEMS (MUST BUILD)

### ❌ PHONE SERVICE LAYER
| Component | Status | Priority | Scope |
|-----------|--------|----------|-------|
| Telephony Provider Abstraction | NOT BUILT | CRITICAL | Interface + adapters (Twilio, Telnyx, SignalWire) |
| Call Session Manager | NOT BUILT | CRITICAL | State machine + storage |
| STT Integration | NOT BUILT | CRITICAL | Speech-to-text abstraction |
| TTS Integration | NOT BUILT | CRITICAL | Text-to-speech abstraction |
| LLM Routing | NOT BUILT | CRITICAL | AI conversation engine |
| Phone API Routes | NOT BUILT | CRITICAL | /api/v1/calls, /api/v1/phone/* |
| Phone Workers | NOT BUILT | HIGH | Redis queue handlers |
| Phone Real-time | NOT BUILT | HIGH | WebSocket/SSE for live updates |

### ❌ DATABASE MODELS (HVAC-SPECIFIC)
| Model | Status | Purpose | Estimated Lines |
|-------|--------|---------|-----------------|
| HVACProperty | NOT BUILT | Customer property/address | 100 |
| HVACEquipment | NOT BUILT | AC/heat pump/furnace etc | 150 |
| HVACEquipmentType | NOT BUILT | Equipment catalog | 50 |
| Technician | NOT BUILT | Service technicians | 120 |
| PhoneNumber | NOT BUILT | Inbound phone tracking | 80 |
| Call | NOT BUILT | Call logs | 180 |
| CallParticipant | NOT BUILT | Who was on the call | 50 |
| CallEvent | NOT BUILT | Call state transitions | 100 |
| CallTranscript | NOT BUILT | STT output storage | 120 |
| CallSummary | NOT BUILT | AI-generated summary | 140 |
| CallDisposition | NOT BUILT | Outcome tracking | 60 |
| WorkOrder | NOT BUILT | Service jobs | 200 |
| Appointment | NOT BUILT | Scheduling | 150 |
| ServiceArea | NOT BUILT | Geographic coverage | 80 |
| CommunicationThread | NOT BUILT | SMS/email history | 100 |
| SMSMessage | NOT BUILT | Outbound SMS | 100 |
| OutboundCampaign | NOT BUILT | Maintenance reminders | 120 |
| CallbackTask | NOT BUILT | Missed call automation | 100 |
| PhoneProvider | NOT BUILT | Carrier configuration | 80 |
| PhoneConfiguration | NOT BUILT | Settings/routing | 100 |
| Consent | NOT BUILT | Opt-in/TCPA compliance | 100 |
| OptOut | NOT BUILT | Do-not-call lists | 80 |
| **TOTAL** | | | **~2,300-2,700 lines schema** |

### ❌ HVAC-SPECIFIC PAGES/COMPONENTS
| Component | Status | Priority | Location |
|-----------|--------|----------|----------|
| Phone Command Center | NOT BUILT | CRITICAL | New page |
| Call Dashboard | NOT BUILT | CRITICAL | Live calls view |
| Call Detail View | NOT BUILT | HIGH | Transcript + actions |
| Customer Timeline | NOT BUILT | HIGH | Communication history |
| Phone Settings Admin | NOT BUILT | HIGH | Configuration UI |
| Scheduling Interface | NOT BUILT | HIGH | Appointment booking |
| SMS/Callback UI | NOT BUILT | MEDIUM | Outbound mgmt |
| Test Harness | NOT BUILT | MEDIUM | Simulation UI |

### ❌ BRANDING/DESIGN INTEGRATION
- ✅ Asset pack provided (3 reference images + docs)
- ❌ Phone UI must match WISE² HVAC visual system
- ❌ Design system tokens need HVAC-specific colors (carbon black, metallic silver, electric blue, cyan, green success, amber warning, red danger)
- ❌ Premium industrial diagnostic feel (not generic SaaS)

---

## DEPLOYMENT ENVIRONMENT

### PRODUCTION STACK
```
173.208.147.165 (VPS as user dwise)
├── Docker Compose (docker-compose.prod.yml)
├── PostgreSQL (localhost:5432)
├── Redis (localhost:6379)
├── NestJS API (localhost:3010 via nginx)
├── Next.js Website (localhost:3000 via nginx)
├── Nginx (ports 8080/8443 → 80/443)
└── SSL certs (/home/dwise/wise2-core/certs)
```

### ENVIRONMENT VARIABLES (EXISTING)
```
DATABASE_PASSWORD (PostgreSQL)
JWT_SECRET
REDIS_PASSWORD
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
SENDGRID_API_KEY
GOOGLE_CLIENT_ID/SECRET
DISCORD_WEBHOOK_URL
OLLAMA_BASE_URL
HERMES_ENDPOINT
```

### ENVIRONMENT VARIABLES (NEW - PHONE)
```
TELEPHONY_PROVIDER (twilio|telnyx|signalwire)
TELEPHONY_ACCOUNT_ID
TELEPHONY_API_KEY
TELEPHONY_AUTH_TOKEN
TELEPHONY_PHONE_NUMBER

STT_PROVIDER (twilio|google|azure|deepgram)
STT_API_KEY

TTS_PROVIDER (google|aws|azure|elevenlabs)
TTS_API_KEY

PHONE_PUBLIC_BASE_URL (for webhooks)
PHONE_WEBHOOK_SECRET (webhook signature verification)

WISE2_AI_URL (Hermes endpoint for conversation)

SMS_PROVIDER (twilio|telnyx|signalwire)
SMS_API_KEY

PHONE_DAILY_BUDGET (cost control)
PHONE_ALERT_THRESHOLD
```

---

## BLOCKED DEPENDENCIES

### EXTERNAL (User Action Required)
| Item | Status | Action | Impact |
|------|--------|--------|--------|
| Twilio/Telephony Account | NOT CREATED | User creates account + acquires phone number | BLOCKING Phase 10 |
| Twilio Credentials | NOT CONFIGURED | Copy API key, auth token, phone number | BLOCKING Phase 10 |
| STT Provider (Google, Twilio, Deepgram) | NOT CONFIGURED | Select provider + configure API key | BLOCKING Phase 6 |
| TTS Provider (Google, ElevenLabs, AWS) | NOT CONFIGURED | Select provider + configure API key | BLOCKING Phase 6 |
| Fieldpiece API (optional) | NOT INVESTIGATED | Check if real integration available | OPTIONAL Phase 8 |
| SMS Carrier (Twilio/Telnyx) | NOT CONFIGURED | Confirm carrier for SMS sending | BLOCKING Phase 28 |

### INTERNAL (Build Required)
| Item | Status | Priority | Effort |
|------|--------|----------|--------|
| Telephony abstraction layer | NOT BUILT | CRITICAL | ~600 lines |
| STT abstraction layer | NOT BUILT | CRITICAL | ~400 lines |
| TTS abstraction layer | NOT BUILT | CRITICAL | ~400 lines |
| LLM conversation engine | NOT BUILT | CRITICAL | ~800 lines |
| Database migrations | NOT BUILT | CRITICAL | ~500 lines |
| API routes | NOT BUILT | CRITICAL | ~2,500 lines |
| Real-time handlers | NOT BUILT | CRITICAL | ~1,000 lines |
| Phone UI components | NOT BUILT | HIGH | ~2,500 lines |

---

## GIT STATUS (BASELINE)

```
Current branch: main
Modified files:
  - .claude/launch.json
  - apps/getdown-demo/README.md
  - apps/wise-hvac-demo/android/app/build.gradle
  - apps/wise-hvac-demo/android/gradle.properties
  - apps/wise-hvac-demo/app/field-tech/page.tsx

Untracked (not yet committed):
  - apps/wise-hvac-demo/android/app/capacitor.build.gradle
  - apps/wise-hvac-demo/android/app/release.jks
  - apps/wise-hvac-demo/android/capacitor.settings.gradle
  - apps/wise-hvac-demo/android/release.jks
  - apps/wise-hvac-demo/app/api/field/
  - apps/wise-hvac-demo/app/api/leads/
  - apps/wise-hvac-demo/release.jks

Latest commits:
  22c30dfb Merge branch 'main' of https://github.com/dwise03-bit/wise2-core
  84c20968 fix: remove basePath in dev mode for proper asset loading
  b18655c5 fix(dashboard): Resolve Docker connection reset issue causing downtime
  063eaf11 feat(deployment): Complete Tailscale mesh VPN setup for multi-device network
  2d48ec29 docs: Add Google Voice deployment checklist for quick reference
```

---

## RECOMMENDATION: PHASED APPROACH

Given the massive scope, recommend **12-phase delivery** (as outlined in master prompt):

**PHASE 1 (NOW)**: Audit ✅ + Architecture Design (2-4 hours)
- Inspect repo structure ✅
- Map existing systems ✅
- Identify missing components ✅
- Create integration design
- Define provider abstraction interfaces

**PHASE 2**: Database Models (4-6 hours)
- Create HVAC-specific schema
- Add phone models
- Write migrations
- Seed base data

**PHASE 3**: Telephony Abstraction (4-6 hours)
- Provider interface
- Twilio adapter (mock if no account yet)
- Telnyx adapter (skeleton)
- SignalWire adapter (skeleton)

**PHASE 4**: Backend Phone Services (6-8 hours)
- Call session manager
- Call storage
- Transcript persistence
- State machine

**PHASE 5**: LLM/AI Integration (4-6 hours)
- Hermes routing
- Conversation state
- Context extraction
- Tool calls (create lead, schedule, dispatch)

**PHASE 6-7**: STT/TTS (4-6 hours each)
- STT abstraction + providers
- TTS abstraction + providers
- Audio streaming

**PHASE 8**: API Routes (6-8 hours)
- /api/v1/calls
- /api/v1/phone/*
- Webhook handlers
- Business logic

**PHASE 9**: Phone Command Center UI (6-8 hours)
- Dashboard layout
- Live call view
- Transcript viewer
- Actions (transfer, create job, etc.)

**PHASE 10**: Provider Integration (4-6 hours, user-dependent)
- Real provider credentials
- Webhook registration
- Number configuration
- Inbound call routing

**PHASE 11**: Testing (6-8 hours)
- E2E tests
- Load tests
- Security pass
- Offline mode

**PHASE 12**: Deployment (2-4 hours)
- Docker service
- Environment vars
- Monitoring
- Health checks

**ESTIMATED TOTAL: 60-90 hours of focused work**

---

## CRITICAL RULES FOR IMPLEMENTATION

1. **Never fabricate phone-provider state** — if not connected, say `NOT_CONFIGURED`
2. **Reuse existing auth/CRM/scheduling** — don't rebuild
3. **Offline-first field tech** — calls work without network
4. **Photo-backed proof** — store actual images, timestamps
5. **Real tool readings only** — no fake Fieldpiece data
6. **Provider-neutral** — business logic above abstraction
7. **Safety-first escalation** — dangerous situations → human
8. **Audit trail everything** — compliance + debugging
9. **Brand consistency** — WISE² HVAC visual language throughout
10. **No rabbit branding** — strict WISE² logo only

---

## NEXT STEPS

**PHASE 2 (DATABASE MODELS)** — Ready to execute. Proceed? (Y/N)
- Define HVAC property/equipment/technician/work-order schema
- Create phone/call/transcript/sms models
- Write Prisma schema additions
- Generate migrations
- Test locally

