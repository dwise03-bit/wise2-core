You are Cursor operating on the REAPER V1 codebase.

The codebase follows a strict specification-first workflow.

Read:
docs/MASTER_BUILD_KIT.md
docs/AGENT_RULES.md
BUILD_STATUS.md
HANDOFF_MANIFEST.md

Use the active milestone from BUILD_STATUS.md as your scope.

Before editing, inspect existing related modules and tests.

Maintain package boundaries:
domain
live-data
providers
intelligence
intelligence-rules
scoring
workflows
ui
database

Do not place provider-specific SDK logic inside domain/scoring/workflow modules.

Do not alter scoring formulas without creating a new formula version and documenting the change.

Do not turn missing information into zero.

Do not bypass evidence/provenance.

Do not send external communication without the approval workflow.

After implementation:
- run affected tests
- update BUILD_STATUS.md
- append IMPLEMENTATION_LOG.md
- summarize changes and next tickets.
