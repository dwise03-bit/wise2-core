# REAPER V1 — LIVE DATA + PROVIDER INTEGRATION ARCHITECTURE

## Primary Principle

Provider → Raw Response → Normalization → Entity Matching → Validation → Provenance → Snapshot → Evidence → Audit Engine

External sources produce observations.
REAPER produces conclusions.

## Provider Categories

SEARCH
BUSINESS_DIRECTORY
MAPS
GEOCODING
WEBSITE_FETCH
WEBSITE_BROWSER
WEBSITE_SCREENSHOT
SOCIAL_DISCOVERY
SOCIAL_DATA
REVIEWS
AI
STORAGE
EMAIL
CRM
ANALYTICS

## Provider Manager

Business logic requests capabilities such as:
business_search
web_search
geocode
nearby_search
website_fetch
website_render
website_screenshot
social_discovery
social_profile
review_sources
reviews

Provider selection considers:
capability
organization preference
health
quota
quality
cost
latency
freshness
fallback

## Provider Strategies

PRIMARY_ONLY
PRIMARY_WITH_FALLBACK
MULTI_SOURCE

## Entity Resolution

Strong signals:
- exact domain
- exact phone
- exact verified cross-link
- exact address
- official listing identifier

Medium:
- business name
- city
- logo similarity
- service category
- social username
- description

Weak:
- similar name only
- same industry only
- same state
- generic logo colors

Suggested Entity Match Score:
0.30 DOMAIN_MATCH
+ 0.25 PHONE_MATCH
+ 0.20 ADDRESS_MATCH
+ 0.10 NAME_MATCH
+ 0.05 CATEGORY_MATCH
+ 0.05 SOCIAL_CROSSLINK
+ 0.05 GEO_MATCH

Thresholds:
>=90 AUTO_MATCH
75–89 HIGH_CONFIDENCE_MATCH if no contradiction
60–74 REVIEW_REQUIRED
<60 DO_NOT_MATCH

## Website Crawling

Modes:
HTTP FETCH
BROWSER RENDER escalation

Quick audit:
~3–5 high-value pages

Standard:
~20–40 pages

Full:
configurable ~100–250 pages

Prioritize:
homepage
contact
services
products
pricing
booking
quote
about
locations
testimonials
case studies

Detect traps:
calendar loops
search params
faceted nav
session IDs
pagination loops
tracking params
duplicate paths

Respect crawl budgets and per-domain rate limits.

## Website Safety

Block:
localhost
127.0.0.0/8
RFC1918 private networks
link-local
cloud metadata endpoints
internal hostnames
non-HTTP schemes

Revalidate redirects.

Do not bypass blocked access or login restrictions.

## Social

Primarily business-facing public profiles.

Do not associate personal accounts merely because an owner name appears on a business website.

Missing metrics = UNKNOWN, never zero.

## Reviews

Normalize ratings.
Deduplicate syndicated reviews.
Use sampling for large volumes:
recent
negative
positive
historical stratified sample

## Provenance

Every normalized observation includes:
provider
source type
source URL
external ID
provider request ID
captured time
reliability

## Snapshots

Do not overwrite historical public signals.

Snapshot:
Business profile
Website
Social profile
Social content
Review source
Competitor
Search visibility

## Freshness

Website: fresh <=30d
Social activity: <=7d preferred
Reviews: <=14d preferred
Business address: <=90d
Brand profile: <=90d unless site changes
Competitor audit: <=30d

All configurable.

## Caching

L1 request cache
L2 application cache
L3 persistent normalized cache

Use stale-while-revalidate for Finder when appropriate.

## Rate Limits

Per provider
Per API key
Per organization
Per domain
Per user

Request priorities:
P0 CRITICAL
P1 INTERACTIVE
P2 AUDIT
P3 ENRICHMENT
P4 MONITORING

## Failure Policy

Optional provider failure creates partial audit + lower confidence.
Critical identity failure may block audit.

Failure taxonomy:
AUTHENTICATION
RATE_LIMIT
TIMEOUT
NETWORK
NOT_FOUND
BLOCKED
INVALID_INPUT
PARSING
NORMALIZATION
ENTITY_AMBIGUOUS
QUOTA_EXCEEDED
PROVIDER_OUTAGE
UNSUPPORTED
UNKNOWN

## Data Quality Score

0.35 SOURCE_RELIABILITY
+ 0.25 ENTITY_MATCH
+ 0.20 COMPLETENESS
+ 0.20 FRESHNESS

## Safety Principle

REAPER analyzes businesses, business-facing profiles, business websites, public commercial reputation, and public customer-facing content.

It does not become personal surveillance, private-profile collection, sensitive-trait profiling, facial recognition, or credential harvesting.
