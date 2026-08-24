/**
 * Call Management API Controller
 * Endpoints for managing active calls
 */

import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
  Inject,
} from '@nestjs/common';
import { ITelephonyProvider } from '../providers/telephony.provider';
import { CallSessionService } from '../services/call-session.service';
import { ConversationService } from '../services/conversation.service';
import { TTSService } from '../services/tts.service';
import { PrismaService } from '@shared/services/prisma.service';
import {
  InitiateCallDto,
  TransferCallDto,
  EndCallDto,
  PlayAudioDto,
  SendDTMFDto,
  CallStatusResponse,
  CallListResponse,
} from '../dto/call.dto.ts';

@Controller('api/v1/phone/calls')
export class CallController {
  private readonly logger = new Logger(CallController.name);

  constructor(
    @Inject('TELEPHONY_PROVIDER') private provider: ITelephonyProvider,
    private callSession: CallSessionService,
    private conversation: ConversationService,
    private tts: TTSService,
    private prisma: PrismaService,
  ) {}

  /**
   * Initiate an outbound call
   */
  @Post('initiate')
  @HttpCode(HttpStatus.CREATED)
  async initiateCall(@Body() dto: InitiateCallDto): Promise<{ callSid: string }> {
    try {
      this.logger.log(`Initiating call to ${dto.toNumber}`);

      // Initiate call via provider
      const callSid = await this.provider.initiateCall({
        toNumber: dto.toNumber,
        fromNumber: dto.fromNumber,
        recordingEnabled: dto.recordingEnabled,
      });

      // Start session
      await this.callSession.startSession(callSid, {
        inboundNumber: dto.fromNumber,
        callerNumber: dto.toNumber,
        isInbound: false,
        customerId: dto.customerId,
        propertyId: dto.propertyId,
      });

      // Identify customer if provided
      if (dto.customerId) {
        await this.callSession.identifyCustomer(callSid, dto.customerId);
      }

      if (dto.propertyId) {
        await this.callSession.identifyProperty(callSid, dto.propertyId);
      }

      return { callSid };
    } catch (error) {
      this.logger.error(`Call initiation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get call status
   */
  @Get(':callSid/status')
  async getCallStatus(@Param('callSid') callSid: string): Promise<CallStatusResponse> {
    try {
      const session = this.callSession.getSession(callSid);

      if (!session) {
        // Try to fetch from database if not in active session
        const call = await this.prisma.call.findUnique({
          where: { callSid },
          include: { transcript: true },
        });

        if (!call) {
          throw new Error(`Call not found: ${callSid}`);
        }

        return {
          callSid: call.callSid || callSid,
          status: call.status,
          duration: call.durationSeconds || undefined,
          recordingUrl: call.recordingUrl || undefined,
          customerId: call.customerId || undefined,
          propertyId: call.propertyId || undefined,
          transcript: call.transcript?.segments.map((s) => s.text).join('\n'),
        };
      }

      return {
        callSid,
        status: session.status,
        duration: session.durationSeconds,
        customerId: session.customerId,
        propertyId: session.propertyId,
        transcript: this.callSession.getTranscript(callSid),
      };
    } catch (error) {
      this.logger.error(`Status lookup failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * List active calls
   */
  @Get()
  async listActiveCalls(): Promise<CallListResponse> {
    const sessions = this.callSession.getActiveSessions();

    const calls: CallStatusResponse[] = sessions.map((s) => ({
      callSid: s.callSid,
      status: s.status,
      duration: s.durationSeconds,
      customerId: s.customerId,
      propertyId: s.propertyId,
    }));

    return {
      activeCalls: sessions.length,
      calls,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Transfer a call
   */
  @Post(':callSid/transfer')
  @HttpCode(HttpStatus.OK)
  async transferCall(
    @Param('callSid') callSid: string,
    @Body() dto: TransferCallDto
  ): Promise<{ success: boolean }> {
    try {
      this.logger.log(`Transferring call ${callSid} to ${dto.toNumber}`);

      await this.provider.transferCall({
        callSid,
        toNumber: dto.toNumber,
        method: (dto.method as any) || 'BLIND',
      });

      return { success: true };
    } catch (error) {
      this.logger.error(`Transfer failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * End a call
   */
  @Post(':callSid/end')
  @HttpCode(HttpStatus.OK)
  async endCall(@Param('callSid') callSid: string): Promise<{ success: boolean }> {
    try {
      this.logger.log(`Ending call ${callSid}`);

      await this.provider.endCall(callSid);

      // Generate summary and end session
      await this.conversation.endConversation(callSid);
      await this.callSession.endSession(callSid);

      return { success: true };
    } catch (error) {
      this.logger.error(`End call failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Play audio to a call
   */
  @Post(':callSid/play-audio')
  @HttpCode(HttpStatus.OK)
  async playAudio(
    @Param('callSid') callSid: string,
    @Body() dto: PlayAudioDto
  ): Promise<{ success: boolean }> {
    try {
      this.logger.log(`Playing audio to ${callSid}: ${dto.audioUrl}`);

      await this.provider.playAudio({
        callSid,
        audioUrl: dto.audioUrl,
        loop: dto.loop || false,
      });

      return { success: true };
    } catch (error) {
      this.logger.error(`Play audio failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Hold a call
   */
  @Post(':callSid/hold')
  @HttpCode(HttpStatus.OK)
  async holdCall(@Param('callSid') callSid: string): Promise<{ success: boolean }> {
    try {
      await this.provider.holdCall(callSid);
      await this.callSession.updateSessionStatus(callSid, 'HELD');
      return { success: true };
    } catch (error) {
      this.logger.error(`Hold failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Resume a held call
   */
  @Post(':callSid/resume')
  @HttpCode(HttpStatus.OK)
  async resumeCall(@Param('callSid') callSid: string): Promise<{ success: boolean }> {
    try {
      await this.provider.resumeCall(callSid);
      await this.callSession.updateSessionStatus(callSid, 'IN_PROGRESS');
      return { success: true };
    } catch (error) {
      this.logger.error(`Resume failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send DTMF (dial tone) to a call
   */
  @Post(':callSid/dtmf')
  @HttpCode(HttpStatus.OK)
  async sendDTMF(
    @Param('callSid') callSid: string,
    @Body() dto: SendDTMFDto
  ): Promise<{ success: boolean }> {
    try {
      await this.provider.sendDTMF({
        callSid,
        digits: dto.digits,
      });
      return { success: true };
    } catch (error) {
      this.logger.error(`DTMF send failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get call transcript
   */
  @Get(':callSid/transcript')
  async getTranscript(@Param('callSid') callSid: string): Promise<{
    transcript: string;
    segments?: Array<{ speaker: string; text: string; timestamp: number }>;
  }> {
    try {
      const session = this.callSession.getSession(callSid);

      if (session) {
        return {
          transcript: this.callSession.getTranscript(callSid),
          segments: this.callSession.getConversation(callSid).map((turn) => ({
            speaker: turn.role,
            text: turn.text,
            timestamp: turn.timestamp.getTime(),
          })),
        };
      }

      // Try database
      const transcript = await this.prisma.callTranscript.findUnique({
        where: { callId: callSid },
        include: { segments: true },
      });

      if (!transcript) {
        throw new Error(`Transcript not found: ${callSid}`);
      }

      return {
        transcript: transcript.segments.map((s) => s.text).join('\n'),
        segments: transcript.segments.map((s) => ({
          speaker: s.speaker,
          text: s.text,
          timestamp: s.startMs,
        })),
      };
    } catch (error) {
      this.logger.error(`Transcript fetch failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get call summary
   */
  @Get(':callSid/summary')
  async getSummary(
    @Param('callSid') callSid: string
  ): Promise<{
    summary: any;
  }> {
    try {
      const summary = await this.prisma.callSummary.findUnique({
        where: { callId: callSid },
      });

      if (!summary) {
        throw new Error(`Summary not found: ${callSid}`);
      }

      return { summary };
    } catch (error) {
      this.logger.error(`Summary fetch failed: ${error.message}`);
      throw error;
    }
  }
}
