# WISE² Security Policy & Shannon

> Last updated: 2026-10-02. This governs all security tooling on this machine.

## Authorization — non-negotiable

- Security testing is **restricted to systems Daniel owns or has explicit,
  documented authorization to test.**
- **No scan ever starts automatically.** Not during setup, not by an agent,
  not by the Command Center.
- Agents (Claude, Codex, Hermes) must **never** launch Shannon or any scanner
  on their own initiative. They may prepare engagement scaffolding and explain,
  but a human runs the authorized launch.
- Never scan random Internet systems.

## Shannon

- Package: `@keygraph/shannon` (v3.3.0 at audit).
- Launcher: `/usr/local/bin/wise2-shannon`
  - `cd /opt/wise2/shannon` → `npx --yes @keygraph/shannon@latest "$@"`
  - env: `SHANNON_USE_PI_AUTH=1`, `SHANNON_AI_MODEL=openai-codex:gpt-5.6-sol`
  - ⇒ Shannon's AI backend depends on **OpenAI Codex** (installed; authentication requires a separate check).
- Guarded launcher: `/usr/local/bin/wise2-pentest`
  - Prompts: engagement name, authorized target, repo path, **authorization
    (must type `yes`)**. Anything but `yes` → "Scan cancelled", exit 1.
  - On confirm, creates `engagements/<ID>`, `evidence/<ID>`, `reports/<ID>`
    with an `engagement.txt` manifest (ID, target, repo, AUTHORIZED, timestamp,
    engine). ID = `<UTC-timestamp>-<sanitized-name>`.

**Both launchers are validated and must be preserved.** Improve only additively
and only with Daniel's review; back up before editing either.

## Engagement record requirements

Every engagement must capture: engagement ID · authorized target · repository ·
authorization confirmation · timestamp · operator · scope · evidence dir ·
report dir · logs. (`wise2-pentest` already records most of these.)

## Security workspace (`/opt/wise2/security`)

```
engagements/  targets/  configs/  evidence/  reports/  logs/
```

- Evidence and reports stay **local**. Do not sync security evidence to Git
  unless Daniel explicitly approves per-artifact.

## Command Center ↔ Shannon

- Command Center shows Shannon status / engagements / findings / evidence /
  reports **read-only**, via a **server-side adapter with an allowlist** of
  operations.
- The browser UI must **never** expose arbitrary shell execution.
- Launching a real scan is a deliberate, authorized, human action — not a button
  that fires a scan without the authorization gate.

## Secrets

- Never print secrets. Never commit secrets. Never store tokens/keys in context,
  device manifests, unit files, or logs.
- Credentials live in env files outside Git, the OS keyring, or Tailscale.
