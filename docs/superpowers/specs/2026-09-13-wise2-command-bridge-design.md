# WISE² Command Bridge — Design Specification

**Status:** Architecture approved; implementation plan pending review  
**Repository:** `dwise03-bit/wise2-core`  
**Design branch:** `docs/wise2-command-bridge-design`

## Objective

Create a local-first command system that turns approved WISE² requests into traceable engineering jobs. The VPS is the secure control plane; the Mac is a Tailscale-connected executor for local models, Xcode, Unity, USB devices, and hardware tooling.

## Scope and non-goals

V1 supports authenticated job intake, approvals, queued execution, isolated Git branches/worktrees, testing, commits, pull requests, executor health, and audit logging.

V1 does not allow direct `main` pushes, automatic production deployments, unaudited shell commands, public Mac exposure, unapproved external messages, or secrets in Git/logs.

## Architecture

```text
WISE² GPT / Discord / future mobile UI
                │ signed structured request
                ▼
      Command API on WISE² VPS (existing Core)
         ├── PostgreSQL: jobs, approvals, audit events
         ├── Redis: queue and executor leases
         ├── policy engine and repository allowlist
         ├── VPS executor: web/API/Docker/Git tasks
         └── Mac executor over Tailscale: iOS/XR/USB/Ollama
                              │
                     isolated branch + tests + PR
```

The VPS is authoritative. The Mac connects outbound over Tailscale/TLS and reports capabilities; it never accepts public inbound command traffic.

## Trust model

- Clients authenticate with scoped service or device credentials.
- Requests use schema validation, timestamps, nonces, idempotency keys, target-repository allowlists, and size/rate limits.
- Natural-language text is converted into a structured plan; it is never executed as raw shell input.
- Executors enroll with short-lived tokens, obtain unique credentials, and use leases so a job runs once.
- GitHub access uses a dedicated WISE² GitHub App or scoped automation credential—not a personal developer token.

## Job lifecycle

```text
DRAFT → AWAITING_APPROVAL → QUEUED → RUNNING → TESTING → PR_READY → COMPLETED
                          ↘ REJECTED / FAILED / CANCELLED / EXPIRED
```

Each job records requester, source, repository, base branch, selected executor, approved plan, sanitized logs, changed files, test results, branch, commit, pull request, and immutable events. Duplicate idempotency keys return the original job.

## Risk policy

| Class | Examples | Delivery |
|---|---|---|
| Read-only | status, code search, diagnostics | audit event only |
| Low-risk | docs, isolated UI, tests | branch, tests, PR |
| Medium-risk | API, schema, configuration | explicit approval, branch, tests, PR |
| High-risk | deploy, secret rotation, destructive migration, external posting | separate execution-time approval; blocked by default |

Default Git policy is always **branch → test → pull request**. Production deployment uses a separate release process. The bridge prepares Discord alerts but does not post a test or external message without Daniel's explicit approval.

## Repository execution

1. Validate the allowlisted repository, base branch, and approved plan.
2. Create a unique `command/<job-id>` branch and isolated worktree.
3. Execute only approved commands in the selected executor.
4. Capture bounded, sanitized logs and artifacts.
5. Run the required tests.
6. Commit only files owned by the job.
7. Open a pull request containing changed files, test outcomes, and rollback notes.
8. Retain audit data; clean the worktree after retention.

The executor rejects dirty source checkouts, unknown remotes, branch collisions, unavailable capabilities, and out-of-policy commands.

## Initial API

```text
POST /api/v1/command-jobs
GET  /api/v1/command-jobs/{id}
POST /api/v1/command-jobs/{id}/approve
POST /api/v1/command-jobs/{id}/cancel
POST /api/v1/executors/enroll
POST /api/v1/executors/{id}/heartbeat
POST /api/v1/executors/{id}/events
GET  /api/v1/executors/{id}/jobs/next
```

All writes require authentication, nonce protection, audit events, and schema-versioned payloads.

## Executor capabilities

The Mac reports real capabilities such as `ios_build`, `android_build`, `unity`, `usb_device_flash`, `ollama_local`, and `git`. Jobs requiring unavailable capabilities remain blocked with a clear reason. Flash jobs additionally require hardware target confirmation and a validated backup where supported.

## AI routing

Routine classification, transformation, and log summarization use existing local WISE² models when available. Cloud reasoning is an escalation path only. Model choice and human approvals are written to the audit record. AI cannot bypass policy, approval, validation, tests, or measured device state.

## Reliability, deployment, and rollback

PostgreSQL is the system of record; Redis supplies queueing and leases. Health endpoints report worker availability, queue latency, executor status, and failures. Logs redact secrets.

Deploy behind `COMMAND_BRIDGE_ENABLED=false`. Verify the API and worker on the VPS, enroll the Mac, and run a documentation-only end-to-end job in a non-production repository. Rollback disables the flag and pauses/cancels queued work without deleting audit records, branches, commits, or pull requests.

## Required verification

- Request authentication, replay rejection, and idempotency
- Repository/branch allowlists and approval gating
- Executor enrollment, heartbeat, lease, offline, cancellation, and retry behavior
- Worktree isolation and dirty-checkout rejection
- Test failure blocks commit/PR
- Successful safe branch → tests → commit → PR in a non-production repository
- Sanitized logs and no secret leakage
- Mac capability reporting and harmless local execution
- Feature-flag rollback

## Definition of done

V1 is complete when an authenticated command creates a structured job; approval gates every change job; the VPS and Mac executors accurately run only allowed work; a safe end-to-end job produces a tested pull request; external posting and deployments remain blocked without separate approval; and audit, health, failure, cancellation, and rollback behavior are verified.
