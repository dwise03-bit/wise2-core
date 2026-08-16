/**
 * Image Generation API Routes
 * Hermes-integrated endpoints for PIFF CITY campaign generation
 */

import { Router, Request, Response } from 'express';
import generationService from '../../services/hermes-image-generation';

const router = Router();

/**
 * POST /api/generation/campaign
 * Generate a campaign with Hermes optimization
 *
 * Body:
 * {
 *   "campaign": "hero-announcement",
 *   "style": "cinematic luxury",
 *   "userId": "user-id-or-discord-id"
 * }
 */
router.post('/campaign', async (req: Request, res: Response) => {
  try {
    const { campaign, style, userId } = req.body;

    if (!campaign || !userId) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['campaign', 'userId'],
      });
    }

    const result = await generationService.generateCampaign({
      campaign,
      style: style || 'cinematic luxury',
      userId,
    });

    res.json(result);
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({
      error: 'Generation failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/generation/optimize-prompts
 * Ask Hermes to optimize prompts for a campaign
 *
 * Body:
 * {
 *   "campaign": "hero-announcement",
 *   "style": "cinematic luxury"
 * }
 */
router.post('/optimize-prompts', async (req: Request, res: Response) => {
  try {
    const { campaign, style } = req.body;

    if (!campaign) {
      return res.status(400).json({
        error: 'Missing required field: campaign',
      });
    }

    const prompts = await generationService.askHermesForPrompts(
      campaign,
      style
    );

    res.json({
      campaign,
      style: style || 'default',
      prompts,
      count: prompts.length,
    });
  } catch (error) {
    console.error('Prompt optimization error:', error);
    res.status(500).json({
      error: 'Failed to optimize prompts',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/generation/recommendations/:campaign
 * Get Hermes recommendations for a campaign
 */
router.get('/recommendations/:campaign', async (req: Request, res: Response) => {
  try {
    const { campaign } = req.params;

    const insights =
      await generationService.askHermesForRecommendations(campaign);

    res.json({
      campaign,
      insights,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({
      error: 'Failed to get recommendations',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/generation/batch
 * Generate multiple campaigns in sequence
 *
 * Body:
 * {
 *   "campaigns": ["hero-announcement", "split-identity", "workforce"],
 *   "userId": "user-id"
 * }
 */
router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { campaigns, userId } = req.body;

    if (!campaigns || !Array.isArray(campaigns) || !userId) {
      return res.status(400).json({
        error: 'Invalid request',
        required: ['campaigns (array)', 'userId'],
      });
    }

    const results = [];

    for (const campaign of campaigns) {
      const result = await generationService.generateCampaign({
        campaign,
        userId,
      });
      results.push(result);
    }

    res.json({
      total: campaigns.length,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Batch generation error:', error);
    res.status(500).json({
      error: 'Batch generation failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/generation/status
 * Check GPU generation service status
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    // Check if ComfyUI is running
    const axios = await import('axios');
    await axios.default.get('http://localhost:8188');

    res.json({
      status: 'healthy',
      service: 'GPU Image Generation (SDXL 1.0)',
      model: 'SDXL 1.0',
      vram: '6GB GTX 1660 SUPER',
      hermes_connected: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'unavailable',
      error: 'ComfyUI service not responding',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
