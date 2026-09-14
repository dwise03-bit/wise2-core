# WISE² AI Stack Command Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the approved 2026 WISE² AI Tool Stack visual into a maintainable, responsive page in the existing WISE² website without changing production infrastructure.

**Architecture:** Add a dedicated `/ai-stack` App Router page backed by a typed data module. Keep runtime health explicitly labeled as presentation-only until authenticated health endpoints are connected. Changes stay isolated on a feature branch and go through existing CI before merge/deploy.

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, Jest, GitHub Actions.

**Spec:** Approved WISE² 2026 AI Tool Stack visual and the repository's current WISE² architecture documentation.

## Global Constraints

- Preserve the current WISE² production deployment and existing routes.
- Local-first AI routing remains the default operating philosophy.
- n8n remains the primary business automation platform.
- WISE² CRM remains the system of record.
- Never expose secrets or credentials.
- Do not claim runtime services are healthy until authenticated health checks verify them.
- Production deployment is a separate verified step after CI and review.

---

### Task 1: Stack data contract

**Files:**
- Create: `apps/website/app/ai-stack/stack-data.ts`
- Test: `apps/website/app/ai-stack/__tests__/stack-data.test.ts`

**Interfaces:**
- Produces: `stackCategories`, `quickWins`, `retireTools`, `monthlyCostTiers`, `architectureLayers`.

- [x] Write failing tests defining category order, local-first routing, n8n priority, quick wins and cost guardrails.
- [x] Add the typed data module satisfying that contract.
- [ ] Run the focused Jest test in a network-capable checkout and confirm PASS.

### Task 2: Responsive command-map page

**Files:**
- Create: `apps/website/app/ai-stack/page.tsx`

**Interfaces:**
- Consumes: exports from `./stack-data`.
- Produces: public route `/ai-stack`.

- [x] Build responsive stack cards, architecture map, quick wins, cost guardrails, retire list and environment-status presentation.
- [x] Add route metadata.
- [x] Mark runtime status as presentation-only until health endpoints are wired.
- [ ] Run website type-check, lint, tests and production build.

### Task 3: Verification and release gate

**Files:**
- No production file changes required unless verification finds a defect.

- [ ] Confirm `/ai-stack` renders at desktop and mobile widths.
- [ ] Confirm no existing route changed.
- [ ] Confirm GitHub Actions CI is green.
- [ ] Review diff and merge only after verification.
- [ ] Deploy through the repository's existing production workflow.
- [ ] Verify the public route after deployment and document the final URL/status.
