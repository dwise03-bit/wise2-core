import {
  Controller,
  Post,
  Body,
  Logger,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { VoiceService } from './voice.service';
import { TelnyxWebhookEvent, VoiceCommandResponse } from './voice.service';

@Controller('voice')
export class VoiceController {
  private logger = new Logger('VoiceController');

  constructor(private voiceService: VoiceService) {}

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(@Body() event: TelnyxWebhookEvent): Promise<VoiceCommandResponse | { success: boolean }> {
    try {
      if (!event?.data?.event_type) {
        this.logger.warn('Invalid webhook event format');
        throw new BadRequestException('Invalid event format');
      }

      const response = await this.voiceService.handleVoiceEvent(event);

      if (response) {
        this.logger.debug(
          `Responding with commands for call: ${response.call_control_id}`,
        );
        return response;
      }

      return { success: true };
    } catch (error) {
      this.logger.error('Webhook error:', error);
      throw error;
    }
  }

  @Post('health')
  @HttpCode(200)
  health() {
    return { status: 'ok', service: 'voice-webhook-handler' };
  }
}
