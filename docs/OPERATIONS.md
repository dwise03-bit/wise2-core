# WISE² operations — level-up v0.2

**Delivery status: STAGED.** Source is implemented and tested in
`/home/dwise/wise2-level-up`. Host application and live acceptance are BLOCKED
by this session's filesystem/network/systemd restrictions. This document
specifies behavior after the reviewed patch is applied. No production-ready
claim is made before host acceptance.

## Architecture

The existing `/usr/local/bin/wise2` symlink continues to invoke
`/opt/wise2/scripts/wise2`. Its operation commands delegate to standard-library
Python in `core/`. `core/runtime.py` provides fixed read-only probes to both CLI
and Command Center. There is no browser-to-shell interface, remote agent,
job dispatcher, competing Hermes instance, or deployment backend.

Command Center remains the existing `wise2-command-center` **user service**,
with the unchanged proven unit, linger and Restart=on-failure policy.
It serves only 127.0.0.1:3010. Routes: `/`, static assets, `/healthz` and
`/api/status`. The paired v0.2 API/UI uses typed status records. `/healthz`
measures the HTTP process; doctor separately checks service, listener and UI
HTTP. The status API runs fixed collectors in a background thread, coalesces
polls at ten seconds and marks results older than thirty seconds STALE.
An initial COLLECTING response contains no invented telemetry.

## Commands

| Command | Actual behavior |
|---|---|
| `wise2 status [--json]` | Structured observed overview; nonzero if tracked services are offline/unknown |
| `wise2 doctor [--json]` | Functional checks; 0 complete, 1 FAIL present, 2 WARN/incomplete |
| `wise2 services` | System, dynamic touch and Command Center user-service observations |
| `wise2 logs` | Safe local operation event records, not raw process messages |
| `wise2 devices [--json]`, `wise2 node [status]` | Registered metadata plus explicitly sourced observations |
| `wise2 command-center status` | User service + health HTTP checks |
| `wise2 command-center restart` | Prints action/target/reason/effect/rollback; restarts only this user service and verifies health |
| `wise2 command-center logs` | Recent journal timestamp/priority metadata; messages withheld |
| `wise2 hermes status [--json]` | Existing remote Hermes probe; 3 NOT CONFIGURED, 1 configured failure, 0 ready |
| `wise2 projects` | Local project directory inventory; no invented build/deployment state |
| `wise2 backup create` | Atomic, owner-only, manifest-verified metadata archive |
| `wise2 backup list` | Archive inventory; legacy archives labeled unverified |
| `wise2 backup verify [archive-name]` | Full policy/hash verification, without extraction |
| `wise2 update`, `wise2 version` | Version inventory only; no unattended installation/pull |
| `wise2 shannon status` | Installed launcher/local package metadata; no npx execution |
| `wise2 pentest` | Preserved interactive authorization wrapper; no arguments accepted |

Existing informational `system`, `network`, `ssh`, `support` and `help`
remain. `command` is a compatibility alias. Bare `wise2 backup` means create.
Unsupported arguments fail explicitly. No automatic restore command exists.

## Health semantics

A systemd observation denied by permissions yields UNKNOWN/WARN, not a claimed
outage or PASS. Confirmed inactive services are FAIL. DNS/HTTP probes that do
not succeed remain FAIL; network namespace restrictions can cause those
measurements, so interpret them alongside the observation environment.
Tools execute version commands; this does not establish account auth, API
credits or successful model inference. Docker user access uses `docker info`.
Touch matches `active running` columns of any `iptsd@*.service`, never a
substring that also matches `inactive`.

Hermes intentionally disabled pending its production connection is INFO
NOT CONFIGURED. Enabling it makes connectivity/authentication/memory failures
counted FAIL. The disabled integration is not disguised as ready.

TCP exposure inventory uses parsed socket addresses, including IPv6 and
specific non-loopback binds. SSH is excepted under the existing documented
LAN/tailnet policy; that exception does not prove router/firewall policy.
No service is reconfigured to conceal a warning.

## Logs and resilience

`/opt/wise2/logs/operations.jsonl`: owner-only operation events with fixed
UTC time/action/outcome fields. Events cover health, backup, Command Center
restart and acceptance/recovery. Rotation at 1 MiB retains three prior files,
with an advisory lock. No arbitrary output, URLs, headers, credentials,
security evidence or browser request text is recorded. Journald remains the
existing service log store; the CLI exposes metadata only. Daniel may inspect
raw journals locally and must redact before sharing.

Remote deployment, device-agent, security-job and Hermes job logs are PLANNED;
there are no such local backends to falsely log. Existing unit hardening and
restart policy remain intact. Resource limits are PARTIAL: this patch adds no
arbitrary memory limit that might break the service. Background cached probes
bound request latency, each subprocess has a timeout, Hermes responses are
bounded and backup file/archive sizes have limits. Measure live usage before
choosing MemoryMax/CPUQuota; those changes require separate validation.

## Hermes and Shannon

The existing `hermes/config/hermes.conf` is preserved, disabled. Configuration
is parsed as literal KEY=value, not executed. The client uses in-process HTTP
headers, rejects redirects, bypasses proxy forwarding, and requires the
existing device credential to be an owner-owned regular file of mode 0600.
It never returns tokens/endpoint values. No credentials were created or changed.
READY requires configured + reachable + authenticated JSON + memory evidence.
Jobs, pending approvals and remote agent state are NOT CONFIGURED until the
existing production contract is integrated. The connection scope and production
prerequisites remain in `hermes/DEVICE-CREDENTIAL.md` and pending documentation.

Shannon launchers and authorization code are unchanged. Telemetry reads only
local package metadata. Doctor tests the inspected gate's **explicit denial**
path, without creating an engagement or executing a scanner; if its hash has
changed, it refuses to execute it and asks for review. INSTALLED means launcher
and cached package, not an active engagement or confirmed AI authentication.
A cached npx package does not guarantee offline execution of an `@latest`
launcher; that pre-existing limitation remains. No engagement authorization is
inferred from a folder count.
