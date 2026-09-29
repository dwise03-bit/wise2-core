/**
 * Hermes Adaptive AI Routes
 * FREE-FIRST model routing with dynamic selection and fallback
 */

import { Router, Request, Response } from 'express';
import pino from 'pino';
import { HermesAdaptiveAgent } from '../../ai-orchestrator/src/hermes/HermesAdaptiveAgent';
import { DynamicModelRouter } from '../../ai-orchestrator/src/models/DynamicModelRouter';
import { ModelRegistry } from '../../ai-orchestrator/src/models/ModelRegistry';

const logger = pino();
const router = Router();

let modelRegistry: ModelRegistry;
let modelRouter: DynamicModelRouter;
let hermesAgent: HermesAdaptiveAgent;

/**
 * Initialize Hermes adaptive services
 */
export async function initializeHermes() {
  try {
    // Initialize model registry (discovers available models)
    modelRegistry = new ModelRegistry('./config/model-registry.json');
    await modelRegistry.initialize();

    // Initialize dynamic router
    modelRouter = new DynamicModelRouter(modelRegistry, 'FREE-FIRST');

    // Initialize Hermes agent
    hermesAgent = new HermesAdaptiveAgent(modelRegistry, modelRouter);

    logger.info('Hermes Adaptive AI initialized', {
      modelsAvailable: modelRegistry.getAllModels().length,
      freeModelsAvailable: modelRegistry.getAvailableFreeModels().length,
    });
  } catch (error) {
    logger.error('Failed to initialize Hermes', { error });
    throw error;
  }
}

/**
 * GET /api/v1/hermes/adaptive/models
 * List all available models with capabilities
 */
router.get('/adaptive/models', (_req: Request, res: Response) => {
  try {
    const models = modelRegistry.getAllModels();
    const stats = modelRegistry.getStats();

    return res.json({
      success: true,
      data: {
        stats,
        models: models.map((m) => ({
          name: m.name,
          displayName: m.displayName,
          provider: m.provider,
          available: m.available,
          free: m.free,
          local: m.local,
          contextWindow: m.contextWindow,
          capabilities: m.capabilities,
          successRate: m.successRate.toFixed(3),
          avgLatencyMs: m.avgLatencyMs,
          preferredTasks: m.preferredTasks,
          lastVerified: m.lastVerified,
        })),
      },
    });
  } catch (error) {
    logger.error('Error listing models', { error });
    return res.status(500).json({
      success: false,
      error: { code: 'MODEL_LIST_ERROR', message: (error as Error).message },
    });
  }
});

/**
 * GET /api/v1/hermes/adaptive/health
 * Check health of all models
 */
router.get('/adaptive/health', async (_req: Request, res: Response) => {
  try {
    const stats = modelRegistry.getStats();
    const costPolicy = modelRouter.getCostPolicy();

    return res.json({
      success: true,
      data: {
        status: stats.available > 0 ? 'healthy' : 'degraded',
        costPolicy,
        models: {
          total: stats.total,
          available: stats.available,
          free: stats.free,
          local: stats.local,
          averageSuccessRate: stats.averageSuccessRate,
        },
        lastCheck: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error checking health', { error });
    return res.status(500).json({
      success: false,
      error: { code: 'HEALTH_CHECK_ERROR', message: (error as Error).message },
    });
  }
});

/**
 * POST /api/v1/hermes/adaptive/process
 * Process a request with adaptive model selection
 */
router.post('/adaptive/process', async (req: Request, res: Response) => {
  try {
    const { query, context, requiresStructuredOutput, priority } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_QUERY', message: 'query field is required' },
      });
    }

    const response = await hermesAgent.process({
      query,
      context,
      requiresStructuredOutput: requiresStructuredOutput || false,
      priority: priority || 'quality',
    });

    return res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    logger.error('Error processing request', { error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'PROCESSING_ERROR',
        message: (error as Error).message,
      },
    });
  }
});

/**
 * GET /api/v1/hermes/adaptive/stats
 * Get Hermes statistics and model performance
 */
router.get('/adaptive/stats', (_req: Request, res: Response) => {
  try {
    const stats = hermesAgent.getRegistryStats();
    const costPolicy = modelRouter.getCostPolicy();

    return res.json({
      success: true,
      data: {
        costPolicy,
        timestamp: new Date().toISOString(),
        ...stats,
      },
    });
  } catch (error) {
    logger.error('Error getting stats', { error });
    return res.status(500).json({
      success: false,
      error: { code: 'STATS_ERROR', message: (error as Error).message },
    });
  }
});

/**
 * POST /api/v1/hermes/adaptive/fallback-test
 * Test fallback mechanism (for acceptance testing)
 * Temporarily disables a model to verify fallback works
 */
router.post('/adaptive/fallback-test', async (req: Request, res: Response) => {
  try {
    const { modelName, testDuration } = req.body;

    if (!modelName) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_MODEL', message: 'modelName field is required' },
      });
    }

    const model = modelRegistry.getModel(modelName);
    if (!model) {
      return res.status(404).json({
        success: false,
        error: { code: 'MODEL_NOT_FOUND', message: `Model ${modelName} not found` },
      });
    }

    // Temporarily disable model
    const originalState = model.available;
    model.available = false;

    logger.info(`Fallback test: disabled ${modelName}`, { testDuration });

    // Re-enable after test duration
    const duration = testDuration || 5000; // 5 seconds default
    setTimeout(() => {
      model.available = originalState;
      logger.info(`Fallback test: restored ${modelName}`);
    }, duration);

    return res.json({
      success: true,
      data: {
        model: modelName,
        disabled: true,
        testDuration: duration,
        message: 'Model temporarily disabled for fallback testing. Will be restored automatically.',
      },
    });
  } catch (error) {
    logger.error('Error in fallback test', { error });
    return res.status(500).json({
      success: false,
      error: { code: 'FALLBACK_TEST_ERROR', message: (error as Error).message },
    });
  }
});

/**
 * GET /api/v1/hermes/adaptive/docs
 * API documentation
 */
router.get('/adaptive/docs', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      service: 'Hermes Adaptive AI',
      version: '1.0.0',
      baseUrl: '/api/v1/hermes',
      costMode: 'FREE-FIRST',
      description: 'Intelligent model selection with automatic fallback and cost optimization',
      endpoints: {
        models: {
          method: 'GET',
          path: '/adaptive/models',
          description: 'List all available models',
        },
        health: {
          method: 'GET',
          path: '/adaptive/health',
          description: 'Check model health and system status',
        },
        process: {
          method: 'POST',
          path: '/adaptive/process',
          description: 'Process a request with adaptive model selection',
          body: {
            query: 'string (required)',
            context: 'object (optional)',
            requiresStructuredOutput: 'boolean (default: false)',
            priority: 'speed | quality | cost (default: quality)',
          },
        },
        stats: {
          method: 'GET',
          path: '/adaptive/stats',
          description: 'Get performance statistics',
        },
        fallbackTest: {
          method: 'POST',
          path: '/adaptive/fallback-test',
          description: 'Test fallback mechanism (admin only)',
          body: {
            modelName: 'string (required)',
            testDuration: 'number in ms (optional, default: 5000)',
          },
        },
      },
      features: {
        freeFirst: 'Prioritizes local and free models',
        dynamicRouting: 'Scores models based on task type',
        automaticFallback: 'Retries with next model if primary fails',
        healthTracking: 'Circuit breaker prevents cascading failures',
        costGuard: 'Prevents unexpected AI bills',
      },
      example: {
        method: 'POST',
        url: 'http://localhost:3000/api/v1/hermes/adaptive/process',
        body: {
          query: 'Write a Python function to sort an array',
          priority: 'quality',
        },
      },
    },
  });
});

export default router;
