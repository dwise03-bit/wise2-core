# WISE² runbook

Updated 2026-10-03. v0.2 operations below are STAGED until the host rollout.
Current source/application status: `CURRENT-STATE.md`.

- Health: `wise2 doctor`; 0 complete, 1 FAIL, 2 WARN/incomplete.
- User dashboard: `wise2 command-center status|restart|logs`.
- Registry: `wise2 devices`, `wise2 node`; remote presence is not agent health.
- Safe logs: `wise2 logs`; no raw credentials/process output.
- Snapshot: `wise2 backup create`, `wise2 backup list`, `wise2 backup verify`.
- Hermes: `wise2 hermes status`; existing remote client, NOT CONFIGURED until
  Daniel supplies its approved endpoint/device credential.
- Shannon: `wise2 shannon status`; never starts a scanner. Authorized manual
  engagements use `wise2 pentest` and explicit ownership/scope/yes confirmation.
- Updates: `wise2 update` inventories versions only.

Existing remote administration: OpenSSH over the authorized private tailnet.
The baseline Surface address 100.97.230.73 is historical; verify current mesh
IP before relying on it. Do not change router exposure, ACL or firewall.

Detailed operators' reference: `docs/OPERATIONS.md`, `docs/BACKUP-RECOVERY.md`,
`docs/DEVICE-REGISTRY.md`, `docs/APPROVAL-MODEL.md`, `docs/ACCEPTANCE.md`.
Recovery: `recovery/RECOVERY.md`. Preserve Surface and generic fallback kernels.

After meaningful work update CURRENT-STATE + CHANGELOG and relevant decisions;
write a handoff when leaving required validation unfinished. Never call staged
source, disabled Hermes, planned agents or unobserved services production-ready.
