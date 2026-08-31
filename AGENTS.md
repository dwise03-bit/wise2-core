# AGENTS.md - WISE² Genesis — Coding Agent Rules

## Visual UI mandatory rule
For every landing page, dashboard, iOS/Android screen, client site, or visual component, read and obey `docs/design/WISE2_UI_CONSTITUTION.md` before implementation.

Approved references are authoritative. Do not reinterpret them into generic SaaS designs. Preserve identity-locked people, logos, mascots, products, devices, vehicles, and artwork.

Mandatory visual loop:
REFERENCE -> INSPECT -> MEASURE -> BUILD -> RUN -> SCREENSHOT -> COMPARE -> CORRECT -> REPEAT -> VERIFY.

Use `docs/design/VISUAL_REFERENCE_TEMPLATE.md` to lock approved screens and `docs/design/PROJECT_REPLICATION_PROMPT.md` for project-level handoffs.

## Repository behavior
WISE² Core uses the existing PromptOS agent framework. Preserve its architecture and working APIs, routing, authentication, integrations, environment behavior, and deployments unless explicitly required otherwise.

### Important paths
- `apps/website/` - public website and landing pages
- `apps/dashboard/` - operational dashboard
- `packages/api/src/` - backend API
- `packages/db/` - database layer
- `promptos/agents/` - specialist agent prompts
- `docs/design/WISE2_UI_CONSTITUTION.md` - visual source-of-truth rules

## Engineering rules
- Inspect before editing.
- Reuse existing assets/components when correct.
- Avoid unrelated refactors.
- Never hardcode secrets.
- Follow repository conventions.
- Run relevant lint, typecheck, tests, and builds.
- For UI work, always perform visual QA in addition to technical verification.
- Do not claim completion while known visual differences remain undisclosed.

## UI completion gate
Report BUILD, TYPECHECK, TESTS, DESKTOP VISUAL QA, MOBILE VISUAL QA, ASSET FIDELITY, and KNOWN DIFFERENCES.

When coding-agent preference conflicts with an approved WISE²/client reference, the approved reference wins.
