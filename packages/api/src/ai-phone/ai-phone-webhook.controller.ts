import { Controller, Get, Header, HttpCode, Logger, Post, Query, Req, Res, Body } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AiPhoneService } from './ai-phone.service';
import { validateTwilioSignature } from './ai-phone.twilio-signature';
import { recordVoicemailTwiml, sayGatherTwiml, sayHangupTwiml, transferTwiml } from './ai-phone.twiml';
import { PrismaService } from '../prisma/prisma.service';

@Controller('v1/ai-phone')
export class AiPhoneWebhookController {
  private readonly logger = new Logger(AiPhoneWebhookController.name);

  constructor(
    private readonly phone: AiPhoneService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'wise2-ai-phone',
      voice: process.env.OPENAI_API_KEY ? 'openai' : 'mock',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('webhooks/twilio/voice')
  @HttpCode(200)
  @Header('Content-Type', 'text/xml')
  async voice(@Req() req: Request, @Res() res: Response) {
    if (!this.signatureOk(req)) {
      return res.status(403).json({ error: 'Invalid Twilio signature' });
    }

    const body = (req.body || {}) as Record<string, string>;
    const from = body.From || '';
    const to = body.To || '';
    const callSid = body.CallSid || `local-${Date.now()}`;
    const baseUrl = this.webhookBase();

    const matched = await this.phone.findConfigByNumber(to);
    const tenantId = matched?.tenantId ?? (await this.fallbackTenantId());
    if (!tenantId) {
      return res.type('text/xml').send(sayHangupTwiml('This number is not configured. Goodbye.'));
    }

    const started = await this.phone.startInboundCall({ tenantId, callSid, from, to });
    const config = started.config;

    if (!config.enabled) {
      return res.type('text/xml').send(sayHangupTwiml('This line is not taking calls right now. Please try again later.'));
    }

    if (!this.phone.isOpen(config) && config.voicemailEnabled) {
      return res
        .type('text/xml')
        .send(recordVoicemailTwiml(baseUrl, config.afterHoursMessage || 'Please leave a message after the tone.'));
    }

    return res
      .type('text/xml')
      .send(sayGatherTwiml(baseUrl, config.greeting, started.sessionId));
  }

  @Post('webhooks/twilio/gather')
  @HttpCode(200)
  @Header('Content-Type', 'text/xml')
  async gather(
    @Req() req: Request,
    @Res() res: Response,
    @Query('sessionId') sessionId?: string,
  ) {
    if (!this.signatureOk(req)) {
      return res.status(403).json({ error: 'Invalid Twilio signature' });
    }

    const body = (req.body || {}) as Record<string, string>;
    const speech = (body.SpeechResult || body.Digits || '').trim();
    const callSid = body.CallSid || '';
    const to = body.To || '';
    const baseUrl = this.webhookBase();

    const matched = await this.phone.findConfigByNumber(to);
    const call = callSid ? await this.phone.findCallBySid(callSid) : null;
    const tenantId = call?.tenantId ?? matched?.tenantId;
    if (!tenantId) {
      return res.type('text/xml').send(sayHangupTwiml('Goodbye.'));
    }

    if (!speech) {
      return res.type('text/xml').send(sayGatherTwiml(baseUrl, "Sorry, I missed that. Could you say it again?", sessionId));
    }

    const turn = await this.phone.handleTurn({
      tenantId,
      callSid,
      sessionId: sessionId || call?.sessionId || undefined,
      message: speech,
    });

    if (turn.shouldTransfer && turn.config.transferNumber) {
      await this.phone.completeCall({ callSid, outcome: 'TRANSFERRED', status: 'COMPLETED' });
      return res
        .type('text/xml')
        .send(transferTwiml(turn.response || 'Transferring you now.', turn.config.transferNumber));
    }

    return res.type('text/xml').send(sayGatherTwiml(baseUrl, turn.response, turn.sessionId));
  }

  @Post('webhooks/twilio/recording')
  @HttpCode(200)
  @Header('Content-Type', 'text/xml')
  async recording(@Req() req: Request, @Res() res: Response) {
    if (!this.signatureOk(req)) {
      return res.status(403).json({ error: 'Invalid Twilio signature' });
    }
    const body = (req.body || {}) as Record<string, string>;
    await this.phone.completeCall({
      callSid: body.CallSid,
      outcome: 'VOICEMAIL',
      status: 'COMPLETED',
      recordingUrl: body.RecordingUrl,
      durationSeconds: body.RecordingDuration ? Number(body.RecordingDuration) : undefined,
    });
    return res.type('text/xml').send(sayHangupTwiml('Thanks. We will call you back.'));
  }

  @Post('webhooks/twilio/status')
  @HttpCode(200)
  async status(@Req() req: Request, @Res() res: Response) {
    if (!this.signatureOk(req)) {
      return res.status(403).json({ error: 'Invalid Twilio signature' });
    }
    const body = (req.body || {}) as Record<string, string>;
    if (body.CallStatus === 'completed' || body.CallStatus === 'busy' || body.CallStatus === 'failed' || body.CallStatus === 'no-answer') {
      await this.phone.completeCall({
        callSid: body.CallSid,
        status: 'COMPLETED',
        durationSeconds: body.CallDuration ? Number(body.CallDuration) : undefined,
      });
    }
    return res.status(204).send();
  }

  // CRM API Endpoints for phone gateway

  @Post('customer/lookup')
  async lookupCustomer(
    @Req() req: Request,
    @Body('phone') phone: string,
  ) {
    const tenantId = this.extractTenantId(req);
    if (!tenantId) return { error: 'Missing tenant' };

    const customer = await this.prisma.revenueCustomer.findFirst({
      where: { tenantId, phone },
    });

    if (!customer) return null;
    return {
      id: customer.id,
      fullName: [customer.firstName, customer.lastName].filter(Boolean).join(' '),
      primaryPhone: customer.phone,
      email: customer.email,
    };
  }

  @Post('customer')
  async createCustomer(
    @Req() req: Request,
    @Body() body: { fullName: string; primaryPhone: string; email?: string },
  ) {
    const tenantId = this.extractTenantId(req);
    if (!tenantId) return { error: 'Missing tenant' };

    const parts = body.fullName.split(' ');
    const customer = await this.prisma.revenueCustomer.create({
      data: {
        tenantId,
        firstName: parts[0],
        lastName: parts.slice(1).join(' ') || null,
        phone: body.primaryPhone,
        email: body.email || null,
      },
    });

    return {
      id: customer.id,
      fullName: body.fullName,
      primaryPhone: customer.phone,
      email: customer.email,
    };
  }

  @Post('lead')
  async createLead(
    @Req() req: Request,
    @Body() body: { customerId?: string; source: string; intent: string; sourceCallId: string },
  ) {
    const tenantId = this.extractTenantId(req);
    if (!tenantId) return { error: 'Missing tenant' };

    const lead = await this.prisma.lead.create({
      data: {
        tenantId,
        customerId: body.customerId,
        source: body.source || 'ai-phone',
        summary: body.intent || 'Inbound phone call',
        serviceCategory: body.intent,
        status: 'NEW',
      },
    });

    return {
      id: lead.id,
      customerId: lead.customerId,
      source: lead.source,
      intent: body.intent,
      stage: 'new',
    };
  }

  @Post('booking')
  async createBooking(
    @Req() req: Request,
    @Body()
    body: {
      customerId: string;
      serviceType: string;
      startAt: string;
      endAt: string;
      sourceCallId: string;
    },
  ) {
    const tenantId = this.extractTenantId(req);
    if (!tenantId) return { error: 'Missing tenant' };

    const job = await this.prisma.serviceJob.create({
      data: {
        tenantId,
        customerId: body.customerId,
        serviceType: body.serviceType,
        scheduledStart: new Date(body.startAt),
        scheduledEnd: new Date(body.endAt),
        status: 'SCHEDULED',
        notes: `Booked via WISE² AI Phone (call ${body.sourceCallId})`,
        sourceAttribution: 'ai-phone',
      },
    });

    return {
      id: job.id,
      customerId: job.customerId,
      serviceType: job.serviceType,
      startAt: job.scheduledStart,
      endAt: job.scheduledEnd,
      confirmationNumber: job.id.slice(-8).toUpperCase(),
      status: 'confirmed',
    };
  }

  @Post('call-event')
  async recordCallEvent(
    @Req() req: Request,
    @Body()
    body: {
      callSid: string;
      leadId?: string;
      customerId?: string;
      transcript: string;
      summary: string;
      duration: number;
      disposition: string;
    },
  ) {
    const tenantId = this.extractTenantId(req);
    if (!tenantId) return { error: 'Missing tenant' };

    const call = await this.prisma.aiPhoneCall.create({
      data: {
        tenantId,
        callSid: body.callSid,
        callerNumber: '',
        inboundNumber: '',
        direction: 'INBOUND',
        status: body.disposition === 'completed' ? 'COMPLETED' : 'IN_PROGRESS',
        summary: body.summary,
        customerId: body.customerId,
        leadId: body.leadId,
        startedAt: new Date(),
        endedAt: body.disposition === 'completed' ? new Date() : undefined,
      },
    });

    return {
      id: call.id,
      callSid: call.callSid,
      status: call.status,
    };
  }

  private webhookBase(): string {
    const root = (
      process.env.TWILIO_WEBHOOK_BASE_URL ||
      process.env.AI_PHONE_WEBHOOK_BASE_URL ||
      process.env.APP_URL ||
      'http://localhost:3001'
    ).replace(/\/$/, '');
    const prefix = root.endsWith('/api') ? '' : '/api';
    return `${root}${prefix}/v1/ai-phone/webhooks/twilio`;
  }

  private signatureOk(req: Request): boolean {
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (!token) return true;
    const signature = req.headers['x-twilio-signature'];
    if (typeof signature !== 'string') return false;
    const url = `${this.publicOrigin(req)}${req.originalUrl}`;
    try {
      return validateTwilioSignature(token, signature, url, (req.body || {}) as Record<string, string>);
    } catch (error) {
      this.logger.warn(`Twilio signature check failed: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  private publicOrigin(req: Request): string {
    const configured = process.env.TWILIO_WEBHOOK_BASE_URL || process.env.APP_URL;
    if (configured) return configured.replace(/\/$/, '').replace(/\/api$/, '');
    return `${req.protocol}://${req.get('host')}`;
  }

  private async fallbackTenantId(): Promise<string | null> {
    return this.phone.firstConfiguredTenantId();
  }

  private extractTenantId(req: Request): string | null {
    const header = req.headers['x-tenant-id'];
    if (typeof header === 'string') return header;
    return null;
  }
}
