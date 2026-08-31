# CLAUDE.md - WISE² Genesis — Master System Prompt

**Project**: WISE² Genesis - AI-Native Business Operating System  
**Version**: 2.1  

## Visual UI mandatory rule
For any landing page, dashboard, mobile app, client site, or other visual implementation, read and obey `docs/design/WISE2_UI_CONSTITUTION.md` before editing UI code. Approved references override agent design preference. Use the mandatory render/screenshot/compare/correct loop and preserve identity-locked assets. Use `docs/design/VISUAL_REFERENCE_TEMPLATE.md` to record approved screens and `docs/design/PROJECT_REPLICATION_PROMPT.md` as the short task handoff.

## Existing WISE² operating model
WISE² is an AI-native business operating system spanning cloud infrastructure, VPS deployments, edge nodes, desktop/browser clients, and iOS/Android applications. Preserve the existing PromptOS agent framework, repository architecture, APIs, integrations, deployment behavior, and working features unless the task specifically requires changing them.

### PromptOS routing
Route requests through the existing specialist prompts under `promptos/agents/`. For code and UI work, inspect the current implementation before proposing or making changes. For visual work, the UI constitution is an additional hard requirement.

### Brand and design knowledge
- Master reference: `docs/WISE2_DESIGN_SYSTEM_MASTER_VISUAL.png`
- Brand Bible: `docs/BRAND_BIBLE_UPDATED.md`
- Design System: `docs/DESIGN_SYSTEM.md`
- Brand Context: `.agents/brand-context.md`
- UI fidelity constitution: `docs/design/WISE2_UI_CONSTITUTION.md`
- Visual lock template: `docs/design/VISUAL_REFERENCE_TEMPLATE.md`
- Short replication prompt: `docs/design/PROJECT_REPLICATION_PROMPT.md`

### Code map
- Website: `apps/website/`
- Dashboard: `apps/dashboard/`
- API: `packages/api/src/`
- Database: `packages/db/`

## Core engineering rules
- Inspect existing code and assets first.
- Preserve working architecture and functionality.
- Never hardcode credentials.
- Follow existing project conventions.
- Run appropriate build, typecheck, lint, and tests before claiming completion.
- For UI tasks, technical tests do not replace visual QA.
- Do not make unrelated refactors while fixing a scoped issue.
- Record durable architectural decisions in the existing project decision system.

## UI completion gate
A visual task is complete only when the implementation has been rendered and compared against its approved reference. Report build/test state, desktop visual QA, mobile visual QA, asset fidelity, and known differences. “Inspired by,” “similar,” or “general feel” are not acceptable substitutes for faithful recreation.

**WISE² rule:** when agent preference conflicts with an approved reference, the approved reference wins.
