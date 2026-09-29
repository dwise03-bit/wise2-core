/**
 * Consulting API Routes
 * Exposes WISE² AI consulting services via REST
 */

import { Router, Request, Response } from 'express';
import hermesConsultingSystem from '../../services/hermes-consulting-system';
import { BusinessAudit } from '../../types/integrations';

const router = Router();

/**
 * POST /api/v1/consulting/guidance
 * Get consulting guidance from Hermes
 */
router.post('/guidance', async (req: Request, res: Response) => {
  try {
    const { question, clientContext } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const guidance = await hermesConsultingSystem.getConsultingGuidance(question, clientContext);

    res.json({
      success: true,
      guidance,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to get consulting guidance:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/v1/consulting/readiness-score
 * Calculate AI readiness score
 */
router.post('/readiness-score', async (req: Request, res: Response) => {
  try {
    const audit: BusinessAudit = req.body;

    if (!audit.clientName || !audit.industry) {
      return res.status(400).json({ error: 'Client name and industry are required' });
    }

    const score = await hermesConsultingSystem.calculateReadinessScore(audit);

    res.json({
      success: true,
      score,
      assessment: score < 4 ? 'Not Ready' : score < 6 ? 'Emerging' : score < 8 ? 'Ready' : 'Advanced',
      recommendation:
        score < 4
          ? 'Focus on data quality and systems integration before AI implementation'
          : score < 6
            ? 'Begin with pilot projects to build organizational readiness'
            : score < 8
              ? 'Ready for strategic AI implementation across key processes'
              : 'Position for enterprise-wide AI transformation',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to calculate readiness score:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/v1/consulting/roi-projection
 * Generate ROI projection
 */
router.post('/roi-projection', async (req: Request, res: Response) => {
  try {
    const { audit, solution } = req.body;

    if (!audit || !solution) {
      return res.status(400).json({ error: 'Audit and solution are required' });
    }

    const projection = await hermesConsultingSystem.generateROIProjection(audit, solution);

    res.json({
      success: true,
      ...projection,
      summary: `Implement ${solution} for ~$${projection.implementationCost.toLocaleString()}. Save $${projection.annualSavings.toLocaleString()}/year. Payback in ${projection.paybackMonths} months. Year 1 ROI: ${projection.firstYearROI}%.`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to generate ROI projection:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/v1/consulting/playbook
 * Generate industry-specific playbook
 */
router.post('/playbook', async (req: Request, res: Response) => {
  try {
    const { industry } = req.body;

    if (!industry) {
      return res.status(400).json({ error: 'Industry is required' });
    }

    const playbook = await hermesConsultingSystem.generatePlaybook(industry);

    res.json({
      success: true,
      industry,
      playbook,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to generate playbook:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/v1/consulting/roadmap
 * Generate consulting roadmap
 */
router.post('/roadmap', async (req: Request, res: Response) => {
  try {
    const audit: BusinessAudit = req.body;

    if (!audit.clientName || !audit.industry) {
      return res.status(400).json({ error: 'Client name and industry are required' });
    }

    const roadmap = await hermesConsultingSystem.generateRoadmap(audit);

    res.json({
      success: true,
      roadmap,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to generate roadmap:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/v1/consulting/implementation-plan
 * Generate detailed implementation plan
 */
router.post('/implementation-plan', async (req: Request, res: Response) => {
  try {
    const { clientName, solution, timeline } = req.body;

    if (!clientName || !solution || !timeline) {
      return res.status(400).json({
        error: 'Client name, solution, and timeline are required',
      });
    }

    const plan = await hermesConsultingSystem.generateImplementationPlan(clientName, solution, timeline);

    res.json({
      success: true,
      plan,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to generate implementation plan:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/v1/consulting/optimization-recommendations
 * Get optimization recommendations for active project
 */
router.post('/optimization-recommendations', async (req: Request, res: Response) => {
  try {
    const { projectId, industry, currentPhase } = req.body;

    if (!industry || !currentPhase) {
      return res.status(400).json({
        error: 'Industry and current phase are required',
      });
    }

    const recommendations = await hermesConsultingSystem.getOptimizationRecommendations({
      id: projectId || 'temp',
      clientName: 'Client',
      industry,
      currentPhase,
      aiReadinessScore: 0,
      projectedROI: 0,
      timeline: '',
      status: currentPhase as any,
    });

    res.json({
      success: true,
      recommendations,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to get optimization recommendations:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/v1/consulting/initialize
 * Initialize consulting knowledge in Hermes
 */
router.post('/initialize', async (req: Request, res: Response) => {
  try {
    await hermesConsultingSystem.initializeConsultingKnowledge();

    res.json({
      success: true,
      message: 'Consulting knowledge initialized in Hermes',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to initialize consulting knowledge:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
