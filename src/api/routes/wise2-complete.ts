/**
 * WISE² Complete System API Routes
 * Master API that ties together all systems:
 * - Commerce Accelerator
 * - Model Orchestrator
 * - Content Engine
 * - Creative Engine
 * - Marketing Engine
 * - Automation Engine
 * - Analytics Engine
 * - Knowledge Loop
 */

import { Router, Request, Response } from 'express';
import contentEngine from '../../services/content-engine';
import {
  creativeEngine,
  marketingEngine,
  automationEngine,
  analyticsEngine,
  knowledgeLoop,
} from '../../services/creative-marketing-automation-engines';

const router = Router();

// ============================================================================
// CONTENT ENGINE ROUTES
// ============================================================================

/**
 * POST /api/v1/wise2/content/landing-page
 * Generate landing page content
 */
router.post('/content/landing-page', async (req: Request, res: Response) => {
  try {
    const result = await contentEngine.generateLandingPage(req.body);
    res.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Landing page generation failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/v1/wise2/content/sales-page
 * Generate sales page content
 */
router.post('/content/sales-page', async (req: Request, res: Response) => {
  try {
    const result = await contentEngine.generateSalesPage(req.body);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

/**
 * POST /api/v1/wise2/content/email-sequence
 * Generate email campaign sequences
 */
router.post('/content/email-sequence', async (req: Request, res: Response) => {
  try {
    const result = await contentEngine.generateEmailSequence(req.body);
    res.json({
      success: true,
      emails: result,
      totalCost: result.reduce((sum, e) => sum + e.cost, 0),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

/**
 * POST /api/v1/wise2/content/blog
 * Generate blog articles
 */
router.post('/content/blog', async (req: Request, res: Response) => {
  try {
    const result = await contentEngine.generateBlogArticle(req.body);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

/**
 * POST /api/v1/wise2/content/product-description
 * Generate product descriptions
 */
router.post('/content/product-description', async (req: Request, res: Response) => {
  try {
    const result = await contentEngine.generateProductDescription(req.body);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

/**
 * POST /api/v1/wise2/content/faq
 * Generate FAQ pages
 */
router.post('/content/faq', async (req: Request, res: Response) => {
  try {
    const result = await contentEngine.generateFAQ(req.body);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// ============================================================================
// CREATIVE ENGINE ROUTES
// ============================================================================

/**
 * POST /api/v1/wise2/creative/product-image
 * Generate product image prompts
 */
router.post('/creative/product-image', async (req: Request, res: Response) => {
  try {
    const result = await creativeEngine.generateProductImage(req.body);
    res.json({
      success: true,
      ...result,
      platform: 'midjourney/dall-e',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

/**
 * POST /api/v1/wise2/creative/ad-creative
 * Generate ad creative (headlines, copy, CTAs)
 */
router.post('/creative/ad-creative', async (req: Request, res: Response) => {
  try {
    const result = await creativeEngine.generateAdCreative(req.body);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

/**
 * POST /api/v1/wise2/creative/video-script
 * Generate video scripts
 */
router.post('/creative/video-script', async (req: Request, res: Response) => {
  try {
    const result = await creativeEngine.generateVideoScript(req.body);
    res.json({ success: true, script: result });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// ============================================================================
// MARKETING ENGINE ROUTES
// ============================================================================

/**
 * POST /api/v1/wise2/marketing/campaign-strategy
 * Generate marketing campaign strategy
 */
router.post('/marketing/campaign-strategy', async (req: Request, res: Response) => {
  try {
    const result = await marketingEngine.generateCampaignStrategy(req.body);
    res.json({
      success: true,
      ...result,
      totalBudget: req.body.budget,
      expectedROAS: result.expectedROAS,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// ============================================================================
// AUTOMATION ENGINE ROUTES
// ============================================================================

/**
 * POST /api/v1/wise2/automation/workflow
 * Generate automation workflows
 */
router.post('/automation/workflow', async (req: Request, res: Response) => {
  try {
    const result = await automationEngine.generateWorkflow(req.body);
    res.json({
      success: true,
      ...result,
      enabled: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// ============================================================================
// ANALYTICS ENGINE ROUTES
// ============================================================================

/**
 * POST /api/v1/wise2/analytics/recommendations
 * Get AI-powered recommendations based on metrics
 */
router.post('/analytics/recommendations', async (req: Request, res: Response) => {
  try {
    const recommendations = await analyticsEngine.generateRecommendations(req.body);
    const healthScore = analyticsEngine.calculateHealthScore(req.body);

    res.json({
      success: true,
      healthScore,
      healthStatus:
        healthScore >= 80
          ? 'excellent'
          : healthScore >= 60
            ? 'good'
            : healthScore >= 40
              ? 'fair'
              : 'needs-improvement',
      recommendations,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

/**
 * GET /api/v1/wise2/analytics/health-score
 * Get business health score
 */
router.post('/analytics/health-score', (req: Request, res: Response) => {
  const score = analyticsEngine.calculateHealthScore(req.body);

  res.json({
    success: true,
    score,
    status:
      score >= 80
        ? 'excellent'
        : score >= 60
          ? 'good'
          : score >= 40
            ? 'fair'
            : 'needs-improvement',
    breakdown: {
      revenue: req.body.revenue > 10000 ? 'strong' : 'needs-growth',
      roi: req.body.roi > 200 ? 'healthy' : 'needs-optimization',
      retention: req.body.churnRate < 5 ? 'good' : 'needs-attention',
      efficiency: req.body.ltv / req.body.cac >= 3 ? 'optimal' : 'needs-improvement',
    },
  });
});

// ============================================================================
// KNOWLEDGE LOOP ROUTES
// ============================================================================

/**
 * POST /api/v1/wise2/knowledge/record-success
 * Record a winning campaign or element
 */
router.post('/knowledge/record-success', (req: Request, res: Response) => {
  try {
    knowledgeLoop.recordSuccess(req.body);
    res.json({
      success: true,
      message: 'Success recorded in knowledge base',
      learningsCount: knowledgeLoop.getHistoricalData().length,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

/**
 * GET /api/v1/wise2/knowledge/top-performers
 * Get top-performing campaigns by type
 */
router.get('/knowledge/top-performers', (req: Request, res: Response) => {
  const { type = 'winning_headline', industry, limit = 5 } = req.query;

  const performers = knowledgeLoop.getTopPerformers(
    type as string,
    industry as string | undefined,
    parseInt(limit as string) || 5
  );

  res.json({
    success: true,
    type,
    industry: industry || 'all',
    count: performers.length,
    performers,
  });
});

/**
 * GET /api/v1/wise2/knowledge/insights
 * Generate insights from historical data
 */
router.get('/knowledge/insights', async (req: Request, res: Response) => {
  try {
    const insights = await knowledgeLoop.generateInsights();
    res.json({
      success: true,
      insights,
      dataPoints: knowledgeLoop.getHistoricalData().length,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// ============================================================================
// SYSTEM HEALTH & STATUS
// ============================================================================

/**
 * GET /api/v1/wise2/system/status
 * Get overall system status
 */
router.get('/system/status', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'operational',
    systems: {
      commerce: 'ready',
      modelOrchestrator: 'ready',
      contentEngine: 'ready',
      creativeEngine: 'ready',
      marketingEngine: 'ready',
      automationEngine: 'ready',
      analyticsEngine: 'ready',
      knowledgeLoop: 'ready',
    },
    learningsRecorded: knowledgeLoop.getHistoricalData().length,
    timestamp: new Date().toISOString(),
  });
});

export default router;
