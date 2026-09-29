import { Router, Request, Response } from 'express';

const router = Router();

/**
 * REAPER V1 API Routes - M0 Foundation
 * Business intelligence, prospect discovery, audit, qualification
 */

// ============================================================================
// PROSPECTS
// ============================================================================

router.get('/reaper/prospects', async (req: Request, res: Response) => {
  try {
    // GET /api/reaper/prospects - List prospects for organization
    res.json({
      endpoint: 'GET /api/reaper/prospects',
      status: 'M0_FOUNDATION',
      data: [],
      meta: {
        total: 0,
        page: req.query.page || 1,
        limit: req.query.limit || 20,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prospects' });
  }
});

router.post('/reaper/prospects', async (req: Request, res: Response) => {
  try {
    // POST /api/reaper/prospects - Create prospect from URL or manual entry
    const { sourceUrl, companyName, contactName, contactEmail, contactPhone } = req.body;

    if (!companyName && !sourceUrl) {
      return res.status(400).json({ error: 'companyName or sourceUrl required' });
    }

    res.status(201).json({
      endpoint: 'POST /api/reaper/prospects',
      status: 'CREATED',
      prospect: {
        id: `prospect-${Date.now()}`,
        companyName: companyName || sourceUrl,
        sourceUrl,
        contactName,
        contactEmail,
        contactPhone,
        status: 'DISCOVERY',
        createdAt: new Date(),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create prospect' });
  }
});

router.get('/reaper/prospects/:prospectId', async (req: Request, res: Response) => {
  try {
    // GET /api/reaper/prospects/:prospectId - Get prospect detail
    const { prospectId } = req.params;

    res.json({
      endpoint: `GET /api/reaper/prospects/${prospectId}`,
      prospect: {
        id: prospectId,
        companyName: 'Sample Company',
        status: 'DISCOVERY',
        sourceUrl: 'https://example.com',
        createdAt: new Date(),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prospect' });
  }
});

// ============================================================================
// AUDITS
// ============================================================================

router.post('/reaper/prospects/:prospectId/audit', async (req: Request, res: Response) => {
  try {
    // POST /api/reaper/prospects/:prospectId/audit - Start audit run
    // Fixtures for M0: website audit only
    const { prospectId } = req.params;
    const { auditType = 'WEBSITE', sourceUrl } = req.body;

    if (!sourceUrl && auditType === 'WEBSITE') {
      return res.status(400).json({ error: 'sourceUrl required for WEBSITE audit' });
    }

    const auditId = `audit-${Date.now()}`;

    res.status(202).json({
      endpoint: `POST /api/reaper/prospects/${prospectId}/audit`,
      status: 'AUDIT_STARTED',
      auditRun: {
        id: auditId,
        prospectId,
        auditType,
        status: 'RUNNING',
        progress: 0,
        startedAt: new Date(),
      },
      message: 'Audit queued. Check status with GET /api/reaper/audits/{auditId}',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start audit' });
  }
});

router.get('/reaper/audits/:auditId', async (req: Request, res: Response) => {
  try {
    // GET /api/reaper/audits/:auditId - Get audit status and results
    const { auditId } = req.params;

    res.json({
      endpoint: `GET /api/reaper/audits/${auditId}`,
      audit: {
        id: auditId,
        status: 'COMPLETED',
        auditType: 'WEBSITE',
        findings: [],
        scores: {
          website: { rawScore: 72, confidence: 78 },
        },
        completedAt: new Date(),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit' });
  }
});

// ============================================================================
// SCORES
// ============================================================================

router.get('/reaper/businesses/:businessId/scores', async (req: Request, res: Response) => {
  try {
    // GET /api/reaper/businesses/:businessId/scores - Get all scores for business
    const { businessId } = req.params;

    res.json({
      endpoint: `GET /api/reaper/businesses/${businessId}/scores`,
      scores: [
        {
          id: `score-${Date.now()}`,
          scoreType: 'REAPER_OPPORTUNITY',
          rawScore: 76,
          confidence: 72,
          version: 1,
          calculatedAt: new Date(),
          reasoning: 'M0 fixture score',
        },
      ],
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch scores' });
  }
});

// ============================================================================
// OPPORTUNITIES
// ============================================================================

router.get('/reaper/opportunities', async (req: Request, res: Response) => {
  try {
    // GET /api/reaper/opportunities - List opportunities ranked by REAPER score
    res.json({
      endpoint: 'GET /api/reaper/opportunities',
      opportunities: [],
      meta: {
        total: 0,
        sortedBy: 'REAPER_OPPORTUNITY_SCORE',
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch opportunities' });
  }
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

router.get('/reaper/health', async (req: Request, res: Response) => {
  res.json({
    endpoint: 'GET /api/reaper/health',
    status: 'OPERATIONAL',
    version: 'M0_FOUNDATION',
    features: ['PROSPECTS', 'AUDITS', 'WEBSITE_CRAWL', 'SCORING', 'FIXTURE_PROVIDERS'],
    message: 'REAPER V1 M0 Foundation running with fixture data',
  });
});

export default router;
