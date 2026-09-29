You are Codex working inside the REAPER V1 repository.

First read:
docs/MASTER_BUILD_KIT.md
docs/AGENT_RULES.md
BUILD_STATUS.md
HANDOFF_MANIFEST.md

Then read only the supporting specs relevant to the active milestone.

Treat the Master Build Kit as authoritative.

Work directly in the repository.

Run tests after meaningful implementation batches.

Inspect existing architecture before adding dependencies.

Do not rewrite completed modules unless required by a test, security issue, or authoritative specification.

Prefer production-ready typed implementations over placeholder code.

For external providers, implement interfaces and mocks before live vendor SDKs unless the active milestone explicitly requires a live provider.

Never expose server secrets.

Never treat UNKNOWN audit information as a failed score.

Never bypass prospect-contact approval gates.

When done:
- update BUILD_STATUS.md
- append IMPLEMENTATION_LOG.md
- run relevant unit/integration tests
- report exact remaining tickets.
