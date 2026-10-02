# Shannon ↔ Command Center Adapter Contract

> Defines how the Command Center may interact with Shannon. **Read-only status
> by default. No arbitrary shell from the browser. Ever.**

## Principle

The browser UI never executes shell. It calls a **server-side adapter** that
exposes a fixed **allowlist** of operations. Anything not on the allowlist is
rejected. Launching a real scan is a deliberate, authorized, human action that
still passes the `wise2-pentest` authorization gate — it is not a web button
that fires a scan unattended.

## Allowlisted operations (v0 — all READ-ONLY)

| op | returns | source |
|---|---|---|
| `shannon.status` | launcher present?, version | `wise2-shannon version` |
| `engagements.list` | engagement IDs + metadata | read `security/engagements/*/engagement.txt` |
| `engagement.get` | one engagement's manifest | read that `engagement.txt` |
| `findings.list` | findings for an engagement | read `security/reports/<id>/` (parsed) |
| `evidence.list` | evidence file names + sizes (NOT contents) | list `security/evidence/<id>/` |
| `reports.list` | report file names | list `security/reports/<id>/` |

## Explicitly NOT allowed via adapter

- Starting/stopping scans, passing arbitrary args to Shannon.
- Reading raw evidence file contents into the browser without explicit auth.
- Any shell, eval, or path outside `/opt/wise2/security`.
- Any write to engagement data.

## Input rules

- Engagement IDs validated against `^[0-9A-Za-z._-]+$` and must resolve inside
  `security/engagements` (no path traversal).
- All responses are JSON; no HTML passthrough of file contents.
