# REAPER V1 — ACCEPTANCE CHECKLIST

## Foundation
[ ] App starts locally
[ ] Database migrations run
[ ] Auth works
[ ] Organization isolation passes
[ ] Environment validation works
[ ] CI runs tests
[ ] No secrets committed

## Core CRM
[ ] Create prospect
[ ] Create/link business
[ ] Valid state transitions
[ ] Invalid transitions blocked
[ ] Score cards show confidence
[ ] Business Health and Digital Execution shown separately

## Audit Orchestration
[ ] Audit starts asynchronously
[ ] Worker processes jobs
[ ] Progress is weighted and real
[ ] Optional failure produces PARTIAL
[ ] Critical dependency blocks correctly
[ ] Retry works
[ ] Duplicate start suppressed

## Live Data
[ ] Provider swappable
[ ] Raw schemas normalized
[ ] Entity collisions handled
[ ] Stale lowers confidence
[ ] Missing provider data = UNKNOWN
[ ] Provider fallback works
[ ] Provenance preserved

## Website Intelligence
[ ] SSRF blocked
[ ] JS site rendering escalation
[ ] Crawl budget enforced
[ ] Trap detection works
[ ] Desktop/mobile screenshots captured
[ ] Evidence links to source

## Scoring
[ ] UNKNOWN does not lower raw score
[ ] NOT_APPLICABLE excluded
[ ] Formula versions stored
[ ] Confidence stored
[ ] Strong business/weak website outranks weak business/weak website
[ ] Golden Prospect pattern works

## Automation
[ ] Outreach draft can auto-generate
[ ] Outreach send blocked without approval
[ ] Proposal send blocked without approval
[ ] Suppression blocks contact
[ ] Client conversion preserves history
[ ] Duplicate events are idempotent

## Release Blockers
[ ] No cross-tenant leak
[ ] No approval bypass
[ ] No SSRF vulnerability
[ ] No frontend secret exposure
[ ] No wrong-business auto-merge at high confidence
[ ] No sent-proposal mutation
[ ] No crawler runaway
