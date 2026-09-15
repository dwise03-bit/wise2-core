import { Router } from 'express';
import { PrismaClient } from '@wise2/db';
import axios from 'axios';

const router = Router();
const prisma = new PrismaClient();

// ===== CAPTURES =====

router.post('/rayban/captures', async (req, res) => {
  try {
    const { deviceId, jobId, contractorId, frameUrl, latitude, longitude, notes } = req.body;

    const capture = await prisma.rayBanCapture.create({
      data: {
        deviceId,
        jobId,
        contractorId,
        frameUrl,
        latitude,
        longitude,
        notes,
        status: 'PENDING',
      },
    });

    // Send alert to Discord
    await sendDiscordAlert({
      title: '📸 Frame Captured',
      message: `Contractor captured frame for Job ${jobId}`,
      severity: 'INFO',
      jobId,
      contractorId,
    });

    res.json(capture);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/rayban/captures', async (req, res) => {
  try {
    const { jobId, contractorId, status } = req.query;

    const captures = await prisma.rayBanCapture.findMany({
      where: {
        ...(jobId && { jobId: jobId as string }),
        ...(contractorId && { contractorId: contractorId as string }),
        ...(status && { status: status as string }),
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(captures);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/rayban/captures/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;

    const capture = await prisma.rayBanCapture.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy,
        approvedAt: new Date(),
      },
    });

    // Send alert
    await sendDiscordAlert({
      title: '✅ Frame Approved',
      message: `Frame approved for Job ${capture.jobId}`,
      severity: 'INFO',
      jobId: capture.jobId,
    });

    res.json(capture);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== ALERTS =====

router.post('/rayban/alerts', async (req, res) => {
  try {
    const { deviceId, title, message, severity, type, jobId, contractorId, customerId } = req.body;

    const alert = await prisma.rayBanAlert.create({
      data: {
        deviceId,
        title,
        message,
        severity: severity || 'INFO',
        type,
        jobId,
        contractorId,
        customerId,
      },
    });

    // Send to Discord async
    sendDiscordAlert({
      title,
      message,
      severity,
      jobId,
      contractorId,
    }).catch(console.error);

    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/rayban/alerts', async (req, res) => {
  try {
    const { contractorId, severity, limit = 50 } = req.query;

    const alerts = await prisma.rayBanAlert.findMany({
      where: {
        ...(contractorId && { contractorId: contractorId as string }),
        ...(severity && { severity: severity as string }),
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
    });

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== SESSIONS =====

router.post('/rayban/sessions', async (req, res) => {
  try {
    const { deviceId, jobId, contractorId, customerId } = req.body;

    const session = await prisma.rayBanSession.create({
      data: {
        deviceId,
        jobId,
        contractorId,
        customerId,
        startTime: new Date(),
      },
    });

    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/rayban/sessions/:id/end', async (req, res) => {
  try {
    const { id } = req.params;

    const session = await prisma.rayBanSession.update({
      where: { id },
      data: {
        endTime: new Date(),
        duration: Math.floor(
          (new Date().getTime() - new Date(req.body.startTime).getTime()) / 1000
        ),
      },
    });

    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== METRICS =====

router.get('/rayban/metrics/:contractorId', async (req, res) => {
  try {
    const { contractorId } = req.params;

    const metrics = await prisma.rayBanMetrics.findUnique({
      where: { contractorId },
    });

    if (!metrics) {
      return res.status(404).json({ error: 'Metrics not found' });
    }

    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== DASHBOARD DATA =====

router.get('/rayban/dashboard', async (req, res) => {
  try {
    const totalCaptures = await prisma.rayBanCapture.count();
    const pendingApprovals = await prisma.rayBanCapture.count({
      where: { status: 'PENDING' },
    });
    const recentAlerts = await prisma.rayBanAlert.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
    });
    const activeSessions = await prisma.rayBanSession.findMany({
      where: { endTime: null },
    });
    const devices = await prisma.rayBanDevice.findMany({
      where: { isConnected: true },
    });

    res.json({
      stats: {
        totalCaptures,
        pendingApprovals,
        activeSessions: activeSessions.length,
        connectedDevices: devices.length,
      },
      recentAlerts,
      topContractors: [], // TODO: aggregate metrics
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== HELPER FUNCTIONS =====

async function sendDiscordAlert(data: {
  title: string;
  message: string;
  severity: string;
  jobId?: string;
  contractorId?: string;
}) {
  try {
    const webhook = await prisma.discordWebhook.findFirst({
      where: { channel: 'contractor-os', isActive: true },
    });

    if (!webhook) return;

    const color = {
      INFO: 0x0099ff,
      WARNING: 0xffcc00,
      ERROR: 0xff3333,
      CRITICAL: 0xff0000,
    }[data.severity] || 0x0099ff;

    await axios.post(webhook.url, {
      embeds: [
        {
          title: data.title,
          description: data.message,
          color,
          fields: [
            ...(data.jobId ? [{ name: 'Job ID', value: data.jobId, inline: true }] : []),
            ...(data.contractorId
              ? [{ name: 'Contractor', value: data.contractorId, inline: true }]
              : []),
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    });

    // Mark as sent
    await prisma.rayBanAlert.updateMany({
      where: {
        ...(data.jobId && { jobId: data.jobId }),
        sentToDiscord: false,
      },
      data: { sentToDiscord: true },
    });
  } catch (error) {
    console.error('Discord webhook failed:', error.message);
  }
}

export default router;
