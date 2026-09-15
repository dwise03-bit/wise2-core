# WISE² Bridge, Tailscale, GitHub Sync, and GREEN Deploy Gate Design

**Date:** 2026-09-14
**Status:** Approved / Locked
**Canonical repository:** `dwise03-bit/wise2-core`

## Objective

Create a unified WISE² control plane that connects Daniel's Mac, Darrin's computer, the WISE² VPS, GitHub, ChatGPT-facing automation, Hermes/local AI services, and deployment state through a private Tailscale-based network and a single authenticated bridge. The system must keep development state visible, color-coded, auditable, synchronized, and safe for production use.

## Approved Access Model

- Daniel retains full administrative access.
- Darrin GitHub username: `wisevillain86`.
- Darrin receives full operational access to the canonical WISE² repositories and the approved Tailscale/admin fabric.
- Full access does not bypass production controls.
- Production deployment is blocked unless the GREEN sync gate passes.
- No developer may silently overwrite another developer's uncommitted work.

## Canonical Repository Set

Initial first-class repositories:

- `dwise03-bit/wise2-core`
- `dwise03-bit/wise2.net`
- `dwise03-bit/wise2-dashboard`
- `dwise03-bit/Wise2-hardware`

Other WISE²-related repositories must be classified as active, transitional, or legacy before they are included in automated synchronization.

`wise2-core` is the control-plane repository for this bridge/sync subsystem. Do not create another top-level repository for the same responsibility.

## Architecture

### Nodes

- Daniel MacBook Pro
- Darrin development computer
- WISE² production VPS
- Optional GPU/local-AI nodes
- GitHub as the canonical code-state source
- WISE² Command Center as the human-visible state surface

### Private Transport

Tailscale is the default private network transport between trusted WISE² nodes.

Internal administrative services should prefer:

1. localhost binding,
2. Tailscale-only binding,
3. reverse-proxied authenticated access when remote browser access is required.

Direct public exposure is reserved only for intentionally public web services.

### WISE² Bridge

A single authenticated WISE² bridge provides controlled access from ChatGPT/Hermes/automation to approved operational functions.

The bridge must not expose raw Docker sockets, Redis, PostgreSQL, Ollama, SSH credentials, secrets, or arbitrary shell execution directly to public clients.

The bridge is responsible for:

- node health reporting,
- Git repository status collection,
- deployment-state reporting,
- approved operational commands,
- Tailscale reachability checks,
- audit logging,
- GREEN gate evaluation,
- Command Center status feeds.

Recommended location inside `wise2-core`:

`ops/wise2-bridge/`

## Color-Coded State Model

### GREEN — deploy allowed

All required sync, health, CI, repository, and network checks pass.

### BLUE — active work

A node or repository has intentional in-progress development activity that is not yet ready to deploy.

### YELLOW — unsynced

Examples:

- local uncommitted changes,
- branch ahead/behind remote,
- deployment SHA differs from the release candidate,
- required node has stale state.

### PURPLE — review

A pull request, review, approval, or release-validation step is active.

### RED — blocked / unhealthy

Examples:

- merge conflict,
- failed test or CI,
- failed required service,
- broken Tailscale reachability,
- unauthorized port exposure,
- deployment mismatch,
- production health failure.

### GRAY — legacy / archived

The repository, service, or node is intentionally excluded from active synchronization.

## Node State Contract

Every participating node reports at minimum:

- node ID and human-readable name,
- node role,
- Tailscale identity/IP,
- online/offline state,
- repository path,
- repository name,
- current branch,
- HEAD commit SHA,
- upstream commit SHA,
- dirty/clean working-tree state,
- ahead/behind counts,
- active developer/owner when known,
- running service/container health,
- deployment SHA when applicable,
- last successful health check,
- last successful sync check,
- port exposure summary,
- aggregate color state.

## GitHub Source-of-Truth Rules

GitHub is the canonical code-state source. Local machines and VPS checkouts are working/deployment nodes, not competing sources of truth.

Rules:

- production releases point to an exact Git commit SHA,
- deployed SHA must be visible in Command Center,
- local dirty work is never automatically discarded,
- force-push or destructive resets are not part of normal synchronization,
- conflicts move the affected repo/node to RED,
- active review moves it to PURPLE,
- ahead/behind or dirty states move it to YELLOW unless explicitly classified as BLUE active work.

## GREEN Production Deployment Gate

Production deployment is prohibited unless all required checks pass.

Required checks:

1. Intended release branch and commit exist on GitHub.
2. Required CI/tests for the release commit pass.
3. Daniel's production-relevant checkout has no unresolved production-impacting divergence.
4. Darrin's production-relevant checkout has no unresolved production-impacting divergence.
5. No unresolved merge conflicts exist in required repositories.
6. VPS deployment target is reachable.
7. Tailscale private connectivity for required nodes is healthy.
8. Required production containers/services are in an approved pre-deploy state.
9. Port exposure matches the approved port policy.
10. Release candidate SHA is recorded before deployment.
11. Post-deploy VPS SHA matches the approved release SHA.
12. Post-deploy health checks pass.

Any failed required check blocks deployment and returns the blocking node, repository, service, or network condition.

There is no manual bypass in the normal deploy path. Any future emergency-break-glass path must be separately designed, authenticated, logged, and approved.

## GitHub Collaboration Model

Darrin (`wisevillain86`) receives the repository access needed for full WISE² development and operations.

Production safety comes from the GREEN gate, review state, audit trail, and branch/deployment controls rather than from withholding ordinary development access.

Current observed access at design time:

- `wise2-core`: write
- `wise2.net`: none
- `wise2-dashboard`: none
- `Wise2-hardware`: read

These permissions must be normalized during implementation to the approved operating model using the safest permission level that still supports full operational duties.

## Port Cleanup Policy

Port cleanup follows:

**INVENTORY → MAP OWNER → CLASSIFY → CHANGE → TEST → VERIFY**

Never close or rebind a production port solely because it appears unfamiliar.

Each listener must be mapped to:

- process,
- container/service,
- bind address,
- owning WISE² component,
- dependency,
- intended audience,
- public/private classification.

Preferred policy:

- PostgreSQL: localhost/Tailscale only unless explicitly required otherwise.
- Redis: localhost/private network only.
- Ollama/local model servers: localhost/Tailscale only.
- Docker Engine API/socket: never publicly exposed.
- SSH: restricted to approved admin paths; Tailscale preferred.
- internal dashboards/admin panels: Tailscale or authenticated reverse proxy.
- Traefik/public web ingress: expose only deliberate public HTTP/HTTPS entry points.
- development servers: not publicly exposed by default.

Before any firewall or binding change, capture the current listener state and rollback path.

## Security and Secrets

- No API keys, passwords, tokens, Tailscale auth keys, SSH private keys, or credentials in Git.
- No secrets in custom GPT instructions.
- Bridge authentication material must be stored in approved environment/secret storage.
- Commands must be attributable to an authenticated operator or automation identity.
- Administrative events must be logged.
- Public web endpoints must not become generic proxies to private services.

## Audit Trail

The system records important operational events including:

- sync-state changes,
- deploy attempts,
- GREEN gate results,
- blocked deployments,
- successful deployments,
- release SHAs,
- operator identity,
- repository/branch,
- node health transitions,
- port-policy violations,
- administrative bridge actions.

Audit events should be consumable by WISE² Command Center and Discord alerting without making either system the source of truth.

## Command Center Presentation

Command Center should provide one synchronized view of:

- Daniel Mac status,
- Darrin PC status,
- VPS status,
- optional GPU/edge nodes,
- GitHub repository state,
- active branch/SHA,
- working-tree cleanliness,
- ahead/behind state,
- deploy status,
- CI/test status,
- Tailscale health,
- service health,
- port-policy status,
- aggregate color state.

The UI must make the exact reason for YELLOW or RED visible without requiring terminal access.

## Failure Handling

- Node offline: mark affected checks unavailable and block production if the node is required by policy.
- GitHub unavailable: block release-changing production deploys; do not guess repository state.
- Dirty working tree: preserve files, mark YELLOW/BLUE, never auto-reset.
- Merge conflict: mark RED and require explicit resolution.
- Tailscale failure: mark RED when private connectivity is required.
- CI failure: mark RED and block deploy.
- Port-policy drift: mark RED for critical exposure, YELLOW for non-critical reviewable drift.
- Post-deploy health failure: mark RED and expose rollback information immediately.

## Rollback Requirements

Every production deployment must preserve:

- previous known-good deployment SHA,
- new release SHA,
- deployment timestamp,
- operator,
- health result.

Rollback must deploy the previous known-good immutable commit/image rather than reconstructing state from a developer workstation.

## Testing Strategy

Implementation must include automated coverage for:

- color-state evaluation,
- dirty/ahead/behind repository classification,
- GREEN gate pass/fail behavior,
- individual blocker reporting,
- node-offline handling,
- GitHub mismatch handling,
- deployment-SHA mismatch handling,
- port-policy evaluation,
- audit-event generation,
- authorization boundaries for bridge actions.

Integration testing must cover at least one Mac/dev node, one second developer node, GitHub, Tailscale reachability, and the VPS deployment target before production rollout.

## Rollout Order

1. Inventory existing repos, nodes, listeners, and deployment flows.
2. Classify canonical vs legacy repositories.
3. Normalize GitHub permissions.
4. Establish/verify Tailscale node membership and identities.
5. Build read-only node/repo state collection.
6. Add color-state computation.
7. Add Command Center visibility.
8. Add GREEN gate in non-enforcing/report-only mode.
9. Validate against current production workflow.
10. Enforce GREEN gate for production deploys.
11. Perform controlled port cleanup with rollback protection.
12. Enable authenticated bridge actions and audit logging.

## Definition of Done

The architecture is complete when:

- Daniel and Darrin can both work across the approved WISE² repositories and nodes.
- GitHub is the canonical code-state source.
- Mac, Darrin PC, VPS, and approved nodes report synchronized state.
- Command Center displays accurate color-coded status.
- Production deploys cannot proceed unless the GREEN gate passes.
- The exact release SHA is visible before and after deployment.
- No developer's uncommitted work is overwritten by synchronization.
- Internal services are not unnecessarily exposed to the public Internet.
- Port ownership and exposure are documented and verified.
- ChatGPT/Hermes automation uses the authenticated bridge rather than direct unsafe service exposure.
- Operational actions and deployment decisions are auditable.
- Rollback to the previous known-good release is tested and documented.
