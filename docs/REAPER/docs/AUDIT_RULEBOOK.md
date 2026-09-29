# REAPER V1 — AUDIT INTELLIGENCE RULEBOOK

## Core Logic

SOURCE → OBSERVATION → RULE → FINDING → SCORE INPUT → OPPORTUNITY → RECOMMENDATION

Every rule returns:
PASS | FAIL | WARNING | UNKNOWN | NOT_APPLICABLE

Every important finding must answer:
- What did we observe?
- Where did we observe it?
- When?
- How reliable is the source?
- Which rule fired?
- How did it affect score?
- What should happen next?

## Confidence

Final finding confidence =
0.30 EVIDENCE_COVERAGE
+ 0.25 SOURCE_RELIABILITY
+ 0.20 CROSS_SOURCE_AGREEMENT
+ 0.15 DATA_FRESHNESS
+ 0.10 DETECTION_CONFIDENCE

Bands:
90–100 VERY HIGH
80–89 HIGH
65–79 MEDIUM
50–64 LOW
<50 VERY LOW

## Severity

0.30 BusinessImpact
+ 0.25 ConversionImpact
+ 0.15 CustomerImpact
+ 0.15 TrustImpact
+ 0.10 Breadth
+ 0.05 Urgency

Bands:
0–24 INFO
25–44 LOW
45–64 MEDIUM
65–84 HIGH
85–100 CRITICAL

## Website Checks

- Website presence
- Availability
- HTTPS
- Mobile responsiveness
- Mobile CTA visibility
- Navigation clarity
- Broken navigation
- Primary value proposition
- Service clarity
- Content thinness
- Duplicate content signal
- Page structure
- Footer completeness
- Contact information consistency
- Contact accessibility
- Primary CTA
- CTA competition
- Form quality
- Public-form failure
- Phone CTA
- Booking relevance
- Chat appropriateness
- Performance
- Oversized images
- Video performance
- Accessibility basics
- Broken links
- Tech-stack signal

## Brand Checks

- Logo presence
- Logo consistency
- Color consistency
- Typography consistency
- Distinctiveness
- Memorability
- Scalability
- Visual quality consistency
- Business photo quality
- Message consistency
- Tagline quality
- Professionalism

## SEO Checks

- Title tags
- Meta descriptions
- H1 relevance
- Indexability
- XML sitemap
- robots.txt
- Canonicals
- Local business information
- Location pages
- Structured data
- Internal links
- Content topic coverage
- Search intent alignment
- Image SEO

## Social Checks

- Profile discovery
- Profile completeness
- Brand consistency
- Posting recency
- Posting frequency
- Content mix
- Visual quality
- Short-form video
- CTA usage
- Public engagement signal
- Response signal
- Platform relevance

## Reputation Checks

- Average rating
- Review volume
- Review recency
- Review velocity
- Unusual review concentration
- Owner response rate
- Negative-review response
- Sentiment topics
- Recurring complaints
- Testimonial opportunity

## Content Checks

- Content inventory
- Customer proof
- Case studies
- Before/after content
- Authority content
- Content consistency
- Repurposing

## Conversion Checks

Customer journey:
DISCOVER → UNDERSTAND → TRUST → ACT → CONFIRM → FOLLOW UP → RETURN

Check:
- Discovery-to-understanding
- Understanding-to-trust
- Trust-to-action
- Action-to-confirmation
- Follow-up readiness
- Offer clarity
- Lead magnet appropriateness
- Expired promotions
- Retargeting readiness

## Trust Checks

- Business identity transparency
- Team visibility where relevant
- Credentials as business claims
- Policy presence where relevant
- Testimonial transparency
- Trust-signal consistency

## Automation Checks

Only use verified signals.
No evidence = UNKNOWN.

Categories:
- Lead routing
- Email follow-up
- SMS follow-up
- Booking automation
- Review automation
- CRM readiness
- Retention automation
- Reporting

## Competitor Checks

- Competitor relevance
- Digital score comparison
- Relative gaps
- Competitive advantages
- Competitive weaknesses
- Positioning white space
- Offer gaps
- Content gaps
- Review gaps

## Business Health Checks

- Recent business activity
- Customer proof
- Reputation strength
- Service clarity
- Market presence
- Longevity signals
- Public business-health warnings

## Cross-Module Patterns

Golden Prospect:
Business Health >= 70
Reputation >= 75
Digital Execution <= 55
Growth Potential >= 75
Confidence >= 70

Strong Business / Weak Website:
Business Health >= 65
Website <= 50
Reputation >= 65

Strong Reviews / Weak Proof Display:
Reputation >= 80
Website proof <= 50

Active Social / Weak Conversion:
Social >= 70
Conversion <= 50

Great Brand / Weak Website:
Brand >= 75
Website <= 55

Great Website / Weak Brand:
Website >= 75
Brand <= 50

Visual Business / No Video:
High visual suitability
Customer proof >= 60
Short-form video <= 20

Commercial Opportunity Gap:
Business provides commercial services
Commercial visibility <= 40
Competitors visibly target commercial buyers

## Recommendation Catalog

WEBSITE_CREATION
WEBSITE_REBUILD
WEBSITE_MODERNIZATION
HOMEPAGE_POSITIONING_REWRITE
MOBILE_REBUILD
NAVIGATION_RESTRUCTURE
SERVICE_PAGE_SYSTEM
COMMERCIAL_LANDING_SYSTEM
LOCAL_LANDING_SYSTEM
PRIMARY_CTA_SYSTEM
CONTACT_FLOW_SIMPLIFICATION
QUOTE_FLOW_OPTIMIZATION
BOOKING_SYSTEM
FORM_OPTIMIZATION
PERFORMANCE_OPTIMIZATION
IMAGE_OPTIMIZATION
ACCESSIBILITY_REMEDIATION
SEO_TECHNICAL_CLEANUP
SEO_CONTENT_EXPANSION
LOCAL_PRESENCE_CLEANUP
SCHEMA_IMPLEMENTATION
INTERNAL_LINKING_SYSTEM
BRAND_REFRESH
BRAND_REBUILD
LOGO_SUITE_EXPANSION
LOGO_SYSTEM_STANDARDIZATION
BRAND_COLOR_SYSTEM
BRAND_TYPE_SYSTEM
POSITIONING_ALIGNMENT
POSITIONING_WHITE_SPACE
VISUAL_CONTENT_UPGRADE
BRAND_PHOTO_LIBRARY
SOCIAL_PROFILE_CLEANUP
SOCIAL_TEMPLATE_SYSTEM
SOCIAL_CONTENT_SYSTEM
SHORT_FORM_VIDEO_ENGINE
CONTENT_REPURPOSING_PIPELINE
TESTIMONIAL_SYSTEM
CASE_STUDY_SYSTEM
BEFORE_AFTER_SYSTEM
AUTHORITY_CONTENT_SYSTEM
REVIEW_RESPONSE_SYSTEM
REVIEW_GENERATION_SYSTEM
REPUTATION_AUTOMATION
CRM_AUDIT
LEAD_ROUTING_AUTOMATION
FOLLOW_UP_AUTOMATION
BOOKING_AUTOMATION
RETENTION_AUTOMATION
REPORTING_DASHBOARD
SOCIAL_TO_LEAD_FUNNEL
CUSTOMER_JOURNEY_REBUILD
WISE2_FULL_REBUILD

## Canonical Rulebook Principle

REAPER must say:
WHAT IS HAPPENING
HOW WE KNOW
WHY IT MATTERS
HOW CERTAIN WE ARE
WHAT OPPORTUNITY IT CREATES
WHAT SHOULD HAPPEN NEXT
IN WHAT ORDER
