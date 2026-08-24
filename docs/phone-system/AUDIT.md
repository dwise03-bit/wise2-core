# WISE² Phone System Audit
**Date**: August 23, 2026  
**Environment**: macOS M4 (development)  
**Target Deployment**: Linux VPS with GPU (production)

## Executive Summary

WISE² has substantial infrastructure that can be leveraged for a production phone system:
- **Existing**: PostgreSQL, Redis, Docker, Nginx, Hermes/Ollama
- **To Add**: Asterisk 22 LTS, Phone Gateway, SIP provider, Voice models
- **Current Blockers**: None technical; requires SIP credentials

---

## EXISTING INFRASTRUCTURE

### Database
- **Service**: PostgreSQL 15 (Alpine)
- **Container**: wise2-db
- **Port**: 5432 (localhost only)
- **Database**: wise2_prod
- **User**: wise2
- **Status**: ACTIVE

### Cache & Queue
- **Service**: Redis 7 (Alpine)
- **Container**: wise2-redis
- **Port**: 6379 (localhost only)
- **Status**: ACTIVE

### API Layer
- **Service**: NestJS (TypeScript)
- **Container**: wise2-api
- **Port**: 3010 (mapped from 3000)
- **Dependencies**: PostgreSQL, Redis
- **Status**: ACTIVE
- **Schema**: Prisma ORM with 23 phone-related models available

### LLM / Intelligence
- **Service**: Ollama (Docker or Host)
- **Models Available**: Hermes2-Pro, Mistral, others
- **Endpoint**: http://172.17.0.1:11435 (Docker gateway to host)
- **Status**: AVAILABLE
- **Note**: Existing Hermes/Ollama already configured in API env

### Reverse Proxy
- **Service**: Nginx (Alpine)
- **Ports**: 8080 (HTTP), 8443 (HTTPS)
- **Config**: /nginx.conf
- **Status**: ACTIVE

### Networking
- **Docker Network**: wise2 (bridge)
- **Hostname Resolution**: host.docker.internal available
- **Public Connectivity**: Tailscale mesh VPN (optional)

---

## HARDWARE CAPABILITY (Development Machine)

- **OS**: macOS 14.5 (Darwin Kernel 25.5.0)
- **CPU**: Apple M4 (10 cores)
- **RAM**: 16 GB
- **GPU**: Apple M4 (integrated, suitable for Whisper/TTS inference)
- **Docker**: Version 29.6.1
- **Docker Compose**: v5.1.4
- **Storage**: Adequate

---

## CURRENT LISTENING PORTS

- 3000: Website (Next.js)
- 3002: Prompt Shop
- 3005: Studio
- 3010: API (mapped from 3000)
- 3020: GetDown Demo
- 5432: PostgreSQL
- 6379: Redis
- 8080: Nginx HTTP
- 8443: Nginx HTTPS

---

## REUSABLE SERVICES

| Service | Container | Port | Database | Reuse Plan |
|---------|-----------|------|----------|------------|
| PostgreSQL | wise2-db | 5432 | (database engine) | Share phone models in wise2_prod |
| Redis | wise2-redis | 6379 | (cache) | Share call queues, session state |
| Ollama/Hermes | (host) | 11435 | (model files) | Existing LLM for phone conversations |
| Nginx | wise2-nginx | 8080/8443 | (config) | Route /phone to gateway |

---

## COMPONENTS TO ADD

### 1. Asterisk 22 LTS
- **Install Target**: Production Linux VPS (NOT this Mac)
- **Purpose**: SIP PBX, call routing, dialplan
- **Architecture Decision**: 
  - **Option A**: Docker container (lightweight, single service model)
  - **Option B**: Host service (better RTP performance, direct networking)
  - **Recommendation**: Option B for production reliability
- **Ports to Open**: 5060 (SIP), 5061 (SIP TLS), 10000-20000 (RTP)
- **Status**: NOT INSTALLED

### 2. Phone Gateway Service
- **Type**: Node.js + TypeScript
- **Location**: apps/phone-gateway/
- **Responsibilities**:
  - Asterisk connection (ARI/WebSocket)
  - Call lifecycle management
  - Audio streaming to/from Asterisk
  - VAD (Voice Activity Detection)
  - STT orchestration
  - LLM interaction via Hermes
  - TTS playback
  - Barge-in/interruption handling
  - CRM tool calls
- **Status**: TO BE BUILT

### 3. Whisper STT Service
- **Type**: Local AI (Docker or host)
- **Model**: OpenAI Whisper (small/medium/large-v3)
- **Input**: PSTN audio (ulaw 8kHz)
- **Output**: Transcribed text
- **Docker**: onesoil/whisper-api or equivalent
- **Status**: TO BE DEPLOYED

### 4. TTS Provider
- **Priority 1**: Local Whisper-derived TTS (gTTS alternative)
- **Priority 2**: Piper (lightweight, streaming)
- **Priority 3**: Coqui TTS
- **Daniel Voice**: Custom reference dataset + fine-tuned model
- **Fallback**: Generic WISE² voice
- **Status**: TO BE IMPLEMENTED

### 5. SIP Provider Trunk
- **Required**: Legitimate SIP DID with inbound routing
- **Candidates**: Telnyx, Twilio SIP, SignalWire, Flowroute, VoIP.ms
- **Cost**: ~$1-3/month DID + usage (typically $0.01-0.05/min)
- **Authentication**: REGISTER or IP-based
- **Status**: REQUIRES PURCHASE (blocked on decision)

### 6. Daniel Voice Model
- **Source**: New Recording.m4a (authorized reference)
- **Path**: /Users/danielwise/Library/Containers/com.apple.Notes/Data/tmp/TemporaryItems/NSIRD_Notes_erXpFJ/HardLinkURLTemp/224B67F0-9DFE-4965-ADD2-47E5A7996352/1787530176/New Recording.m4a
- **Use**: Voice cloning/fine-tuning for TTS
- **Status**: REFERENCE RECEIVED

---

## CONFLICTS & RISKS

### No Conflicts
- **Phone Gateway** (port 3001) → Already defined in docker-compose.phone.yml
- **Asterisk** (ports 5060, 10000-20000) → Not in use, safe to add
- **Whisper** (port 8000) → Not in use, safe to add
- **Database**: Can add phone models without breaking existing schema

### Risks to Mitigate
1. **RTP Port Exhaustion**: If system gets high call volume, UDP range 10000-20000 may need expansion
   - **Mitigation**: Monitor, document in config
2. **Asterisk Reliability**: Needs supervision/restart policy
   - **Mitigation**: systemd/Docker restart: unless-stopped
3. **Audio Quality**: PSTN to AI pipeline has latency; must target < 1 second
   - **Mitigation**: Optimize codec handling, RTP buffering
4. **LLM Availability**: If Ollama crashes, calls fail
   - **Mitigation**: Fallback to simple IVR, health checks

---

## DEPLOYMENT ARCHITECTURE

### Development (This Machine)
- Phone Gateway (Node.js local)
- STT (Docker Whisper)
- LLM (Existing Ollama/Hermes)
- TTS (Docker or local)
- NO Asterisk (macOS incompatible for real SIP)
- **Use Case**: Local voice testing, pipeline development

### Production (Linux VPS)
```
Public Phone Number (SIP DID)
       ↓
Firewall (allow 5060, 10000-20000)
       ↓
Asterisk 22 LTS (systemd service)
       ↓
WebSocket/ARI
       ↓
Phone Gateway (Node.js, Docker or systemd)
       ↓
├─ Whisper STT (Docker)
├─ Hermes LLM (existing Ollama)
├─ TTS Provider (Docker)
└─ PostgreSQL (existing)
```

---

## SYSTEM REQUIREMENTS

### Production Server (Recommended)
- **CPU**: 4+ cores
- **RAM**: 8+ GB
- **GPU**: NVIDIA (RTX 3060 or better) for Whisper acceleration
  - Alternative: CPU acceptable, slower inference
- **OS**: Ubuntu 22.04 LTS or Rocky Linux 9
- **Network**: Static IP, reliable upstream ISP
- **Bandwidth**: 100 kbps/call (outbound)

---

## PORTS & FIREWALL

| Service | Port | Protocol | Firewall | Notes |
|---------|------|----------|----------|-------|
| Asterisk SIP | 5060 | UDP | ALLOW | Primary SIP signaling |
| Asterisk SIP TLS | 5061 | TCP | ALLOW | Secure SIP (optional) |
| Asterisk RTP | 10000-20000 | UDP | ALLOW | Media stream range |
| Phone Gateway | 3001 | TCP | ALLOW | API + WebSocket |
| Whisper API | 8000 | TCP | INTERNAL | Docker network only |
| LLM | 11435 | TCP | INTERNAL | Docker network only |
| TTS | 8080 | TCP | INTERNAL | Docker network only |

---

## ENVIRONMENT VARIABLES (TO CREATE)

```env
# Asterisk
ASTERISK_HOST=localhost
ASTERISK_PORT=8088
ASTERISK_USERNAME=wise2_gateway
ASTERISK_PASSWORD=<random-secret>
ASTERISK_ARI_ENDPOINT=http://localhost:8088/ari

# SIP Provider (when purchased)
WISE2_SIP_PROVIDER=telnyx  # or twilio, signalwire, etc
WISE2_SIP_USERNAME=<account>
WISE2_SIP_PASSWORD=<secret>
WISE2_SIP_HOST=sip.provider.com
WISE2_SIP_PORT=5060
WISE2_SIP_DID=+1234567890
WISE2_SIP_OUTBOUND_CID=+1234567890

# STT (Whisper)
WHISPER_URL=http://whisper:8000/v1/audio/transcriptions
STT_PROVIDER=whisper

# TTS
TTS_PROVIDER=piper  # or gtts, coqui
TTS_VOICE_MODEL=en_US-male

# Daniel Voice
DANIEL_VOICE_MODEL_PATH=/app/voice/daniel/models/tts-model.bin
DANIEL_VOICE_ENABLED=false  # Start disabled, enable after training

# LLM (Hermes)
HERMES_ENDPOINT=http://ollama:11435/v1/chat/completions
HERMES_CHAT_MODEL=hermes2-pro

# CRM Integration
CRM_DATABASE_URL=postgresql://wise2:${DATABASE_PASSWORD}@postgres:5432/wise2_prod
CRM_REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379/1

# Phone System
PHONE_PUBLIC_NUMBER=+1234567890  # Set after SIP DID
PHONE_API_BASE_URL=https://wise2.net/phone
PHONE_WEBHOOK_SECRET=<random-secret>
```

---

## NEXT PHASE: PHASE 2

**Deliverable**: Asterisk 22 LTS Installation & Configuration  
**Timeline**: 1-2 days (production server only, not macOS)  
**Blocker**: Production server access required

---

## DECISION POINTS

| Decision | Options | Recommendation | Status |
|----------|---------|---|----------|
| **SIP Carrier** | Telnyx, Twilio, SignalWire, Flowroute | Telnyx (best value) | PENDING DECISION |
| **Asterisk Host** | Docker container vs systemd service | Systemd (reliability) | PENDING DECISION |
| **TTS Engine** | Piper, Coqui, gTTS, custom | Piper (streaming + quality) | PENDING DECISION |
| **STT Model Size** | small, medium, large-v3 | medium (latency/quality) | PENDING DECISION |
| **GPU Allocation** | Shared with Ollama or dedicated | Shared (better utilization) | PENDING DECISION |

---

## DEFINED DONE (Phase 1)

- [x] Existing infrastructure audited
- [x] Reusable services identified
- [x] New components mapped
- [x] Ports planned and documented
- [x] Conflicts resolved
- [x] Hardware requirements stated
- [x] Environment variables templated
- [ ] SIP provider selected & purchased (external blocker)
- [ ] Production server prepared (external blocker)
- [ ] Daniel voice reference received (completed)

---

**Status**: ✅ AUDIT COMPLETE  
**Blockers**: SIP provider decision, production server availability  
**Next Action**: Proceed to Phase 2 (Asterisk installation on production server)
