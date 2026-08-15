import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AppointmentSlot,
  CalendarProvider,
  LeadSourceProvider,
  MessagingProvider,
  PlaceCallInput,
  PlaceCallResult,
  ProviderHealth,
  ReviewProvider,
  SendSmsInput,
  SendSmsResult,
  TelephonyProvider,
} from './provider.types';

/**
 * The default provider when no vendor credentials are configured.
 *
 * Its contract is to be honest rather than useful: nothing is sent, nothing
 * is placed, no availability is invented, and every result carries
 * NEEDS_CONFIG with the exact env vars that are missing. This is what keeps
 * an unconfigured Revenue OS from silently appearing to work.
 */
@Injectable()
export class MockProvider
  implements MessagingProvider, TelephonyProvider, CalendarProvider, LeadSourceProvider, ReviewProvider
{
  readonly name = 'mock';
  private readonly logger = new Logger('RevenueOS/MockProvider');

  constructor(private configService: ConfigService) {}

  private missingVars(vars: string[]): string[] {
    return vars.filter((v) => !this.configService.get<string>(v));
  }

  health(): ProviderHealth {
    const missing = this.missingVars([
      'TELEPHONY_PROVIDER',
      'TELEPHONY_ACCOUNT_ID',
      'TELEPHONY_AUTH_TOKEN',
      'TELEPHONY_PHONE_NUMBER',
    ]);

    return {
      name: this.name,
      status: 'NEEDS_CONFIG',
      missing,
      detail:
        'No live provider configured. Messages and calls are recorded but not sent.',
    };
  }

  async sendSms(input: SendSmsInput): Promise<SendSmsResult> {
    this.logger.log(
      `[mock] SMS suppressed for tenant ${input.tenantId} (provider not configured)`,
    );
    return {
      sent: false,
      status: 'NEEDS_CONFIG',
      detail: 'Messaging provider not configured; nothing was sent.',
    };
  }

  async placeCall(input: PlaceCallInput): Promise<PlaceCallResult> {
    this.logger.log(
      `[mock] Call suppressed for tenant ${input.tenantId} (provider not configured)`,
    );
    return {
      placed: false,
      status: 'NEEDS_CONFIG',
      detail: 'Telephony provider not configured; no call was placed.',
    };
  }

  /**
   * Always false. An unverifiable signature must never be treated as valid,
   * least of all by the placeholder provider.
   */
  verifySignature(): boolean {
    return false;
  }

  /**
   * Empty, never fabricated. Phase 5's global agent rules forbid inventing
   * availability, and returning plausible-looking slots here is exactly how
   * that rule would get broken in practice.
   */
  async availableSlots(
    _tenantId: string,
    _from: Date,
    _to: Date,
  ): Promise<AppointmentSlot[]> {
    return [];
  }

  /** Null rather than a guessed URL — agents must not invent review links. */
  async reviewLink(_tenantId: string): Promise<string | null> {
    return null;
  }
}
