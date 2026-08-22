/**
 * API endpoints for Jobber sync control and monitoring
 * POST /integrations/jobber/sync - trigger manual sync
 * GET /integrations/jobber/sync/status - check sync status
 * GET /integrations/jobber/config - get current config (masked token)
 */

import { Router, Request, Response } from 'express';
import { JobberSyncService } from '../../services/jobber-sync';

const router = Router();

// Middleware: validate Jobber credentials are configured
const requireJobberConfig = (req: Request, res: Response, next: Function) => {
  const { JOBBER_ACCOUNT_ID, JOBBER_ACCESS_TOKEN } = process.env;

  if (!JOBBER_ACCOUNT_ID || !JOBBER_ACCESS_TOKEN) {
    return res.status(400).json({
      error: 'Jobber integration not configured',
      message: 'Set JOBBER_ACCOUNT_ID and JOBBER_ACCESS_TOKEN environment variables',
    });
  }

  req.jobber = {
    accountId: JOBBER_ACCOUNT_ID,
    accessToken: JOBBER_ACCESS_TOKEN,
  };

  next();
};

// POST /integrations/jobber/sync
// Trigger manual sync of all Jobber data
router.post('/sync', requireJobberConfig, async (req: Request, res: Response) => {
  try {
    const { accountId, accessToken } = req.jobber;
    const service = new JobberSyncService(accountId, accessToken);

    // In production, pass a real database connection
    const result = await service.sync(null);

    res.json({
      success: result.success,
      syncedAt: result.syncedAt,
      counts: result.counts,
      duration: result.duration,
      error: result.error,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Sync failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /integrations/jobber/sync/status
// Check last sync status and counts
router.get('/sync/status', requireJobberConfig, async (req: Request, res: Response) => {
  try {
    // In production, query the database for the last sync record
    // This is a placeholder response
    res.json({
      lastSync: null,
      counts: {
        customers: 0,
        jobs: 0,
        estimates: 0,
        invoices: 0,
        payments: 0,
      },
      syncWorkerActive: true,
      syncIntervalMinutes: 15,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Status check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /integrations/jobber/config
// Return current config (with token masked)
router.get('/config', requireJobberConfig, (req: Request, res: Response) => {
  const { JOBBER_ACCOUNT_ID, JOBBER_ACCESS_TOKEN } = process.env;
  const tokenMasked = JOBBER_ACCESS_TOKEN
    ? `${JOBBER_ACCESS_TOKEN.slice(0, 10)}...${JOBBER_ACCESS_TOKEN.slice(-4)}`
    : 'NOT_SET';

  res.json({
    accountId: JOBBER_ACCOUNT_ID,
    tokenStatus: JOBBER_ACCESS_TOKEN ? 'configured' : 'missing',
    tokenMasked,
  });
});

// POST /integrations/jobber/config
// Update Jobber credentials (requires auth)
router.post('/config', async (req: Request, res: Response) => {
  // In production, validate admin auth before allowing this
  const { accountId, accessToken } = req.body;

  if (!accountId || !accessToken) {
    return res.status(400).json({
      error: 'Missing credentials',
      message: 'accountId and accessToken are required',
    });
  }

  // Validate by making a test call
  try {
    const service = new JobberSyncService(accountId, accessToken);
    // Just test connectivity
    await (service as any).client.query(`query { account { id } }`);

    // In production, store these securely in your database or vault
    process.env.JOBBER_ACCOUNT_ID = accountId;
    process.env.JOBBER_ACCESS_TOKEN = accessToken;

    res.json({
      success: true,
      message: 'Jobber credentials updated',
      accountId,
    });
  } catch (error) {
    res.status(400).json({
      error: 'Invalid credentials',
      message: error instanceof Error ? error.message : 'Failed to validate',
    });
  }
});

// POST /integrations/jobber/reset
// Clear Jobber credentials
router.post('/reset', async (req: Request, res: Response) => {
  // In production, require admin auth
  delete process.env.JOBBER_ACCOUNT_ID;
  delete process.env.JOBBER_ACCESS_TOKEN;

  res.json({
    success: true,
    message: 'Jobber integration reset',
  });
});

export default router;
