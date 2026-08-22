import { Router, Request, Response } from 'express';
import { ClientManagementService } from '../client-management/client-management.service';

const router = Router();
let clientService: ClientManagementService;

// Initialize service (would be dependency-injected in NestJS)
export function initClientManagement(service: ClientManagementService) {
  clientService = service;
}

// Get client dashboard
router.get('/clients/:clientId/dashboard', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const data = await clientService.getClientDashboardData(clientId);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Get client details
router.get('/clients/:clientId', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const client = await clientService.getClient(clientId);
    res.json({ success: true, client });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Update client
router.patch('/clients/:clientId', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const updated = await clientService.updateClient(clientId, req.body);
    res.json({ success: true, client: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Get client integrations
router.get('/clients/:clientId/integrations', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const integrations = await clientService.getIntegrations(clientId);
    res.json({ success: true, integrations });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Get integration health
router.get('/clients/:clientId/health', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const health = await clientService.getClientHealth(clientId);
    res.json({ success: true, health });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Get client metrics
router.get('/clients/:clientId/metrics', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const { period } = req.query;
    const metrics = await clientService.getClientMetrics(clientId, period as string);
    res.json({ success: true, metrics });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Get onboarding steps
router.get('/clients/:clientId/onboarding', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const steps = await clientService.initializeOnboarding(clientId);
    res.json({ success: true, steps });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Complete onboarding step
router.post('/clients/:clientId/onboarding/:step/complete', async (req: Request, res: Response) => {
  try {
    const { clientId, step } = req.params;
    const completed = await clientService.completeOnboardingStep(clientId, parseInt(step));
    res.json({ success: true, step: completed });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Get payment history
router.get('/clients/:clientId/payments', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const { limit = '12' } = req.query;
    const payments = await clientService.getPaymentHistory(clientId, parseInt(limit as string));
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Record payment
router.post('/clients/:clientId/payments', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const { amount } = req.body;
    const payment = await clientService.recordPayment(clientId, amount);
    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export default router;
