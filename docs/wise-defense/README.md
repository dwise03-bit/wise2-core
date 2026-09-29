# WISE DEFENSE Safety Radar + Comms Grid

The Safety Radar is a tenant-scoped WISE² module available under `/wise-defense`.
It is deliberately data-honest: without an authorized incident provider or a
connected gateway/device, the dashboard reports `NOT CONFIGURED` or `UNKNOWN`.
It never manufactures incidents, radio traffic, weather, positions, or health.

## Deployment prerequisites

Set `WISE_DEFENSE_ENABLED=true`, apply the additive Prisma migration, and create
a normal `TenantMembership` plus a `WiseDefenseMembership` for each operator.
`WISE_DEFENSE_DEMO_MODE` is intentionally off by default.

## Provider and hardware boundaries

Incident providers must be authorized by their source. CrimeRadar has no
assumed public API in this module; configure a provider adapter only after its
authorization and contract are verified. Meshtastic telemetry enters through
the authenticated edge-gateway path; production gateway token verification is a
deployment prerequisite. SDR is receive-only. GMRS and amateur-radio records
are planning and logging data: this module does not transmit, bridge, encrypt,
or rebroadcast traffic.

## Privacy and compliance

Every persisted Safety Radar record has a tenant id. Never send tenant IDs from
the client as authority; the API derives them from verified membership. Keep
watch zones private, use approximate incident locations for public display, and
do not store radio secrets in metadata. Users are responsible for licensing,
frequency authorization, equipment compliance, and local/federal law.

## Remaining production configuration

`INCIDENT_PROVIDER_*`, `MESHTASTIC_*`, `SDR_*`, `REDIS_URL`,
`WISE_DEFENSE_NOTIFICATIONS_ENABLED`, and `WISE_DEFENSE_AI_ENABLED` require
tenant-approved credentials, devices, or policy before their associated
capabilities report as configured.
