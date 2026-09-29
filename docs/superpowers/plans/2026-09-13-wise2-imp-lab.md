# WISE² IMP LAB Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Add the approved WISE² IMP LAB community/classroom experience to the existing WISE² web ecosystem.

**Architecture:** Reuse the existing website, auth, WISE² IMP, Discord, XR/Quest, Second Brain, and shared design-system packages. Implement IMP LAB as a focused website surface with reusable data/config modules so it can later bind to live API data without redesigning the UI.

**Tech Stack:** Existing wise2-core monorepo, Next.js/React/TypeScript, shared WISE² packages and tests.

**Spec:** `docs/superpowers/specs/2026-09-13-wise2-imp-lab-skool-design.md`

## Global Constraints
- Preserve existing production functionality and environment variables.
- No owl mascot; use the WISE² IMP.
- Five tracks: Learner blue, Creator green, Guide red, Safe purple, Team gold.
- Reuse existing auth/integrations rather than creating duplicate services.
- Work in an isolated branch/worktree and verify tests/build before deployment.

### Task 1: Isolated workspace and baseline
- [ ] Inspect repo instructions and Git state.
- [ ] Create `.worktrees/wise2-imp-lab` on branch `feat/wise2-imp-lab` if not already isolated.
- [ ] Install/reuse dependencies and run the existing website test/build baseline.

### Task 2: IMP LAB route and data model
- [ ] Write a failing route/content test for the IMP LAB page.
- [ ] Add focused IMP LAB track/course/event/badge configuration.
- [ ] Implement the route using existing WISE² UI primitives and brand tokens.
- [ ] Verify the focused test passes.

### Task 3: Ecosystem links and responsive behavior
- [ ] Add tests for wise2.net/Discord/XR/resource navigation and five-track rendering.
- [ ] Implement accessible responsive navigation/cards without new duplicate backends.
- [ ] Run focused tests, lint/typecheck and production build.

### Task 4: Verification and handoff
- [ ] Review diff for secrets/unrelated changes.
- [ ] Verify route locally and capture exact test/build results.
- [ ] Commit feature branch; do not deploy production until verification is clean.

## Verification Gates
- Baseline must be known before feature code.
- Every behavior change starts with a failing test.
- No production deploy if tests/typecheck/build are not clean.
- No secrets, generated caches, or unrelated working-tree changes in the commit.
