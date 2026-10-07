# hermes-events

Lightweight local event gateway for the WISE² Agent Command Graph.

- Binds `127.0.0.1:3014` by default (no public exposure).
- `POST /ingest` with header `x-events-key: $HERMES_EVENTS_SECRET` accepts an
  `AgentEvent` JSON body (must include `event_type`).
- `GET /brain-stream` upgrades to WebSocket; recent 200 events are replayed to
  new clients, then live events are fanned out.
- `GET /health` returns `{ ok, clients, recent }`.
- `GET /recent` returns the in-memory ring buffer.

## Env

- `HERMES_EVENTS_PORT` (default `3014`)
- `HERMES_EVENTS_BIND` (default `127.0.0.1`)
- `HERMES_EVENTS_SECRET` (required for ingest; `/ingest` returns 503 without it)

## Reach

The Surface Agent Command Graph never talks to the VPS directly. It connects
to a local SSH tunnel at `ws://127.0.0.1:3100/brain-stream` which forwards to
this service's `127.0.0.1:3014/brain-stream` on `gpu-nmls-1` over Tailscale.
