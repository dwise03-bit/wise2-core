# WISE² Command Center v0.2

**STAGED source upgrade** of the existing working localhost dashboard.
Application/live validation is blocked by the current session. See
`docs/OPERATIONS.md` and `docs/ACCEPTANCE.md` for exact status and rollout.

Python standard library only. Preserves the existing user service and port
127.0.0.1:3010. Fixed read-only probes in `core/runtime.py`; no shell from HTTP
input, no mutation endpoints, no scan or credential response. Static paths use
resolved path containment. Browser renders values with textContent, never raw
status HTML. Shared background cache coalesces probes; old results are STALE.

SYSTEM, AI, SECURITY, DEVICES, PROJECTS, DEPLOYMENTS, SUPPORT, ALERTS, LOGS,
BACKUPS and SETTINGS select actual module views. Unconnected deployment,
support and remote agent/job/approval integrations show NOT CONFIGURED.
Remote service/hardware state is never inferred from Tailscale presence.

Routes: `/`, `/app.js`, `/healthz`, `/api/status`. v0.2 status schema is paired
with this UI. Healthz is a cheap HTTP liveness probe, not full system health.
Environment: `WISE2_ROOT`, `CC_HOST` (must be 127.0.0.1), `CC_PORT` (3010 in the
installed unit). No new dependencies or unit changes are required.

Operations:
```
wise2 command-center status
wise2 command-center restart
wise2 command-center logs
```
Logs expose metadata only. Restart is narrow, disclosed and verified. Existing
Restart=on-failure, RestartSec=3, user linger, NoNewPrivileges and PrivateTmp
are preserved. Resource-limit tuning requires live measurements; it is not
silently added here. Never install the legacy root-unit template alongside the
existing user service. Hermes remains a remote client, not a local daemon.
