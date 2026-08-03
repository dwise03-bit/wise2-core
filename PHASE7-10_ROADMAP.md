# WISE² Genesis — Phase 7-10 Roadmap
## Building the AI-Native Operating System

**Vision**: WISE² is an AI-native business operating system providing one synchronized experience across cloud, VPS, Raspberry Pi edge, Mac, Windows, Linux, Chromebook, browser, and mobile.

**Timeline**: Weeks 8-16 (8-week sprint)  
**Phases**: 7, 8, 9, 10  
**Mission**: Build WISE² Core v1.0

---

## Phase 7: PromptOS & Agent Framework Foundation
**Timeline**: Weeks 8-9  
**Status**: Starting now

### Deliverables

#### 1. PromptOS Modular Prompt Framework (700+ LOC)

**Architecture**:
```
PromptOS (Core)
├── Base System Prompt (executive layer)
├── Module System (inheritance)
├── Prompt Registry
├── Version Management
└── Composition Engine

Agent Prompts (Specialized)
├── Executive (business logic, reasoning)
├── Developer (code, architecture, debugging)
├── Infrastructure (servers, deployment, monitoring)
├── Deployment (CI/CD, releases, rollbacks)
├── Raspberry Pi (edge devices, automation)
├── Discord (communication, notifications)
├── Marketing (content, campaigns, messaging)
├── Sales (deals, pipeline, customers)
├── CRM (relationships, accounts, opportunities)
├── Finance (budgets, forecasts, tracking)
├── Research (analysis, competitive, data)
├── Documentation (knowledge base, guides)
├── Voice (natural language, conversations)
├── Vision (image analysis, visual tasks)
├── Security (compliance, vulnerabilities, access)
├── Quality Assurance (testing, quality gates)
└── Automation (workflows, triggers, orchestration)
```

**Files to Create**:
- `promptos/core/base-system-prompt.md` — Foundation prompt
- `promptos/core/prompt-registry.ts` — Prompt loader
- `promptos/core/module-system.ts` — Inheritance engine
- `promptos/core/composition.ts` — Prompt composition
- `promptos/agents/executive.md` — Business reasoning layer
- `promptos/agents/developer.md` — Development specialist
- `promptos/agents/infrastructure.md` — Ops specialist
- `promptos/agents/[13 more agents].md` — Agent prompts
- `promptos/README.md` — PromptOS documentation

#### 2. Agent Framework (Core Layer) (500+ LOC)

**Files to Create**:
- `packages/agent-framework/src/BaseAgent.ts` — Abstract agent
- `packages/agent-framework/src/AgentRegistry.ts` — Agent management
- `packages/agent-framework/src/AgentContext.ts` — Shared context
- `packages/agent-framework/src/AgentRouter.ts` — Intent-based routing
- `packages/agent-framework/src/AgentMemory.ts` — Agent-specific memory
- `packages/agent-framework/src/AgentTools.ts` — Tool bindings
- `packages/agent-framework/src/types.ts` — Type definitions

**Features**:
- Agent lifecycle management
- Prompt loading from PromptOS
- Memory isolation per agent
- Tool registration and execution
- Context passing between agents
- Error handling and recovery

#### 3. Executive Agent Implementation (400+ LOC)

**Files to Create**:
- `services/executive-agent/src/ExecutiveAgent.ts` — Business reasoner
- `services/executive-agent/src/reasoning/BusinessLogic.ts` — Decision engine
- `services/executive-agent/src/reasoning/GoalPlanning.ts` — Goal decomposition
- `services/executive-agent/src/routing/AgentSelector.ts` — Which agent to use?
- `services/executive-agent/src/memory/ExecutiveMemory.ts` — Business context

**Capabilities**:
- Parse user intent
- Route to appropriate specialist agents
- Synthesize results
- Make business decisions
- Track goals and progress
- Remember context across sessions

#### 4. CLAUDE.md PromptOS Integration

**Replace agent routing table with**:
```
## Agent Routing via PromptOS

Instead of inline agent registry, use modular prompts:

User Request
    ↓
[Executive Agent]
    ├─ Load executive.md from PromptOS
    ├─ Analyze intent
    ├─ Decompose into subtasks
    └─ Select specialist agent(s)
        ↓
[Specialist Agent]
    ├─ Load agent/{domain}.md from PromptOS
    ├─ Execute specialized work
    └─ Return results
        ↓
[Executive Agent]
    ├─ Synthesize results
    ├─ Update memory
    └─ Respond to user
```

**Update CLAUDE.md sections**:
- Remove `@dev`, `@ops`, `@design`, etc. static table
- Add PromptOS reference
- Document agent prompt files
- Show routing flow

---

## Phase 8: Knowledge Graph & Second Brain Integration
**Timeline**: Weeks 9-11  
**Status**: Follows Phase 7

### Deliverables

#### 1. Knowledge Graph Service (1,000+ LOC)

**Architecture**:
```
Knowledge Graph (Graph Database)
├── Entities
│   ├── People (users, team members, contacts)
│   ├── Organizations (companies, clients, vendors)
│   ├── Projects (business initiatives)
│   ├── Repositories (code, documentation)
│   ├── Services (microservices, APIs)
│   ├── Servers (cloud, VPS, Raspberry Pi)
│   ├── Documents (files, notes, records)
│   ├── Meetings (events, decisions)
│   ├── Tasks (work items, assignments)
│   ├── Deployments (releases, rollbacks)
│   ├── Prompts (PromptOS entries)
│   ├── Automations (workflows, jobs)
│   ├── Agents (AI agents, bots)
│   └── Infrastructure (networks, DNS, CDN)
│
├── Relationships
│   ├── owns (person owns project)
│   ├── manages (manager oversees team)
│   ├── works_on (person contributes to project)
│   ├── depends_on (service depends on service)
│   ├── deploys_to (repo deploys to server)
│   ├── runs_on (process runs on server)
│   ├── related_to (knowledge cross-reference)
│   ├── mentions (document mentions entity)
│   ├── assigned_to (task assigned to person)
│   ├── scheduled_for (event scheduled for time)
│   └── triggers (automation triggers action)
│
└── Properties
    ├── Timestamps (created, updated, accessed)
    ├── Status (active, archived, deleted)
    ├── Tags (categorization)
    ├── Metadata (custom properties)
    └── Versions (change history)
```

**Files to Create**:
- `services/knowledge-graph/src/GraphDB.ts` — Graph storage
- `services/knowledge-graph/src/entities/Entity.ts` — Entity base class
- `services/knowledge-graph/src/relationships/Relationship.ts` — Relationship model
- `services/knowledge-graph/src/queries/GraphQuery.ts` — Query engine
- `services/knowledge-graph/src/search/SemanticSearch.ts` — Vector search
- `services/knowledge-graph/src/reasoning/GraphReasoning.ts` — Inference
- `services/knowledge-graph/src/api/GraphAPI.ts` — REST API

**Features**:
- Create/update/delete entities and relationships
- Query relationships (e.g., "Find all projects Alice owns")
- Semantic search across graph
- Inference and recommendations
- Version tracking
- Backup and recovery

#### 2. Second Brain ↔ Knowledge Graph Bridge (400+ LOC)

**Files to Create**:
- `services/knowledge-bridge/src/VaultIndexer.ts` — Index vault into graph
- `services/knowledge-bridge/src/EntityExtractor.ts` — Extract entities from documents
- `services/knowledge-bridge/src/RelationshipDetector.ts` — Detect relationships
- `services/knowledge-bridge/src/GraphSync.ts` — Keep in sync

**Features**:
- Automatically extract entities from documents
- Build relationships from mentions and cross-references
- Keep graph in sync with vault changes
- Query graph to enhance vault search

#### 3. Expanded Second Brain Vault Structure (300+ LOC)

**Vault Expansion**:
```
VAULT/
├── INBOX/              (new messages, ideas)
├── COMPANY/            (org info, team, culture)
├── PROJECTS/           (active initiatives)
├── CLIENTS/            (customer data, accounts)
├── ARCHITECTURE/       (system design, decisions)
├── DOCUMENTATION/      (guides, HOWTOs)
├── DECISIONS/          (ADRs, RFCs)
├── MARKETING/          (campaigns, content)
├── OPERATIONS/         (SOPs, processes)
├── INFRASTRUCTURE/     (servers, networking)
├── AI-CONVERSATIONS/   (agent outputs, logs)
├── PROMPTS/            (PromptOS registry)
├── AUTOMATIONS/        (workflows, triggers)
├── SECURITY/           (policies, incidents)
├── KNOWLEDGE-GRAPH/    (entity definitions)
└── ARCHIVE/            (old projects, closed)
```

#### 4. Knowledge Graph API (200+ LOC)

**Endpoints**:
- `POST /graph/entities` — Create entity
- `GET /graph/entities/{id}` — Get entity
- `POST /graph/relationships` — Create relationship
- `GET /graph/query` — Query graph
- `POST /graph/search` — Semantic search
- `GET /graph/reasoning/{entity}` — Get recommendations

---

## Phase 9: Raspberry Pi Edge Platform & Cross-Device Sync
**Timeline**: Weeks 11-13  
**Status**: Parallel with Phase 8

### Deliverables

#### 1. Raspberry Pi WISE² Edge Appliance (1,200+ LOC)

**Architecture**:
```
Raspberry Pi WISE² Edge
├── Docker Runtime
│   ├── Ollama (local LLM inference)
│   ├── Agent Runtime (run agents locally)
│   ├── Voice Service (wake-word, TTS/STT)
│   ├── Sync Engine (bidirectional sync)
│   └── Background Jobs (cron, webhooks)
│
├── Hardware Integration
│   ├── GPIO (lights, sensors, relays)
│   ├── Camera (video, snapshots)
│   ├── Microphone (audio input)
│   ├── Speaker (audio output)
│   └── USB (peripheral support)
│
├── Offline Operation
│   ├── Local database (SQLite + CRDT)
│   ├── Cached AI models
│   ├── Cached documents
│   ├── Background queue
│   └── Sync queue
│
├── Edge Automation
│   ├── Local triggers (sensor input)
│   ├── Scheduled jobs (cron)
│   ├── Webhook handlers
│   ├── MQTT broker
│   └── Scene execution
│
└── Cloud Connectivity
    ├── VPN connection (WireGuard)
    ├── Secure sync protocol
    ├── Health reporting
    ├── Remote management
    └── Automatic updates
```

**Files to Create**:
- `services/edge-appliance/docker-compose.yml` — Docker stack
- `services/edge-appliance/src/EdgeRuntime.ts` — Main runtime
- `services/edge-appliance/src/LocalAgent.ts` — Run agents locally
- `services/edge-appliance/src/OfflineDB.ts` — Local database
- `services/edge-appliance/src/SyncManager.ts` — Bidirectional sync
- `services/edge-appliance/src/HardwareInterface.ts` — GPIO/camera/mic
- `services/edge-appliance/src/VoiceAssistant.ts` — Voice control
- `services/edge-appliance/src/AutomationEngine.ts` — Trigger execution
- `services/edge-appliance/ansible/` — Deployment playbooks

#### 2. Cross-Device Synchronization Engine (800+ LOC)

**Files to Create**:
- `packages/sync-engine/src/SyncManager.ts` — Orchestrate sync
- `packages/sync-engine/src/SyncProtocol.ts` — Protocol (CRDT + vector clocks)
- `packages/sync-engine/src/ConflictResolver.ts` — Resolve conflicts
- `packages/sync-engine/src/ChangeLog.ts` — Track changes
- `packages/sync-engine/src/DeviceRegistry.ts` — Manage devices
- `packages/sync-engine/src/SyncQueue.ts` — Queue changes
- `packages/sync-engine/src/OfflineBuffer.ts` — Buffer when offline

**Features**:
- Sync conversations, projects, memory, automations
- CRDT algorithm for conflict resolution
- Works offline, syncs when online
- Device-to-device (Raspberry Pi, Mac, phone, browser)
- Partial sync (selective data sync)

#### 3. Memory Engine Cross-Device Sync (400+ LOC)

**Files to Create**:
- `services/memory-engine/src/CrossDeviceMemory.ts` — Unified memory
- `services/memory-engine/src/MemorySync.ts` — Sync memory across devices
- `services/memory-engine/src/MemoryPartitioning.ts` — Device-specific splits

**Features**:
- User memory available on all devices
- Long-term storage on cloud
- Recent context cached on devices
- Automatic cache invalidation

---

## Phase 10: API Gateway, Voice Interface & Full Integration
**Timeline**: Weeks 13-16  
**Status**: Final integration sprint

### Deliverables

#### 1. API Gateway (Unified Access) (600+ LOC)

**Architecture**:
```
Client Requests
    ↓
[API Gateway]
├── Authentication (OAuth, API keys)
├── Rate Limiting (per user, per agent)
├── Logging (structured logs)
├── Metrics (Prometheus)
├── Request Routing
│   ├── /api/executive/* → Executive Agent
│   ├── /api/developer/* → Developer Agent
│   ├── /api/infrastructure/* → Infra Agent
│   ├── /api/knowledge-graph/* → KG Service
│   ├── /api/second-brain/* → Sync Engine
│   └── /api/edge/* → Edge Appliance
├── Response Formatting
├── Error Handling
└── Cache (Redis)
```

**Files to Create**:
- `packages/api-gateway/src/Gateway.ts` — Main gateway
- `packages/api-gateway/src/auth/AuthMiddleware.ts` — Authentication
- `packages/api-gateway/src/routing/RouteHandler.ts` — Route requests
- `packages/api-gateway/src/ratelimit/RateLimiter.ts` — Rate limiting
- `packages/api-gateway/src/cache/ResponseCache.ts` — Caching
- `packages/api-gateway/src/logging/RequestLogger.ts` — Logging
- `packages/api-gateway/src/metrics/MetricsCollector.ts` — Metrics

#### 2. Voice Assistant Service (500+ LOC)

**Features**:
- Wake-word detection (on Raspberry Pi)
- Speech-to-text (local or cloud)
- Agent interaction (voice input → agent → response)
- Text-to-speech (natural voice)
- Multi-language support
- Hands-free operation

**Files to Create**:
- `services/voice-assistant/src/VoiceProcessor.ts` — Audio processing
- `services/voice-assistant/src/STT.ts` — Speech-to-text
- `services/voice-assistant/src/TTS.ts` — Text-to-speech
- `services/voice-assistant/src/VoiceAgent.ts` — Voice-specific agent
- `services/voice-assistant/src/WakeWord.ts` — Wake-word detection

#### 3. WISE² Core Dashboard v2 (800+ LOC)

**Enhancements to Phase 6 Dashboard**:
- **Agent Status Panel** — Which agents are running
- **Knowledge Graph Visualization** — Entity relationships
- **Sync Status** — Device sync status
- **Edge Device Management** — Raspberry Pi control
- **Automation Builder** — Visual workflow builder
- **Memory Browser** — Browse user/agent memory
- **Prompt Management** — PromptOS interface

**Files to Create**:
- `apps/command-center/src/components/AgentStatus.tsx`
- `apps/command-center/src/components/KnowledgeGraphViz.tsx`
- `apps/command-center/src/components/SyncStatus.tsx`
- `apps/command-center/src/components/EdgeDevices.tsx`
- `apps/command-center/src/components/AutomationBuilder.tsx`
- `apps/command-center/src/components/MemoryBrowser.tsx`
- `apps/command-center/src/components/PromptManager.tsx`

#### 4. Full System Integration & Testing (1,000+ LOC)

**Integration Points**:
- PromptOS ↔ Agent Framework
- Agent Framework ↔ Executive Agent
- Executive Agent ↔ Specialist Agents
- Second Brain ↔ Knowledge Graph
- Knowledge Graph ↔ Search
- Cross-Device Sync ↔ All Services
- Raspberry Pi ↔ Cloud
- Voice Assistant ↔ Agent Framework
- Dashboard ↔ All Services

**Files to Create**:
- `services/integration-tests/` — Full system tests
- `docs/ARCHITECTURE.md` — System architecture
- `docs/INTEGRATION_GUIDE.md` — Integration patterns
- `docs/DEPLOYMENT.md` — Deployment procedures
- `docs/API_REFERENCE.md` — API documentation

---

## WISE² Core v1.0 Feature Matrix

| Component | Phase 7 | Phase 8 | Phase 9 | Phase 10 |
|-----------|---------|---------|---------|----------|
| PromptOS | ✅ Build | ✅ Expand | ✅ Use | ✅ Refine |
| Agent Framework | ✅ Build | ✅ Expand | ✅ Edge | ✅ Integrate |
| Executive Agent | ✅ Build | ✅ Expand | ✅ Edge | ✅ Optimize |
| Knowledge Graph | — | ✅ Build | ✅ Use | ✅ Integrate |
| Second Brain Bridge | — | ✅ Build | ✅ Sync | ✅ Refine |
| Cross-Device Sync | — | — | ✅ Build | ✅ Integrate |
| Raspberry Pi Edge | — | — | ✅ Build | ✅ Integrate |
| API Gateway | — | — | — | ✅ Build |
| Voice Assistant | — | — | — | ✅ Build |
| Dashboard v2 | — | — | — | ✅ Build |
| Integration Testing | — | — | — | ✅ Build |

---

## Summary: WISE² Core v1.0 Roadmap

| Phase | Timeline | Focus | LOC | Status |
|-------|----------|-------|-----|--------|
| **7** | Weeks 8-9 | PromptOS, Agent Framework | 1,600+ | Next |
| **8** | Weeks 9-11 | Knowledge Graph, Second Brain Bridge | 1,400+ | Follows |
| **9** | Weeks 11-13 | Raspberry Pi, Cross-Device Sync | 2,000+ | Parallel |
| **10** | Weeks 13-16 | API Gateway, Voice, Integration | 3,700+ | Final |
| **TOTAL** | 8 weeks | **WISE² Core v1.0** | **8,700+** | 🚀 |

---

## Success Criteria

✅ **PromptOS** — Modular prompt system replacing hardcoded agent routing  
✅ **Agent Framework** — Extensible agents using PromptOS  
✅ **Executive Agent** — Business reasoning and agent coordination  
✅ **Knowledge Graph** — Semantic relationships and recommendations  
✅ **Second Brain** — Full vault with graph integration  
✅ **Raspberry Pi** — Full WISE² on edge device with local inference  
✅ **Cross-Device Sync** — Seamless experience across all devices  
✅ **API Gateway** — Unified, secure access to all services  
✅ **Voice Assistant** — Natural language interaction  
✅ **Dashboard v2** — Comprehensive system monitoring and control  
✅ **Full Integration** — All components working together  
✅ **Documentation** — Complete architecture and deployment guides  
✅ **Tests** — Comprehensive integration tests  

**Deliverable**: **WISE² Core v1.0** — Production-ready AI-native operating system

---

*Phase 7-10 builds the foundation for WISE² to become a true multi-platform, AI-native business operating system.*
