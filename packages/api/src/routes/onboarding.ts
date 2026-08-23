import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { JwtAuthGuard } from '../auth/jwt.guard';

const router = Router();

interface OnboardingStep {
  step: number;
  name: string;
  status: 'completed' | 'in_progress' | 'pending';
  completedAt?: Date;
}

interface OnboardingData {
  userId: string;
  currentStep: number;
  steps: OnboardingStep[];
  accountData: {
    businessName?: string;
    businessType?: string;
    phoneNumber?: string;
  };
  integrations: {
    jobber?: { connected: boolean; accountId?: string };
    stripe?: { connected: boolean; accountId?: string };
    twilio?: { connected: boolean; phoneNumber?: string };
  };
}

// 5-Step Onboarding Flow
// 1. Connect Integration (Jobber/Stripe)
// 2. Setup Billing (Stripe)
// 3. Configure Dashboard (Users, widgets)
// 4. Enable AI Phone (Greeting, hours)
// 5. Launch (Verify + Go live)

/**
 * GET /onboarding/status
 * Get current onboarding status
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Get or create onboarding record
    let onboarding = await prisma.onboarding.findUnique({
      where: { userId },
    });

    if (!onboarding) {
      onboarding = await prisma.onboarding.create({
        data: {
          userId,
          currentStep: 1,
          steps: [
            { step: 1, name: 'Connect Integration', status: 'in_progress' },
            { step: 2, name: 'Setup Billing', status: 'pending' },
            { step: 3, name: 'Configure Dashboard', status: 'pending' },
            { step: 4, name: 'Enable AI Phone', status: 'pending' },
            { step: 5, name: 'Launch', status: 'pending' },
          ] as any,
        },
      });
    }

    res.json({
      currentStep: onboarding.currentStep,
      steps: onboarding.steps,
      progress: (onboarding.currentStep / 5) * 100,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get onboarding status' });
  }
});

/**
 * POST /onboarding/step/:step/complete
 * Mark a step as complete
 */
router.post('/step/:step/complete', async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const step = parseInt(req.params.step);
    const { data } = req.body;

    if (!userId || step < 1 || step > 5) {
      return res.status(400).json({ error: 'Invalid step' });
    }

    const onboarding = await prisma.onboarding.update({
      where: { userId },
      data: {
        currentStep: Math.min(step + 1, 5),
      },
    });

    // Store step-specific data
    if (step === 1) {
      // Store integration connection
      await prisma.integration.upsert({
        where: { userId_provider: { userId, provider: data.provider } },
        create: { userId, provider: data.provider, accountId: data.accountId },
        update: { accountId: data.accountId },
      });
    } else if (step === 2) {
      // Store billing info
      await prisma.account.update({
        where: { userId },
        data: { stripeCustomerId: data.stripeCustomerId },
      });
    } else if (step === 3) {
      // Store dashboard config
      await prisma.dashboardConfig.upsert({
        where: { userId },
        create: { userId, widgets: data.widgets || [], theme: data.theme || 'dark' },
        update: { widgets: data.widgets || [] },
      });
    } else if (step === 4) {
      // Store AI Phone config
      await prisma.aiPhoneConfig.upsert({
        where: { userId },
        create: {
          userId,
          greeting: data.greeting || 'Hello! Thanks for calling.',
          businessHours: data.businessHours || {},
        },
        update: { greeting: data.greeting, businessHours: data.businessHours },
      });
    } else if (step === 5) {
      // Launch - activate account
      await prisma.account.update({
        where: { userId },
        data: { status: 'active' },
      });
    }

    res.json({
      currentStep: onboarding.currentStep,
      message: `Step ${step} completed`,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete step' });
  }
});

/**
 * POST /onboarding/skip-step/:step
 * Skip a step (for later)
 */
router.post('/skip-step/:step', async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const step = parseInt(req.params.step);

    if (!userId || step < 1 || step > 5) {
      return res.status(400).json({ error: 'Invalid step' });
    }

    await prisma.onboarding.update({
      where: { userId },
      data: {
        currentStep: Math.min(step + 1, 5),
      },
    });

    res.json({
      message: `Step ${step} skipped`,
      nextStep: Math.min(step + 1, 5),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to skip step' });
  }
});

export default router;
