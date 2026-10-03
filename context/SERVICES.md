# WISE² services

Updated 2026-10-03. Live service state is UNKNOWN to the restricted Codex
session; this table distinguishes installed roles from fresh observations.

| Unit | Role / evidence |
|---|---|
| ssh | Existing OpenSSH; prior active/enabled baseline, unchanged |
| tailscaled | Existing mesh; prior active/enabled baseline, unchanged |
| docker + docker.socket | Existing containers; prior working baseline, unchanged |
| iptsd@*.service | Dynamic Surface touch instances; virtual input devices observed |
| bluetooth | Existing controller/service; unchanged |
| systemd-resolved | Existing DNS; fresh resolution blocked here |
| wise2-command-center (user) | Existing dwise service, localhost:3010, enabled/linger, Restart=on-failure; prior boot/recovery passed |

Versioned Command Center unit: `services/wise2-command-center.user.service`;
installed path `~/.config/systemd/user/wise2-command-center.service`.
The level-up changes source only and preserves unit/restart behavior.
Use `wise2 services`, `wise2 command-center status`, and `wise2 doctor` on the
host for actual state. See `docs/OPERATIONS.md` for staging/exit semantics.

Hermes is an existing **remote** service. Surface is a disabled client, not a
Hermes host. Legacy root-service/Hermes unit templates are not instructions to
install a competing service. No new persistent services are introduced.

Unit edits, dependency/resource/hardening changes require reviewed rollback
and recovery verification. Do not restart unrelated services. Journald stores
service output; safe CLI logs expose metadata without raw messages.
