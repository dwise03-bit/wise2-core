/**
 * Express server setup and configuration
 */

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config_ } from './config';
import { logger } from './logger';
import { database } from './database';
import { migrationRunner } from './migrations/runner';
import {
  requestIdMiddleware,
  requestLoggingMiddleware,
  responseLoggingMiddleware,
} from './middlewares/logging';
import {
  errorHandler,
  notFoundHandler,
} from './middlewares/error-handler';
import hermesRouter from './routes/hermes';
import metricsRouter from './routes/metrics';
import authRouter from './routes/auth';
import paymentsRouter from './routes/payments';
import filesRouter from './routes/files';
import consultingRouter from './routes/consulting';
import webhooksRouter from './routes/webhooks';
import crmRouter from './routes/crm';
import estimatesRouter from './routes/estimates';
import dispatchRouter from './routes/dispatch';
import followUpsRouter from './routes/followups';
import approvalsRouter from './routes/approvals';
import workflowsRouter from './routes/workflows';
import industryTemplatesRouter from './routes/industry-templates';
import observabilityRouter from './routes/observability';

export async function createServer(): Promise<Express> {
  const app = express();

  // ============================================================================
  // Security Middleware
  // ============================================================================
  app.use(helmet());

  // ============================================================================
  // Webhook Raw Body Capture (before JSON parsing)
  // Required for Stripe signature verification
  // ============================================================================
  app.use('/api/v1/webhooks', express.raw({ type: 'application/json' }), (req, res, next) => {
    (req as any).rawBody = req.body;
    next();
  });

  // ============================================================================
  // Request Parsing Middleware
  // ============================================================================
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // ============================================================================
  // CORS Configuration
  // ============================================================================
  app.use(
    cors({
      origin: config_.cors.origin,
      credentials: config_.cors.credentials,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
      exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
      maxAge: 86400,
    }),
  );

  // ============================================================================
  // Request Context Middleware
  // ============================================================================
  app.use(requestIdMiddleware);
  app.use(requestLoggingMiddleware);
  app.use(responseLoggingMiddleware);

  // ============================================================================
  // Health Check Endpoint (No Auth Required)
  // ============================================================================
  app.get('/health', async (_req: Request, res: Response) => {
    try {
      const isHealthy = await database.healthCheck();
      const status = isHealthy ? 'ok' : 'degraded';

      res.status(isHealthy ? 200 : 503).json({
        status,
        timestamp: new Date().toISOString(),
        database: isHealthy ? 'connected' : 'disconnected',
        poolStats: database.getPoolStats(),
        uptime: process.uptime(),
      });
    } catch (error) {
      logger.error('Health check failed', { error });
      res.status(503).json({
        status: 'unhealthy',
        error: 'Health check failed',
      });
    }
  });

  // ============================================================================
  // Status Endpoint (No Auth Required)
  // ============================================================================
  app.get('/status', (_req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        service: 'wise2-api',
        version: '1.0.0',
        environment: config_.app.nodeEnv,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
    });
  });

  // ============================================================================
  // API Routes
  // ============================================================================

  // Webhook routes (before auth routes, no auth required)
  app.use('/api/v1/webhooks', webhooksRouter);

  // Authentication routes
  app.use('/api/v1/auth', authRouter);

  // Payment routes
  app.use('/api/v1/payments', paymentsRouter);

  // CRM routes (Command Center - requires auth + tenant context)
  app.use('/api/v1/crm', crmRouter);

  // Estimates routes (Phase 8)
  app.use('/api/v1/crm', estimatesRouter);

  // Dispatch routes (Phase 9)
  app.use('/api/v1/crm', dispatchRouter);

  // Follow-ups routes (Phase 10)
  app.use('/api/v1/crm', followUpsRouter);

  // Approvals routes (Phase 13)
  app.use('/api/v1/crm', approvalsRouter);

  // Workflows routes (Phase 14)
  app.use('/api/v1/crm', workflowsRouter);

  // Industry templates routes (Phase 15)
  app.use('/api/v1/crm', industryTemplatesRouter);

  // Observability routes (Phase 16)
  app.use('/api/v1/crm', observabilityRouter);

  // File storage routes
  app.use('/api/v1/files', filesRouter);

  // Hermes Website Builder API
  app.use('/api/v1/hermes', hermesRouter);

  // Metrics API
  app.use('/api/v1/metrics', metricsRouter);

  // Consulting Revenue System API
  app.use('/api/v1/consulting', consultingRouter);

  // ============================================================================
  // 404 Handler
  // ============================================================================
  app.use(notFoundHandler);

  // ============================================================================
  // Error Handler (Must be last middleware)
  // ============================================================================
  app.use(errorHandler);

  return app;
}

export async function startServer(app: Express): Promise<void> {
  const port = config_.app.port;
  const host = config_.app.host;

  try {
    // Connect to database
    await database.connect();
    logger.info('Database connection established');

    // Run database migrations
    logger.info('Running database migrations...');
    await migrationRunner.run();
    logger.info('Database migrations completed');

    // Start HTTP server
    app.listen(port, host, () => {
      logger.info('Server started', {
        port,
        host,
        environment: config_.app.nodeEnv,
      });
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

export async function stopServer(): Promise<void> {
  try {
    await database.close();
    logger.info('Server stopped');
    process.exit(0);
  } catch (error) {
    logger.error('Error stopping server', { error });
    process.exit(1);
  }
}
