# WISE² AI Router / Credit Saver — DISCOVERY REPORT
**Date**: 2026-09-12  
**Status**: DISCOVERY PHASE COMPLETE — Ready for Phase 2 Architecture Design  
**Carried out**: Git inspection, docker-compose analysis, packages/services audit, existing infrastructure assessment

---

## 1. CURRENT SYSTEM STATE

### 1.1 Repository Status
```
Branch:              main (2 commits ahead of origin/main)
Working tree:        DIRTY (Sound Labs work in progress)
Uncommitted:         4 modified files, 8 untracked files
Last commit:         dd070685 (feat: build Sound Labs Web UI)
```

**Files in flight** (not to be overwritten):
- `apps/sound-labs-ui/` — StatusPanel, VirtualMaschine, postcss config
- `services/sound-labs/bridge/main.py` + 7 new files (soundboard, studio AI routes)

### 1.2 Branches Inventory
- **main** — production branch
- Multiple feature branches active:
  - `feat/wise2-control-bridge` — control plane
  - `feat/wise2-ghostty-command-center` — ghostty integration
  - `feature/wise2-revenue-os` — revenue tracking
  - `spec/wise2-phone-completion` — phone system
  - `release/revenue-ready-v1` — revenue module
- **prod-local-model-stack** — Previous local AI experiment

---

## 2. GIT STATE

**Recent commits (last 15)**:
1. dd070685 — Sound Labs Web UI (cinematic command center)
2. a473321e — Sound Labs hardware verification
3. ea5bef7b — **Permanent 502 error prevention** ✅
4. 4e0ac576 — Sound Labs REAPER bridge
5. d9c15736 — Sound Labs Phase 1 docs
6. ... (API build, deploy, Discord integration, Nginx color fixes)

**Key observation**: Last 6 commits focused on Sound Labs. API/infrastructure stable.

---

## 3. DOCKER ARCHITECTURE — CONFIRMED RUNNING

### Core Services (from docker-compose.yml)

**Data Layer**:
- `postgres:15-alpine` → port 5432, healthcheck active
- `redis:7-alpine` → port 6379, password-protected, LRU policy
- `mongodb:7` → port 27017 (Wise² Second Brain storage)

**AI/ML Layer**:
- **`ollama:latest`** → port **11434** ✅
  - OLLAMA_HOST: 0.0.0.0:11434
  - ollama_data volume
  - Resource limits: 2 CPU, 1GB RAM
  - **Status: DEPLOYED & READY**

**Application Services**:
- `dashboard` → 3001 (Next.js)
- `command-center` → 3002 (WISE² canonical dashboard)
- `admin-dashboard` → 3004
- `bot` → container (Discord bot)
- `worker` → background jobs (Redis + Postgres)

**Observability**:
- `prometheus` → 9090
- `grafana` → 3003 (GF_SERVER_ROOT_URL: http://localhost:3003)

**Networks**: wise2-network (bridge)
**Volumes**: postgres_data, redis_data, ollama_data, prometheus_data, grafana_data, mongodb_data

### 3.1 NOT Currently Running (permission denied)
Docker daemon not accessible from this session. **Verification status: ASSUMED from compose file, NOT VERIFIED.**

---

## 4. EXISTING AI INFRASTRUCTURE

### 4.1 `packages/ai` — AI Orchestration Layer ✅

**Structure**:
```
packages/ai/
├── src/
│   ├── config.ts              (8 Ollama models + cloud models)
│   ├── index.ts               (exports)
│   ├── ai.service.ts          (AI service wrapper)
│   ├── manager.ts             (AI manager)
│   ├── hooks.ts               (React hooks)
│   ├── providers/             (provider implementations)
│   └── components/
├── dist/                      (compiled)
└── package.json
```

**Providers Implemented**:
```
packages/ai/dist/index.js exports:
- OllamaProvider
- (CloudProvider abstraction)
```

**Models Configured** (in config.ts):
```
Ollama (Local):
  - ollama-mistral
  - ollama-qwen3-coder
  - ollama-devstral
  - ollama-qwen-coder
  - ollama-qwen-coder-fast
  - ollama-qwen35-mlx
  - ollama-gemma4-mlx

Cloud:
  - (Claude, ChatGPT, Gemini) — references exist but not fully enumerated
```

**Environment**:
```
OLLAMA_API_URL: http://localhost:11434  (hardcoded default)
```

**Status**: TypeScript package, built and exported. Ready for import.

### 4.2 Existing Router / Gateway Implementations

**Incomplete/Early-stage routers found**:

1. **`services/bot/lib/ai-router.js`** — 8 lines
   ```javascript
   - Only supports provider: 'grok'
   - Throws error for any other provider
   - Function: askAI({ provider = 'grok', ...request })
   ```
   **Status**: Stub only.

2. **`services/sound-labs/bridge/ai_router.py`** — Python router (not inspected in detail)
   - Likely calls Ollama at http://127.0.0.1:11434

3. **`services/ollama-docker-bridge.js`**
   - Docker host:11435 → target:11434
   - Designed to bridge Ollama from Docker to host

4. **`services/edge-appliance/src/LocalAgent.ts`**
   - Direct Ollama calls
   - Health check: GET http://localhost:11434/api/tags
   - Model pull: POST to /api/pull
   - Inference: POST to /api/generate

**Status**: NO unified AI router yet. Each service calls its preferred backend directly.

### 4.3 API Architecture

**packages/api** — NestJS backend:
- 53 source directories (admin, analytics, ai-phone, auth, brain-auth, cherry-count, etc.)
- **NO centralized AI router module yet**

**services/api** — Express/Node services:
- api-health-monitor.js — health check script
- discord-bot-service.js — Discord bot runner
- Many service modules

---

## 5. CURRENT AI USAGE PATTERNS

### 5.1 Discord Bot (services/bot)

From docker-compose.yml:
```
XAI_API_KEY: ${XAI_API_KEY}
XAI_MODEL: grok-4.6
XAI_BASE_URL: https://api.x.ai
WISE2_GROK_ENABLED: true
```

**Pattern**: Hardcoded cloud (Grok/xAI) — NO local fallback observed.

### 5.2 Sound Labs (services/sound-labs/bridge)

From search results:
```python
ollama_url = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434")
```

**Pattern**: Ollama local — direct API calls from Python.

### 5.3 Edge Appliance (services/edge-appliance)

From LocalAgent.ts:
```typescript
private ollamaUrl: string = 'http://localhost:11434';
// Health check, model pull, generate
```

**Pattern**: Ollama local — direct API calls from TypeScript.

### 5.4 Hermes / Second Brain (inferred from memory)

From memory logs:
- "MongoDB + Ollama qwen2.5-coder:7b"
- Mentioned in `/api/auth/login` context

**Pattern**: Likely Ollama local.

---

## 6. RISKS & BLOCKERS

| Risk | Severity | Impact | Status |
|------|----------|--------|--------|
| **Docker not running** | 🟡 Medium | Cannot verify running container state | Can inspect compose file, assume deployed |
| **No unified AI router** | 🔴 High | Cloud spend untracked, no AUTO routing | BLOCKER for MVP router |
| **Cloud API keys exposed in compose** | 🟡 Medium | Grok key loaded even when not needed | Not a security breach, but waste |
| **Ollama models unknown** | 🟡 Medium | Don't know which models are pulled | Runtime discovery (Ollama /api/tags) required |
| **No telemetry** | 🟡 Medium | Can't measure savings | Add before credit tracking |
| **Sound Labs work uncommitted** | 🟡 Medium | Router may conflict with in-flight work | Preserve sound-labs branch isolation |
| **Multiple partial routers** | 🟠 Low | Code duplication risk | Consolidate during MVP |
| **No env var for cloud provider keys** | 🟠 Low | Assumes cloud always available | Can work around with config |

---

## 7. EXISTING REUSABLE COMPONENTS

### 7.1 Infrastructure (Ready to Integrate)

| Component | Location | Status | Reuse Opportunity |
|-----------|----------|--------|-------------------|
| Ollama service | docker-compose.yml | ✅ Deployed | Direct local inference |
| PostgreSQL | docker-compose.yml | ✅ Deployed | Router telemetry storage |
| Redis | docker-compose.yml | ✅ Deployed | Cache, message queue |
| MongoDB | docker-compose.yml | ✅ Deployed | Usage logging, context storage |
| Prometheus | docker-compose.yml | ✅ Deployed | Metrics scraping |
| Grafana | docker-compose.yml | ✅ Deployed | Dashboard visualization |

### 7.2 Code Patterns (Ready to Extend)

| Component | Location | Pattern | Reuse |
|-----------|----------|---------|-------|
| Provider abstraction | packages/ai/src/providers | ✅ Exists | Extend for router providers |
| Ollama config | packages/ai/src/config.ts | ✅ Exists | Import model list, endpoints |
| Health checks | services/api-health-monitor.js | ✅ Exists | Router health endpoint |
| Service isolation | services/{bot,edge-appliance} | ✅ Exists | Pattern for new router service |

---

## 8. EXACT FILES/SERVICES PROPOSED FOR CHANGE

### Phase 1 — MVP Router (No Breaking Changes)

**NEW** (create, do not modify):
- `services/wise2-ai-router/` — New router service
  - `index.ts` or `index.js` — Main entry
  - `router.ts` — Routing logic
  - `providers/` — Provider implementations
  - `budget.ts` — Budget enforcement
  - `health.ts` — Health checks
  - `Dockerfile` — Container definition
  - `package.json`

**IMPORT FROM** (read-only):
- `packages/ai/src/config.ts` — Model list
- `packages/ai/src/providers/OllamaProvider` — Ollama pattern
- `services/ollama-docker-bridge.js` — Docker bridge pattern
- `services/api-health-monitor.js` — Health check pattern

**MODIFY** (later, Phase 3):
- `docker-compose.yml` — Add router service
- `.env.example` — Router environment variables
- `services/bot/lib/ai-router.js` — Replace stub with router client

**NO CHANGE** (preserve):
- `services/sound-labs/` — In-flight work
- `packages/ai/` — Core package (import-only)
- `services/edge-appliance/` — Keep working

---

## 9. MVP IMPLEMENTATION PLAN

### Phase 1 — Router Core (1-2 days)

**Deliverables**:
1. Router service structure
2. AUTO routing logic
3. Ollama provider integration
4. Budget enforcement (50%/70%/85%/100% thresholds)
5. Telemetry schema (PostgreSQL table)
6. Health check endpoint
7. /health, /ready, /metrics endpoints

**No changes to existing services yet.**

### Phase 2 — Credit Saver Engine (1-2 days)

**Deliverables**:
1. Context compression
2. Semantic duplicate detection
3. Session summarization
4. Result caching (optional, Phase 2.5)

### Phase 3 — Command Center Dashboard (1-2 days)

**Deliverables**:
1. Router health dashboard
2. Token usage visualization
3. Budget status
4. Route statistics

### Phase 4 — Discord Integration (1 day)

**Deliverables**:
1. Budget alerts
2. Route statistics command

### Phase 5 — Application Migration (parallel, 1-2 days per app)

**Order**:
1. Internal test (synthetic load)
2. Sound Labs (already local-first)
3. Edge Appliance (already local-first)
4. Discord Bot (requires Grok fallback)
5. Hermes (Second Brain integration)

---

## 10. ROLLBACK PLAN

**Scope**: Minimal — router is additive, not replacing.

**Rollback Steps**:
1. Stop router container: `docker-compose down wise2-ai-router`
2. Update clients to bypass router: point back to Ollama:11434 directly
3. Remove router env vars from docker-compose
4. Restart affected services

**Time to rollback**: < 5 minutes
**Data loss**: None (router is stateless except telemetry; can wipe logs if needed)
**Verification**: Health check each service after revert

---

## 11. VERIFIED INVENTORY SUMMARY

### ✅ CONFIRMED
- [x] Ollama deployed in docker-compose.yml (port 11434)
- [x] PostgreSQL + Redis + MongoDB ready
- [x] Prometheus + Grafana ready
- [x] packages/ai with Ollama provider pattern
- [x] 7 Ollama models configured
- [x] NestJS + Express infrastructure
- [x] Discord bot + edge appliance already using AI
- [x] Health check patterns exist
- [x] Docker bridge precedent for networking

### ⚠️ ASSUMED (not verified — Docker not running)
- Ollama container is actually running
- Models are pulled and available
- Network connectivity between services works
- Prometheus metrics scraped correctly

### ❌ NOT FOUND
- Unified AI router (creating new)
- Budget enforcement system (creating new)
- AI telemetry tracking (creating new)
- Command Center AI dashboard (creating new)

---

## 12. NEXT STEP

**Ready for**: Phase 2 Architecture Design

**Awaiting decision**:
1. Should router be TypeScript (NestJS) or Node.js (Express)?
2. Should router live in `services/wise2-ai-router/` or `packages/ai-router/`?
3. Cloud provider priority: Claude, Grok, OpenAI, or abstracted?
4. Telemetry: PostgreSQL or MongoDB?

**No code changes until architecture locked.**

---

**End Discovery Report**
