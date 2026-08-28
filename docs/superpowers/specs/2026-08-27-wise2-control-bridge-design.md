# WISE² Control Bridge Design

Date: 2026-08-27
Status: Approved architecture, implementation pending
Owner: WISE²
Repository: dwise03-bit/wise2-core

## Purpose

Create a secure WISE² Control Bridge that lets ChatGPT act as an operator console for the single WISE² VPS/GPU host. The bridge exposes a small allowlisted API for status, health, logs, deploy, restart, rollback, Git, Docker, Ollama/Hermes, and host resource checks without exposing an unrestricted remote shell.

## Current Environment

The production VPS and gpu-nmls are the same host. Existing infrastructure already includes:

- Docker Compose production deployment.
- GitHub Actions CI/CD with SSH-based production deployment.
- Local deployment scripts.
- Comprehensive health checks for system resources, containers, endpoints, PostgreSQL, Redis, backups, logs, and container resource use.
- Ollama/Hermes services and WISE² application workloads.
- Tailscale networking in the wider WISE² deployment history.

The new bridge must reuse these capabilities instead of replacing them.

## Goals

1. Make ChatGPT a usable WISE² command surface.
2. Keep the server reachable through one authenticated HTTPS API.
3. Run commands locally on the host because the VPS and GPU server are the same machine.
4. Restrict all actions to an explicit allowlist.
5. Require confirmation for destructive or high-impact actions.
6. Record every control action in an audit log.
7. Return structured JSON so ChatGPT, the iOS Command Center, and future clients can use the same API.
8. Preserve GitHub Actions as the canonical CI/CD path for normal code deployment.

## Non-Goals

- No arbitrary shell endpoint.
- No root shell exposure.
- No database wipe, firewall reset, secret retrieval, or credential dumping through the API.
- No replacement of GitHub Actions with ad-hoc deployment logic.
- No second controller host.

## Architecture

ChatGPT / WISE² iOS Command Center
        |
        | HTTPS + bearer token / signed request
        v
WISE² Control Bridge
        |
        +-- Host adapter
        |     CPU, RAM, disk, GPU, uptime
        |
        +-- Docker adapter
        |     ps, stats, logs, restart, health
        |
        +-- Deploy adapter
        |     GitHub Actions trigger/status, local verification, rollback metadata
        |
        +-- Git adapter
        |     read-only status, branch, commit, dirty-state checks
        |
        +-- AI adapter
        |     Ollama status/models, Hermes health
        |
        +-- Web adapter
        |     wise2.net and internal service health
        |
        +-- Audit adapter
              actor, action, target, result, timestamp, request id

The bridge runs on the same VPS/GPU host as the WISE² services and talks to local Docker/system services directly.

## Service Location

Recommended path:

- `services/control-bridge/`

Recommended runtime:

- Node.js + TypeScript using the repo's existing backend conventions.
- Runs as an isolated Docker service with only the minimum host access it needs.

Alternative frameworks are acceptable only if they materially reduce implementation complexity while keeping the same security boundaries.

## Authentication

Phase 1 authentication:

- HTTPS only.
- Long random bearer token stored only in server environment/secrets.
- Constant-time token comparison.
- Request ID on every request.
- Rate limiting.
- Optional source restriction to Tailscale/private ingress where practical.

Phase 2 authentication:

- Signed short-lived requests or JWT with scopes.
- Separate identities for ChatGPT, iOS Command Center, and human operator.

Secrets must never be returned by the API or written to normal logs.

## Authorization Model

Three action classes:

### Read-only

Can execute immediately:

- status
- health
- host metrics
- docker list/stats
- service logs with capped line count
- git status/branch/commit
- ollama status/models
- hermes status
- wise2.net health

### Controlled write

Allowed, audited, and target-validated:

- restart an allowlisted service
- deploy an allowlisted application
- rollback an allowlisted application
- pull/reconcile an approved deployment ref through the deployment workflow

### Destructive / denied by default

Not exposed in v1:

- arbitrary shell
- rm/delete filesystem paths
- docker system prune
- delete containers/volumes
- database reset/drop
- firewall mutation
- SSH key mutation
- secret reads
- reboot/shutdown

Future destructive actions require explicit design review and a second confirmation mechanism.

## API Surface v1

### Core

- `GET /v1/control/health`
- `GET /v1/control/status`
- `GET /v1/control/audit?limit=N`

### Host

- `GET /v1/control/host/metrics`
- `GET /v1/control/host/gpu`

### Docker

- `GET /v1/control/docker/services`
- `GET /v1/control/docker/stats`
- `GET /v1/control/docker/:service/logs?lines=200`
- `POST /v1/control/docker/:service/restart`

### Git

- `GET /v1/control/git/status`
- `GET /v1/control/git/revision`

No arbitrary git command endpoint.

### Deployment

- `POST /v1/control/deploy/:app`
- `GET /v1/control/deploy/:deploymentId`
- `POST /v1/control/rollback/:app`

Deployment must use the existing approved deployment pipeline where practical. Local scripts are used for verification and emergency recovery only.

### AI

- `GET /v1/control/ollama/status`
- `GET /v1/control/ollama/models`
- `GET /v1/control/hermes/status`

### Web Health

- `GET /v1/control/web/wise2`

This should test public wise2.net plus selected internal service endpoints.

## Service Allowlist

The bridge must maintain a configured set of service names. Requests for anything outside the set return 404/403 and are never interpolated into a shell command.

Initial candidates should be derived from the active production compose file rather than hardcoded from stale documentation.

## Command Execution Rules

1. Prefer direct process APIs/libraries where available.
2. If a system command is required, use fixed binaries plus prevalidated arguments.
3. Never invoke `sh -c` with user-controlled text.
4. Never pass arbitrary command fragments from request bodies.
5. Apply strict timeouts and maximum output sizes.
6. Redact environment values and known secret patterns.
7. Return machine-readable exit status and a bounded human-readable summary.

## Deployment Strategy

Normal deployment remains GitHub-driven:

1. Code change reaches approved branch.
2. GitHub Actions runs tests/build.
3. Existing SSH deploy workflow updates the production host.
4. Control Bridge can report workflow/deployment status and perform post-deploy health verification.

For a ChatGPT command such as `deploy HVAC`, the bridge should either trigger the approved GitHub workflow through an authenticated integration or execute a narrowly scoped pre-approved deployment wrapper. Direct arbitrary `git pull && docker compose up` from user text is not permitted.

## Rollback Strategy

Each deployment records:

- app
- previous git revision/image tag
- target revision/image tag
- timestamp
- health result

Rollback restores only an allowlisted app to its recorded prior known-good revision/image and reruns health checks.

No database rollback is performed automatically in v1.

## Existing Script Normalization

The current repository has deployment and health scripts that use different Compose filenames and still contain same-host SSH assumptions. Implementation should:

- select one canonical production Compose file;
- expose that path through one configuration value;
- remove same-host SSH from local health execution;
- preserve remote SSH deployment only where GitHub Actions needs it;
- convert health results into structured JSON for the bridge;
- retain human-friendly CLI wrappers for manual use.

## Error Handling

Every API response includes:

- `ok`
- `requestId`
- `action`
- `target` when relevant
- `timestamp`
- `data` on success
- `error.code`, `error.message`, and safe diagnostic detail on failure

Command timeouts, missing services, Docker failures, unavailable Ollama/Hermes, and failed health probes must be distinguishable.

Secrets, raw environment dumps, and unbounded command output are never returned.

## Audit Logging

Audit records should include:

- request ID
- authenticated actor
- source
- action
- target
- start/end timestamp
- success/failure
- exit code when applicable
- confirmation marker for controlled writes

Do not record bearer tokens, secret headers, environment values, or full sensitive logs.

Initial storage can be append-only JSONL with rotation. The design should allow moving to PostgreSQL later.

## Confirmation Behavior

ChatGPT-side UX:

- Read-only actions: execute directly.
- Controlled writes such as restart/deploy/rollback: execute when the user clearly requested that action.
- Destructive actions not in v1: refuse at the bridge level even if requested.

The API should support an optional confirmation nonce for future high-risk actions, but v1 does not expose destructive operations.

## Chat Command Mapping

Examples:

- `WISE² status` -> aggregate `/status`, host, Docker, web and AI health.
- `check wise2.net` -> `/web/wise2`.
- `show API logs` -> `/docker/api/logs`.
- `restart HVAC` -> validated service restart.
- `deploy HVAC` -> deployment adapter + health verification.
- `rollback HVAC` -> last known-good app rollback + health verification.
- `show GPU` -> `/host/gpu`.
- `what models are loaded` -> `/ollama/models`.

The same API is intended for the existing WISE² iOS Command Center so ChatGPT and the native app share one backend contract.

## Observability

Expose Prometheus-compatible metrics or structured internal metrics for:

- requests by action/status
- execution latency
- deployment results
- restart count
- failed auth attempts
- rate-limit events

Bridge health should not depend on optional services such as Ollama being healthy; dependencies are reported separately.

## Testing

Required automated tests:

1. Authentication success/failure.
2. Service allowlist enforcement.
3. Command argument injection attempts.
4. Output truncation/redaction.
5. Docker status parsing.
6. Restart success/failure.
7. Health aggregation.
8. Ollama/Hermes unavailable cases.
9. Deployment adapter mocked success/failure.
10. Rollback metadata correctness.
11. Audit entry generation.
12. Rate limiting.

Integration tests must run against mocks or disposable containers, not production services.

## Production Verification

After deployment:

1. Verify bridge health locally.
2. Verify authenticated access through the chosen HTTPS/Tailscale ingress.
3. Verify unauthenticated requests return 401.
4. Verify unknown service names cannot execute commands.
5. Verify status/health/log endpoints.
6. Perform one controlled restart of a noncritical test service.
7. Verify audit record.
8. Verify wise2.net remains healthy.
9. Verify secrets are absent from responses/logs.

## Security Boundary

The Control Bridge is intentionally not a shell proxy. Its security comes from reducing remote control to explicit, testable operations. Even if a client is compromised, the API surface should prevent arbitrary command execution and secret extraction.

## Implementation Sequence

1. Normalize production Compose/service discovery.
2. Create control-bridge service and config schema.
3. Add authentication, rate limiting, request IDs, audit logging.
4. Add read-only host/Docker/Git/AI/web adapters.
5. Add validated restart action.
6. Add deployment status/trigger adapter.
7. Add rollback metadata and action.
8. Add Docker/runtime packaging.
9. Add HTTPS/Tailscale ingress configuration.
10. Wire iOS/ChatGPT clients to the same contract.
11. Run full security and production verification.

## Success Criteria

The feature is complete when the user can issue a natural-language WISE² command from ChatGPT, the corresponding allowlisted action can be executed through the bridge, the result returns in structured form, every write is audited, no arbitrary shell is exposed, and production health can be verified before and after control actions.
