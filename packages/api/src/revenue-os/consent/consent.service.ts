import { Injectable, Logger } from '@nestjs/common';
import { ConsentChannel, ConsentState } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/** Inbound keywords that must stop outbound messaging immediately. */
const STOP_KEYWORDS = [
  'stop', 'stopall', 'unsubscribe', 'cancel', 'end', 'quit', 'optout', 'opt out', 'remove me',
];

/** Keywords that re-enable messaging after a STOP. */
const START_KEYWORDS = ['start', 'unstop', 'yes', 'subscribe', 'optin', 'opt in'];

@Injectable()
export class ConsentService {
  private readonly logger = new Logger('RevenueOS/Consent');

  constructor(private prisma: PrismaService) {}

  /**
   * Whether an automation may contact this customer on this channel.
   *
   * Defaults to *deny* when consent is unknown for SMS and calls. An
   * automation that contacts someone who never opted in is a compliance
   * problem, so silence is treated as refusal rather than permission.
   */
  async canContact(
    tenantId: string,
    customerId: string,
    channel: ConsentChannel,
  ): Promise<boolean> {
    const latest = await this.prisma.consentRecord.findFirst({
      where: { tenantId, customerId, channel },
      orderBy: { occurredAt: 'desc' },
    });

    if (!latest) {
      return false;
    }

    if (latest.state === ConsentState.OPTED_OUT || latest.state === ConsentState.DNC) {
      return false;
    }

    return latest.state === ConsentState.OPTED_IN;
  }

  /** Records an explicit opt-in, e.g. a web form with a consent checkbox. */
  async recordOptIn(
    tenantId: string,
    customerId: string,
    channel: ConsentChannel,
    source: string,
  ) {
    return this.prisma.consentRecord.create({
      data: { tenantId, customerId, channel, state: ConsentState.OPTED_IN, source },
    });
  }

  /**
   * Handles an inbound message, honouring STOP/START.
   *
   * Returns the resulting state so callers can halt an in-flight sequence in
   * the same pass rather than waiting for the next scheduled check.
   */
  async handleInboundKeyword(
    tenantId: string,
    customerId: string,
    channel: ConsentChannel,
    body: string,
  ): Promise<ConsentState | null> {
    const normalized = body.trim().toLowerCase().replace(/[^a-z ]/g, '');

    if (STOP_KEYWORDS.includes(normalized)) {
      await this.prisma.consentRecord.create({
        data: {
          tenantId,
          customerId,
          channel,
          state: ConsentState.OPTED_OUT,
          source: 'inbound-keyword',
          keyword: normalized,
        },
      });
      this.logger.log(`Opt-out recorded for customer ${customerId} on ${channel}`);
      return ConsentState.OPTED_OUT;
    }

    if (START_KEYWORDS.includes(normalized)) {
      await this.prisma.consentRecord.create({
        data: {
          tenantId,
          customerId,
          channel,
          state: ConsentState.OPTED_IN,
          source: 'inbound-keyword',
          keyword: normalized,
        },
      });
      return ConsentState.OPTED_IN;
    }

    return null;
  }

  /** Marks a customer do-not-contact across every channel. */
  async markDoNotContact(tenantId: string, customerId: string, source: string) {
    const channels = [ConsentChannel.SMS, ConsentChannel.CALL, ConsentChannel.EMAIL];
    return Promise.all(
      channels.map((channel) =>
        this.prisma.consentRecord.create({
          data: { tenantId, customerId, channel, state: ConsentState.DNC, source },
        }),
      ),
    );
  }
}
