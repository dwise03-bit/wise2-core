# WISE² Local AI Command Router Design

## Goal
Add a WISE² Command Center module that routes AI work across the Mac and GPU-NMLS while keeping the Mac responsive and preserving local-first cost control.

## Placement
- Existing app: `apps/command-center`
- New route: `/local-ai`
- No separate standalone app or duplicated auth layer.

## Visual baseline
Use the approved WISE² UNITED / Local AI Command Router visual: black/charcoal foundation, chrome WISE² identity, cyan/blue structure, neon-green operational states, industrial field-built styling, dense system readouts, numbered ROUTE / OBSERVE / ACT sections.

## Core behavior
- AUTO is default and chooses the execution target from task class and resource pressure.
- LOCAL routes normal coding work to the Mac using `qwen2.5-coder:7b`.
- GPU routes heavy work to GPU-NMLS over Tailscale/private infrastructure.
- HEAVY local execution is explicit only; it must never be the automatic default on the 16 GB Mac.
- Models unload when idle and only one local Ollama model may be loaded at once.

## Safety boundaries
- Browser never receives SSH credentials, API keys, shell tokens, or unrestricted command execution.
- All machine actions run server-side through a narrow allowlisted control layer.
- Existing BLAKKHAIL, Fergie, and unrelated dirty-tree changes are not modified.
## UI modules
- Header health chips: Mac, GPU-NMLS, Tailscale.
- Prompt composer with AUTO / LOCAL / GPU routing controls.
- Model cards for safe local, heavy local, and remote GPU execution.
- Live resource monitor for Mac memory/CPU and remote GPU health.
- Loaded-model panel with idle-unload status.
- Quick actions: Stop Models, Safe Cleanup, Diagnostics, Logs.
- Numbered feature panels: 01 ROUTE, 02 OBSERVE, 03 ACT.

## Server interfaces
- `GET /api/local-ai/status` returns normalized Mac/GPU/Tailscale/Ollama health.
- `POST /api/local-ai/route` accepts a bounded task request and returns selected target/model plus execution result.
- `POST /api/local-ai/action` accepts only allowlisted actions: `stop-models`, `safe-cleanup`, `diagnostics`.
- `GET /api/local-ai/logs` returns a capped, sanitized recent log window.

## Routing policy
1. Lightweight coding, short transforms, and routine analysis stay on Mac.
2. Large-context, heavy reasoning, or user-selected GPU tasks route to GPU-NMLS.
3. If Mac memory pressure crosses the configured threshold, AUTO avoids local inference.
4. If GPU-NMLS is unavailable, AUTO falls back to safe local only when the task fits local limits; otherwise it returns a clear unavailable state.

## Definition of done
The module renders inside Command Center, reports live machine state, safely routes test prompts to Mac and GPU-NMLS, performs allowlisted maintenance actions, passes type/test/build checks, and does not expose secrets or alter unrelated work.
