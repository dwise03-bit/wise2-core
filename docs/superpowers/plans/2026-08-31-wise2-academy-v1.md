# WISE² Academy V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready WISE² Academy V1 where a learner can enroll, learn, practice in a sandbox, pass an assessment, earn a credential, and publicly verify it.

**Architecture:** Add `apps/academy` as a Next.js 14 app in the existing pnpm/Turborepo monorepo and add a focused `academy` NestJS domain under `packages/api/src`. Reuse WISE² JWT/tenant infrastructure and PostgreSQL/TypeORM, with explicit migrations and isolated simulated sandbox records.

**Tech Stack:** Next.js 14.2.x, React 18, TypeScript 5.3+, Framer Motion, Lucide React, NestJS 10, TypeORM 0.3, PostgreSQL 16, Jest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-08-31-wise2-academy-v1-design.md`

## Global Constraints
- Preserve the approved WISE² Academy black/chrome/neon-green command-center visual; do not use a generic LMS aesthetic.
- Keep WISE² credentials explicitly separate from OpenAI-issued certifications.
- Reuse WISE² authentication and tenant middleware.
- Production TypeORM `synchronize` remains `false`; schema changes require migrations.
- Sandbox data is simulated, visibly labeled, isolated from production tenant identifiers, and resettable.
- Public credential verification exposes only minimum validation data.
- Business OS Operator passing score is 85; other V1 credentials default to 80.
- Node.js >=20 and pnpm 8.15.9 remain the repository runtime baseline.

---

### Task 1: Academy application shell and canonical visual system

**Files:**
- Create: `apps/academy/package.json`
- Create: `apps/academy/tsconfig.json`
- Create: `apps/academy/next.config.js`
- Create: `apps/academy/jest.config.js`
- Create: `apps/academy/app/layout.tsx`
- Create: `apps/academy/app/globals.css`
- Create: `apps/academy/app/page.tsx`
- Create: `apps/academy/components/academy-header.tsx`
- Create: `apps/academy/components/hero.tsx`
- Create: `apps/academy/components/learning-tracks.tsx`
- Create: `apps/academy/components/certification-stack.tsx`
- Create: `apps/academy/__tests__/landing-page.test.tsx`
- Modify: `package.json`

**Interfaces:**
- Produces: Next.js application `@wise2/academy`, dev port 3015, public landing route `/`.

- [ ] **Step 1: Write the landing-page test** asserting the hero text `MASTER AI.` and `MASTER YOUR BUSINESS.`, three learning tracks, certification stack, and Start Learning CTA.
- [ ] **Step 2: Run** `pnpm --filter @wise2/academy test -- landing-page.test.tsx` and verify it fails because the app does not exist.
- [ ] **Step 3: Create the Academy package and app shell** using Next 14.2.35, React 18.2, Framer Motion and Lucide React; add `apps/academy` to root workspaces.
- [ ] **Step 4: Implement the visual tokens** in `globals.css`: carbon surfaces, chrome text treatment, `#7CFF00` primary accent, blue/purple track accents, luminous 1px borders, responsive panel grid, visible focus rings, reduced-motion support.
- [ ] **Step 5: Implement the landing page** with hero, WISE² platform strip, three learning tracks, certification stack and public navigation matching the approved concept.
- [ ] **Step 6: Run** `pnpm --filter @wise2/academy test && pnpm --filter @wise2/academy type-check && pnpm --filter @wise2/academy build`; expect all PASS.
- [ ] **Step 7: Commit** `feat(academy): add Academy application shell and landing experience`.

### Task 2: Academy persistence model and migration

**Files:**
- Create: `packages/api/src/academy/entities/course.entity.ts`
- Create: `packages/api/src/academy/entities/course-module.entity.ts`
- Create: `packages/api/src/academy/entities/lesson.entity.ts`
- Create: `packages/api/src/academy/entities/enrollment.entity.ts`
- Create: `packages/api/src/academy/entities/lesson-progress.entity.ts`
- Create: `packages/api/src/academy/entities/assessment.entity.ts`
- Create: `packages/api/src/academy/entities/assessment-attempt.entity.ts`
- Create: `packages/api/src/academy/entities/practical-submission.entity.ts`
- Create: `packages/api/src/academy/entities/badge.entity.ts`
- Create: `packages/api/src/academy/entities/credential.entity.ts`
- Create: `packages/api/src/academy/entities/sandbox-tenant.entity.ts`
- Create: `packages/api/src/migrations/1788134400000-CreateAcademyV1.ts`
- Create: `packages/api/src/academy/__tests__/academy-entities.spec.ts`

**Interfaces:**
- Produces: TypeORM Academy schema with UUID primary keys; credential statuses `active|expired|revoked`; attempt results `in_progress|passed|failed|pending_review`.

- [ ] **Step 1: Write entity metadata tests** for required relations, unique course slug, unique credential ID, learner/user linkage, tenant linkage and sandbox isolation flag.
- [ ] **Step 2: Run** `pnpm --filter @wise2/platform-api test -- academy-entities.spec.ts`; expect FAIL because entities are absent.
- [ ] **Step 3: Implement focused entity classes** with timestamps and explicit indexes/uniques; keep question/answer payloads in JSONB fields on assessment/attempt instead of creating premature question-table abstractions.
- [ ] **Step 4: Write the forward/reverse migration** creating only the Academy tables, foreign keys and indexes.
- [ ] **Step 5: Run** API tests and `pnpm --filter @wise2/platform-api type-check`; expect PASS.
- [ ] **Step 6: Commit** `feat(academy): add Academy persistence model`.

### Task 3: Catalog, enrollment and progress API

**Files:**
- Create: `packages/api/src/academy/academy.module.ts`
- Create: `packages/api/src/academy/catalog.controller.ts`
- Create: `packages/api/src/academy/learner.controller.ts`
- Create: `packages/api/src/academy/academy.service.ts`
- Create: `packages/api/src/academy/dto/enroll.dto.ts`
- Create: `packages/api/src/academy/dto/update-progress.dto.ts`
- Create: `packages/api/src/academy/__tests__/academy.service.spec.ts`
- Modify: `packages/api/src/app.module.ts`

**Interfaces:**
- Produces: `GET /api/v1/academy/courses`, `GET /api/v1/academy/courses/:slug`, `POST /api/v1/academy/enrollments`, `GET /api/v1/academy/me/enrollments`, `PUT /api/v1/academy/progress/:lessonId`.

- [ ] **Step 1: Write service tests** proving published-only public catalog reads, idempotent enrollment, tenant-scoped learner reads and progress clamped to 0–100.
- [ ] **Step 2: Run the Academy service tests** and verify FAIL.
- [ ] **Step 3: Implement `AcademyService`** with repository injection and learner/tenant scoped methods.
- [ ] **Step 4: Implement public and authenticated controllers** using the repository's existing JWT request-user pattern; reject cross-tenant resource access.
- [ ] **Step 5: Register `AcademyModule`** in `AppModule`.
- [ ] **Step 6: Run Academy tests, API type-check and API build**; expect PASS.
- [ ] **Step 7: Commit** `feat(academy): add catalog enrollment and progress API`.

### Task 4: Learner dashboard and course experience

**Files:**
- Create: `apps/academy/lib/api.ts`
- Create: `apps/academy/lib/auth.ts`
- Create: `apps/academy/app/dashboard/page.tsx`
- Create: `apps/academy/app/learn/[courseSlug]/page.tsx`
- Create: `apps/academy/components/dashboard-shell.tsx`
- Create: `apps/academy/components/progress-card.tsx`
- Create: `apps/academy/components/course-player.tsx`
- Create: `apps/academy/__tests__/learner-dashboard.test.tsx`
- Create: `apps/academy/__tests__/course-player.test.tsx`

**Interfaces:**
- Consumes: Academy catalog/enrollment/progress endpoints from Task 3.
- Produces: dashboard and WATCH → LEARN → TRY → BUILD → PROVE → EARN course UI.

- [ ] **Step 1: Write dashboard tests** for current level, progress, credentials placeholder state, next course and recent activity.
- [ ] **Step 2: Write course-player tests** proving lesson completion calls the progress endpoint and stage navigation remains keyboard accessible.
- [ ] **Step 3: Run tests** and verify FAIL.
- [ ] **Step 4: Implement API client/auth adapter** without duplicating WISE² identity logic.
- [ ] **Step 5: Implement dashboard and course player** matching the approved command-center visual.
- [ ] **Step 6: Run Academy tests, type-check and build**; expect PASS.
- [ ] **Step 7: Commit** `feat(academy): add learner dashboard and course experience`.

### Task 5: Deterministic WISE² sandbox company

**Files:**
- Create: `packages/api/src/academy/sandbox.service.ts`
- Create: `packages/api/src/academy/sandbox.controller.ts`
- Create: `packages/api/src/academy/fixtures/abc-heating.fixture.ts`
- Create: `packages/api/src/academy/__tests__/sandbox.service.spec.ts`
- Create: `apps/academy/app/labs/page.tsx`
- Create: `apps/academy/components/sandbox-company.tsx`
- Create: `apps/academy/__tests__/sandbox-company.test.tsx`

**Interfaces:**
- Produces: `POST /api/v1/academy/sandbox`, `GET /api/v1/academy/sandbox`, `POST /api/v1/academy/sandbox/reset` and deterministic `ABC Heating & Cooling` training state.

- [ ] **Step 1: Write sandbox tests** proving each learner receives isolated simulated state, reset restores fixture values, and production tenant IDs are rejected.
- [ ] **Step 2: Run tests** and verify FAIL.
- [ ] **Step 3: Implement fixture and sandbox service/controller** with explicit `isSimulation=true` enforcement.
- [ ] **Step 4: Implement the Labs UI** with Leads, Calls, Jobs, Invoices, Customers and Automation Alerts panels plus persistent `SIMULATED TRAINING DATA` disclosure.
- [ ] **Step 5: Run API and Academy test/type/build checks**; expect PASS.
- [ ] **Step 6: Commit** `feat(academy): add isolated training sandbox`.

### Task 6: Assessments and practical review

**Files:**
- Create: `packages/api/src/academy/assessment.service.ts`
- Create: `packages/api/src/academy/assessment.controller.ts`
- Create: `packages/api/src/academy/dto/submit-assessment.dto.ts`
- Create: `packages/api/src/academy/dto/review-practical.dto.ts`
- Create: `packages/api/src/academy/__tests__/assessment.service.spec.ts`
- Create: `apps/academy/app/assessments/page.tsx`
- Create: `apps/academy/components/assessment-runner.tsx`

**Interfaces:**
- Produces: assessment start/submit endpoints, practical submission endpoint, admin review endpoint and weighted final score calculation `knowledge*.20 + scenario*.30 + practical*.50`.

- [ ] **Step 1: Write scoring tests** for 20/30/50 weighting, default 80 threshold, BOS 85 threshold and pending practical review.
- [ ] **Step 2: Run tests** and verify FAIL.
- [ ] **Step 3: Implement assessment lifecycle** so server-side scoring owns pass/fail; clients cannot submit a final score.
- [ ] **Step 4: Implement assessment UI** with autosaved answers and explicit submission confirmation.
- [ ] **Step 5: Run API and Academy checks**; expect PASS.
- [ ] **Step 6: Commit** `feat(academy): add assessments and practical review`.

### Task 7: Credential issuance and public verification

**Files:**
- Create: `packages/api/src/academy/credential.service.ts`
- Create: `packages/api/src/academy/credential.controller.ts`
- Create: `packages/api/src/academy/__tests__/credential.service.spec.ts`
- Create: `apps/academy/app/credentials/page.tsx`
- Create: `apps/academy/app/verify/[credentialId]/page.tsx`
- Create: `apps/academy/components/credential-card.tsx`
- Create: `apps/academy/components/certificate.tsx`
- Create: `apps/academy/__tests__/credential-verification.test.tsx`

**Interfaces:**
- Produces: `GET /api/v1/academy/me/credentials`, `GET /api/v1/academy/credentials/verify/:credentialId`, internal `issueCredential(...)`, admin revoke operation, and QR target `https://academy.wise2.net/verify/{credentialId}`.

- [ ] **Step 1: Write credential tests** proving only passed/evaluated requirements issue credentials, issuance is idempotent, IDs match `W2-{CODE}-{YEAR}-{SERIAL}`, revoked credentials verify as revoked, and public DTO omits email/internal IDs.
- [ ] **Step 2: Run tests** and verify FAIL.
- [ ] **Step 3: Implement issuance/verification/revocation** with database uniqueness protecting duplicate IDs.
- [ ] **Step 4: Implement credential wallet, certificate visual and public verification page** matching the approved concept; render a QR code pointing only to the verification URL.
- [ ] **Step 5: Run all Academy/API checks**; expect PASS.
- [ ] **Step 6: Commit** `feat(academy): add verifiable WISE2 credentials`.

### Task 8: Seed V1 curriculum and Academy administration

**Files:**
- Create: `packages/api/src/academy/academy-admin.controller.ts`
- Create: `packages/api/src/academy/academy-admin.service.ts`
- Create: `packages/api/src/academy/fixtures/v1-curriculum.fixture.ts`
- Create: `packages/api/src/academy/__tests__/academy-admin.spec.ts`
- Create: `apps/academy/app/admin/page.tsx`
- Create: `apps/academy/components/admin-course-manager.tsx`

**Interfaces:**
- Produces: admin publish/update/review/revoke operations and deterministic seed definitions for AI Ready, AI Operator, Workflow Builder, Agent Operator, Business OS Operator and HVAC Field Tech Specialist.

- [ ] **Step 1: Write authorization tests** proving learners cannot mutate courses, review practicals or revoke credentials.
- [ ] **Step 2: Run tests** and verify FAIL.
- [ ] **Step 3: Implement Academy admin service/controller** using the existing WISE² role/permission pattern.
- [ ] **Step 4: Add idempotent V1 curriculum seed data** with course codes, slugs, levels and pass thresholds.
- [ ] **Step 5: Implement minimal admin UI** for publish state, enrollments, pending practicals and credential revocation; avoid building a full generic LMS authoring suite in V1.
- [ ] **Step 6: Run checks**; expect PASS.
- [ ] **Step 7: Commit** `feat(academy): add V1 curriculum and administration`.

### Task 9: Deployment, subdomain and end-to-end acceptance

**Files:**
- Create: `apps/academy/Dockerfile`
- Create: `docs/ACADEMY_DEPLOYMENT.md`
- Create: `scripts/test-academy-e2e.sh`
- Modify: the active production compose/Traefik configuration identified at execution time only after confirming which compose file currently serves `wise2.net`.

**Interfaces:**
- Produces: deployable Academy container on internal port 3015 and HTTPS host `academy.wise2.net`.

- [ ] **Step 1: Write `scripts/test-academy-e2e.sh`** to fail unless landing page, catalog, authenticated enrollment/progress, sandbox reset, assessment submission, credential issuance and public verification all succeed.
- [ ] **Step 2: Run the E2E script before deployment wiring** and verify the expected host-routing check fails.
- [ ] **Step 3: Add production Docker build** using the monorepo package manager/runtime baseline.
- [ ] **Step 4: Inspect the currently active production compose/Traefik file** and add Academy without changing unrelated routes.
- [ ] **Step 5: Configure DNS/Traefik instructions** for `academy.wise2.net`, TLS, API origin and health checks in `ACADEMY_DEPLOYMENT.md`.
- [ ] **Step 6: Run** Academy tests, API Academy tests, type-checks, builds, migration dry-run against a disposable database, then `scripts/test-academy-e2e.sh`; all must PASS.
- [ ] **Step 7: Commit** `deploy(academy): add Academy production deployment`.

## Final Acceptance Gate
- [ ] Landing page visually matches the approved Academy concept at desktop and mobile breakpoints.
- [ ] No horizontal overflow at 390px width.
- [ ] Keyboard-only learner flow works through course and assessment controls.
- [ ] Sandbox data is clearly marked simulated and isolated.
- [ ] Cross-tenant tests pass.
- [ ] A learner can complete the full enroll → learn → lab → assess → credential → verify loop.
- [ ] Public verification does not leak learner email, tenant IDs, answers or internal assessment evidence.
- [ ] WISE² credential copy never implies OpenAI certification.
- [ ] Full relevant test/type/build suite passes before PR review.
