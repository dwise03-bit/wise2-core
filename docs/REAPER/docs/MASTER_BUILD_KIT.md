# REAPER V1 — TOOL-NEUTRAL MASTER BUILD KIT

Version: 1.0
Parent Ecosystem: WISE² OS
Product: REAPER
Status: AUTHORITATIVE IMPLEMENTATION PACKAGE

## Product Definition

REAPER is a business-intelligence, prospect-discovery, audit, qualification, strategy, proposal, client-conversion, and monitoring platform.

REAPER exists to answer four questions:

1. How healthy does this business appear?
2. How well is its digital presence executed?
3. How large is the gap between current execution and realistic potential?
4. What should WISE² do first to close that gap?

Canonical lifecycle:

DISCOVER → NORMALIZE → MATCH → VERIFY → AUDIT → SCORE → QUALIFY → PRIORITIZE → PREPARE → APPROVE → CONTACT → INTERVIEW → STRATEGIZE → PROPOSE → CONVERT → BUILD → MONITOR → MEASURE → LEARN

## Product Name

REAPER

Internal expansion:
Recon • Evaluate • Analyze • Prioritize • Execute • Rebuild

Parent:
WISE² OS

Strategy layer:
Premeditated Success

## Product Positioning

REAPER is not a generic CRM, generic scraper, generic AI website grader, lead-list generator, social-media stalker, or penetration-testing tool.

REAPER is a source-aware business intelligence engine that identifies businesses where underlying strength exceeds digital execution, proves the gap with evidence, ranks the highest-value interventions, prepares the sales path, and measures the result.

## Canonical Product Principle

GOOD BUSINESS + WEAK OR UNDERDEVELOPED DIGITAL EXECUTION = HIGH-VALUE OPPORTUNITY

Poor business performance plus poor digital execution should NOT automatically create a high REAPER Opportunity Score.

Business Health must remain separate from Digital Execution.

## Authoritative Spec Hierarchy

1. MASTER_BUILD_KIT.md
2. ARCHITECTURE.md
3. AUDIT_RULEBOOK.md
4. UX_UI_SPEC.md
5. LIVE_DATA.md
6. WORKFLOW.md
7. Implementation notes
8. Agent-generated assumptions

## Core Build Rules

DO NOT:
- Collapse Business Health and Digital Execution.
- Treat missing information as failure.
- Treat UNKNOWN as zero.
- Allow AI output to bypass evidence.
- Hard-wire one provider.
- Run full audits inside HTTP request handlers.
- Allow external messages without approval.
- Allow proposals to send without approval.
- Allow pricing to be invented by AI.
- Delete prospect history when converting to client.
- Merge businesses based on name alone.
- Scrape private profiles.
- Bypass access restrictions.
- Use face recognition.
- Infer sensitive personal traits.
- Expose secrets to frontend code.
- Silently change scoring formulas.
- Silently alter sent proposals.

## Monorepo Target

reaper/
  apps/
    web/
    worker/
  packages/
    database/
    domain/
    ui/
    providers/
    live-data/
    intelligence/
    intelligence-rules/
    scoring/
    workflows/
    queue/
    config/
    logging/
    validation/
    types/
  docs/
    architecture/
    audit/
    ui/
    integrations/
    workflows/
    api/
    operations/
  scripts/
  tests/
    unit/
    integration/
    e2e/
    fixtures/
  .env.example
  package.json
  turbo.json
  README.md

## Recommended Stack

Frontend:
- Next.js
- React
- TypeScript
- Tailwind CSS
- Zod

Backend:
- Next.js server endpoints and/or dedicated Node services
- PostgreSQL
- Prisma or Drizzle

Worker:
- Node worker service
- BullMQ or comparable queue abstraction
- Redis-compatible queue/cache

Website inspection:
- HTTP fetch
- Playwright escalation

Storage:
- S3-compatible object storage

Testing:
- Vitest/Jest equivalent
- Playwright E2E
- Storybook or equivalent where practical

Observability:
- Structured logs
- Request IDs
- Audit IDs
- Job IDs
- OpenTelemetry-compatible tracing where practical

## Multi-Tenant Requirement

All organization-owned data MUST contain organization_id.
Server-side authorization MUST enforce organization boundaries.

## Primary Domain Objects

User, Organization, Prospect, Business, Business Location, Business Service, Website, Website Page, Social Profile, Review Source, Review, Brand Profile, Media Asset, Competitor, Audit Run, Audit Job, Evidence, Finding, Score, Opportunity, Recommendation, Blueprint, Proposal, Interview, Client, Project, Task, Approval, Finder Campaign, Automation Rule, Outcome Metric.

## Core Score Family

Website Score
Brand Score
SEO Score
Social Score
Reputation Score
Content Score
Conversion Score
Automation Score
Trust Score
Competitive Position Score
Business Health Score
Digital Execution Score
Growth Potential Score
REAPER Opportunity Score
Premeditated Success Score

Every score must include confidence.

## Mandatory Unknown Model

PASS
FAIL
WARNING
UNKNOWN
NOT_APPLICABLE

UNKNOWN reduces confidence, not raw score.
NOT_APPLICABLE is removed from the denominator.

## Evidence Chain

SOURCE → NORMALIZED OBSERVATION → ENTITY MATCH → EVIDENCE → RULE → FINDING → SCORE INPUT → OPPORTUNITY → RECOMMENDATION → STRATEGY

## Live Data Principle

Provider → Raw response → Normalization → Entity resolution → Validation → Provenance → Snapshot → Evidence → Audit intelligence

## AI Principle

AI may extract, classify, summarize, rank, draft, analyze images, generate structured findings, and generate recommendations.

AI may not invent source evidence, invent pricing, merge businesses alone, make unsupported factual claims, bypass rules, or send external communication without policy/approval.

## UX Principle

BUSINESS → SCORE → WHY → OPPORTUNITY → WHAT NEXT

The interface must expose confidence, evidence, unknown states, strengths, and dependencies.

## Visual Direction

REAPER COMMAND INTELLIGENCE

Dark luxury intelligence.
Near-black foundation.
Graphite surfaces.
Signal-green primary accent.
Electric blue for evidence/data.
Violet for Premeditated Success.
Amber warning.
Red critical.

Avoid excessive neon and gamer HUD clutter.

## V1 Autopilot Policy

Default: LEVEL 1 — ASSIST

REAPER may automatically discover, enrich, quick-audit, score, qualify, rank, generate outreach drafts, generate meeting briefs, generate interview questions, generate blueprint drafts, generate proposal drafts, and monitor.

REAPER requires approval before first outbound message, proposal send, pricing commitment, client conversion, external meeting creation, public publishing, or paid campaign actions.

## Build Phases

M0 Foundation
M1 Product Shell + Core CRM
M2 Audit Orchestration
M3 Live Data Foundation
M4 Website Intelligence
M5 Rules + Scoring
M6 Brand / SEO / Conversion / Reputation
M7 Opportunity + Premeditated Success
M8 Finder + Campaigns + Qualification
M9 Competitor Intelligence
M10 Blueprint + Proposal + Interview
M11 Prospect-to-Client Automation
M12 Mobile/PWA + Monitoring

## First Real Vertical Slice

A user pastes a business URL.

REAPER:
- Creates prospect.
- Creates business.
- Discovers website.
- Crawls homepage/contact/service page.
- Captures desktop/mobile screenshot.
- Generates evidence.
- Runs website rules.
- Calculates Website Score.
- Calculates initial Business Health.
- Calculates initial Digital Execution.
- Calculates initial Growth Potential.
- Calculates REAPER Opportunity Score.
- Shows confidence.
- Shows findings.
- Shows evidence.
- Shows recommendation.

## Final Master Principle

REAPER is a loop:

FIND → PROVE → UNDERSTAND → SCORE → PRIORITIZE → PREPARE → APPROVE → CONVERT → BUILD → MEASURE → LEARN

The product succeeds when a user can move from:
“I wonder if this business is worth pursuing”
to
“I know why this business is a strong opportunity, I can prove it, I know what to recommend, I have the next move prepared, and I can measure whether our work succeeds.”
