# REAPER V1 M1 — Audit Orchestration Implementation

**Phase**: M1 - Audit Orchestration  
**Status**: 🚀 SCAFFOLDING COMPLETE  
**Date**: 2026-08-30  
**Scope**: Website audits, evidence collection, rule-based finding generation, BullMQ queue orchestration

---

## 📋 M1 Overview

M1 transforms REAPER from a fixture-based system into a real audit engine. When a user submits a prospect URL, the system:

1. **Queues** the audit job to BullMQ (non-blocking)
2. **Crawls** the website with Playwright (get pages, screenshots, metrics)
3. **Collects** evidence from crawl results (structured data points)
4. **Applies** rules to evidence (generate findings)
5. **Scores** the website based on findings
6. **Stores** results and findings in PostgreSQL
7. **Reports** back to user with confidence and recommendations

---

## 🏗️ Architecture

```
User Request
    ↓
API: POST /api/reaper/prospects/:prospectId/audit
    ↓
ReaperController queues job → AuditQueueService
    ↓
HTTP 202 ACCEPTED (returns auditId immediately)
    ↓
[Async] BullMQ Worker Process (separate service)
    ├─ WebsiteCrawler (Playwright)
    │  ├─ Navigate to URL
    │  ├─ Collect page data
    │  ├─ Capture screenshots (desktop/mobile)
    │  └─ Measure performance
    │
    ├─ EvidenceCollector
    │  ├─ Extract typed evidence from crawl
    │  ├─ Assign confidence scores
    │  └─ Identify gaps
    │
    ├─ FindingRulesEngine
    │  ├─ Apply 7+ default rules
    │  ├─ Generate findings (CRITICAL/WARNING/INFO)
    │  └─ Prioritize by severity
    │
    └─ Score Calculator
       ├─ Website Score
       ├─ Business Health (from evidence)
       └─ Digital Execution Score
            ↓
       Store Evidence + Findings + Scores in DB
            ↓
User polls: GET /api/reaper/audits/:auditId
    ↓
Retrieve results from database
```

---

## 🔌 Components

### 1. **WebsiteCrawler** (`@wise2/reaper-intelligence/crawler`)

**Purpose**: Navigate websites and extract structured data  
**M0**: Fixture implementation  
**M1**: Implement with Playwright

```typescript
import { WebsiteCrawler } from '@wise2/reaper-intelligence/crawler';

const crawler = new WebsiteCrawler({ headless: true });
const result = await crawler.crawl('https://example.com');

// Returns: pages, screenshots, performance metrics, errors
```

**Methods**:
- `crawl(url)` — Full website crawl
- `crawlPage(url, path)` — Individual page analysis
- `captureDesktopScreenshot(url)` — 1920x1080 viewport
- `captureMobileScreenshot(url)` — 375x667 viewport
- `analyzeAccessibility(url)` — Run axe-core scanner
- `analyzePerformance(url)` — Collect Core Web Vitals

---

### 2. **EvidenceCollector** (`@wise2/reaper-intelligence/evidence`)

**Purpose**: Convert raw crawl data into typed, confidence-scored evidence  
**M1**: Extract 8+ evidence types

```typescript
import { EvidenceCollector } from '@wise2/reaper-intelligence/evidence';

const collector = new EvidenceCollector();
const evidence = collector.collectFromCrawl(crawlResult);
const score = collector.scoreEvidence(evidence);
const gaps = collector.identifyGaps(evidence);
```

**Evidence Types**:
- `HTTP_STATUS` — Server response code (100% confidence if reached)
- `PAGE_COUNT` — Number of crawlable pages (90% confidence)
- `CONTACT_FORM` — Presence/absence of contact form (95% confidence)
- `PHONE_LISTED` — Phone number in content (80% confidence)
- `EMAIL_LISTED` — Email in content (80% confidence)
- `LOAD_TIME` — Full page load time in ms (100% confidence)
- `MOBILE_RESPONSIVE` — Mobile screenshot captured (85% confidence)
- `HTTPS` — SSL/TLS usage (100% confidence)
- `PAGE_TITLE` — Meta title tag (90% confidence)
- `META_DESCRIPTION` — Meta description tag (85% confidence)

**Quality Metrics**:
- Average evidence confidence
- Gap identification (missing evidence types)
- Low-confidence evidence flags

---

### 3. **FindingRulesEngine** (`@wise2/reaper-intelligence/rules`)

**Purpose**: Convert evidence into actionable findings  
**M1**: 7 default rules, extensible for custom rules

```typescript
import { FindingRulesEngine } from '@wise2/reaper-intelligence/rules';

const engine = new FindingRulesEngine();
const findings = engine.generateFindings(evidence);

// Returns findings sorted by severity (CRITICAL → WARNING → INFO)
```

**Default Rules** (M1):
1. **No Contact Form** (WARNING) — Conversion loss
2. **No Phone Number** (WARNING) — Reduced trust
3. **No Email** (INFO) — Accessibility issue
4. **Slow Load Time** (WARNING/CRITICAL) — Performance & SEO penalty
5. **No HTTPS** (CRITICAL) — Security & trust issue
6. **Low Page Count** (WARNING) — Content & SEO gap
7. **Missing Page Title** (WARNING) — SEO issue

**Custom Rule Pattern**:
```typescript
engine.registerRule({
  id: 'my-rule',
  name: 'Rule Name',
  category: 'CATEGORY',
  condition: (evidence) => /* boolean */,
  findingGenerator: (evidence) => /* Finding | null */,
});
```

---

### 4. **AuditJobProcessor** (`@wise2/reaper-worker/jobs`)

**Purpose**: Execute audit workflow (crawl → evidence → findings → score)  
**M1**: Website audits; Social/Reputation audits in M2+

```typescript
import { AuditJobProcessor } from '@wise2/reaper-worker/jobs';

const processor = new AuditJobProcessor();
await processor.processWebsiteAudit(job);
```

**Workflow**:
1. Crawl website (10-35%)
2. Collect evidence (35-60%)
3. Generate findings (60-80%)
4. Calculate scores (80-90%)
5. Store results (90-100%)

**Job Progress Events**:
- Job queued → `PENDING` status
- Job started → `RUNNING` status
- 10% → Crawl started
- 35% → Evidence collected
- 60% → Findings generated
- 80% → Score calculated
- 100% → `COMPLETED` status with results

---

### 5. **AuditQueueService** (`@wise2/reaper-worker/services`)

**Purpose**: BullMQ queue management and job orchestration  
**Configuration**: Redis-backed, 2 concurrent workers, exponential backoff retries

```typescript
import { getAuditQueueService } from '@wise2/reaper-worker/services';

const queue = getAuditQueueService({ host: 'localhost', port: 6379 });

// Queue a job
const jobId = await queue.queueAudit({
  auditRunId: 'audit-123',
  prospectId: 'prospect-1',
  businessId: 'biz-1',
  websiteId: 'web-1',
  url: 'https://example.com',
  organizationId: 'org-1',
  auditType: 'WEBSITE',
});

// Get status
const status = await queue.getJobStatus(jobId);

// Get queue stats
const stats = await queue.getQueueStats();
// { waiting: 5, active: 2, completed: 143, failed: 2, delayed: 0 }
```

---

## 🔄 End-to-End Flow

### 1. User Creates Audit (API Request)

```bash
POST /api/reaper/prospects/prospect-1/audit
{
  "auditType": "WEBSITE",
  "sourceUrl": "https://example.com"
}

→ HTTP 202 ACCEPTED
{
  "auditRunId": "audit-123",
  "status": "RUNNING",
  "message": "Audit queued. Check status with GET /api/reaper/audits/audit-123"
}
```

### 2. Controller Queues Job

```typescript
// ReaperController.startAudit()
const auditRun = await db.reaper_audit_runs.create({
  data: {
    organizationId,
    prospectId,
    businessId,
    websiteId,
    status: 'PENDING',
    auditType: 'WEBSITE',
  },
});

const jobId = await auditQueue.queueAudit({
  auditRunId: auditRun.id,
  prospectId,
  businessId,
  websiteId,
  url: sourceUrl,
  organizationId,
  auditType: 'WEBSITE',
});

// Update status to RUNNING
await db.reaper_audit_runs.update({
  where: { id: auditRun.id },
  data: { status: 'RUNNING', startedAt: new Date() },
});

return { auditRunId: auditRun.id, status: 'RUNNING' };
```

### 3. Worker Processes Audit

```
[BullMQ Worker]
1. Receive job from queue
2. Call AuditJobProcessor.processWebsiteAudit()
3. Progress events → stored in audit_run table
4. On completion, store:
   - Evidence records
   - Finding records
   - Score records
5. Update audit_run status to COMPLETED
6. Emit success event (optional WebSocket update)
```

### 4. User Polls for Results

```bash
GET /api/reaper/audits/audit-123

→ HTTP 200
{
  "auditRunId": "audit-123",
  "status": "COMPLETED",
  "startedAt": "2026-08-30T12:34:56Z",
  "completedAt": "2026-08-30T12:35:23Z",
  "findings": [
    {
      "id": "finding-1",
      "category": "SECURITY",
      "severity": "CRITICAL",
      "title": "Website Not Using HTTPS",
      "description": "...",
      "recommendation": "..."
    },
    ...
  ],
  "scores": {
    "website": { "rawScore": 72, "confidence": 85 }
  },
  "evidence": [
    {
      "sourceType": "HTTP_STATUS",
      "observation": "Website returned HTTP 200",
      "confidence": 100
    },
    ...
  ]
}
```

---

## 🛠️ Integration Checklist

### Database (✅ Ready)
- [x] 13 REAPER tables created
- [x] audit_runs table ready for status tracking
- [x] evidence table ready for storage
- [x] findings table ready for storage
- [x] scores table ready for versioned scores

### API (🚀 Ready for M1)
- [x] POST /api/reaper/prospects/:prospectId/audit endpoint
- [x] GET /api/reaper/audits/:auditId endpoint
- [x] Queue job on audit creation
- [x] Return 202 ACCEPTED with auditId
- [ ] Add progress polling endpoint (optional M1+)

### Worker Service (🏗️ Scaffolding Done)
- [x] BullMQ queue setup
- [x] Job processor framework
- [x] Crawler integration point
- [x] Evidence collection
- [x] Rules engine
- [ ] Docker compose for Redis
- [ ] Start worker service script

### Testing (⏳ M1+)
- [ ] Unit tests for crawler
- [ ] Unit tests for evidence collector
- [ ] Unit tests for rules engine
- [ ] E2E test: URL → audit completion
- [ ] Performance benchmark (audit time vs page complexity)

---

## 🚀 Next Steps (Immediate)

### 1. Wire Up API Endpoints
Update `ReaperController.startAudit()` to:
```typescript
const jobId = await auditQueue.queueAudit({...});
await db.reaper_audit_runs.update({
  where: { id: auditRunId },
  data: { status: 'RUNNING' },
});
return { auditId: auditRunId, status: 'RUNNING' };
```

### 2. Start Redis (Prerequisite)
```bash
docker run -d -p 6379:6379 redis:7-alpine
```

### 3. Start Worker Service
```bash
cd services/reaper-worker
npm install
DATABASE_URL="..." REDIS_URL="redis://localhost:6379" npm run start
```

### 4. Test End-to-End
```bash
# 1. Queue audit
curl -X POST http://localhost:3010/api/reaper/prospects/prospect-1/audit \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"auditType": "WEBSITE", "sourceUrl": "https://example.com"}'

# 2. Poll results
curl http://localhost:3010/api/reaper/audits/audit-123 \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 📊 M1 Scope vs M2+

### M1 (This Phase)
✅ Website audits only  
✅ Playwright crawler (fixture + real implementation path)  
✅ 10 evidence types  
✅ 7 rules → findings  
✅ Website score calculation  
✅ BullMQ orchestration  
✅ Job progress tracking  

### M2+ (Future)
⏳ Social profile discovery & scoring  
⏳ Review/reputation analysis  
⏳ Competitor intelligence  
⏳ Custom rule UI builder  
⏳ Scheduled re-audits  
⏳ Historical trend tracking  

---

## 🎯 Key Design Decisions

### Provider Swappability
- Crawler: Playwright in M1, extensible for other tools
- Evidence: Typed, immutable once created
- Rules: Custom rules can be registered at runtime
- Storage: Prisma ORM, easy to migrate between databases

### Confidence Model
- Evidence has confidence (80-100%)
- Findings inherit confidence from evidence
- Scores include confidence bucket
- UNKNOWN reduces confidence, not score

### Long-Running Jobs
- All audits run async via BullMQ (never on HTTP handler)
- HTTP returns 202 ACCEPTED immediately
- Worker can restart/retry failed jobs
- Progress tracked in database + Redis

---

## 📚 References

**Handoff Package**: `/docs/REAPER/docs/MASTER_BUILD_KIT.md` (M1 audit section)  
**ARCHITECTURE.md**: Audit DAG and data flow  
**M0 Schema**: 13 tables ready for results storage  
**Scoring Formulas**: Already implemented in @wise2/reaper-scoring

---

**Status**: M1 Scaffolding Complete ✅  
**Ready for**: Worker service startup + API integration  
**Estimated Duration**: 2-3 days for full implementation + testing

