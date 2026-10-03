# WISE² level-up audit — 2026-10-03

## Current state

Read-only inspection of `/opt/wise2`: clean `main`, HEAD
`c04bfb2d44e4c979e4b5d18569650fe97bbebdfd`, six commits, one ahead of
`origin/main`. Annotated local tag `wise2-linux-stable-2026-10-03` points to
HEAD. No push performed. No staged or uncommitted work found.

Ubuntu 24.04.5 LTS, WISE² identity present, Surface kernel 6.19.8-surface-3,
Microsoft Surface Laptop 4, i7-1185G7 (4 visible CPUs), 15 GiB RAM, 4 GiB
swap, approximately 203 GiB free on root. Battery 100%, Full. Input devices
include IPTSD virtual touchscreen/stylus. Wi-Fi, Tailscale and Docker interfaces,
Bluetooth controller, audio devices and four video device nodes are present.
Presence does not prove interactive hardware operation.

Node 22.23.3, npm 10.9.9, Python 3.12.3, pip 24.0, Git 2.43.0,
gh 2.102.0, Claude 2.1.288, Codex 0.160.0, Docker 29.1.3,
Compose 2.40.3, jq 1.7, rg 15.2.0, tmux 3.4 execute version checks.

## Already working / preserved evidence

The baseline commit contains the proven Command Center user service,
Restart=on-failure, RestartSec=3, loopback binding, NoNewPrivileges and
PrivateTmp. Earlier operator transcript records reboot and SIGKILL recovery,
and 25 PASS / 0 WARN / 0 FAIL. That is historical evidence, not a fresh test.
Shannon and pentest launchers are intact. Pentest requires explicit `yes`
before creating engagement directories or invoking Shannon.

Hermes is an existing remote control plane, not a local service to replace.
The Surface client is disabled; no device token was found. Existing ADR-0004
and ADR-0005 govern its eventual private authenticated connection.

## Observation limits

This Codex session denies system/user D-Bus, netlink, Docker socket and
localhost access. GNOME/Wayland session, DNS, routes, live service status,
Tailscale connectivity, port 3010 and HTTP cannot be freshly verified here.
Current legacy doctor in this environment: 19 PASS / 1 WARN / 5 FAIL;
those counts include permission-related observation failures. Do not treat
them as confirmed host outages, or claim the historical 25/0/0 was reproduced.
Writable roots are `/home/dwise` and `/tmp`; `/opt/wise2` is read-only to this
session. Implementation is staged in `/home/dwise/wise2-level-up`.

## Improvements and risks

- Doctor checks mostly executable presence, omits several functional checks,
  and uses an unsupported negative-lookahead in grep -E. Missing `ss` data
  can therefore incorrectly pass its exposure check.
- Dashboard hardcodes iptsd@dev-hidraw0, calls a network-dependent npx launcher
  on every refresh, and has navigation that does not select modules.
- Backup suppresses tar failure and treats file existence as success; it has
  no integrity verification or restore review procedure.
- Device manifest stores old service states as though current and labels
  installed Codex as pending. Registered remote devices need separate live
  observations; no remote agent telemetry exists.
- Hermes shell client passes tokens in curl process arguments and sources
  configuration as code. A safe local probe can use literal configuration
  parsing and in-process HTTP headers without changing production.
- Recovery/context docs contain obsolete root service and local Hermes advice.
- CPU reports Gather Data Sampling vulnerability via lscpu. Mitigation work
  requires a separate reviewed kernel/firmware assessment; no kernel changes
  are included in this level-up.

## Proposed phases and likely files

1. Preserve tag; build isolated local checkout without a remote.
2. Shared functional telemetry, doctor and CLI (`core/`, `scripts/wise2`).
3. Verified metadata backups and safe operation logs (`core/`, documentation).
4. Local registry and honest read-only modules (`devices/`, `command-center/`).
5. Credential-safe Hermes probe, preserving disabled configuration/client role.
6. Offline regression/failure tests, acceptance script, accurate context and
   recovery docs; local commits and a patch artifact.
7. BLOCKED here: apply to `/opt/wise2`, restart only Command Center, test live
   recovery and prepare reboot. Reboot requires Daniel's explicit approval.

Shannon launchers, credentials, system configuration, DNS, production Hermes,
security boundaries, service unit and unrelated services are preserved.
