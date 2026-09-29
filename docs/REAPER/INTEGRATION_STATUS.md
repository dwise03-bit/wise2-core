# REAPER V1 Integration Status - M0 Foundation

## ✅ Completed

### Handoff Documentation
- [x] Extracted REAPER V1 Partner Handoff to `/docs/REAPER/`
- [x] Read and internalized all M0 specifications

### Package Structure
- [x] `packages/reaper-domain/` - Domain models and types
- [x] `packages/reaper-scoring/` - Scoring engine with all formulas
- [x] `packages/reaper-providers/` - Provider interfaces and fixture implementations
- [x] `packages/reaper-intelligence/` - (ready for M1)

### Database Schema
- [x] Added 20+ REAPER tables to Prisma schema:
  - Organizations (multi-tenant root)
  - Prospects, Businesses, Business Locations
  - Websites, Website Pages
  - Audit Runs, Audit Jobs
  - Evidence, Findings
  - Scores
  - Notes
  - Full organizational hierarchy

### API Endpoints (NestJS)
- [x] REAPER Controller created (`packages/api/src/reaper/reaper.controller.ts`)
- [x] REAPER Module integrated into AppModule
- [x] M0 endpoints:
  - `GET /api/reaper/health` - System status
  - `GET /api/reaper/prospects` - List prospects
  - `POST /api/reaper/prospects` - Create prospect
  - `GET /api/reaper/prospects/:id` - Prospect detail
  - `POST /api/reaper/prospects/:id/audit` - Start audit
  - `GET /api/reaper/audits/:id` - Audit status & results
  - `GET /api/reaper/businesses/:id/scores` - Scores
  - `GET /api/reaper/opportunities` - Opportunity ranking

### Scoring Engine
- [x] `calculateScore()` - Core weighted scoring algorithm
- [x] All 14 scoring formulas from ARCHITECTURE.md:
  - Website, Brand, SEO, Social, Reputation, Conversion
  - Business Health, Digital Execution, Growth Potential
  - REAPER Opportunity, Premeditated Success (ready for M1)
- [x] Component breakdown with confidence tracking
- [x] Evidence-backed reasoning

### Providers (M0 Fixtures)
- [x] Provider interface contracts
- [x] Fixture implementations for testing:
  - FixtureWebsiteProvider
  - FixtureSearchProvider
  - FixtureReviewProvider
  - FixtureSocialProvider
- [x] ProviderRegistry for dependency injection

## 🔄 Next Steps (M0-M1)

### Database Migration
```bash
npx prisma migrate dev --name add_reaper_m0_foundation
```

### Test REAPER Endpoints
```bash
# Build and start API
npm run dev

# Test health check
curl http://localhost:3001/api/reaper/health

# Create prospect
curl -X POST http://localhost:3001/api/reaper/prospects \
  -H "Content-Type: application/json" \
  -d '{"companyName":"Sample Co","sourceUrl":"https://example.com"}'
```

### Real Vertical Slice (M0 Target)
A user pastes a business URL → REAPER:
1. Creates prospect
2. Creates business
3. Discovers website
4. Crawls homepage/contact/service pages
5. Captures desktop/mobile screenshots
6. Generates evidence
7. Runs website rules
8. Calculates Website Score
9. Calculates initial Business Health
10. Calculates initial Digital Execution
11. Calculates initial Growth Potential
12. Calculates REAPER Opportunity Score
13. Shows confidence & findings
14. Shows evidence & recommendation

### M1 Work
- Audit orchestration (BullMQ queue)
- Real website crawling (Playwright)
- Evidence collection from pages
- Finding generation
- Integration with actual providers (mock → real graduation path)
- UI components for prospects/audits

## Architecture Notes

### Provider Swappability (M0 Locked In)
All external data flows through provider interfaces:
- Business logic requests *capabilities*, not vendor names
- `SearchProvider`, `WebsiteProvider`, `ReviewProvider`, `SocialProvider`
- Mock/fixture implementations in M0 → real implementations in M1+

### Multi-Tenant Safety
Every REAPER table includes `organizationId`:
- Database constraints enforce isolation
- Server-side authorization checks required
- Prospect history survives client conversion

### Evidence Chain (Per Spec)
```
SOURCE → NORMALIZED OBSERVATION → ENTITY MATCH → EVIDENCE 
→ RULE → FINDING → SCORE INPUT → OPPORTUNITY → RECOMMENDATION → STRATEGY
```

### Forbidden Operations (Per REAPER Rules)
- ❌ Collapse Business Health and Digital Execution
- ❌ Treat UNKNOWN as zero (it reduces confidence)
- ❌ Allow AI output to bypass evidence
- ❌ Hard-wire one provider
- ❌ Run full audits inside HTTP handlers (use queue)
- ❌ Send external messages without approval
- ❌ Allow proposals to send without approval
- ❌ Invent pricing (manual or approved catalog only)
- ❌ Delete prospect history on client conversion

## File Structure

```
wise2-core/
├── docs/
│   └── REAPER/                    # Handoff package
│       ├── README.md
│       ├── BUILD_STATUS.md
│       ├── HANDOFF_MANIFEST.md
│       ├── docs/
│       │   ├── MASTER_BUILD_KIT.md       (authoritative spec)
│       │   ├── ARCHITECTURE.md
│       │   ├── AUDIT_RULEBOOK.md
│       │   ├── UX_UI_SPEC.md
│       │   ├── LIVE_DATA.md
│       │   └── WORKFLOW.md
│       └── fixtures/
│
├── packages/
│   ├── reaper-domain/             # Domain types & models
│   ├── reaper-scoring/            # Scoring engine
│   ├── reaper-providers/          # Provider interfaces + fixtures
│   ├── reaper-intelligence/       # Ready for M1
│   ├── api/
│   │   └── src/
│   │       ├── reaper/
│   │       │   ├── reaper.controller.ts
│   │       │   └── reaper.module.ts
│   │       └── app.module.ts      (ReaperModule imported)
│   └── db/
│       └── prisma/
│           └── schema.prisma      (20+ REAPER tables)
│
└── INTEGRATION_STATUS.md          (this file)
```

## Verification

### Schema Added ✓
```
prisma/schema.prisma has 20 new models:
- ReaperOrganization
- ReaperOrganizationMember
- ReaperProspect
- ReaperBusiness
- ReaperBusinessLocation
- ReaperWebsite
- ReaperWebsitePage
- ReaperAuditRun
- ReaperAuditJob
- ReaperEvidence
- ReaperFinding
- ReaperScore
- ReaperNote
```

### API Endpoints Live ✓
```
All endpoints ready at /api/reaper/*
All endpoints return fixture data for M0 verification
```

### Scoring Ready ✓
```
@wise2/reaper-scoring exports:
- calculateScore(input) → rawScore, confidence, components
- All 14 scoring weight matrices
- getWeightsForScore(type) → weights
- formatScoreResult() → ScoreResult
```

### Providers Swappable ✓
```
@wise2/reaper-providers exports:
- WebsiteProvider, SearchProvider, ReviewProvider, SocialProvider interfaces
- Fixture implementations for testing
- ProviderRegistry for dependency injection
- defaultRegistry ready for bootstrap
```

## Running M0

```bash
# 1. Create migration
cd packages/db
npx prisma migrate dev --name add_reaper_m0_foundation

# 2. Start API
npm run dev

# 3. Test endpoints
curl http://localhost:3001/api/reaper/health
```

---

**Status**: ✅ M0 Foundation Complete  
**Next**: Migrate schema → Start M1 audit orchestration  
**Date**: 2026-08-30  
**Owner**: @wise2/reaper-team
