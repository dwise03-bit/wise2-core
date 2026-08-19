import express, { Request, Response, NextFunction } from 'express';
import { Logger, createLogger, format, transports } from 'winston';
import { ComfyUIClient } from './comfyui/ComfyUIClient.js';
import { ImageRouter } from './router/ImageRouter.js';
import { WorkflowManager } from './workflows/WorkflowManager.js';
import { BrandProfileManager } from './brand/BrandProfileManager.js';
import { GenerationRequest, HealthCheckResult } from './types.js';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize logger
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: 'visual-factory' },
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ level, message, timestamp, ...meta }) => {
          return `${timestamp} [${level}] ${message}`;
        })
      ),
    }),
    new transports.File({
      filename: path.join(__dirname, '..', 'logs', 'error.log'),
      level: 'error',
    }),
    new transports.File({
      filename: path.join(__dirname, '..', 'logs', 'combined.log'),
    }),
  ],
});

const app = express();
const port = process.env.PORT || 8890;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Authentication middleware (validates tenant)
const authenticateTenant = (req: Request, res: Response, next: NextFunction) => {
  const tenantId = req.headers['x-tenant-id'] as string;
  const apiKey = req.headers['x-api-key'] as string;

  if (!tenantId) {
    return res.status(400).json({ error: 'Missing x-tenant-id header' });
  }

  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  (req as any).tenantId = tenantId;
  next();
};

// Initialize components
let comfyui: ComfyUIClient;
let imageRouter: ImageRouter;
let workflowManager: WorkflowManager;
let brandManager: BrandProfileManager;

async function initialize() {
  try {
    const comfyuiUrl = process.env.COMFYUI_URL || 'http://127.0.0.1:8188';
    const brandBasePath = process.env.BRAND_DATA_PATH || '/opt/wise2-visual-factory/data/brands';

    logger.info('Initializing Visual Factory...', {
      comfyuiUrl,
      brandBasePath,
    });

    // Initialize components
    comfyui = new ComfyUIClient(comfyuiUrl, logger);
    workflowManager = new WorkflowManager(logger);
    brandManager = new BrandProfileManager(brandBasePath, logger);

    await comfyui.initialize();

    imageRouter = new ImageRouter(comfyui, workflowManager, brandManager, logger, 4);

    logger.info('Visual Factory initialized successfully');

    // Setup routes
    setupRoutes();

    // Start server
    app.listen(port, () => {
      logger.info(`Visual Factory server running on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to initialize Visual Factory', error);
    process.exit(1);
  }
}

function setupRoutes() {
  // Health check
  app.get('/health', async (req: Request, res: Response) => {
    try {
      const stats = await comfyui.getSystemStats();
      const gpu = await comfyui.getGPUInfo();

      const health: HealthCheckResult = {
        status: comfyui.isAvailable() ? 'healthy' : 'degraded',
        gpu: gpu !== null,
        cuda: gpu?.cudaAvailable || false,
        comfyui: comfyui.isAvailable(),
        mcp: true, // Assume MCP is available if we're running
        model: 'FLUX.2-klein-4B', // TODO: Get actual loaded model
        storage: true, // TODO: Check actual storage
        queue: true,
        database: true, // TODO: Check actual database
        checks: {
          comfyuiStats: stats,
          gpuInfo: gpu,
        },
        timestamp: new Date(),
      };

      res.status(health.status === 'healthy' ? 200 : 503).json(health);
    } catch (error) {
      logger.error('Health check failed', error);
      res.status(503).json({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Queue statistics
  app.get('/queue', authenticateTenant, (req: Request, res: Response) => {
    const stats = imageRouter.getQueueStats();
    res.json(stats);
  });

  // Get job status
  app.get('/jobs/:jobId', authenticateTenant, (req: Request, res: Response) => {
    const job = imageRouter.getJob(req.params.jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(job);
  });

  // Generate image
  app.post('/images/generate', authenticateTenant, async (req: Request, res: Response) => {
    try {
      const body = req.body;
      const tenantId = (req as any).tenantId;

      const request: GenerationRequest = {
        requestId: require('uuid').v4(),
        tenantId,
        customerId: body.customerId || tenantId,
        brandId: body.brandId,
        userId: body.userId || 'unknown',
        type: body.type || 'text-to-image',
        prompt: body.prompt,
        negativePrompt: body.negativePrompt,
        referenceImages: body.referenceImages,
        width: body.width || 1024,
        height: body.height || 768,
        aspectRatio: body.aspectRatio,
        steps: body.steps || 20,
        guidance: body.guidance || 7.5,
        seed: body.seed,
        qualityTier: body.qualityTier || 'balanced',
        model: body.model,
        stylePreset: body.stylePreset,
        metadata: body.metadata,
        createdAt: new Date(),
        priority: body.priority || 'normal',
      };

      const job = await imageRouter.routeGenerationRequest(request);
      res.status(202).json({
        jobId: job.jobId,
        status: job.status,
        message: 'Generation request queued',
      });
    } catch (error) {
      logger.error('Failed to process generation request', error);
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // List models
  app.get('/models', authenticateTenant, async (req: Request, res: Response) => {
    try {
      const models = await comfyui.listModels();
      res.json(models);
    } catch (error) {
      logger.error('Failed to list models', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // List workflows
  app.get('/workflows', authenticateTenant, (req: Request, res: Response) => {
    const workflows = workflowManager.listWorkflows();
    res.json(workflows);
  });

  // GPU status
  app.get('/gpu/status', authenticateTenant, async (req: Request, res: Response) => {
    try {
      const gpu = await comfyui.getGPUInfo();
      if (!gpu) {
        return res.status(503).json({ error: 'GPU not available' });
      }
      res.json(gpu);
    } catch (error) {
      logger.error('Failed to get GPU status', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  logger.info('Routes initialized');
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await comfyui.shutdown();
  process.exit(0);
});

// Start
initialize().catch(error => {
  logger.error('Fatal error during initialization', error);
  process.exit(1);
});
