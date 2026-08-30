import { Controller, Get, Header, HttpCode, Logger, Post, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AiPhoneService } from './ai-phone.service';
import { validateTwilioSignature } from './ai-phone.twilio-signature';
import { recordVoicemailTwiml, sayGatherTwiml, sayHangupTwiml, transferTwiml } from './ai-phone.twiml';

@Controller('v1/ai-phone')
export class AiPhoneWebhookController {
  private readonly logger = new Logger(AiPhoneWebhookController.name);

  constructor(private readonly phone: AiPhoneService) {}

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
}
