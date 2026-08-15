import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { GraphDB } from './GraphDB';
import { GraphQuery } from './queries/GraphQuery';
import { SemanticSearch } from './search/SemanticSearch';
import { GraphReasoning } from './reasoning/GraphReasoning';
import { GraphSync } from './sync/GraphSync';
import { createGraphApiRouter } from './api/GraphAPI';
import { config } from './config';
import { logger } from './logger';

let server: ReturnType<Express['listen']> | null = null;

export async function createServer(): Promise<Express> {
  const app = express();

  // Trust proxy
  app.set('trust proxy', true);

  // Security middleware
  app.use(helmet());

  // Body parser
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Request logging
  app.use((req: Request, _res: Response, next: NextFunction) => {
    const start = Date.now();
    _res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info(`${req.method} ${req.path} ${_res.statusCode} ${duration}ms`);
    });
    next();
  });

  // Initialize knowledge graph
  const graph = new GraphDB(config.graph.cacheTtl);
  const graphQuery = new GraphQuery(graph);
  const semanticSearch = new SemanticSearch(graph, config.graph.embeddingDimension);
  const graphReasoning = new GraphReasoning(graph);
  const graphSync = new GraphSync(graph);

  // API routes
  app.use('/api/graph', createGraphApiRouter(graph, graphQuery, semanticSearch, graphReasoning));

  // Sync endpoint
  app.post('/api/sync', async (_req: Request, res: Response) => {
    try {
      const result = await graphSync.syncWithVault();
      res.json(result);
    } catch (error) {
      logger.error('Error during sync', { error });
      res.status(500).json({ error: 'Sync failed' });
    }
  });

  // Pull endpoint
  app.post('/api/pull', async (_req: Request, res: Response) => {
    try {
      const result = await graphSync.pullFromVault();
      res.json(result);
    } catch (error) {
      logger.error('Error during pull', { error });
      res.status(500).json({ error: 'Pull failed' });
    }
  });

  // Full sync endpoint
  app.post('/api/full-sync', async (_req: Request, res: Response) => {
    try {
      const result = await graphSync.fullSync();
      res.json(result);
    } catch (error) {
      logger.error('Error during full sync', { error });
      res.status(500).json({ error: 'Full sync failed' });
    }
  });

  // Sync status endpoint
  app.get('/api/sync-status', (_req: Request, res: Response) => {
    try {
      const status = graphSync.getSyncStatus();
      res.json(status);
    } catch (error) {
      logger.error('Error getting sync status', { error });
      res.status(500).json({ error: 'Failed to get sync status' });
    }
  });

  // Health check
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      service: 'knowledge-graph',
      timestamp: new Date()
    });
  });

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not Found' });
  });

  // Error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error('Unhandled error', { error: err });
    res.status(500).json({ error: 'Internal Server Error' });
  });

  return app;
}

export async function startServer(app?: Express): Promise<void> {
  if (!app) {
    app = await createServer();
  }

  server = app.listen(config.port, config.host, () => {
    logger.info(`Knowledge Graph service listening on ${config.host}:${config.port}`);
  });

  return new Promise(() => {
    // Keep server running
  });
}

export async function stopServer(): Promise<void> {
  if (server) {
    server.close(() => {
      logger.info('Knowledge Graph service stopped');
    });
  }
}
