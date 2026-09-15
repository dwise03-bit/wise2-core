# WISE² Asset Forge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an installable WISE² Asset Forge that crops a master artwork sheet into protected, optimized assets and safely publishes approved outputs.

**Architecture:** Add `/asset-forge` to the existing Next.js website. Keep crop editing and previews local-first, use deterministic image processing for exports, and isolate repository publishing behind an authenticated server route with destination allowlisting.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, sharp, Jest.

**Spec:** `docs/superpowers/specs/2026-09-15-wise2-asset-forge-design.md`

## Global Constraints
- Original Artwork Protected is the default; no redraw or restyling.
- Routine processing must not require paid AI.
- Support iPhone, iPad, Mac, and desktop browsers.
- GitHub credentials never reach the browser.
- Publish only to configured repositories and destination roots.
- Publish to a review branch/PR, never directly to production.

---

### Task 1: Asset Forge shell and project state
**Files:** Create `apps/website/app/asset-forge/page.tsx`, `apps/website/components/asset-forge/AssetForge.tsx`, `apps/website/components/asset-forge/types.ts`; Test `apps/website/__tests__/asset-forge.test.tsx`.
- [ ] Write failing tests for the route, six workflow stages, protected-artwork indicator, and five-IMP preset.
- [ ] Run the focused Jest test and confirm RED.
- [ ] Implement the responsive shell and typed project state.
- [ ] Run focused tests and confirm GREEN.
- [ ] Commit.

### Task 2: Upload and crop editor
**Files:** Create `apps/website/components/asset-forge/UploadPanel.tsx`, `CropEditor.tsx`, `crop-utils.ts`; Test `apps/website/__tests__/asset-forge-crop.test.ts`.
- [ ] Test MIME validation, 1–10 regions, bounds clamping, five-region preset, and deterministic labels.
- [ ] Confirm RED.
- [ ] Implement upload preview, manual crop boxes, preset generation, and crop adjustment.
- [ ] Confirm GREEN and commit.

### Task 3: Deterministic export pipeline
**Files:** Create `apps/website/app/api/asset-forge/process/route.ts`, `apps/website/lib/asset-forge/process-image.ts`; Test `apps/website/__tests__/asset-forge-process.test.ts`.
- [ ] Test crop validation, WebP/PNG output, width presets, metadata stripping, and safe filenames.
- [ ] Confirm RED.
- [ ] Implement processing with `sharp` and strict decoded-size limits.
- [ ] Confirm GREEN and commit.

### Task 4: Preview and downloads
**Files:** Create `apps/website/components/asset-forge/ExportPanel.tsx`, `PreviewGrid.tsx`.
- [ ] Add failing UI tests for format, quality, naming, five output previews, and individual downloads.
- [ ] Confirm RED.
- [ ] Implement export settings and preview/download flow.
- [ ] Confirm GREEN and commit.

### Task 5: Safe repository publishing
**Files:** Create `apps/website/app/api/asset-forge/publish/route.ts`, `apps/website/lib/asset-forge/publish-policy.ts`, `apps/website/components/asset-forge/PublishPanel.tsx`; Test `apps/website/__tests__/asset-forge-publish.test.ts`.
- [ ] Test authentication requirement, allowlisted repository/root, traversal rejection, branch naming, and no direct-main publish.
- [ ] Confirm RED.
- [ ] Implement server-only publish adapter and review-branch/PR workflow.
- [ ] Confirm GREEN and commit.

### Task 6: PWA and mobile install experience
**Files:** Create/modify Asset Forge manifest metadata and install affordance in the route.
- [ ] Test manifest metadata and mobile workflow labels.
- [ ] Confirm RED.
- [ ] Implement standalone display metadata, icons using existing WISE² assets, and vertical mobile stepper.
- [ ] Confirm GREEN and commit.

### Task 7: Verification and release review
- [ ] Run Asset Forge Jest tests.
- [ ] Run website type-check.
- [ ] Run website lint.
- [ ] Run production build.
- [ ] Manually verify upload → five crops → export → preview on desktop viewport.
- [ ] Verify mobile viewport and install metadata.
- [ ] Verify unauthorized publish is rejected and authorized test publish creates only a review branch.
- [ ] Request code review, address findings, rerun verification, and open the final PR.
