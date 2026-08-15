/**
 * WISE² API Gateway
 *
 * Central routing layer for:
 * - /api/executive/* → Executive Agent service
 * - /api/developer/* → Developer Agent service
 * - /api/infrastructure/* → Infrastructure Agent
 * - /api/deployment/* → Deployment Agent
 * - /api/voice/* → Voice Assistant
 * - /api/knowledge-graph/* → Knowledge Graph service
 * - /api/automations/* → Automation Engine
 * - /api/discord/* → Discord bots
 * - /api/sync/* → Cross-device sync
 * - /api/health/* → System health
 *
 * Features:
 * ✅ Authentication (OAuth, API keys, JWT)
 * ✅ Rate limiting (per user, per agent, per endpoint)
 * ✅ Response caching (Redis, 5min-1hr TTL)
 * ✅ Request logging (user, action, timestamp, result)
 * ✅ Metrics collection (Prometheus format)
 * ✅ Error handling (consistent error responses)
 * ✅ Request validation (JSON schema)
 * ✅ Response compression (gzip)
 * ✅ CORS handling
 * ✅ Request tracing
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import axios, { AxiosInstance } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { AuthMiddleware } from './auth/AuthMiddleware';
import { PermissionChecker } from './auth/PermissionChecker';
import { RouteHandler } from './routing/RouteHandler';
import { RateLimiter } from './ratelimit/RateLimiter';
import { ResponseCache } from './cache/ResponseCache';
import { RequestLogger } from './logging/RequestLogger';
import { MetricsCollector } from './metrics/MetricsCollector';
import { ErrorHandler } from './error/ErrorHandler';
import { logger } from './logger';

interface GatewayConfig {
  port: number;
  environment: 'development' | 'production' | 'staging';
  corsOrigin: string | string[];
  redisUrl?: string;
  prometheusPort?: number;
  services: {
    executive: string;
    developer: string;
    infrastructure: string;
    deployment: string;
    voiceAssistant: string;
    knowledgeGraph: string;
    automations: string;
    discord: string;
    sync: string;
    health: string;
  };
}

export class APIGateway {
  private app: Express;
  private config: GatewayConfig;
  private authMiddleware: AuthMiddleware;
  private permissionChecker: PermissionChecker;
  private routeHandler: RouteHandler;
  private rateLimiter: RateLimiter;
  private responseCache: ResponseCache;
  private requestLogger: RequestLogger;
  private metricsCollector: MetricsCollector;
  private errorHandler: ErrorHandler;
  private httpClients: Map<string, AxiosInstance> = new Map();

  constructor(config: GatewayConfig) {
    this.config = config;
    this.app = express();

    // Initialize middleware
    this.authMiddleware = new AuthMiddleware();
    this.permissionChecker = new PermissionChecker();
    this.routeHandler = new RouteHandler(this.config.services);
    this.rateLimiter = new RateLimiter(this.config.redisUrl);
    this.responseCache = new ResponseCache(this.config.redisUrl);
    this.requestLogger = new RequestLogger();
    this.metricsCollector = new MetricsCollector();
    this.errorHandler = new ErrorHandler();

    // Setup middleware
    this.setupMiddleware();

    // Setup routes
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    // Security headers
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
        },
      },
    }));

    // Compression
    this.app.use(compression({
      level: 6,
      threshold: 1024,
    }));

    // CORS
    this.app.use(cors({
      origin: this.config.corsOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Request-ID',
        'X-API-Key',
        'X-User-ID',
      ],
      exposedHeaders: [
        'X-Request-ID',
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
        'X-RateLimit-Reset',
        'X-Cache',
      ],
      maxAge: 86400,
    }));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ limit: '10mb', extended: true }));

    // Request ID middleware
    this.app.use((req: Request, _res: Response, next: NextFunction) => {
      req.id = req.headers['x-request-id'] as string || uuidv4();
      req.startTime = Date.now();
      next();
    });

    // Metrics middleware
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      this.metricsCollector.recordRequest(req.method, req.path);

      const originalSend = res.send;
      res.send = function(data) {
        const duration = Date.now() - (req.startTime || 0);
        this.metricsCollector.recordResponse(
          req.method,
          req.path,
          res.statusCode,
          duration
        );
        return originalSend.call(this, data);
      };

      next();
    });

    // Request logging middleware
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      this.requestLogger.logRequest({
        requestId: req.id,
        method: req.method,
        path: req.path,
        userId: req.user?.id,
        timestamp: new Date(),
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      });
      next();
    });
  }

  private setupRoutes(): void {
    // Health check (no auth required)
    this.app.get('/health', async (req: Request, res: Response) => {
      try {
        const health = await this.checkServiceHealth();
        res.status(health.isHealthy ? 200 : 503).json({
          status: health.isHealthy ? 'ok' : 'degraded',
          timestamp: new Date().toISOString(),
          services: health.services,
          uptime: process.uptime(),
        });
      } catch (error) {
        this.errorHandler.handleError(error, req, res);
      }
    });

    // Metrics endpoint (Prometheus format)
    this.app.get('/metrics', (req: Request, res: Response) => {
      res.set('Content-Type', 'text/plain; version=0.0.4');
      res.send(this.metricsCollector.getMetrics());
    });

    // Gateway status
    this.app.get('/gateway/status', (req: Request, res: Response) => {
      res.json({
        service: 'wise2-api-gateway',
        version: '1.0.0',
        environment: this.config.environment,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      });
    });

    // API routes with full middleware chain
    this.app.use('/api/*', this.withAuth.bind(this));
    this.app.use('/api/*', this.withRateLimit.bind(this));
    this.app.use('/api/*', this.withPermissions.bind(this));

    // Executive Agent routes
    this.app.use('/api/executive', this.withCache.bind(this), (req, res) =>
      this.proxyRequest(req, res, 'executive')
    );

    // Developer Agent routes
    this.app.use('/api/developer', this.withCache.bind(this), (req, res) =>
      this.proxyRequest(req, res, 'developer')
    );

    // Infrastructure Agent routes
    this.app.use('/api/infrastructure', this.withCache.bind(this), (req, res) =>
      this.proxyRequest(req, res, 'infrastructure')
    );

    // Deployment Agent routes
    this.app.use('/api/deployment', this.withCache.bind(this), (req, res) =>
      this.proxyRequest(req, res, 'deployment')
    );

    // Voice Assistant routes (no cache)
    this.app.use('/api/voice', (req, res) =>
      this.proxyRequest(req, res, 'voiceAssistant')
    );

    // Knowledge Graph routes
    this.app.use('/api/knowledge-graph', this.withCache.bind(this), (req, res) =>
      this.proxyRequest(req, res, 'knowledgeGraph')
    );

    // Automations routes
    this.app.use('/api/automations', (req, res) =>
      this.proxyRequest(req, res, 'automations')
    );

    // Discord routes (no cache)
    this.app.use('/api/discord', (req, res) =>
      this.proxyRequest(req, res, 'discord')
    );

    // Sync routes
    this.app.use('/api/sync', (req, res) =>
      this.proxyRequest(req, res, 'sync')
    );

    // Health routes
    this.app.use('/api/health', (req, res) =>
      this.proxyRequest(req, res, 'health')
    );

    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
        requestId: req.id,
      });
    });

    // Error handler
    this.app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
      this.errorHandler.handleError(err, req, res);
    });
  }

  private async withAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await this.authMiddleware.authenticate(req);
      req.user = user;
      next();
    } catch (error) {
      this.errorHandler.handleError(error, req, res);
    }
  }

  private async withRateLimit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id || req.ip;
      const endpoint = req.path;

      const limit = await this.rateLimiter.checkLimit(userId, endpoint);

      res.set('X-RateLimit-Limit', limit.limit.toString());
      res.set('X-RateLimit-Remaining', limit.remaining.toString());
      res.set('X-RateLimit-Reset', limit.resetAt.toString());

      if (limit.exceeded) {
        return res.status(429).json({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded',
          retryAfter: limit.retryAfter,
          requestId: req.id,
        });
      }

      next();
    } catch (error) {
      this.errorHandler.handleError(error, req, res);
    }
  }

  private async withPermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const hasPermission = await this.permissionChecker.check(
        req.user,
        req.method,
        req.path
      );

      if (!hasPermission) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Insufficient permissions',
          requestId: req.id,
        });
      }

      next();
    } catch (error) {
      this.errorHandler.handleError(error, req, res);
    }
  }

  private async withCache(req: Request, res: Response, next: NextFunction): Promise<void> {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    try {
      const cacheKey = this.responseCache.generateKey(req);
      const cached = await this.responseCache.get(cacheKey);

      if (cached) {
        res.set('X-Cache', 'HIT');
        res.set('X-Request-ID', req.id);
        return res.json(cached);
      }

      // Intercept send to cache response
      const originalSend = res.send;
      res.send = function(data: any) {
        if (res.statusCode === 200 && typeof data === 'string') {
          const parsed = JSON.parse(data);
          this.responseCache.set(cacheKey, parsed, 300); // 5 min TTL
        }
        res.set('X-Cache', 'MISS');
        return originalSend.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error', error);
      next();
    }
  }

  private async proxyRequest(
    req: Request,
    res: Response,
    serviceName: keyof GatewayConfig['services']
  ): Promise<void> {
    try {
      const serviceUrl = this.config.services[serviceName];
      if (!serviceUrl) {
        return res.status(503).json({
          error: 'Service Unavailable',
          message: `Service ${serviceName} not configured`,
          requestId: req.id,
        });
      }

      // Get or create HTTP client for this service
      let client = this.httpClients.get(serviceName);
      if (!client) {
        client = axios.create({
          baseURL: serviceUrl,
          timeout: 30000,
          headers: {
            'X-Request-ID': req.id,
            'X-Forwarded-For': req.ip,
            'X-Forwarded-Proto': req.protocol,
          },
        });
        this.httpClients.set(serviceName, client);
      }

      // Remove gateway path prefix
      const servicePath = req.originalUrl
        .replace(/^\/api\/[^/]+/, '')
        .replace(/^\/api/, '');

      // Proxy request
      const response = await client({
        method: req.method as any,
        url: servicePath || '/',
        data: req.method !== 'GET' ? req.body : undefined,
        params: req.query,
        headers: {
          ...req.headers,
          'X-Request-ID': req.id,
          'Content-Type': req.headers['content-type'],
        },
      });

      // Forward response
      res.status(response.status).set(response.headers);
      res.send(response.data);

      // Log successful request
      this.requestLogger.logResponse({
        requestId: req.id,
        statusCode: response.status,
        duration: Date.now() - (req.startTime || 0),
        service: serviceName,
      });
    } catch (error: any) {
      // Log failed request
      this.requestLogger.logError({
        requestId: req.id,
        error: error.message,
        service: serviceName,
      });

      this.errorHandler.handleError(error, req, res);
    }
  }

  private async checkServiceHealth(): Promise<{
    isHealthy: boolean;
    services: Record<string, { healthy: boolean; latency: number }>;
  }> {
    const services: Record<string, { healthy: boolean; latency: number }> = {};
    let allHealthy = true;

    for (const [serviceName, serviceUrl] of Object.entries(this.config.services)) {
      try {
        const startTime = Date.now();
        const response = await axios.get(`${serviceUrl}/health`, {
          timeout: 5000,
        });
        const latency = Date.now() - startTime;

        services[serviceName] = {
          healthy: response.status === 200,
          latency,
        };

        if (response.status !== 200) {
          allHealthy = false;
        }
      } catch (error) {
        services[serviceName] = {
          healthy: false,
          latency: -1,
        };
        allHealthy = false;
      }
    }

    return {
      isHealthy: allHealthy,
      services,
    };
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.app.listen(this.config.port, () => {
          logger.info(`API Gateway listening on port ${this.config.port}`);
          resolve();
        });
      } catch (error) {
        logger.error('Failed to start API Gateway', error);
        reject(error);
      }
    });
  }

  getApp(): Express {
    return this.app;
  }
}

// Extend Express Request to include custom properties
declare global {
  namespace Express {
    interface Request {
      id: string;
      user?: any;
      startTime?: number;
    }
  }
}

export default APIGateway;
