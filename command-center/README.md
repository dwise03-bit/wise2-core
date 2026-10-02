# WISE² Command Center (scaffold v0.1)

Read-only system/security/agent dashboard. Dependency-free (Python 3 stdlib).

## Run (localhost only)
```bash
python3 /opt/wise2/command-center/server.py      # http://127.0.0.1:3010
# or: wise2 command   (status check)
```
Env: `CC_HOST` (default 127.0.0.1), `CC_PORT` (default 3010).

## Safety contract
- Binds to **127.0.0.1 only**. No public/tailnet exposure without Daniel's approval.
- **READ-ONLY.** `/api/status` runs a fixed set of safe collectors.
- **No arbitrary shell from the browser.** Routes are an allowlist; collectors
  use fixed argument vectors (never shell=True, never HTTP input in a command).
- Static files served only from `./public` (path-traversal guarded).
- Security scans run only via the authorized `wise2-pentest` gate — never here.

## Layout
- `server.py` — status server (allowlisted, read-only).
- `public/index.html` — dashboard (deep black/navy, chrome, electric green).

## Roadmap (needs Daniel's direction on stack before expanding)
- Shannon adapter (see `security/configs/command-center-adapter.md`) — read-only
  engagements/findings/evidence/reports.
- Nav sections (ENGAGEMENTS, FINDINGS, DEVICES, …) currently anchor to HOME;
  wire to adapter endpoints as modules land.
- Optional: upgrade to a framework build if/when complexity warrants. v0 stays
  dependency-free and maintainable.

## Service
Install template: `/opt/wise2/services/wise2-command-center.service.template`
(needs sudo; install only when you want it always-on).
