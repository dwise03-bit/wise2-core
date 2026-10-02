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
- Commit secrets (Hermes token lives in a git-ignored `.env`, never in context).

## Next (needs Daniel)

1. Confirm the live Hermes endpoint (Tailscale node:3012 vs public URL).
2. `gh auth login`, then optionally read-only `git clone dwise03-bit/wise2-core`.
3. Agree the Surface→Hermes auth + sync contract; then I build the thin client.
