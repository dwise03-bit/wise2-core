import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'node:crypto';

export type Wise2TextIntake = {
  providerEventId: string;
  occurredAt: Date;
  fromNumber: string;
  toNumber: string;
  text: string;
  media: unknown[];
  rawEvent: unknown;
};

@Injectable()
export class TelnyxTextService {
  private readonly logger = new Logger(TelnyxTextService.name);

  constructor(private readonly prisma: PrismaService) {}

  async accept(input: Wise2TextIntake) {
    const id = randomUUID();
    const mediaJson = JSON.stringify(input.media);
    const rawJson = JSON.stringify(input.rawEvent);

    // The unique provider_event_id makes Telnyx retries idempotent.
    const stored = await this.prisma.$queryRaw<Array<{ id: string }>>`
      INSERT INTO "Wise2TextMessage"
        ("id", "provider_event_id", "occurred_at", "from_number", "to_number", "body", "media", "raw_event", "created_at", "updated_at")
      VALUES
        (${id}, ${input.providerEventId}, ${input.occurredAt}, ${input.fromNumber}, ${input.toNumber}, ${input.text}, ${mediaJson}::jsonb, ${rawJson}::jsonb, NOW(), NOW())
      ON CONFLICT ("provider_event_id")
      DO UPDATE SET "updated_at" = NOW()
      RETURNING "id"
    `;
    const messageId = stored[0]?.id;
    if (!messageId) throw new ServiceUnavailableException('Text archive unavailable');

    const endpoint = process.env.HERMES_TEXT_INTAKE_URL;
    const token = process.env.HERMES_TEXT_INTAKE_TOKEN;
    if (!endpoint || !token) {
      await this.mark(messageId, 'queued', 'Hermes text intake is not configured');
      return { messageId, state: 'queued' as const };
    }

    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'Idempotency-Key': input.providerEventId,
        },
        body: JSON.stringify({
          id: messageId,
          source: 'telnyx',
          receivedAt: input.occurredAt.toISOString(),
          from: input.fromNumber,
          to: input.toNumber,
          text: input.text,
          media: input.media,
        }),
        signal: AbortSignal.timeout(10_000),
      });
    } catch (error) {
      await this.mark(messageId, 'queued', error instanceof Error ? error.message : 'Hermes unavailable');
      return { messageId, state: 'queued' as const };
    }

    if (!response.ok) {
      const detail = `Hermes intake returned HTTP ${response.status}`;
      await this.mark(messageId, 'queued', detail);
      this.logger.warn(detail);
      return { messageId, state: 'queued' as const };
    }

    const receipt = await response.json().catch(() => ({})) as { project?: string; taskIds?: string[] };
    await this.mark(messageId, 'routed', null, receipt);
    return { messageId, state: 'routed' as const, receipt };
  }

  private async mark(id: string, state: 'queued' | 'routed', error: string | null, receipt?: unknown) {
    const receiptJson = receipt === undefined ? null : JSON.stringify(receipt);
    await this.prisma.$executeRaw`
      UPDATE "Wise2TextMessage"
      SET "routing_state" = ${state}, "routing_error" = ${error}, "hermes_receipt" = ${receiptJson}::jsonb, "updated_at" = NOW()
      WHERE "id" = ${id}
    `;
  }
}
