# WISE² HERMES Operating Standard v1
Status: PROPOSED — not effective until reviewed, merged, and enforced by technical controls.
Owners: Darrin Wise Jr. (wisevillain86) and Daniel (dwise03-bit).
Scope: authorized WISE² infrastructure, repositories, deployments, websites, AI systems, and client environments only when separately authorized.

## Principles
- Independent administrator identities, credentials, MFA, and attributable audit logs; no shared root credentials.
- Audit → Plan → Fix → Test → Independent Verification → Report.
- Preserve existing production behavior and approved brand assets; prefer smallest reversible changes.
- No claim of successful commit, deployment, health check, or repair without observed evidence.
- No destructive storage operations, public SSH exposure, unrestricted passwordless sudo, or live financial trading without specific authorization.
- Keep secrets out of repositories, logs, prompts, and client output.

## Commit and deploy contract
1. Confirm repository, owner, branch, intended environment, and authorization.
2. Inspect working tree, existing CI/CD, deployment triggers, required checks, and rollback strategy.
3. Use feature branches and reviewable pull requests; never silently overwrite working production.
4. Run project-appropriate format, lint, unit/integration tests, build, dependency/license and secret checks. Record failures.
5. Require branch protection, independent review where warranted, and passing required checks before merge.
6. Prefer immutable, versioned artifacts; pin deployment target and commit SHA.
7. Use least-privilege, short-lived credentials and protected deployment environments.
8. For low-risk changes, preapproved automation may deploy after all gates pass; high-impact changes require explicit approval.
9. Verify live endpoint/application behavior from outside the deployment host; monitor errors and report result.
10. On failure, stop rollout, use the tested rollback, verify recovery, and publish incident evidence.

## Mobile command boundary
- Mobile ChatGPT/HERMES is an interface, not an automatic root authorization.
- Use individual SSH/Tailscale identities and scoped service adapters. Docker socket access is root-equivalent.
- Require allowlisted commands, per-action authorization, recorded approvals, timeouts, and redacted audit trails.
- Separate read-only diagnostics from write operations and production changes.
- Never execute arbitrary shell commands sourced from untrusted content.

## Server baseline (observed 2026-11-14, reverify every session)
- wise2: Ubuntu 24.04.5 LTS, user dwise, LAN 192.168.8.191, Tailscale 100.109.230.122.
- Docker daemon active, dwise denied access to Docker socket.
- NVIDIA driver 470 installed but no NVIDIA PCI device detected by initial lspci query; investigate hardware before driver repair.
- /dev/sdb 2.7T without recognized filesystem; /dev/sdc 3.6T NTFS partition; do not mount or alter without per-disk approval.
- Ollama API locally responded HTTP 200; Nginx and cloudflared active; public domain routing not yet verified.
- Device visibility through a shared Desktop Commander connection is NOT proof of independent Darrin administrative access.

## Change approval gates
A. Identity and SSH/Tailscale permissions.
B. GPU driver installation or reboot, after physical/PCI diagnosis.
C. Per-disk mount/write/format authorization.
D. Docker administrative privilege scope.
E. HERMES gateway identity, network exposure, and deployment.
F. Per-domain Cloudflare/DNS/Nginx modifications and client authorization.

## Evidence required in completion report
Task, operator identity, target, authorization, before state, exact change, commit SHA or configuration revision, tests, independent verification, rollback reference, and final status (completed/failed/blocked/unverified).

## Rollout policy
This document alone is not enforcement. Before enabling automatic deployments, audit existing GitHub Actions, set branch protection and environment rules, add required CI checks, configure least-privilege deployment credentials, establish rollback, and test staging. Do not modify production or enable automatic deployment merely by merging this document.
