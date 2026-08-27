/**
 * Phone Webhook Controller
 * Handles inbound calls and events from Google Voice / Telephony Provider
 */

import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  Logger,
  Inject,
} from '@nestjs/common';
import { ITelephonyProvider } from '../providers/telephony.provider';
import { CallSessionService } from '../services/call-session.service';
import { STTService } from '../services/stt.service';
import { TTSService } from '../services/tts.service';
import { ConversationService } from '../services/conversation.service';

@Controller('api/v1/phone')
export class PhoneWebhookController {
  private readonly logger = new Logger(PhoneWebhookController.name);

  constructor(
    @Inject('TELEPHONY_PROVIDER') private provider: ITelephonyProvider,
    private callSession: CallSessionService,
    private stt: STTService,
    private tts: TTSService,
    private conversation: ConversationService,
  ) {}

  /**
   * Inbound call webhook
   * Called by Google Voice or telephony provider when a call is received
   */
  @Post('webhook/inbound')
  @HttpCode(200)
  async handleInboundCall(
    @Body() body: any,
    @Headers('x-webhook-signature') signature?: string
  ): Promise<{ success: boolean; callSid?: string; message?: string }> {
    try {
      this.logger.log(`Inbound call webhook received: ${JSON.stringify(body)}`);

      // Verify webhook signature if configured
      if (signature) {
        // TODO: Implement webhook signature verification
      }

      // Handle via provider
      const result = await this.provider.handleWebhook(body, signature);

      if (!result.callSid) {
        return { success: false, message: 'No callSid in webhook response' };
      }

      const callSid = result.callSid;

      // Start call session
      await this.callSession.startSession(callSid, {
        inboundNumber: body.toNumber,
        callerNumber: body.fromNumber,
        isInbound: true,
      });

      // Send greeting
      const greeting = 'Thank you for calling WISE² HVAC Solutions. I\'m the WISE² assistant. How can I help you today?';
      const ttsResult = await this.tts.synthesize(greeting);

      // Play greeting
      await this.provider.playAudio({
        callSid,
        audioUrl: ttsResult.audioUrl,
      });

      // Mark call as answered
      await this.callSession.updateSessionStatus(callSid, 'ANSWERED');
      await this.provider.answerCall({ callSid, playTone: false });

      this.logger.log(`Call ${callSid} answered and greeting played`);

      return { success: true, callSid };
    } catch (error) {
      this.logger.error(
        `Inbound call handling failed: ${error.message}`,
        error.stack
      );
      return { success: false, message: error.message };
    }
  }

  /**
   * Call status update webhook
   * Called when call state changes (connected, transferred, ended, etc.)
   */
  @Post('webhook/status')
  @HttpCode(200)
  async handleCallStatus(
    @Body() body: any,
    @Headers('x-webhook-signature') signature?: string
  ): Promise<{ success: boolean }> {
    try {
      const { callSid, status, duration, recordingUrl } = body;

      this.logger.log(`Call status update: ${callSid} → ${status}`);

      const session = this.callSession.getSession(callSid);
      if (!session) {
        this.logger.warn(`Status update for unknown call: ${callSid}`);
        return { success: false };
      }

      if (status === 'disconnected' || status === 'completed') {
        session.metadata = session.metadata || {};
        session.metadata.recordingUrl = recordingUrl;
        session.metadata.duration = duration;

        // Generate summary and end session
        const summary = await this.conversation.endConversation(callSid);
        await this.callSession.endSession(callSid);

        this.logger.log(`Call ${callSid} ended. Summary: ${JSON.stringify(summary)}`);
      } else {
        await this.callSession.updateSessionStatus(callSid, status.toUpperCase() as any);
      }

      return { success: true };
    } catch (error) {
      this.logger.error(`Call status handling failed: ${error.message}`);
      return { success: false };
    }
  }

  /**
   * Speech input webhook
   * Called when speech is detected and transcribed
   */
  @Post('webhook/speech')
  @HttpCode(200)
  async handleSpeechInput(
    @Body() body: any,
    @Headers('x-webhook-signature') signature?: string
  ): Promise<{ success: boolean; audioUrl?: string }> {
    try {
      const { callSid, transcribedText, audioUrl } = body;

      this.logger.log(
        `Speech input received: ${callSid} - "${transcribedText}"`
      );

      const session = this.callSession.getSession(callSid);
      if (!session) {
        return { success: false };
      }

      // Process message through AI
      const aiResponse = await this.conversation.processMessage(
        callSid,
        transcribedText
      );

      // Synthesize AI response
      const ttsResult = await this.tts.synthesize(aiResponse.text);

      // Play response
      await this.provider.playAudio({
        callSid,
        audioUrl: ttsResult.audioUrl,
      });

      this.logger.log(
        `AI response played: ${callSid} - "${aiResponse.text.substring(0, 50)}..."`
      );

      return { success: true, audioUrl: ttsResult.audioUrl };
    } catch (error) {
      this.logger.error(`Speech handling failed: ${error.message}`);
      return { success: false };
    }
  }

  /**
   * Health check endpoint
   */
  @Post('health')
  @HttpCode(200)
  async healthCheck(): Promise<{
    status: string;
    telephony: any;
    stt: any;
    tts: any;
    timestamp: string;
  }> {
    const telephonyHealth = await this.provider.healthCheck();
    const sttHealth = await this.stt.healthCheck();
    const ttsHealth = await this.tts.healthCheck();

    const allHealthy =
      telephonyHealth.isConnected &&
      sttHealth.isHealthy &&
      ttsHealth.isHealthy;

    return {
      status: allHealthy ? 'healthy' : 'degraded',
      telephony: telephonyHealth,
      stt: sttHealth,
      tts: ttsHealth,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get active calls
   */
  @Post('status')
  @HttpCode(200)
  async getStatus(): Promise<{
    activeCalls: number;
    sessions: any[];
    timestamp: string;
  }> {
    const sessions = this.callSession.getActiveSessions();

    return {
      activeCalls: sessions.length,
      sessions: sessions.map((s) => ({
        callSid: s.callSid,
        status: s.status,
        duration: s.durationSeconds,
        customerId: s.customerId,
      })),
      timestamp: new Date().toISOString(),
    };
  }
}
