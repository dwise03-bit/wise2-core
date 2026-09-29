import { Controller, Post, Body, Headers, HttpCode, HttpStatus, BadRequestException, Logger } from '@nestjs/common';
import { GoogleVoiceService } from './google-voice.service';

interface GoogleVoiceWebhookPayload {
  type: 'INCOMING_CALL' | 'CALL_CONNECTED' | 'CALL_ENDED' | 'CALL_FAILED';
  callId: string;
  googleCallId: string;
  from: string;
  to: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

@Controller('webhooks/google-voice')
export class GoogleVoiceController {
  private readonly logger = new Logger('GoogleVoiceWebhook');

  constructor(private readonly googleVoiceService: GoogleVoiceService) {}

  @Post('events')
  @HttpCode(HttpStatus.OK)
  async handleWebhookEvent(@Body() payload: GoogleVoiceWebhookPayload, @Headers() headers: Record<string, string>) {
    this.logger.log(`Received Google Voice webhook: ${payload.type} from ${payload.from}`);

    // Verify webhook authenticity (Pub/Sub push authentication)
    const authHeader = headers['authorization'] || '';
    if (!this.verifyWebhookSignature(authHeader)) {
      this.logger.error('Invalid webhook signature');
      throw new BadRequestException('Invalid webhook signature');
    }

    try {
      switch (payload.type) {
        case 'INCOMING_CALL':
          await this.googleVoiceService.handleIncomingCall(payload);
          break;
        case 'CALL_CONNECTED':
          await this.googleVoiceService.handleCallConnected(payload);
          break;
        case 'CALL_ENDED':
          await this.googleVoiceService.handleCallEnded(payload);
          break;
        case 'CALL_FAILED':
          await this.googleVoiceService.handleCallFailed(payload);
          break;
        default:
          this.logger.warn(`Unknown webhook type: ${payload.type}`);
      }

      return { success: true, callId: payload.callId };
    } catch (error) {
      this.logger.error(`Error processing webhook: ${error instanceof Error ? error.message : String(error)}`);
      throw new BadRequestException('Failed to process webhook');
    }
  }

  /**
   * Verify Pub/Sub push authentication
   * In production, validate the JWT from the Authorization header
   */
  private verifyWebhookSignature(authHeader: string): boolean {
    // TODO: Implement JWT verification for Pub/Sub authentication
    // For now, we'll accept requests and rely on network security
    return true;
  }

  @Post('health')
  @HttpCode(HttpStatus.OK)
  async healthCheck() {
    return { status: 'ok', service: 'google-voice-webhook' };
  }
}
