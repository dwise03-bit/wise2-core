# command-center-ui

**WISE² Agent Command Graph** — animated, interactive canvas of the agent
network, driven by live Hermes events. First-slice vertical, STAGED.

See `context/DECISIONS.md` → ADR-0007 for the architectural rationale, and
`context/CURRENT-STATE.md` for status.

## Scope of this slice

- Hermes node (breathing + rotating activity rings)
- Five registered nodes: Planner, Claude Agent, QA, Deploy, GitHub (tool),
  plus an Approval node
- Animated edges with per-packet SVG `animateMotion` traveling along the path
- Drag / pan / zoom / fit, node + edge selection, minimap, controls
- Right-side Inspector with node and edge detail
- Bottom Timeline with live/replay toggle, step forward/back, 1× / 2× / 4× speed
- Follow Execution: camera recenters on the current execution step
- Event schema + adapter pattern so the simulated source can be swapped for
  the real Hermes gateway without touching components

## What this slice is NOT

- Not wired to production Hermes (`hermes.wise2.net`); real connection still
  blocks on confirmed port/path and scoped device credential. See
  `hermes/HERMES-PRODUCTION-CONNECTION-PENDING.md`.
- Not served by the Python command-center at `:3010`. It runs standalone on
  `:3011` via Vite until a loopback proxy decision is made.
- Not auto-started by any systemd unit. No `wise2 command-center-ui` CLI.
- Not deployed anywhere off 127.0.0.1.

## Local development

Node ≥ 20 required.

```bash
cd command-center-ui
npm install     # one-time, locks deps to this subdirectory
npm run dev     # starts Vite on 127.0.0.1:3011 (strictPort)
npm run build   # type-check + production build in dist/
npm run lint    # oxlint
```

## Layout

```
src/
  main.tsx            React entry
  App.tsx             Shell: topbar + stage + Inspector + Timeline
  theme.css           WISE² design tokens
  types/events.ts     AgentEvent + GraphNode/Edge + Execution
  events/
    adapter.ts        EventSource interface
    simulated.ts      SimulatedEventSource (default)
    websocket.ts      WebSocketEventSource (stubbed, awaits Hermes)
  state/store.ts      zustand store with ingest() reducer
  graph/
    CommandGraph.tsx  React Flow composition + follow-execution camera
    nodes/            HermesNode, AgentNode, shared nodes.css
    edges/            AnimatedEdge, shared edges.css
  inspector/          Node + edge detail panel
  timeline/           Live/replay toolbar
```

## Switching event sources

`src/App.tsx` picks the source. To test against a real Hermes gateway:

1. Set up a loopback proxy on the Python command-center that bridges
   `ws://127.0.0.1:3010/brain-stream` → authenticated Hermes gateway on
   `hermes.wise2.net`. The browser must not hold the credential.
2. In `App.tsx` swap `new SimulatedEventSource()` for
   `new WebSocketEventSource()`. The event shape (`AgentEvent`) is identical.

Do not point `WebSocketEventSource` directly at `wss://hermes.wise2.net/...`
from the browser; that would require the token to live in the client.

## Guardrails

- No credentials in the browser bundle.
- No raw backend fields rendered via `innerHTML`. Node and edge data flow
  through typed React components only.
- `prefers-reduced-motion: reduce` disables decorative animation; status is
  still communicated via color + text + label.
- `strictPort: true` so the dev server refuses to silently rebind if 3011
  is taken.
