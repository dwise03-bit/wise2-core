/**
 * Hermes Website Builder API Routes
 * Integrates the Hermes website-building agent into wise2
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middlewares/auth';
import { logger } from '../logger';

// In-memory job storage (would be replaced with database in production)
interface HermesJob {
  id: string;
  type: 'design-to-code' | 'site-generator' | 'component' | 'deploy';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  input: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const jobs: Map<string, HermesJob> = new Map();

export const hermesRouter = Router();

/**
 * GET /api/v1/hermes/status
 * Check Hermes service status
 */
hermesRouter.get('/status', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      service: 'hermes-website-builder',
      status: 'operational',
      capabilities: [
        'design-to-code',
        'site-generator',
        'component-scaffolding',
        'deployment-automation',
        'asset-optimization',
      ],
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

/**
 * GET /api/v1/hermes/jobs
 * List all build jobs
 */
hermesRouter.get('/jobs', authenticate, (_req: Request, res: Response) => {
  const jobList = Array.from(jobs.values())
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 50);

  res.json({
    success: true,
    data: {
      total: jobs.size,
      jobs: jobList.map(job => ({
        id: job.id,
        type: job.type,
        status: job.status,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      })),
    },
  });
});

/**
 * GET /api/v1/hermes/jobs/:id
 * Get specific job details
 */
hermesRouter.get('/jobs/:id', authenticate, (req: Request, res: Response) => {
  const job = jobs.get(req.params.id);

  if (!job) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'JOB_NOT_FOUND',
        message: `Job ${req.params.id} not found`,
      },
    });
  }

  res.json({
    success: true,
    data: {
      id: job.id,
      type: job.type,
      status: job.status,
      input: job.input,
      output: job.output,
      error: job.error,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    },
  });
});

/**
 * POST /api/v1/hermes/design-to-code
 * Convert design screenshot to HTML/CSS
 */
hermesRouter.post('/design-to-code', authenticate, async (req: Request, res: Response) => {
  try {
    const { imageUrl, imageBase64, format, responsive } = req.body;

    if (!imageUrl && !imageBase64) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_IMAGE',
          message: 'Either imageUrl or imageBase64 is required',
        },
      });
    }

    const jobId = `hermes-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const job: HermesJob = {
      id: jobId,
      type: 'design-to-code',
      status: 'queued',
      input: { imageUrl, imageBase64, format: format || 'html-css', responsive: responsive !== false },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jobs.set(jobId, job);
    logger.info('Hermes design-to-code job created', { jobId, imageUrl: !!imageUrl });

    // Simulate async processing (in production, would queue to worker)
    setTimeout(() => {
      const j = jobs.get(jobId);
      if (j) {
        j.status = 'processing';
        j.updatedAt = new Date();
      }
    }, 100);

    res.status(202).json({
      success: true,
      data: {
        jobId,
        status: job.status,
        message: 'Design-to-code conversion queued',
        pollUrl: `/api/v1/hermes/jobs/${jobId}`,
      },
    });
  } catch (error) {
    logger.error('design-to-code error', { error });
    res.status(500).json({
      success: false,
      error: {
        code: 'CONVERSION_ERROR',
        message: 'Design conversion failed',
      },
    });
  }
});

/**
 * POST /api/v1/hermes/site-generator
 * Generate complete website from specification
 */
hermesRouter.post('/site-generator', authenticate, async (req: Request, res: Response) => {
  try {
    const { spec, name, pages, designTokens } = req.body;

    if (!spec && !pages) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_SPEC',
          message: 'Either spec document or pages list is required',
        },
      });
    }

    const jobId = `hermes-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const job: HermesJob = {
      id: jobId,
      type: 'site-generator',
      status: 'queued',
      input: { spec, name: name || 'my-website', pages, designTokens },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jobs.set(jobId, job);
    logger.info('Hermes site-generator job created', { jobId, name: name || 'my-website' });

    res.status(202).json({
      success: true,
      data: {
        jobId,
        status: job.status,
        message: 'Site generation queued',
        pollUrl: `/api/v1/hermes/jobs/${jobId}`,
      },
    });
  } catch (error) {
    logger.error('site-generator error', { error });
    res.status(500).json({
      success: false,
      error: {
        code: 'GENERATION_ERROR',
        message: 'Site generation failed',
      },
    });
  }
});

/**
 * POST /api/v1/hermes/component
 * Generate a reusable component
 */
hermesRouter.post('/component', authenticate, async (req: Request, res: Response) => {
  try {
    const { description, type, framework } = req.body;

    if (!description) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_DESCRIPTION',
          message: 'Component description is required',
        },
      });
    }

    const jobId = `hermes-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const job: HermesJob = {
      id: jobId,
      type: 'component',
      status: 'queued',
      input: { description, type: type || 'generic', framework: framework || 'vanilla' },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jobs.set(jobId, job);
    logger.info('Hermes component job created', { jobId, type: type || 'generic' });

    res.status(202).json({
      success: true,
      data: {
        jobId,
        status: job.status,
        message: 'Component generation queued',
        pollUrl: `/api/v1/hermes/jobs/${jobId}`,
      },
    });
  } catch (error) {
    logger.error('component error', { error });
    res.status(500).json({
      success: false,
      error: {
        code: 'COMPONENT_ERROR',
        message: 'Component generation failed',
      },
    });
  }
});

/**
 * POST /api/v1/hermes/deploy
 * Deploy generated website
 */
hermesRouter.post('/deploy', authenticate, async (req: Request, res: Response) => {
  try {
    const { target, domain, credentials, sslEnabled } = req.body;

    if (!target) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_TARGET',
          message: 'Deployment target is required (vercel, netlify, github-pages, vps)',
        },
      });
    }

    const jobId = `hermes-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const job: HermesJob = {
      id: jobId,
      type: 'deploy',
      status: 'queued',
      input: { target, domain, credentials: !!credentials, sslEnabled: sslEnabled !== false },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jobs.set(jobId, job);
    logger.info('Hermes deploy job created', { jobId, target, domain });

    res.status(202).json({
      success: true,
      data: {
        jobId,
        status: job.status,
        message: 'Deployment queued',
        pollUrl: `/api/v1/hermes/jobs/${jobId}`,
      },
    });
  } catch (error) {
    logger.error('deploy error', { error });
    res.status(500).json({
      success: false,
      error: {
        code: 'DEPLOY_ERROR',
        message: 'Deployment failed',
      },
    });
  }
});

/**
 * GET /api/v1/hermes/docs
 * API documentation
 */
hermesRouter.get('/docs', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      service: 'Hermes Website Builder API',
      version: '1.0.0',
      baseUrl: '/api/v1/hermes',
      authentication: 'Bearer token (authenticate middleware)',
      endpoints: {
        status: {
          method: 'GET',
          path: '/status',
          description: 'Check service health',
          auth: false,
        },
        jobs: {
          method: 'GET',
          path: '/jobs',
          description: 'List all build jobs',
          auth: true,
        },
        jobDetail: {
          method: 'GET',
          path: '/jobs/:id',
          description: 'Get specific job details',
          auth: true,
        },
        designToCode: {
          method: 'POST',
          path: '/design-to-code',
          description: 'Convert design screenshot to HTML/CSS',
          auth: true,
          body: {
            imageUrl: 'URL to design image (optional)',
            imageBase64: 'Base64 encoded image (optional)',
            format: 'html-css | react | vue (default: html-css)',
            responsive: 'boolean (default: true)',
          },
        },
        siteGenerator: {
          method: 'POST',
          path: '/site-generator',
          description: 'Generate complete website from specification',
          auth: true,
          body: {
            spec: 'Markdown specification document',
            name: 'Project name (optional)',
            pages: 'Array of page names',
            designTokens: 'Custom design tokens object (optional)',
          },
        },
        component: {
          method: 'POST',
          path: '/component',
          description: 'Generate reusable component',
          auth: true,
          body: {
            description: 'Component description',
            type: 'button | card | form | modal | etc',
            framework: 'vanilla | react | vue (default: vanilla)',
          },
        },
        deploy: {
          method: 'POST',
          path: '/deploy',
          description: 'Deploy website to hosting',
          auth: true,
          body: {
            target: 'vercel | netlify | github-pages | vps',
            domain: 'Custom domain (optional)',
            credentials: 'Hosting provider credentials',
            sslEnabled: 'boolean (default: true)',
          },
        },
      },
      response: {
        success: true,
        data: 'Response data',
        error: 'Error details (on failure)',
      },
      example: {
        designToCode: {
          method: 'POST',
          url: 'http://localhost:3000/api/v1/hermes/design-to-code',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_TOKEN',
          },
          body: {
            imageUrl: 'https://example.com/design.png',
            responsive: true,
          },
        },
      },
    },
  });
});

export default hermesRouter;
