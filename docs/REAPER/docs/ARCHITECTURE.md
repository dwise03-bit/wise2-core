# REAPER V1 — TECHNICAL ARCHITECTURE MASTER SPEC

## System Layers

A. Application UI
B. Application API
C. Intelligence Services
D. Provider Adapters
E. Worker / Queue System
F. Persistent Data

## Recommended Core Architecture

- Next.js + React + TypeScript
- PostgreSQL
- Prisma or Drizzle
- Redis-compatible cache/queue
- BullMQ or comparable queue abstraction
- S3-compatible object storage
- Playwright for approved website inspection
- Zod validation
- Structured logging
- OpenTelemetry-compatible observability

## Core Provider Interfaces

AIProvider
SearchProvider
WebsiteProvider
SocialProvider
ReviewProvider
MapProvider
StorageProvider

Business logic requests capabilities, not vendor names.

## Key Database Areas

users
organizations
organization_members
prospects
businesses
business_locations
business_services
websites
website_pages
social_profiles
social_metric_snapshots
review_sources
reviews
brand_profiles
media_assets
competitors
audit_runs
audit_jobs
evidence
audit_findings
finding_evidence
scores
opportunities
opportunity_findings
recommendations
blueprints
proposals
interviews
interview_questions
interview_answers
clients
projects
notes
tags
entity_tags
activities
provider_connections
system_events
outcome_metrics
recommendation_outcomes

## Audit DAG

BUSINESS_DISCOVERY
→ WEBSITE_DISCOVERY
→ parallel:
  WEBSITE_CRAWL
  SOCIAL_DISCOVERY
  REVIEW_DISCOVERY
  COMPETITOR_DISCOVERY

WEBSITE_CRAWL → WEBSITE_ANALYSIS
WEBSITE_ANALYSIS → SEO_ANALYSIS
WEBSITE_ANALYSIS → CONVERSION_ANALYSIS
WEBSITE_ANALYSIS → BRAND_ANALYSIS
SOCIAL_DISCOVERY → SOCIAL_ANALYSIS
REVIEW_DISCOVERY → REPUTATION_ANALYSIS
COMPETITOR_DISCOVERY → COMPETITOR_ANALYSIS

Then:
MEDIA_COLLECTION
→ SCORE_CALCULATION
→ OPPORTUNITY_DETECTION
→ STRATEGY_RANKING
→ SUMMARY_GENERATION

Blueprint and proposal generation happen on demand.

## Core Scoring Formulas

Website Score:
0.15 UX
+ 0.15 MOBILE
+ 0.15 CONVERSION
+ 0.10 PERFORMANCE
+ 0.10 TRUST
+ 0.10 CONTENT
+ 0.10 TECHNICAL
+ 0.10 STRUCTURE
+ 0.05 ACCESSIBILITY

Brand Score:
0.20 CONSISTENCY
+ 0.20 PROFESSIONALISM
+ 0.15 DISTINCTIVENESS
+ 0.15 MEMORABILITY
+ 0.10 MODERNITY
+ 0.10 MESSAGE_CLARITY
+ 0.10 SCALABILITY

SEO Score:
0.20 TECHNICAL_SEO
+ 0.15 PAGE_METADATA
+ 0.15 CONTENT_RELEVANCE
+ 0.15 LOCAL_SEO
+ 0.10 STRUCTURED_DATA
+ 0.10 INTERNAL_STRUCTURE
+ 0.10 INDEXABILITY
+ 0.05 CONTENT_DEPTH

Social Score:
0.15 PROFILE_COMPLETENESS
+ 0.20 ACTIVITY
+ 0.15 CONSISTENCY
+ 0.15 CONTENT_QUALITY
+ 0.10 VIDEO_USAGE
+ 0.10 ENGAGEMENT_SIGNAL
+ 0.10 CTA_USAGE
+ 0.05 PLATFORM_COVERAGE

Reputation Score:
0.30 RATING_SCORE
+ 0.20 REVIEW_VOLUME
+ 0.15 REVIEW_RECENCY
+ 0.10 REVIEW_VELOCITY
+ 0.15 OWNER_RESPONSE
+ 0.10 SENTIMENT_STABILITY

Conversion Score:
0.20 CTA_CLARITY
+ 0.15 CONTACT_EASE
+ 0.15 LEAD_CAPTURE
+ 0.10 BOOKING
+ 0.10 TRUST_ELEMENTS
+ 0.10 OFFER_CLARITY
+ 0.10 FOLLOW_UP_READINESS
+ 0.10 CUSTOMER_JOURNEY

Business Health:
0.30 REPUTATION
+ 0.20 BUSINESS_ACTIVITY
+ 0.15 MARKET_PRESENCE
+ 0.15 CUSTOMER_PROOF
+ 0.10 SERVICE_CLARITY
+ 0.10 LONGEVITY_SIGNAL

Digital Execution:
0.18 WEBSITE
+ 0.14 BRAND
+ 0.12 SEO
+ 0.12 SOCIAL
+ 0.10 CONTENT
+ 0.12 CONVERSION
+ 0.08 AUTOMATION
+ 0.08 TRUST
+ 0.06 COMPETITIVE_POSITION

Growth Potential:
0.20 MARKET_OPPORTUNITY
+ 0.20 DIGITAL_GAP
+ 0.15 REPUTATION_STRENGTH
+ 0.15 SERVICE_EXPANSION
+ 0.10 COMPETITOR_GAP
+ 0.10 CONTENT_OPPORTUNITY
+ 0.10 AUTOMATION_OPPORTUNITY

Digital Gap = 100 - Digital Execution

REAPER Opportunity Score:
0.25 BUSINESS_HEALTH
+ 0.25 DIGITAL_GAP
+ 0.20 GROWTH_POTENTIAL
+ 0.10 COMPETITIVE_GAP
+ 0.10 PROJECT_SCOPE_POTENTIAL
+ 0.10 BUYER_READINESS_SIGNAL

Confidence factor:
0.60 + (OverallConfidence / 100 × 0.40)

Apply viability multiplier so weak businesses do not outrank healthy businesses merely because their digital execution is poor.

## Premeditated Success Score

BENEFIT =
0.25 IMPACT
+ 0.20 REVENUE_POTENTIAL
+ 0.15 LEAD_POTENTIAL
+ 0.15 CONVERSION_IMPACT
+ 0.10 BRAND_IMPACT
+ 0.15 OPERATIONAL_IMPACT

FRICTION =
0.40 EFFORT
+ 0.30 COST
+ 0.30 TIME_TO_VALUE

CONFIDENCE_FACTOR =
0.5 + (CONFIDENCE / 200)

SPS =
(BENEFIT × 0.75 + (100 - FRICTION) × 0.25)
× CONFIDENCE_FACTOR

Normalize to max 100.

## Architectural Invariants

- Multi-tenant organization isolation.
- Long-running jobs stay off request handlers.
- Scores are versioned.
- Findings cite evidence.
- Provider adapters are swappable.
- UNKNOWN is not failure.
- Human overrides preserve machine result + reason.
- Sent proposals are snapshots.
