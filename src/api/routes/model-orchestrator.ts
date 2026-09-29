/**
 * Model Orchestrator API Routes
 * Manages model routing, health, and usage tracking
 */

import { Router, Request, Response } from 'express';
import modelOrchestrator, { TaskContext } from '../../services/model-orchestrator';

const router = Router();

/**
 * POST /api/v1/models/route
 * Get routing decision for a task
 */
router.post('/route', async (req: Request, res: Response) => {
  try {
    const context: TaskContext = req.body;

    if (!context.category || !context.complexity) {
      return res.status(400).json({
        error: 'Category and complexity are required',
      });
    }

    const routing = await modelOrchestrator.routeTask(context);

    res.json({
      success: true,
      ...routing,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Model routing failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/v1/models/execute
 * Execute task with automatic fallback and error handling
 */
router.post('/execute', async (req: Request, res: Response) => {
  try {
    const { prompt, context, maxRetries = 3 } = req.body;

    if (!prompt || !context) {
      return res.status(400).json({
        error: 'Prompt and context are required',
      });
    }

    const result = await modelOrchestrator.executeWithFallback(
      prompt,
      context as TaskContext,
      maxRetries
    );

    res.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Task execution failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/v1/models/health
 * Get health status of all models
 */
router.get('/health', (req: Request, res: Response) => {
  const health = modelOrchestrator.getHealthStatus();
  const healthArray = Array.from(health.entries()).map(([model, status]) => ({
    model,
    ...status,
  }));

  res.json({
    success: true,
    models: healthArray,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/v1/models/health/:model
 * Get health status of specific model
 */
router.get('/health/:model', (req: Request, res: Response) => {
  const { model } = req.params;
  const health = modelOrchestrator.getHealthStatus();
  const modelHealth = health.get(model as any);

  if (!modelHealth) {
    return res.status(404).json({
      error: 'Model not found',
    });
  }

  res.json({
    success: true,
    model,
    ...modelHealth,
    timestamp: new Date().toISOString(),
  });
});

/**
 * PATCH /api/v1/models/health/:model
 * Manually update model health status
 */
router.patch('/health/:model', (req: Request, res: Response) => {
  try {
    const { model } = req.params;
    const { status } = req.body;

    if (!['healthy', 'degraded', 'down'].includes(status)) {
      return res.status(400).json({
        error: 'Status must be healthy, degraded, or down',
      });
    }

    modelOrchestrator.updateModelHealth(model as any, status);

    res.json({
      success: true,
      message: `Model ${model} status updated to ${status}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to update health:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/v1/models/usage
 * Get usage statistics
 */
router.get('/usage', (req: Request, res: Response) => {
  const stats = modelOrchestrator.getUsageStats();

  const totalCost = stats.reduce((sum, s) => sum + s.cost, 0);
  const totalRequests = stats.reduce((sum, s) => sum + s.requests, 0);
  const totalTokens = stats.reduce((sum, s) => sum + s.tokens, 0);

  res.json({
    success: true,
    models: stats,
    summary: {
      totalCost,
      totalRequests,
      totalTokens,
      averageCostPerRequest: totalRequests > 0 ? totalCost / totalRequests : 0,
      costSavingsFromFreeModels: this.calculateFreeSavings(stats),
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/v1/models/available
 * Get all available models
 */
router.get('/available', (req: Request, res: Response) => {
  const models = modelOrchestrator.getAvailableModels();

  const grouped = {
    premium: models.filter((m) => !m.isFree),
    free: models.filter((m) => m.isFree),
  };

  res.json({
    success: true,
    total: models.length,
    ...grouped,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/v1/models/by-capability/:category
 * Get models supporting a specific capability
 */
router.get('/by-capability/:category', (req: Request, res: Response) => {
  const { category } = req.params;
  const models = modelOrchestrator.getModelsByCapability(category as any);

  if (models.length === 0) {
    return res.status(404).json({
      error: `No models support capability: ${category}`,
    });
  }

  res.json({
    success: true,
    capability: category,
    models,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/v1/models/free
 * Get all free models
 */
router.get('/free', (req: Request, res: Response) => {
  const models = modelOrchestrator.getFreeModels();

  res.json({
    success: true,
    count: models.length,
    models,
    totalTokenLimit: models.reduce((sum, m) => sum + m.rateLimit.tpm, 0),
    timestamp: new Date().toISOString(),
  });
});

/**
 * Helper: Calculate cost savings from using free models
 */
function calculateFreeSavings(stats: any[]): number {
  return stats
    .filter((s) => s.model.includes('deepseek') || s.model.includes('llama') || s.model.includes('nemotron'))
    .reduce((sum, s) => sum + s.cost, 0);
}

export default router;
