import { Controller, ForbiddenException, HttpCode, Logger, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { createPublicKey, verify } from 'node:crypto';
import { TelnyxTextService } from './telnyx-text.service';

type TelnyxMessageEvent = {
  data?: {
    id?: string;
    occurred_at?: string;
    event_type?: string;
    payload?: {
      from?: { phone_number?: string };
      to?: Array<{ phone_number?: string }>;
      text?: string;
      media?: unknown[];
    };
  };
};

@Controller('webhooks/telnyx')
export class TelnyxTextController {
  private readonly logger = new Logger(TelnyxTextController.name);

  constructor(private readonly texts: TelnyxTextService) {}

  @Post('messages')
  @HttpCode(200)
  async receive(@Req() req: Request, @Res() res: Response) {
    if (!this.verifySignature(req)) throw new ForbiddenException('Invalid Telnyx signature');

    const event = (req.body ?? {}) as TelnyxMessageEvent;
    if (event.data?.event_type !== 'message.received') return res.json({ accepted: true, ignored: true });

    const payload = event.data.payload;
    const from = payload?.from?.phone_number;
    const to = payload?.to?.[0]?.phone_number;
    const eventId = event.data.id;
    if (!from || !to || !eventId) return res.status(400).json({ error: 'Invalid Telnyx message event' });

    const accepted = await this.texts.accept({
      providerEventId: eventId,
      occurredAt: event.data.occurred_at ? new Date(event.data.occurred_at) : new Date(),
      fromNumber: from,
      toNumber: to,
      text: payload?.text ?? '',
      media: payload?.media ?? [],
      rawEvent: event,
    });

    // A 200 prevents duplicate deliveries; queued items remain auditable and can be replayed.
    return res.json({ accepted: true, ...accepted });
  }

  private verifySignature(req: Request): boolean {
    const publicKey = process.env.TELNYX_PUBLIC_KEY;
    const timestamp = req.headers['telnyx-timestamp'];
    const signatureHeader = req.headers['telnyx-signature-ed25519'];
    const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
    if (!publicKey || typeof timestamp !== 'string' || typeof signatureHeader !== 'string' || !rawBody) return false;
    try {
      const signatures = signatureHeader.split(/\s+/).map((value) => value.replace(/^v\d+,/, '')).filter(Boolean).map((value) => Buffer.from(value, 'base64'));
      const signedPayload = Buffer.concat([Buffer.from(`${timestamp}|`), rawBody]);
      const key = publicKey.includes('BEGIN')
        ? createPublicKey(publicKey)
        : createPublicKey({ key: Buffer.from(publicKey, 'base64'), format: 'der', type: 'spki' });
      return signatures.some((signature) => verify(null, signedPayload, key, signature));
    } catch (error) {
      this.logger.warn(`Telnyx message signature check failed: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }
}
