# REAPER V1 M0 Quick Start

## What Just Got Built

✅ **Complete M0 Foundation** integrated into wise2-core in one session:

### Database
- 13 Prisma models for REAPER entities (Org, Prospect, Business, Website, Audit, Evidence, Finding, Score, etc.)
- Multi-tenant architecture (every table has `organizationId`)
- Migration SQL ready in `packages/db/prisma/migrations/add_reaper_m0_foundation/`

### API
- 8 NestJS endpoints at `/api/reaper/*` (health, prospects, audits, scores, opportunities)
- Fixture data for M0 testing
- Integrated into AppModule

### Scoring Engine
- All 14 scoring formulas from ARCHITECTURE.md
- `calculateScore()` function with confidence tracking
- Component breakdown and reasoning

### Providers
- Interface contracts for Website, Search, Review, Social
- Fixture implementations for testing without external APIs
- ProviderRegistry for dependency injection

### Domain Types
- TypeScript types for all REAPER entities
- Score types, prospect status, audit status enums
- Confidence model (UNKNOWN, FAIL, WARNING, PASS, NOT_APPLICABLE)

## Next: Run M0

### 1. Create Database Tables
```bash
cd packages/db
npx prisma migrate dev --name add_reaper_m0_foundation
```

### 2. Start API
```bash
npm run dev
# API starts on http://localhost:3001
```

### 3. Test Endpoints
```bash
# Health check
curl http://localhost:3001/api/reaper/health

# Create prospect
curl -X POST http://localhost:3001/api/reaper/prospects \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Acme Corp",
    "sourceUrl": "https://acmecorp.com",
    "contactName": "John Doe",
    "contactEmail": "john@acmecorp.com"
  }'

# Start audit (replace with prospectId from above)
curl -X POST http://localhost:3001/api/reaper/prospects/PROSPECT_ID/audit \
  -H "Content-Type: application/json" \
  -d '{
    "auditType": "WEBSITE",
    "sourceUrl": "https://acmecorp.com"
  }'
```

## What's in Each Package

### @wise2/reaper-domain
TypeScript types and interfaces. Pure data layer — zero dependencies.

```typescript
import { ScoreType, ProspectStatus, ScoreResult } from '@wise2/reaper-domain';
```

### @wise2/reaper-scoring
Scoring engine with all 14 weight matrices.

```typescript
import { calculateScore, WEBSITE_SCORE_WEIGHTS, formatScoreResult } from '@wise2/reaper-scoring';

const result = calculateScore({
  components: { UX: 85, MOBILE: 78, ... },
  confidences: { UX: 90, MOBILE: 85, ... },
  weights: WEBSITE_SCORE_WEIGHTS,
});
```

### @wise2/reaper-providers
Provider interfaces + M0 fixtures.

```typescript
import { 
  defaultRegistry,
  FixtureWebsiteProvider,
  FixtureSearchProvider 
} from '@wise2/reaper-providers';

// In M0, fixtures are used
const websiteProvider = defaultRegistry.getWebsiteProvider();
const website = await websiteProvider.fetchWebsite('https://example.com');

// In M1, swap fixtures for real implementations
registry.register(new RealWebsiteProvider());
```

### ReaperController
All `/api/reaper/*` endpoints. Returns fixture data.

```
GET  /api/reaper/health
GET  /api/reaper/prospects
POST /api/reaper/prospects
GET  /api/reaper/prospects/:prospectId
POST /api/reaper/prospects/:prospectId/audit
GET  /api/reaper/audits/:auditId
GET  /api/reaper/businesses/:businessId/scores
GET  /api/reaper/opportunities
```

## Key Architectural Notes

### Evidence Chain
All scoring must follow this flow:
```
SOURCE (provider) 
  → OBSERVATION (raw data)
  → ENTITY MATCH (normalize to business)
  → EVIDENCE (confidence-weighted fact)
  → RULE (apply finding logic)
  → FINDING (actionable insight)
  → SCORE INPUT (feed scoring)
  → OPPORTUNITY (rank for outreach)
  → RECOMMENDATION (strategy)
```

### Provider Swappability
In M0, all providers are fixtures. In M1-M2:
1. Implement real website crawling (Playwright)
2. Implement real search (Google Business API)
3. Implement real reviews (Trustpilot, Google Reviews API)
4. Implement real social (Instagram API, Facebook Graph)

**No business logic changes required** — swap providers via ProviderRegistry.

### Multi-tenant Safety
Every REAPER table includes `organizationId`. User → Organization is 1:1.

```typescript
// Every query must filter by organization
const prospects = await db.reaper_prospects.findMany({
  where: { organizationId: req.user.organizationId }
});
```

### Scoring Principles
- **UNKNOWN reduces confidence, not score** — e.g., 85 raw score with 50% confidence beats 100 with 10%
- **All scores are versioned** — maintain history for trend analysis
- **Components expose the reasoning** — "72 score" means nothing without "UX=78, Mobile=65, Performance=60..."
- **Base confidence is 60%** — can increase to 100% only with perfect data

## M1 Roadmap

Once M0 is verified:

1. **Audit Orchestration** (BullMQ)
   - Move audit runs off HTTP handlers
   - Long-running website crawls
   - Evidence collection from pages
   - Rule-based finding generation

2. **Real Website Crawling** (Playwright)
   - Homepage analysis (UX, mobile, performance)
   - Contact page discovery
   - Service page crawl
   - Screenshot capture (desktop/mobile)

3. **Real Data Providers**
   - Search: Google Business API, LocalBizDB
   - Reviews: Trustpilot, Google Reviews API
   - Social: Instagram Graph API, Facebook API
   - Maps: Google Maps API

4. **UI Components**
   - Prospect list & detail views
   - Audit progress & results
   - Score breakdowns with reasoning
   - Evidence explorer
   - Finding review & approval

5. **Score Calculation**
   - Real Website Score from crawl findings
   - Business Health from reviews + social
   - Digital Execution from all online signals
   - Growth Potential combining above
   - REAPER Opportunity Score final ranking

## Verification Checklist

- [ ] Prisma migration runs without errors
- [ ] ReaperModule loads in NestJS
- [ ] `GET /api/reaper/health` returns 200
- [ ] `POST /api/reaper/prospects` creates prospect
- [ ] Database contains prospect record
- [ ] All 8 endpoints respond with fixture data
- [ ] TypeScript compiles without errors
- [ ] No console warnings

## Files Changed

```
wise2-core/
├── docs/REAPER/
│   ├── INTEGRATION_STATUS.md (new)
│   ├── QUICK_START_M0.md (this file)
│   └── [20 handoff docs already extracted]
├── packages/
│   ├── reaper-domain/
│   │   ├── src/types/index.ts (new)
│   │   ├── package.json (new)
│   │   └── tsconfig.json (new)
│   ├── reaper-scoring/
│   │   ├── src/index.ts (new)
│   │   ├── package.json (new)
│   │   └── tsconfig.json (new)
│   ├── reaper-providers/
│   │   ├── src/index.ts (new)
│   │   ├── package.json (new)
│   │   └── tsconfig.json (new)
│   ├── api/
│   │   └── src/
│   │       ├── reaper/
│   │       │   ├── reaper.controller.ts (new)
│   │       │   └── reaper.module.ts (new)
│   │       └── app.module.ts (edited: +ReaperModule)
│   └── db/
│       └── prisma/
│           ├── schema.prisma (edited: +13 models)
│           └── migrations/
│               └── add_reaper_m0_foundation/
│                   ├── migration.sql (new)
│                   └── .prismarc (new)
└── memory/
    ├── wise2_reaper_v1_m0_integration.md (new)
    └── MEMORY.md (edited: +link)
```

## Questions?

Check these in order:
1. `/docs/REAPER/docs/MASTER_BUILD_KIT.md` — authoritative spec
2. `/docs/REAPER/docs/ARCHITECTURE.md` — system design
3. `/packages/api/src/reaper/reaper.controller.ts` — API reference
4. `/packages/reaper-scoring/src/index.ts` — scoring logic
5. `/packages/reaper-providers/src/index.ts` — provider pattern

---

**Status**: M0 Foundation Complete ✅  
**Date**: 2026-08-30  
**Next**: Migrate → Test → Start M1  
**Owner**: WISE² Reaper Team
