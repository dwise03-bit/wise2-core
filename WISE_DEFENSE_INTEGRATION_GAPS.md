# Wise Defense Integration Gaps

Audit date: 2026-08-20 (America/New_York)  
Scope: repository, production deployment host, live database, configured integration keys, network interfaces, serial/USB hardware, and deployed API routes.  
Secret policy: values were never printed, copied, or added to this report.

## Current state

| Area | State | Evidence / safe conclusion |
| --- | --- | --- |
| Public landing page | ACTIVE | `wisedefensellc.com` serves the public Wise Defense landing page. |
| Safety Radar dashboard UI | ACTIVE — UI only | The `/wise-defense/*` dashboard is served by a healthy dedicated container and accurately shows unconfigured states. |
| Wise Defense API | DISABLED / not deployed | `https://api.wise2.net/api/health/wise-defense` and the module route return `404`; the running API image does not expose this module. |
| Wise Defense database schema | MISSING | The live database does not contain `Tenant`, `WiseDefenseMembership`, `Incident`, `WatchZone`, `MeshNode`, radio, SDR, alert, or family tables. It also has no Prisma migration ledger. |
| Wise Defense tenant / operators | MISSING | No `Tenant`/workspace data exists in the live database to reuse. No duplicate record was created. |
| Incident provider | MISSING_CREDENTIAL | No authorized incident-provider adapter or configured provider key was found. |
| Meshtastic | MISSING_HARDWARE | No serial candidate or Meshtastic CLI exists on the VPS. |
| SDR | MISSING_HARDWARE | No RTL-SDR/SoapySDR/HackRF/Airspy tools or SDR-class USB device was detected on the VPS. |
| GMRS / HAM | MISSING_INPUT | No real operator, callsign, repeater, channel, or licensing record exists in the discovered production systems. |
| Weather | DISABLED | No weather provider configuration or service implementation was found. |
| Discord core credentials | DETECTED_NOT_CONFIGURED | A global Discord bot and webhook are configured (values withheld), but no Wise Defense tenant, destination channel mapping, or live Wise Defense notifier exists. |
| Email | MISSING_CREDENTIAL | The production SendGrid settings are empty. Email provider code supports Resend and SendGrid when configured. |
| SMS | DISABLED | Existing communication route contains provider TODOs; no operational SMS provider configuration was detected. |
| Generic webhooks | DETECTED_NOT_CONFIGURED | Generic webhook infrastructure and Discord webhook support exist, but no tenant-scoped Wise Defense endpoint is configured. |
| Tailscale | DETECTED_NOT_CONFIGURED | The VPS has an active Tailscale interface. No Safety Radar edge gateway is registered or reachable through it. |

## Safe actions completed

- Searched repository environment, Docker/Compose, Nginx, deployment, database schema, tenant, Discord, notification, and edge-appliance sources.
- Inspected production environment-variable *presence* only; no secret value was output.
- Enumerated VPS USB buses, serial paths, installed Meshtastic/SDR tools, Docker services, and network interfaces without modifying hardware state.
- Checked the production database for existing Wise Defense tenant/operator records before considering any insert. None exist.
- Checked the deployed API route and health endpoint before enabling the module. The current production API does not contain the route.
- Preserved the dashboard's honest `NOT CONFIGURED` / `UNKNOWN` behavior. No fake incident, node, radio, SDR, operator, or location was created.

## Required deployment reconciliation

The current live database contains a legacy workspace/user schema, while the Wise Defense migration requires the Prisma `Tenant` foundation. Applying `20260818120000_add_wise_defense_safety_radar` directly would fail because its foreign keys reference `Tenant`.

1. Back up the production database.
2. Reconcile and apply the prerequisite tenant-isolation / Revenue OS schema migrations to a staging copy first.
3. Verify a real Wise Defense tenant exists and assign real authenticated users through `TenantMembership` and `WiseDefenseMembership`.
4. Deploy the current Nest API image containing `WiseDefenseModule`.
5. Run `GET /api/health/wise-defense` and a tenant-scoped authenticated dashboard request. Only then set `WISE_DEFENSE_ENABLED=true`.

No automatic production migration was run because these are schema-creating, tenant-identity changes and require a proven database migration path.

## Inputs that require a human owner

| Needed value | Why required | Storage / validation |
| --- | --- | --- |
| Wise Defense owner/admin identity | Create the authentic tenant and role memberships. | `Tenant`, `TenantMembership`, `WiseDefenseMembership`; validate authenticated tenant-scoped API access. |
| Authorized incident source and credentials | Permit lawful incident ingestion. | Secret manager/runtime env plus provider adapter configuration; validate a provider health check and one normalized authorized event. |
| Watch-zone coordinates, radius, categories, and recipients | Define alerts without exposing private locations. | Tenant-scoped `WatchZone`; validate distance match with redacted output. |
| Meshtastic gateway identity and connection information | Connect hardware without guessing a serial device or network target. | Edge gateway device credential / runtime env; validate telemetry receipt and node update. |
| Licensed GMRS/HAM operator, callsign, channels, repeaters, and tones | Legal operational planning and accurate display. | Tenant-scoped radio models; validate against owner-supplied licensed configuration. |
| SDR device attachment and desired receive-only frequency watches | Attach an actual supported receiver. | Edge gateway SDR config; validate device detection and an `UNKNOWN` signal record. |
| Notification destination authorization | Route alerts to the correct Discord channel, email, SMS, or webhook. | Tenant notification configuration; validate a non-emergency test notification. |
| Weather provider credential and covered geography | Retrieve current conditions/alerts legitimately. | Runtime secret/provider adapter; validate provider health response. |

## Non-destructive hardware discovery record

- VPS: no `/dev/serial/by-id`, `/dev/ttyUSB*`, or `/dev/ttyACM*` device was found; USB inventory contained only host hubs/KVM devices.
- VPS: Meshtastic, RTL-SDR, SoapySDR, HackRF, and Airspy command-line tools were not installed.
- Local development machine: one USB modem serial candidate was present. Its identity was not assumed to be Meshtastic and it was not opened or modified.
- VPS: an active Tailscale interface exists, but no discoverable Wise Defense gateway was registered.

## Next safe sequence

1. Resolve the production schema/API deployment reconciliation.
2. Create the real Wise Defense tenant and owner membership.
3. Add approved provider credentials and hardware endpoints.
4. Enable each integration independently only after its health test is green.
5. Record final state as `ACTIVE`, `DETECTED_NOT_CONFIGURED`, `MISSING_CREDENTIAL`, `MISSING_HARDWARE`, or `DISABLED`—never inferred as online.
