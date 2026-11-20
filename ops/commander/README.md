# WISE² Commander — safe cutover

Status: **staged for review, not installed or live**. Production host is Ubuntu `wise2` only.

## Purpose
Replace the external Desktop Commander dependency with a first-party, auditable WISE² remote operations plane integrated with Hermes. Preserve the current access channel until independently verified.

## Security requirements
- Tailscale SSH or another authenticated private transport; no unauthenticated HTTP `/exec` and no public listener.
- Dedicated non-root service account; no unrestricted sudo, Docker socket, or arbitrary shell through a web endpoint.
- Strict operation allowlist (read-only audit, bounded health probes, scoped deploy approval); all writes require explicit authorization.
- Secrets stay on the host or in GitHub encrypted secrets, never committed or echoed.
- Per-operation audit log, timeouts, resource limits, kill switch, rollback.
- Existing Mac bridge documented in `packages/api/bin/REMOTE_BRIDGE_GUIDE.md` is historical and unsafe to expose; do not reuse its unauthenticated design.

## First action on the authorized `wise2` host
```bash
bash ops/commander/audit.sh
```
This script is read-only. Review output before sharing. Verify runner identity, repository visibility, services, ports, and Hermes endpoints locally.

## Cutover gates
1. Verify live host and backup configurations.
2. Verify private repo, branch protections and dedicated self-hosted runner with `wise2-maintenance` label; don't run untrusted PRs.
3. Implement authenticated restricted Commander agent and test its read-only endpoints.
4. Test bounded command allowlist, denied commands, audit trail, service recovery, and rollback.
5. Integrate Hermes with scoped capabilities, not shell access.
6. Validate WISE² clipper pipeline in draft-only mode.
7. Independently verify access from a second device before retiring Desktop Commander.

Do **not** stop Desktop Commander or restart production containers until all gates pass.
