# WISE² current state

Updated 2026-10-03 by Codex. **Distinguish host baseline from staged source.**

## Preserved host baseline

`/opt/wise2`, main at c04bfb2, six commits, clean, one ahead of origin/main.
Local annotated tag `wise2-linux-stable-2026-10-03` points at c04bfb2. No push.
Ubuntu 24.04.5 LTS, WISE² identity, Surface Laptop 4, Surface kernel
6.19.8-surface-3, 15 GiB RAM, ~203 GiB free root at audit.
All requested development tools execute version commands. IPTSD virtual
screen/stylus and camera/audio/Bluetooth/Wi-Fi device nodes are present.

Prior operator evidence: Command Center user service on 127.0.0.1:3010,
enabled + linger, Restart=on-failure, SIGKILL/reboot persistence tested,
dynamic iptsd CLI detection, doctor 25 PASS / 0 WARN / 0 FAIL.
That remains **historical evidence**, not a current live test.

This session denies D-Bus/netlink/Docker socket/network access and writes to
`/opt/wise2`. Legacy doctor here returned 19 PASS / 1 WARN / 5 FAIL, including
observation-denied checks. Do not infer host outages from that environment.
GNOME/Wayland, live networking/service health and interactive touch require
host verification. Audit: `docs/LEVEL-UP-AUDIT-2026-10-03.md`.

## Source upgrade — STAGED, not applied to host

Isolated checkout `/home/dwise/wise2-level-up`, branch level-up-2026-10-03,
no remotes. Implemented CLI v0.2/shared probes, functional doctor, manifest
backups, safe rotated logs, local-first registry, existing Hermes client
improvements, read-only dashboard modules/cache/stale labels and acceptance
script. Existing unit and `/usr/local/bin/wise2-{shannon,pentest}` preserved.

Offline tests and staging backup verification pass. Exact final verification
and commit records are in `docs/LEVEL-UP-STATUS.md` and the delivery record.
Fixture tests do not replace live acceptance. Documentation describes source
behavior after application, not an installed production upgrade.

## Component status

| Component | State |
|---|---|
| Development CLI tools | Version execution verified; account authentication not re-tested |
| Command Center baseline | Existing unit/code present, historical recovery proven; fresh live state UNKNOWN |
| Command Center UI (Agent Command Graph) | STAGED in `command-center-ui/`; Vite+React+@xyflow/react, 127.0.0.1:3011, simulated events default (`?source=hermes` opt-in → `wss://hermes.wise2.net/brain-stream` via Cloudflare Access, ADR-0008); voice control (Web Speech API, Chrome/Edge) + local-only camera preview (getUserMedia) wired behind topbar toggles; `npm run build` passes; not auto-started, no systemd unit, Python server on :3010 unchanged (ADR-0007) |
| v0.2 doctor/CLI/dashboard | STAGED implementation, offline tested |
| Metadata backup/rotation | STAGED implementation, real local archive verified |
| Local device registry | STAGED; remote agent telemetry NOT CONFIGURED |
| Hermes | Existing remote implementation; Surface connection disabled, NOT CONFIGURED |
| Shannon | Existing launchers intact; local package 3.3.0 cached; no engagement/scan started |
| Deployment/remote job/approval backends | NOT CONFIGURED / PLANNED |
| Visual inspection on Surface | BLOCKED until host rollout |
| Live acceptance/recovery/reboot | BLOCKED by session access; reboot requires Daniel |

## Next checkpoints

Apply only after inspecting current host Git and preserving any new edits.
Follow `docs/ACCEPTANCE.md`: verified pre-change metadata backup, patch check,
reviewed apply, narrow Command Center restart, new backup/doctor/acceptance,
intentional recovery. Prepare a saved-work/health/Git/service record and obtain
Daniel's explicit approval before reboot. Then repeat acceptance after boot.

Production Hermes/VPS/DNS/credentials and Tailscale/firewall/kernel boundaries
remain untouched. Hermes connection prerequisites stay in its existing pending
record; do not deploy a competing local brain. Never push without authorization.
