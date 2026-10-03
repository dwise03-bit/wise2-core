# Hermes — WISE² Second Brain (Surface client layer)

> Status 2026-10-02: Surface is a **CLIENT** of the existing production Hermes.
> This directory is the local integration/client layer — it does **NOT** host or
> replace the production Second Brain. See **HERMES-INTEGRATION.md** for the
> read-only discovery results and the connection plan.

## What Hermes is

Hermes is WISE²'s central durable memory + orchestration layer, backed by
MongoDB and served from the canonical repo **`dwise03-bit/wise2-core`**
(`second-brain/api-server`, historic process `wise2-second-brain`, port 3012).
It provides shared context to Claude, Codex, ChatGPT-facing WISE² services, the
Command Center (via a same-origin `/brain-api` proxy), agents and devices.

## This machine's role

Wise2-surface connects to the existing Hermes as a client. The production
Hermes is **remote** — audit from this Surface (2026-10-02) found no local
install, nothing on :3012, no local MongoDB, and the historic public endpoint
`command.wise2.net` not currently resolving. **The live endpoint/port must be
confirmed before wiring** (open questions in HERMES-INTEGRATION.md).

## Durable memory ≠ model-local chat memory

| Model-local chat memory | WISE² durable memory (Hermes) |
|---|---|
| Lives inside one assistant/session | MongoDB-backed, shared across agents/devices |
| Vendor-controlled, opaque, resettable | WISE²-owned, inspectable, versionable |
| Fragments per tool/model | One canonical store all agents read/write |
| Lost on new chat / context limit | Persists across sessions, reboots, devices |

The Surface on-disk `/opt/wise2/context` is the **local** truth; the Hermes
client reconciles it with the canonical brain (no divergent per-agent memory).

## Do NOT

- Replace production Hermes with a local stub, or deploy another instance.
- Modify production or expose it publicly.
- Commit secrets (Hermes token lives in the approved owner-only device credential file, never in context).

## Next (needs Daniel / production access)

Confirm existing production runtime/private endpoint and supply its approved
scoped device credential; then explicitly enable the Surface connection.
The local v0.2 probe is STAGED and implements the same four-state read-only
contract. Literal config is not executed; credentials never enter process argv,
UI or logs. No token was minted, configured or modified. Details/status:
`docs/OPERATIONS.md`, `HERMES-PRODUCTION-CONNECTION-PENDING.md`.

Jobs, pending approvals and remote agent telemetry remain NOT CONFIGURED;
we will integrate the existing production contract, not create a local brain.
