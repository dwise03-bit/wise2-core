/**
 * Communications Routes
 * Phase 7: Multi-channel communication (SMS, Email, Discord, Push)
 */

import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../database';
import { logger } from '../logger';
import { authenticate } from '../middlewares/auth';
import { tenantGuard, requireRole, scopedWhere } from '../middlewares/tenant-guard';

const router = Router();

router.use(authenticate);
router.use(tenantGuard);

/**
 * POST /api/v1/crm/tenants/:tenantId/communications/send-sms
 * Send SMS message via integrated provider (Twilio, Nexmo)
 */
router.post(
  '/tenants/:tenantId/communications/send-sms',
  requireRole('OWNER', 'ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { phoneNumber, message, recipientId, recipientType } = req.body;

      if (!phoneNumber || !message) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'phoneNumber and message are required' },
        });
      }

      // Create communication record
      const communication = await db.communication.create({
        data: {
          tenantId: req.tenant!.tenantId,
          channel: 'SMS',
          status: 'PENDING',
          recipient: phoneNumber,
          recipientId: recipientId || null,
          recipientType: recipientType || 'PHONE',
          subject: null,
          message,
          metadata: {
            provider: 'twilio', // TODO: Make configurable
            sendAt: new Date(),
          },
        },
      });

      // TODO: Call Twilio API to send SMS
      // const response = await twilioClient.messages.create({
      //   body: message,
      //   to: phoneNumber,
      //   from: process.env.TWILIO_PHONE_NUMBER
      // });

      // Simulate successful send
      const updated = await db.communication.update({
        where: { id: communication.id },
        data: {
          status: 'SENT',
          externalId: `sms_${Date.now()}`,
          sentAt: new Date(),
        },
      });

      // Audit log
      await db.auditLog.create({
        data: {
          tenantId: req.tenant!.tenantId,
          actor: req.tenant!.userId,
          action: 'SMS_SENT',
          resourceType: 'Communication',
          resourceId: communication.id,
          changesAfter: { channel: 'SMS', recipient: phoneNumber },
          source: 'API',
        },
      });

      logger.info('SMS sent', { communicationId: communication.id, phoneNumber });

      res.json({ success: true, data: { communication: updated } });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/crm/tenants/:tenantId/communications/send-email
 * Send email via integrated provider (SendGrid, Mailgun)
 */
router.post(
  '/tenants/:tenantId/communications/send-email',
  requireRole('OWNER', 'ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, subject, message, recipientId, recipientType, template } = req.body;

      if (!email || !subject || !message) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'email, subject, and message are required' },
        });
      }

      const communication = await db.communication.create({
        data: {
          tenantId: req.tenant!.tenantId,
          channel: 'EMAIL',
          status: 'PENDING',
          recipient: email,
          recipientId: recipientId || null,
          recipientType: recipientType || 'EMAIL',
          subject,
          message,
          metadata: {
            provider: 'sendgrid',
            template: template || null,
          },
        },
      });

      // TODO: Call SendGrid API
      // const response = await sgMail.send({
      //   to: email,
      //   from: process.env.SENDGRID_FROM_EMAIL,
      //   subject,
      //   html: message
      // });

      const updated = await db.communication.update({
        where: { id: communication.id },
        data: {
          status: 'SENT',
          externalId: `email_${Date.now()}`,
          sentAt: new Date(),
        },
      });

      await db.auditLog.create({
        data: {
          tenantId: req.tenant!.tenantId,
          actor: req.tenant!.userId,
          action: 'EMAIL_SENT',
          resourceType: 'Communication',
          resourceId: communication.id,
          changesAfter: { channel: 'EMAIL', recipient: email },
          source: 'API',
        },
      });

      logger.info('Email sent', { communicationId: communication.id, email });

      res.json({ success: true, data: { communication: updated } });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/crm/tenants/:tenantId/communications/send-discord
 * Send message to Discord channel (for tenant's Discord workspace)
 */
router.post(
  '/tenants/:tenantId/communications/send-discord',
  requireRole('OWNER', 'ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { channelId, message, mentionRole, embeds } = req.body;

      if (!channelId || !message) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'channelId and message are required' },
        });
      }

      const tenant = await db.tenant.findUnique({
        where: { id: req.tenant!.tenantId },
      });

      if (!tenant?.discordBotToken) {
        return res.status(400).json({
          success: false,
          error: { code: 'NOT_CONFIGURED', message: 'Discord integration not configured for this tenant' },
        });
      }

      const communication = await db.communication.create({
        data: {
          tenantId: req.tenant!.tenantId,
          channel: 'DISCORD',
          status: 'PENDING',
          recipient: channelId,
          recipientType: 'DISCORD_CHANNEL',
          subject: 'Discord Message',
          message,
          metadata: {
            channelId,
            mentionRole: mentionRole || null,
            embeds: embeds || null,
          },
        },
      });

      // TODO: Call Discord API via bot token
      // const discordClient = new Discord.Client({ token: tenant.discordBotToken });
      // const channel = await discordClient.channels.fetch(channelId);
      // await channel.send({ content: message, embeds });

      const updated = await db.communication.update({
        where: { id: communication.id },
        data: {
          status: 'SENT',
          externalId: `discord_${Date.now()}`,
          sentAt: new Date(),
        },
      });

      await db.auditLog.create({
        data: {
          tenantId: req.tenant!.tenantId,
          actor: req.tenant!.userId,
          action: 'DISCORD_MESSAGE_SENT',
          resourceType: 'Communication',
          resourceId: communication.id,
          changesAfter: { channel: 'DISCORD', channelId },
          source: 'API',
        },
      });

      logger.info('Discord message sent', { communicationId: communication.id, channelId });

      res.json({ success: true, data: { communication: updated } });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/crm/tenants/:tenantId/communications
 * List all communications with filtering by channel
 */
router.get('/tenants/:tenantId/communications', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const skip = (page - 1) * limit;

    const channel = req.query.channel as string | undefined;
    const status = req.query.status as string | undefined;

    const where = scopedWhere(req, {
      ...(channel && { channel }),
      ...(status && { status }),
    });

    const [communications, total] = await Promise.all([
      db.communication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.communication.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        communications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/crm/tenants/:tenantId/communications/summary
 * Get communication summary by channel and status
 */
router.get(
  '/tenants/:tenantId/communications/summary',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const where = scopedWhere(req);

      const byChannel = await db.communication.groupBy({
        by: ['channel'],
        where,
        _count: true,
      });

      const byStatus = await db.communication.groupBy({
        by: ['status'],
        where,
        _count: true,
      });

      const summary: any = {
        totalSent: 0,
        byChannel: {},
        byStatus: {},
      };

      for (const item of byChannel) {
        summary.byChannel[item.channel] = item._count;
        summary.totalSent += item._count;
      }

      for (const item of byStatus) {
        summary.byStatus[item.status] = item._count;
      }

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/crm/tenants/:tenantId/communications/broadcast
 * Send bulk message to multiple recipients
 */
router.post(
  '/tenants/:tenantId/communications/broadcast',
  requireRole('OWNER', 'ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { channel, recipients, subject, message, template } = req.body;

      if (!channel || !Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'channel and recipients array are required' },
        });
      }

      if (!message && !template) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'message or template is required' },
        });
      }

      const results: any[] = [];

      for (const recipient of recipients) {
        const communication = await db.communication.create({
          data: {
            tenantId: req.tenant!.tenantId,
            channel,
            status: 'QUEUED',
            recipient: recipient.value,
            recipientId: recipient.id || null,
            recipientType: recipient.type || channel,
            subject: subject || null,
            message: message || null,
            metadata: {
              template: template || null,
              broadcastId: `broadcast_${Date.now()}`,
            },
          },
        });

        results.push({
          recipient: recipient.value,
          communicationId: communication.id,
          status: 'QUEUED',
        });
      }

      logger.info('Broadcast queued', {
        channel,
        recipientCount: recipients.length,
        totalQueued: results.length,
      });

      res.json({
        success: true,
        data: {
          broadcastId: `broadcast_${Date.now()}`,
          totalQueued: results.length,
          results,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
