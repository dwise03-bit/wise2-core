import { Controller, Post, Body, Headers, HttpCode, HttpStatus, BadRequestException, Logger } from '@nestjs/common';
import { TelnyxService } from './telnyx.service';
import * as crypto from 'crypto';

interface TelnyxWebhookPayload {
  data: {
    event_type: string;
    id: string;
    payload: {
      call_control_id?: string;
      call_leg_id?: string;
      from?: string;
      to?: string;
      state?: string;
      call_session_id?: string;
      client_state?: string;
      dtmf_digits?: string;
      cause?: string;
      cause_description?: string;
    };
  };
}

@Controller('webhooks/telnyx')
export class TelnyxController {
  private readonly logger = new Logger('TelnyxWebhook');

  constructor(private readonly telnyxService: TelnyxService) {}

  @Post('events')
  @HttpCode(HttpStatus.OK)
  async handleWebhookEvent(@Body() payload: TelnyxWebhookPayload, @Headers() headers: Record<string, string>) {
    const eventType = payload.data?.event_type;
    const from = payload.data?.payload?.from;

    this.logger.log(`Received Telnyx webhook: ${eventType} from ${from}`);

    // Verify webhook authenticity (Telnyx signature in headers)
    const signature = headers['telnyx-signature-mac'] || '';
    if (!this.verifyWebhookSignature(signature, JSON.stringify(payload))) {
      this.logger.error('Invalid webhook signature');
      throw new BadRequestException('Invalid webhook signature');
    }

    try {
      const callControlId = payload.data?.payload?.call_control_id || '';
      const callSessionId = payload.data?.payload?.call_session_id || '';
      const clientState = payload.data?.payload?.client_state || '';

      // Use client_state (our callId) if available, else use call_session_id or call_control_id
      const callId = clientState || callSessionId || callControlId;

      switch (eventType) {
        case 'call.initiated':
          await this.telnyxService.handleCallInitiated({
            callId,
            callControlId,
            from: payload.data.payload.from || '',
            to: payload.data.payload.to || '',
            timestamp: new Date().toISOString(),
          });
          break;

        case 'call.answered':
          await this.telnyxService.handleCallAnswered({
            callId,
            callControlId,
            timestamp: new Date().toISOString(),
          });
          break;

        case 'call.hangup':
          await this.telnyxService.handleCallEnded({
            callId,
            callControlId,
            cause: payload.data.payload.cause || 'unknown',
            timestamp: new Date().toISOString(),
          });
          break;

        case 'call.failed':
          await this.telnyxService.handleCallFailed({
            callId,
            callControlId,
            reason: payload.data.payload.cause_description || 'Call failed',
            timestamp: new Date().toISOString(),
          });
          break;

        case 'call.dtmf.received':
          // Handle DTMF input for IVR
          this.logger.debug(`DTMF received on call ${callId}: ${payload.data.payload.dtmf_digits}`);
          await this.telnyxService.handleDTMFInput({
            callId,
            callControlId,
            dtmfDigits: payload.data.payload.dtmf_digits || '',
            timestamp: new Date().toISOString(),
          });
          break;

        case 'call.hangup':
          // Also handle hangup separately from failed
          await this.telnyxService.handleCallEnded({
            callId,
            callControlId,
            cause: payload.data.payload.cause || 'hangup',
            timestamp: new Date().toISOString(),
          });
          break;

        default:
          this.logger.debug(`Unhandled Telnyx event type: ${eventType}`);
      }

      return { success: true, callId };
    } catch (error) {
      this.logger.error(`Error processing webhook: ${error instanceof Error ? error.message : String(error)}`);
      throw new BadRequestException('Failed to process webhook');
    }
  }

  /**
   * Verify Telnyx webhook signature using HMAC-SHA256
   * Reference: https://developers.telnyx.com/docs/voice/webhooks#webhook_signature_verification
   */
  private verifyWebhookSignature(signature: string, payload: string): boolean {
    if (!signature) {
      this.logger.warn('No webhook signature provided');
      return false;
    }

    const secret = process.env.TELNYX_WEBHOOK_SECRET;
    if (!secret) {
      this.logger.warn('TELNYX_WEBHOOK_SECRET not configured - webhook verification disabled');
      // In development, allow unsigned webhooks if secret is not configured
      return process.env.NODE_ENV !== 'production';
    }

    try {
      // Telnyx uses HMAC-SHA256 for signature verification
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('base64');

      // Compare signatures using constant-time comparison
      const isValid = crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );

      return isValid;
    } catch (error) {
      this.logger.error(
        `Webhook signature verification error: ${error instanceof Error ? error.message : String(error)}`
      );
      return false;
    }
  }

  @Post('health')
  @HttpCode(HttpStatus.OK)
  async healthCheck() {
    return { status: 'ok', service: 'telnyx-webhook' };
  }
}
