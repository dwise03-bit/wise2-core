import { Controller, Post, Body, Headers, HttpCode, HttpStatus, BadRequestException, Logger } from '@nestjs/common';
import { TelnyxService } from './telnyx.service';

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
          // Log DTMF for future IVR implementation
          this.logger.debug(`DTMF received on call ${callId}: ${payload.data.payload.dtmf_digits}`);
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
   * Verify Telnyx webhook signature
   * In production, validate the HMAC signature from Telnyx
   */
  private verifyWebhookSignature(signature: string, payload: string): boolean {
    // TODO: Implement HMAC verification using Telnyx webhook secret
    // For now, we'll accept requests and rely on network security
    return true;
  }

  @Post('health')
  @HttpCode(HttpStatus.OK)
  async healthCheck() {
    return { status: 'ok', service: 'telnyx-webhook' };
  }
}
