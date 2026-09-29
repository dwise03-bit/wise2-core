# REAPER V1 — PROSPECT-TO-CLIENT AUTOMATION WORKFLOW + STATE MACHINE

## Core Principle

REAPER automates:
DISCOVERY
ENRICHMENT
AUDITING
QUALIFICATION
PRIORITIZATION
RECOMMENDATION
PREPARATION
MONITORING

Human approval is required for:
First-contact outreach
Sending proposals
Changing pricing
Contractual commitments
Client conversion
Paid advertising
Public publishing

## Prospect States

DISCOVERED
ENRICHING
READY_FOR_QUALIFICATION
QUALIFIED
DISQUALIFIED
AUDIT_QUEUED
AUDITING
AUDITED
NEEDS_REVIEW
HOT_LEAD
OUTREACH_READY
CONTACT_APPROVED
CONTACTED
ENGAGED
MEETING_SCHEDULED
INTERVIEWING
INTERVIEW_COMPLETE
STRATEGY_READY
PROPOSAL_DRAFT
PROPOSAL_APPROVAL
PROPOSAL_SENT
PROPOSAL_VIEWED
FOLLOW_UP
NEGOTIATION
WON
LOST
CLIENT
MONITOR
ARCHIVED

## Lead Queues

VERIFY IDENTITY
NEEDS ENRICHMENT
READY TO AUDIT
AUDITS RUNNING
NEEDS HUMAN REVIEW
HOT LEADS
OUTREACH READY
FOLLOW-UP DUE
PROPOSALS OPEN
NEGOTIATIONS
MONITOR

## Prequalification

PQS =
0.20 CATEGORY_FIT
+ 0.15 GEO_FIT
+ 0.20 BUSINESS_SIGNAL_STRENGTH
+ 0.20 DIGITAL_GAP_ESTIMATE
+ 0.15 PROJECT_SCOPE_ESTIMATE
+ 0.10 ENTITY_CONFIDENCE

Bands:
85–100 auto-promote to quick audit if campaign permits
70–84 priority enrichment
55–69 review queue
<55 do not promote automatically

## Hot Lead Logic

Opportunity Score >=80
Business Health >=55
Confidence >=65
No identity blocker
Not CLIENT/LOST/ARCHIVED

## Outreach

REAPER may automatically create an Outreach Package:
- Business
- Contact options
- Reason for outreach
- One strong positive observation
- One or two high-value opportunities
- Suggested opener
- Suggested meeting goal
- Suggested CTA

It does NOT send by default.

## Follow-Up

Default suggested tasks:
Day 0 initial outreach
Day 3 follow-up
Day 7 second follow-up
Day 14 final follow-up
Then MONITOR

These are tasks by default, not autonomous sends.

## Approval Policies

AUTO
REVIEW_REQUIRED
MANUAL_ONLY

Safe AUTO:
Add queue item
Create task
Generate audit
Generate internal summary
Generate outreach draft
Generate interview questions
Update scores
Create monitoring refresh
Send internal notification

REVIEW_REQUIRED:
Outreach send
Follow-up send
Proposal send
Client-facing audit send
External meeting request

MANUAL_ONLY:
Accept contract
Commit pricing
Create binding agreement
Charge customer
Start paid campaign
Public publish
Convert prospect to client

## Interview

Question priority:
0.30 STRATEGIC_IMPORTANCE
+ 0.25 UNKNOWN_REDUCTION
+ 0.20 RECOMMENDATION_DEPENDENCY
+ 0.15 BUSINESS_RELEVANCE
+ 0.10 CLIENT_EFFORT_INVERSE

Interview completion may:
update business profile
recalculate confidence
update automation score
update recommendations
update Premeditated Success
generate strategy delta

## Proposal

Pricing comes only from:
Approved service catalog
Manual pricing
Configured package rules
Explicit estimator

No AI-invented pricing.

## Client Conversion

WON → CLIENT requires human confirmation.
Conversion transaction creates:
Client
Project
Onboarding state
Blueprint link
Initial tasks
Monitoring baseline

Prospect history is preserved.

## Monitoring

After project completion:
monitor website
reviews
social
search visibility
authorized client metrics

Outcome source types:
PUBLIC_SIGNAL
CLIENT_REPORTED
CONNECTED_SYSTEM
CALCULATED

## Canonical Workflow

FINDER CAMPAIGN
→ DISCOVERED
→ ENRICHED
→ QUALIFIED
→ AUDITED
→ HOT LEAD
→ OUTREACH READY
→ CONTACTED
→ ENGAGED
→ MEETING
→ INTERVIEW
→ STRATEGY
→ BLUEPRINT
→ PROPOSAL
→ NEGOTIATION
→ WON
→ CLIENT
→ PROJECT
→ MONITOR
→ RESULT
→ LEARN
