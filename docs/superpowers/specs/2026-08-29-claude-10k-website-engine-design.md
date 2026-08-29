# WISE² × Claude $10K Website Engine — Design Specification

**Date:** 2026-08-29  
**Status:** Approved design; implementation pending  
**Branch:** `feat/claude-10k-website-engine`

## Objective

Integrate a reusable premium-website production system into WISE² Core and Claude Code. The system must turn a client brief and approved brand assets into a conversion-focused, production-ready website through a repeatable six-stage workflow:

`DISCOVER → DESIGN → BUILD → VERIFY → DEPLOY → CONVERT`

It extends the existing PromptOS and `.claude/skills` architecture. It does not replace the WISE² agent framework or rebuild working applications.

## Commercial packages

| Package | Starting price | Outcome |
|---|---:|---|
| Launch | $2,500 | Focused premium landing site with lead capture |
| Growth | $5,500 | Multi-page conversion website with CRM and analytics |
| Business OS | $10,000+ | Website plus business automation, portal/integrations, reporting, and launch support |

Pricing is positioning guidance, not a guarantee of revenue.

## Architecture

### Persistent Claude context

Add a concise root `CLAUDE.md`, kept below 200 lines. It will reference existing WISE² sources of truth and define only rules Claude must know every session:

- use pnpm and the existing Turbo monorepo;
- inspect before editing;
- preserve working components and brand locks;
- use real client assets and copy;
- follow Credit Saver Mode;
- run scoped checks during work and full gates before completion;
- never claim success without evidence.

Detailed procedures remain in skills so they load only when relevant.

### Claude skills

Add the following project skills beneath `.claude/skills/`:

1. `website-engine` — orchestrates the six stages and client-package scope.
2. `brand-brain` — converts brand references into tokens, imagery rules, typography, tone, and invariants.
3. `conversion-architecture` — offer, audience, objections, sitemap, CTAs, lead flow, CRM events, and measurement.
4. `visual-verification` — responsive browser review and screenshot comparison.
5. `website-launch` — production build, accessibility, SEO, analytics, deployment, and handoff checklist.

Each skill has a narrow trigger description and an explicit completion contract. Side-effecting launch steps require direct invocation.

### Specialist reviewers

Add isolated Claude agents beneath `.claude/agents/`:

- `ux-reviewer.md`
- `conversion-reviewer.md`
- `accessibility-reviewer.md`
- `performance-reviewer.md`

Reviewers return findings and evidence. They do not deploy or modify production state.

### Deterministic quality gates

Add `.claude/settings.json` only after inspecting existing settings. Merge safely if one exists. Hooks will use repository scripts and never embed credentials.

Required gates:

- formatting/lint after relevant edits where practical;
- type checking;
- production build;
- accessibility checks;
- desktop, tablet, and mobile browser verification;
- blocking completion when required checks fail.

The hook layer must remain lightweight. Expensive full-suite checks run at the final verification stage, not after every file edit.

## Workflow

### 1. Discover

Read the client brief, existing site, supplied assets, audience, competitors, offer, constraints, and required integrations. Produce a short discovery record. Ask only genuinely blocking questions.

### 2. Design

Create a content hierarchy and 2–3 meaningfully different visual directions. Choose one against business and brand criteria. Establish design tokens before page implementation. The approved WISE² visual baseline is carbon black, gunmetal, chrome silver, electric green, high contrast, dimensional depth, and phone-readable typography.

### 3. Build

Follow each target application's existing framework and patterns. For WISE² website work, prefer Next.js App Router, TypeScript strict mode, Tailwind, semantic HTML, responsive images, and purposeful motion. No generic AI landing-page composition, fake testimonials, placeholder copy, or needless component replacement.

### 4. Verify

Run repository-supported lint, type checks, tests, and builds. Inspect the running site in a browser at 375, 768, 1024, and 1440-pixel widths. Verify navigation, CTAs, forms, validation, reduced motion, focus states, metadata, console output, network failures, loading states, and overflow.

Targets:

- LCP ≤ 2.5 s
- INP ≤ 200 ms
- CLS ≤ 0.1
- no critical accessibility violations
- no horizontal overflow from 320–1600 px
- no suppressed production-build failures

When local measurement is unavailable, record the missing environment requirement instead of inventing results.

### 5. Deploy

Use the target application's existing deployment path. Never expose secrets. Generate a deployment handoff containing required environment variables, rollback path, live URL, verification evidence, and remaining risks.

### 6. Convert

Configure real CTAs, lead routing, CRM/email integrations, and analytics events appropriate to the selected package. Record event names and conversion definitions in the client handoff.

## Credit Saver Mode

- Read only relevant files and reference exact paths.
- Keep persistent context compact.
- Use on-demand skills for long procedures.
- Run targeted tests during implementation.
- Run full gates once at final verification.
- Reuse approved assets and functioning components.
- Capture new screenshots only after material visual changes.
- Use isolated reviewers for investigation so the main context stays clean.
- Reserve the highest-cost model for architecture, hard blockers, and final review.

## Data flow

```text
Client brief + brand assets + current code
        ↓
Discovery and conversion architecture
        ↓
Brand Brain tokens + approved direction
        ↓
Application implementation
        ↓
Automated checks + isolated reviewers
        ↓
Preview deployment and human approval
        ↓
Production deployment
        ↓
CRM events + analytics + optimization record
```

## Error handling and safety

- Missing assets: stop only when identity or legal accuracy depends on them.
- Missing credentials: document the variable and continue with a safe mock boundary; never request secrets in chat or commit them.
- Failed build or test: fix root cause or report the exact blocker; do not suppress.
- Existing dirty work: preserve unrelated changes.
- Deployment failure: keep the previous production version active and provide rollback evidence.
- Brand conflict: specific locked client rules override generic WISE² styling.

## Verification strategy

1. Validate all new Markdown frontmatter and file paths.
2. Confirm Claude discovers each skill and agent.
3. Run repository lint/type/build commands that apply to modified executable files.
4. Invoke the website engine on a small fixture brief in dry-run mode.
5. Confirm launch workflow cannot silently pass a failed gate.
6. Review the complete diff for secrets, unrelated edits, and duplicated instructions.
7. Open a draft pull request with evidence and remaining environment requirements.

## Planned repository changes

- `CLAUDE.md`
- `.claude/skills/website-engine/SKILL.md`
- `.claude/skills/brand-brain/SKILL.md`
- `.claude/skills/conversion-architecture/SKILL.md`
- `.claude/skills/visual-verification/SKILL.md`
- `.claude/skills/website-launch/SKILL.md`
- `.claude/agents/ux-reviewer.md`
- `.claude/agents/conversion-reviewer.md`
- `.claude/agents/accessibility-reviewer.md`
- `.claude/agents/performance-reviewer.md`
- `docs/superpowers/specs/2026-08-29-claude-10k-website-engine-design.md`

Existing files are changed only when inspection proves integration requires it.

## Acceptance criteria

- Claude can invoke a single WISE² website-engine workflow.
- Workflow uses existing PromptOS routing and brand sources.
- The six stages and three packages are documented consistently.
- Credit Saver Mode is enforced by the workflow structure.
- Quality checks return evidence rather than unsupported claims.
- Side-effecting deployment remains explicitly controlled.
- No secrets, fake client data, or production mutations are committed.
