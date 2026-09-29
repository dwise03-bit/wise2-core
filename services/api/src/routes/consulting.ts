/**
 * Consulting Revenue System Routes
 * Handles lead intake, qualification, checkout, and project management
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middlewares/auth';
import { consultingService } from '../services/consulting.service';

const router = Router();

/**
 * POST /api/v1/consulting/leads
 * Submit intake form and create lead record
 */
router.post('/leads', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      fullName,
      email,
      phone,
      companyName,
      website,
      industry,
      businessDescription,
      currentProblem,
      desiredBuild,
      currentTools,
      desiredResult,
      timeline,
      budgetRange,
      teamSize,
      revenueRange,
      crm,
      websitePlatform,
      socialPlatforms,
      existingAutomations,
      aiTools,
      notes,
      utmSource,
      utmMedium,
      utmCampaign,
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !companyName || !currentProblem || !desiredBuild) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields: fullName, email, companyName, currentProblem, desiredBuild',
        },
      });
    }

    const { lead, score, recommendedService } = await consultingService.createLead({
      fullName,
      email,
      phone,
      companyName,
      website,
      industry,
      businessDescription,
      currentProblem,
      desiredBuild,
      currentTools: currentTools || [],
      desiredResult,
      timeline,
      budgetRange,
      teamSize,
      revenueRange,
      crm,
      websitePlatform,
      socialPlatforms: socialPlatforms || [],
      existingAutomations: existingAutomations || [],
      aiTools: aiTools || [],
      notes,
      utmSource,
      utmMedium,
      utmCampaign,
    });

    res.status(201).json({
      success: true,
      data: {
        leadId: lead.id,
        email: lead.email,
        leadScore: score,
        recommendedService,
        nextSteps: 'Proceed to checkout',
      },
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * GET /api/v1/consulting/leads/:leadId
 * Get lead details (user or admin)
 */
router.get('/leads/:leadId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { leadId } = req.params;
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;

    const lead = await consultingService.getLeadById(leadId, userId, userRole);

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Lead not found',
        },
      });
    }

    const score = consultingService.calculateLeadScore(lead);
    const recommendedService = consultingService.recommendService(lead);

    res.status(200).json({
      success: true,
      data: {
        lead,
        score,
        recommendedService,
      },
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * PATCH /api/v1/consulting/leads/:leadId
 * Update lead (admin only)
 */
router.patch(
  '/leads/:leadId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { leadId } = req.params;
      const userRole = (req as any).userRole;

      // Admin only
      if (userRole !== 'ADMIN' && userRole !== 'FOUNDER') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Only admins can update leads',
          },
        });
      }

      const updateData = req.body;
      const lead = await consultingService.updateLead(leadId, updateData);

      if (!lead) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Lead not found',
          },
        });
      }

      res.status(200).json({
        success: true,
        data: { lead },
      });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * POST /api/v1/consulting/checkout
 * Create Stripe Checkout Session
 */
router.post('/checkout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { leadId, serviceId, email, utmSource, utmMedium, utmCampaign } = req.body;

    if (!leadId && !serviceId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Either leadId or serviceId is required',
        },
      });
    }

    const { sessionId, checkoutUrl, expiresAt } = await consultingService.createCheckoutSession({
      leadId,
      serviceId,
      email,
      utmSource,
      utmMedium,
      utmCampaign,
    });

    res.status(200).json({
      success: true,
      data: {
        sessionId,
        checkoutUrl,
        expiresAt,
      },
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * GET /api/v1/consulting/services
 * List all consulting services (public)
 */
router.get('/services', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const services = await consultingService.getAllServices();

    res.status(200).json({
      success: true,
      data: {
        services: services.map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          hourlyRate: s.hourlyRate,
          stripePriceId: s.stripePriceId,
          featured: s.featured,
          isRecurring: s.isRecurring,
          isManagementTier: s.isManagementTier,
          icon: s.icon,
          tags: s.tags,
        })),
      },
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * POST /api/v1/consulting/projects/:projectId/complete
 * Mark consulting session complete and trigger deliverables (admin only)
 */
router.post(
  '/projects/:projectId/complete',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { projectId } = req.params;
      const userRole = (req as any).userRole;
      const { deliverables, recommendations, nextSteps } = req.body;

      // Admin only
      if (userRole !== 'ADMIN' && userRole !== 'FOUNDER') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Only admins can complete projects',
          },
        });
      }

      const project = await consultingService.completeProject(projectId, {
        deliverables,
        recommendations,
        nextSteps,
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Project not found',
          },
        });
      }

      res.status(200).json({
        success: true,
        data: {
          project,
          message: 'Session marked complete. Follow-up workflows triggered.',
        },
      });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * GET /api/v1/consulting/projects/:projectId
 * Get project details (admin only)
 */
router.get(
  '/projects/:projectId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { projectId } = req.params;
      const userRole = (req as any).userRole;

      // Admin only
      if (userRole !== 'ADMIN' && userRole !== 'FOUNDER') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Only admins can view projects',
          },
        });
      }

      const project = await consultingService.getProjectById(projectId);

      if (!project) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Project not found',
          },
        });
      }

      res.status(200).json({
        success: true,
        data: { project },
      });
    } catch (error) {
      return next(error);
    }
  }
);

export default router;
