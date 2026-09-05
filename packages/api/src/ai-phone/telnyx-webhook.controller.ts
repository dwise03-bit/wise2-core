import { Controller, HttpCode, Logger, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { createPublicKey, verify } from 'node:crypto';
import { AiPhoneService } from './ai-phone.service';

type TelnyxEvent = {
  data?: {
    event_type?: string;
    payload?: Record<string, unknown>;
  };
};

@Controller('v1/ai-phone/webhooks/telnyx')
export class TelnyxWebhookController {
  private readonly logger = new Logger(TelnyxWebhookController.name);

  constructor(private readonly phone: AiPhoneService) {}

  @Post()
  @HttpCode(200)
  async receive(@Req() req: Request, @Res() res: Response) {
    if (!this.verifySignature(req)) {
      this.logger.warn('Rejected Telnyx webhook with missing or invalid signature');
      return res.status(403).json({ error: 'Invalid Telnyx signature' });
    }

    const event = (req.body || {}) as TelnyxEvent;
    const eventType = event.data?.event_type;
    const payload = event.data?.payload;
    if (!eventType || !payload) return res.status(400).json({ error: 'Invalid Telnyx event' });

    try {
      const result = await this.phone.handleTelnyxEvent({ eventType, payload });
      return res.json(result);
    } catch (error) {
      this.logger.error(`Telnyx event failed (${eventType}): ${error instanceof Error ? error.message : String(error)}`);
      return res.status(500).json({ error: 'Unable to process Telnyx event' });
    }
  }

  private verifySignature(req: Request): boolean {
    const publicKey = process.env.TELNYX_PUBLIC_KEY;
    const timestamp = req.headers['telnyx-timestamp'];
    const signatureHeader = req.headers['telnyx-signature-ed25519'];
    const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
    if (!publicKey || typeof timestamp !== 'string' || typeof signatureHeader !== 'string' || !rawBody) return false;
    try {
      const signatures = signatureHeader.split(' ').map((value) => Buffer.from(value, 'base64'));
      const signedPayload = Buffer.concat([Buffer.from(`${timestamp}.`), rawBody]);
      const key = createPublicKey({ key: Buffer.from(publicKey, 'base64'), format: 'der', type: 'spki' });
      return signatures.some((signature) => verify(null, signedPayload, key, signature));
    } catch (error) {
      this.logger.warn(`Telnyx signature check failed: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }
}
