# Local-first device registry

**STAGED implementation.** `devices/registry.json`, schema_version 1, is the
registration source. `devices/wise2-surface.json` is labeled historical hardware
inventory; old service values are UNKNOWN, not current telemetry.

## Registration and observation schema

Stored fields: unique `id`, `hostname`, `display_name`, `role`, `os`, optional
`architecture`, `registration` (REGISTERED or NOT CONFIGURED), `local` boolean,
optional `tailscale_node_id`, and non-secret `capabilities`. Initial device:
`wise2-surface`, Surface Laptop 4, PRIMARY COMMAND CENTER, WISE² Linux.

Derived records from `wise2 devices` and the dashboard additionally support:
`online_state` (ONLINE/OFFLINE/UNKNOWN/NOT CONFIGURED), `last_seen`,
`agent_version`, `tailscale_ip`, `cpu`, `ram_gib`, `storage`, `services`, and
`telemetry_source`. Local records are freshly observed only when their
registered hostname matches this host. Agent version is the local collector
version; it is not a claim that a remote daemon exists.

Remote presence is UNKNOWN until a registered exact Tailscale node ID appears
in a successful `tailscale status --json` observation. Tailscale ONLINE/OFFLINE
is peer presence, **not** SSH, agent, hardware or service health. Remote CPU,
RAM, storage, services and agent version stay null. No fabricated heartbeat,
last-seen timestamp or telemetry is written into the registration file. No
remote device is automatically enrolled from discovered tailnet membership.

## Enrollment — reviewed local metadata, no credential provisioning

1. Daniel confirms device identity/role and owns or controls the node.
2. Preserve registry with `wise2 backup create`; inspect existing JSON.
3. Add one unique ID and required string metadata, `registration=REGISTERED`,
   `local=false`. Optionally enter its **node ID** from Daniel's private tailnet
   inventory, not its token/key or a guessed hostname/IP.
4. Run `wise2 devices` and `wise2 doctor`; review output. Missing peer evidence
   remains UNKNOWN. Registry editing never establishes remote authorization.
5. Replacing a device or credential is a separate reviewed action. Future agent
   enrollment needs authenticated heartbeats, revocation and an approval contract.

Supported planned device types are listed as plans, not enrolled nodes:
MacBook Pro, WISE² server/VPS, Pixel Slate, Raspberry Pi, Unihiker K10, iPhone,
Go GO Gadet Watch. Add no secrets, owners' login data or remote access keys to
this file. No fleet control or remote job execution is implemented.
