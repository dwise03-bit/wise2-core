# WISE² Orchestration Design

Date: 2026-09-13
Branch: `wise2-orchestration-v1`

## Goal

Turn the existing WISE² Mac + GPU environment into a coordinated private control fabric over Tailscale, with stable service identities, health-aware routing, agent placement, monitoring, and safe recovery behavior.

The design preserves the current production website/API behavior, keeps stateful services protected, and avoids destructive changes to unrelated work.

## Current Verified Topology

### Mac command node

- Tailscale IPv4: `100.64.72.14`
- Remote Desktop Commander: online
- Git/deployment control
- Claude/Codex/ChatGPT operator workflows
- iOS/Android/XR build tooling
- local AI fallback capability
- SSH alias `gpu-nmls` already reaches the live GPU over Tailscale

### GPU core node

- Hostname: `gpu-nmls`
- Tailscale IPv4: `100.68.145.5`
- Remote Desktop Commander: online
- Tailscale daemon enabled and active
- Persistent Desktop Commander user service enabled
- Existing services include:
  - `wise2-website-prod`
  - `wise2-api`
  - `wise2-db`
  - `wise2-redis`
  - `wise2-control-bridge-prod`
  - `wise2-ai-router-prod`
  - `wise2-admin-backend`
  - `ollama`
  - `uptime-kuma`

## Architecture

WISE² uses three logical layers.

### 1. Command Layer

The Mac is the primary operator node for interactive control, development, mobile builds, source control, deployment, and local fallback execution.

Responsibilities:

- human/operator entry point
- ChatGPT / Remote Commander control
- Claude and Codex workflows
- repository management
- iOS/Android/XR build orchestration
- deployment initiation
- local model fallback

### 2. Core Services Layer

The GPU server is the primary runtime node for persistent backend services and heavy AI workloads.

Responsibilities:

- API
- database
- Redis
- GPU Ollama inference
- AI routing
- control bridge
- admin backend
- production website/dashboard runtime
- monitoring
- background agents and workers

### 3. Private Fabric Layer

Tailscale is the private control network between WISE² nodes.

Operational traffic uses Tailscale where possible:

- SSH
- admin control
- service health checks
- agent coordination
- AI routing
- monitoring
- internal APIs

Public website traffic remains behind the existing production proxy. PostgreSQL, Redis, admin backends, and control endpoints remain private-only.

## Canonical Node and Service Identities

The system will use stable logical names rather than scattered raw IP addresses and ports.

### Nodes

- `wise2-mac` — Mac command node
- `wise2-gpu` — GPU core node

### Services

- `wise2-api` — core API
- `wise2-db` — PostgreSQL
- `wise2-cache` — Redis
- `wise2-ai` — AI routing layer
- `wise2-ollama-gpu` — GPU inference
- `wise2-ollama-mac` — Mac-local inference
- `wise2-control` — control bridge
- `wise2-admin` — admin backend
- `wise2-web` — production web runtime
- `wise2-monitor` — monitoring/health service

The service registry records:

- logical name
- owning node
- private endpoint
- local endpoint
- health probe
- role
- routing priority
- allowed exposure level
- fallback target where safe
- last known health state

## Routing Modes

WISE² supports five explicit routing modes.

### AUTO

Choose the highest-priority healthy backend for the workload.

Expected behavior:

- quick local edits may prefer Mac-local AI
- coding/heavier inference prefers GPU
- GPU failure allows Mac fallback when the task is compatible
- cloud fallback is allowed only when configured and permitted

### GPU

Force GPU-backed services/models. If the GPU path is unavailable, return a degraded-state error rather than silently switching.

### LOCAL-MAC

Force Mac-local tools/models.

### CLOUD

Force configured hosted providers.

### SAFE

Use only backends currently passing all required health checks.

## AI Routing Policy

The AI router will treat execution targets as capabilities rather than hard-coded model endpoints.

Initial policy:

- lightweight edits and quick assistance: Mac-local first when healthy
- coding and heavier reasoning: GPU first
- vision / GPU-heavy inference: GPU first
- GPU unavailable: Mac fallback when capability exists
- Mac and GPU unavailable: cloud only if the route explicitly permits cloud
- no healthy backend: fail closed with a clear degraded-state response

The router must never silently route a task to an unauthorized cloud provider.

## Stateful Service Policy

PostgreSQL and Redis remain single-primary in the initial orchestration release.

The system must not implement fake high availability or split-brain-prone automatic failover.

Rules:

- never auto-reinitialize PostgreSQL
- never delete or recreate production database volumes as a recovery action
- never promote an unverified replica
- Redis may be restarted if the existing deployment already treats it as safely restartable, but data-destructive actions are prohibited
- database outage raises a critical alert and blocks dependent workflows safely

## Stateless Recovery Policy

Stateless services may use bounded automatic recovery.

Eligible actions:

- health retry
- controlled service restart
- retry failed jobs with limits
- move compatible AI work between GPU, Mac, and approved cloud routes
- mark services `DEGRADED` or `OFFLINE`
- notify operators on state transitions

Automatic recovery must use backoff and maximum-attempt limits to avoid restart loops.

## Health Model

Every node and service receives one of these states:

- `ONLINE`
- `BUSY`
- `DEGRADED`
- `OFFLINE`

Health checks include, where applicable:

- Tailscale reachability
- node heartbeat
- TCP port probe
- HTTP `/health` probe
- AI model readiness probe
- PostgreSQL connection check
- Redis ping
- Remote Desktop Commander reachability
- disk capacity
- memory pressure
- GPU availability

Health transitions are timestamped and exposed to the command center.

## Agent Model

Agents are registered as workloads with explicit placement and permissions.

Agent classes:

- operator agents: ChatGPT, Claude, Codex, Hermes
- build agents: iOS, Android, web, XR
- AI workers: coding, vision, transcription, embeddings, 3D
- business agents: CRM, phone, Discord, intake, audit, onboarding
- infrastructure agents: monitoring, backup, deploy, recovery

Each agent reports:

- identity
- current node
- status
- current task
- model/backend
- last heartbeat
- dependencies
- allowed actions
- preferred execution target
- fallback target

## Command Center

The WISE² dashboard becomes the canonical operational view.

It must expose:

- Mac and GPU health
- Tailscale connectivity
- CPU, GPU, memory, and disk utilization
- Docker/systemd service health
- API status
- PostgreSQL status
- Redis status
- AI router status
- model availability
- Remote Commander status
- deployment revision
- active agents
- queued jobs
- alert state
- failover/degraded state

The `wise2-status` CLI presents the same core information in a concise terminal view.

## Alerts

Alert severities:

- `INFO` — deployments and normal state transitions
- `WARN` — stale heartbeat, model unavailable, elevated resource use, partial degradation
- `CRITICAL` — API outage, database unreachable, storage critical, both local AI nodes unavailable

Alert handling rules:

- suppress repeated identical alerts during the same incident
- emit a recovery event when the service returns healthy
- keep incident timestamps for later review
- Discord is the first external notification target

## Deployment Safety

Canonical deployment flow:

1. isolated worktree or clean feature branch
2. tests
3. type checks/lint where applicable
4. build
5. pre-deploy health snapshot
6. deploy only affected services
7. post-deploy health checks
8. mark healthy only after verification

If verification fails:

1. stop the rollout
2. roll back the affected stateless service to the recorded prior revision
3. preserve logs and failure artifacts
4. emit an alert
5. do not modify unrelated services

The orchestration layer must never force-push Git or automatically deploy a failed build.

## SSH and Tailscale Normalization

The Mac SSH configuration currently contains duplicate `wise2-vps` definitions and legacy naming.

Implementation will normalize these to canonical entries while preserving existing access.

Target aliases:

- `wise2-gpu` -> live GPU over Tailscale
- `wise2-mac` -> Mac command node where needed for reverse control
- legacy aliases may remain temporarily as compatibility shims

The stale historical Tailscale device record named `gpu-nmls` will not be deleted automatically unless the active-node identity is first verified. The live node is the Tailscale device currently reachable at `100.68.145.5`.

## Data Flow

Primary control flow:

`Operator -> Mac Command Node -> Tailscale -> GPU Core Node -> WISE² Service`

AI flow in AUTO mode:

`Task -> AI Router -> capability/health evaluation -> GPU or Mac -> optional approved cloud fallback`

Monitoring flow:

`Node/service probes -> health registry -> command center -> alert engine -> Discord`

Deployment flow:

`Git -> isolated build/test -> deploy controller -> affected service -> health verification -> healthy/rollback`

## Security Boundaries

- Tailscale is the preferred private transport for operator and service control traffic.
- PostgreSQL and Redis stay loopback/private only.
- Admin/control services stay private unless a documented reverse proxy route is explicitly required.
- Public web routes continue through existing production ingress.
- Secrets remain outside the service registry and are never written into status output.
- Agent permissions are explicit; infrastructure-destructive operations are not granted by default.

## Failure Handling

### Tailscale failure

- mark private path degraded
- do not open sensitive services publicly as a fallback
- retain local-node operations
- alert operator

### GPU failure

- mark GPU workloads unavailable
- route compatible AI jobs to Mac
- keep stateful service failure visible and fail closed where dependencies are required

### Mac failure

- GPU production runtime remains independent
- monitoring and persistent GPU services continue
- interactive control is unavailable until another authorized operator path is used

### Database failure

- block dependent writes
- do not auto-reinitialize
- issue critical alert
- preserve logs and storage state

### AI model failure

- mark that capability degraded
- reroute only if a permitted backend provides the same required capability

## Implementation Phases

### Phase 1 — Network and identity normalization

- clean duplicate SSH entries
- standardize canonical node aliases
- confirm live Tailscale identities
- preserve compatibility aliases

### Phase 2 — Service registry and health

- define registry format
- register current services
- add health probes
- expose unified health state

### Phase 3 — Routing and failover

- add AUTO/GPU/LOCAL-MAC/CLOUD/SAFE route policy
- add bounded AI failover
- add safe stateless-service recovery

### Phase 4 — Agent registration and placement

- register operator/build/AI/business/infrastructure agents
- expose heartbeat, task, node, and dependency state

### Phase 5 — Command Center and CLI

- wire dashboard health panels
- upgrade `wise2-status`
- expose active alerts and degraded states

### Phase 6 — Alerts and deployment integration

- Discord incident notifications
- recovery notifications
- deployment pre/post checks
- rollback orchestration for eligible stateless services

## Testing and Verification

Implementation is not complete until all of the following are verified with fresh evidence:

- Mac -> GPU Tailscale connectivity
- GPU -> Mac Tailscale connectivity
- SSH using canonical aliases
- Remote Commander on both nodes
- API health
- PostgreSQL connectivity from authorized service context
- Redis ping from authorized service context
- AI router health
- GPU Ollama model readiness
- Mac fallback route
- routing-mode behavior
- service-registry correctness
- command-center state matches actual service state
- alert creation and recovery behavior
- stateless restart policy works without loops
- public production routes still work
- protected/private services remain non-public

## Non-Goals for This Release

- automatic PostgreSQL primary election
- multi-primary database architecture
- destructive self-healing
- automatic public exposure of private services
- broad unrelated repository refactors

## Success Criteria

WISE² orchestration is successful when:

1. Mac and GPU are represented as stable canonical nodes.
2. Core WISE² services are discoverable through one registry.
3. Health state is visible in one CLI/dashboard view.
4. AI workloads route according to explicit policy and health.
5. Safe stateless recovery works automatically.
6. Stateful failures fail closed and alert operators.
7. Remote control remains available through Tailscale and Desktop Commander.
8. Production web/API behavior remains intact.
9. Operators can identify degraded services, active agents, current route decisions, and deployment state without manually checking each host.
