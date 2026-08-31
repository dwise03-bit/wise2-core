# WISE² Academy V1 Design

## Goal
Build `academy.wise2.net` as the education and credentialing layer of WISE² United, using the approved black/chrome/neon-green Academy visual as the canonical UI target.

## Product Scope
V1 ships a public Academy site, authenticated learner dashboard, course experience, sandbox company, assessments, credentials, public credential verification, and Academy administration.

Initial certification stack:
1. AI Ready
2. AI Operator
3. Workflow Builder
4. Agent Operator
5. Business OS Operator
6. HVAC Field Tech Specialist

OpenAI Academy content may be referenced as external prerequisite/recommended learning where appropriate, but WISE² credentials must never be represented as OpenAI certifications.

## Architecture
Academy remains inside the `wise2-core` monorepo.

- `apps/academy`: Next.js 14 learner/public application, matching the approved WISE² Academy visual.
- `packages/api/src/academy`: NestJS Academy domain module.
- Existing WISE² JWT identity and tenant context are reused.
- Existing PostgreSQL/TypeORM infrastructure is reused; schema changes are migrations only because production `synchronize` is false.
- Existing shared WISE² packages are reused where they fit without coupling Academy presentation to the current dashboard.

## Public Experience
Routes:
- `/` — Academy landing page
- `/courses` — course catalog
- `/certifications` — certification stack and tracks
- `/verify/[credentialId]` — public credential verification

Hero copy:
- WISE² ACADEMY
- MASTER AI. MASTER YOUR BUSINESS.
- Learn the systems, AI agents and workflows powering the next generation of businesses.

The public site shows the three tracks: Employee, Business Owner, Builder/Partner.

## Authenticated Experience
Routes:
- `/dashboard`
- `/learn/[courseSlug]`
- `/labs`
- `/assessments`
- `/credentials`

Dashboard presents level, course progress, earned credentials, learning streak, current course, next course, and recent activity.

Course interaction follows six stages: WATCH → LEARN → TRY → BUILD → PROVE → EARN.

## Sandbox Company
V1 provides a deterministic training tenant named `ABC Heating & Cooling`. Seeded training state includes leads, calls, jobs, invoices, customers, and automation alerts. Sandbox data is isolated from production tenant records and resettable. Every sandbox surface must visibly state that its data is simulated for training.

## Assessments
Credential decisions combine:
- 20% knowledge questions
- 30% scenario evaluation
- 50% practical execution

Core credentials require an overall passing score of 80 unless a course explicitly sets a higher threshold. Business OS Operator requires 85.

Attempts preserve score, answers/evidence, timestamps, pass/fail result, and evaluator information for practical submissions.

## Credentials
Credential IDs use the format `W2-{CODE}-{YEAR}-{SERIAL}`. Example: `W2-BOS-2026-00057`.

A credential contains learner identity, credential type, issue date, status, assessment evidence reference, and optional expiration. Status values: active, expired, revoked.

Public verification reveals only the minimum credential information needed to validate authenticity. Verification pages must not expose private learner account data.

Certificate and credential visuals use carbon black, chrome W² branding, neon-green edge lighting, a W² seal, and a QR code linking to the public verification route.

## Academy API Domain
Primary resources:
- Course
- CourseModule
- Lesson
- Enrollment
- LessonProgress
- Assessment
- AssessmentAttempt
- PracticalSubmission
- Badge
- Credential
- SandboxTenant

Controllers expose catalog reads publicly where appropriate, authenticated learner progress/attempt operations, credential verification, and role-protected Academy administration.

## Visual System
Canonical target is the approved WISE² Academy concept visual generated in this project. Preserve:
- near-black/carbon canvas
- metallic/chrome W² identity
- electric neon green as primary action/status accent
- restrained blue for Business Owner track
- restrained purple for Builder/Partner track
- thin luminous panel borders
- dense but readable command-center information hierarchy
- desktop-first command-center layout with fully responsive mobile adaptation

Do not substitute a generic LMS aesthetic. Academy must visibly belong to WISE² United.

## Accessibility and Responsive Behavior
All controls are keyboard reachable, visible focus states are required, semantic headings and landmarks are used, and critical status information is not communicated by color alone. Desktop panels collapse into a single-column mobile learner experience without horizontal scrolling.

## Security
Reuse WISE² authentication and tenant middleware. Learner mutations require authentication. Admin mutations require an Academy admin role/permission. Public verification is read-only and returns a deliberately limited DTO. Sandbox writes can never target production tenant identifiers.

## V1 Success Criteria
A user can:
1. visit `academy.wise2.net` and understand the Academy offering;
2. authenticate using WISE² identity;
3. enroll in AI Operator;
4. complete lessons and persist progress;
5. enter the simulated company lab;
6. submit an assessment/practical;
7. earn a WISE² credential when requirements are satisfied;
8. open the credential and QR verification page;
9. verify the credential publicly by ID.

An Academy administrator can create/publish course content, inspect enrollments/attempts, evaluate practical submissions, and revoke credentials.

## Out of Scope for V1
- Selling Academy courses as standalone ecommerce products
- External partner commissions
- Automated proctoring
- OpenAI-issued credential synchronization
- SCORM/xAPI compatibility
- Native iOS/Android Academy apps
- Full Level 06/07 partner/architect curriculum

These can be layered on after the V1 learning and credential loop is proven.
