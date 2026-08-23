import { Injectable, Logger } from '@nestjs/common';
import { GoogleVoiceProvider, CallSessionManager, VoiceOrchestrator, ToolRegistry } from '@wise2/ai-phone';
import { PrismaService } from '@wise2/db';

interface GoogleVoiceWebhookPayload {
  type: 'INCOMING_CALL' | 'CALL_CONNECTED' | 'CALL_ENDED' | 'CALL_FAILED';
  callId: string;
  googleCallId: string;
  from: string;
  to: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class GoogleVoiceService {
  private readonly logger = new Logger('GoogleVoiceService');
  private googleVoiceProvider: GoogleVoiceProvider;
  private sessionManager: CallSessionManager;
  private voiceOrchestrator: VoiceOrchestrator;
  private activeSessions = new Map<string, { sessionId: string; callId: string; customerId?: string }>();

  constructor(private readonly prisma: PrismaService) {
    this.initializeProviders();
  }

  /**
   * Initialize Google Voice and orchestration components
   */
  private initializeProviders() {
    // Initialize Google Voice Provider
    this.googleVoiceProvider = new GoogleVoiceProvider({
      projectId: process.env.GOOGLE_PROJECT_ID!,
      credentials: {
        type: 'service_account',
        project_id: process.env.GOOGLE_PROJECT_ID!,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID!,
        private_key: process.env.GOOGLE_PRIVATE_KEY!,
        client_email: process.env.GOOGLE_CLIENT_EMAIL!,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL!,
      },
      phoneNumber: process.env.GOOGLE_PHONE_NUMBER!,
    });

    // Initialize session manager and orchestrator
    this.sessionManager = new CallSessionManager();
    // TODO: Initialize with actual voice model (OpenAI Realtime)
    // this.voiceOrchestrator = new VoiceOrchestrator(voiceModel, sessionManager, toolRegistry);

    this.logger.log('Google Voice service initialized');
  }

  /**
   * Handle incoming call from Google Voice
   */
  async handleIncomingCall(payload: GoogleVoiceWebhookPayload) {
    const { callId, googleCallId, from, to, timestamp } = payload;

    this.logger.log(`Incoming call from ${from} to ${to} (callId: ${callId})`);

    try {
      // Register call with provider
      const callInfo = await this.googleVoiceProvider.incomingCall(callId, from, to, googleCallId);

      // Look up customer in database
      const customer = await this.prisma.customer.findFirst({
        where: { primaryPhone: from },
      });

      if (customer) {
        this.logger.log(`Found customer: ${customer.fullName}`);
      } else {
        this.logger.log(`New caller from ${from}`);
      }

      // Automatically accept call
      await this.googleVoiceProvider.acceptCall(callId);

      // Create call record in database
      const callRecord = await this.prisma.call.create({
        data: {
          tenantId: 'default',
          providerId: 'google-voice',
          direction: 'inbound',
          fromNumber: from,
          toNumber: to,
          startedAt: new Date(timestamp),
          recordingStatus: 'none',
          transcriptStatus: 'pending',
          confidence: 0,
          costEstimate: 0,
          customerId: customer?.id,
        },
      });

      this.logger.log(`Created call record: ${callRecord.id}`);

      // Create conversation session
      // TODO: Start voice conversation with OpenAI Realtime API
      const session = this.sessionManager.createSession(callId, 'default', []);

      // Store session mapping
      this.activeSessions.set(callId, {
        sessionId: session.sessionId,
        callId,
        customerId: customer?.id,
      });

      // Start media stream
      const wsUrl = `wss://wise2.net/media/stream/${callId}`;
      await this.googleVoiceProvider.startMediaStream(callId, wsUrl);

      this.logger.log(`Call ${callId} connected and ready for conversation`);
    } catch (error) {
      this.logger.error(`Error handling incoming call: ${error instanceof Error ? error.message : String(error)}`);

      // Reject call on error
      try {
        await this.googleVoiceProvider.rejectCall(callId);
      } catch (rejectError) {
        this.logger.error(`Failed to reject call: ${rejectError instanceof Error ? rejectError.message : String(rejectError)}`);
      }

      throw error;
    }
  }

  /**
   * Handle call connected event
   */
  async handleCallConnected(payload: GoogleVoiceWebhookPayload) {
    const { callId, timestamp } = payload;

    this.logger.log(`Call ${callId} connected at ${timestamp}`);

    try {
      // Update call record
      await this.prisma.call.update({
        where: { id: callId },
        data: { connectedAt: new Date(timestamp) },
      });
    } catch (error) {
      this.logger.warn(`Could not update call record: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Handle call ended event
   */
  async handleCallEnded(payload: GoogleVoiceWebhookPayload) {
    const { callId, timestamp } = payload;

    this.logger.log(`Call ${callId} ended at ${timestamp}`);

    try {
      // Get session info
      const sessionInfo = this.activeSessions.get(callId);

      // End call
      await this.googleVoiceProvider.endCall(callId);

      // Get call duration
      const callRecord = await this.prisma.call.findUnique({ where: { id: callId } });
      if (callRecord?.startedAt) {
        const duration = new Date(timestamp).getTime() - callRecord.startedAt.getTime();
        await this.prisma.call.update({
          where: { id: callId },
          data: {
            endedAt: new Date(timestamp),
            disposition: 'completed',
          },
        });
      }

      // Get call summary from session
      if (sessionInfo) {
        const summary = this.sessionManager.getSummary(sessionInfo.sessionId);
        this.logger.log(`Call ${callId} summary: ${summary.messageCount} messages, ${summary.toolsUsed.length} tools used`);
      }

      // Clean up session
      this.activeSessions.delete(callId);

      // Trigger post-call processing
      await this.processPostCall(callId, sessionInfo?.customerId);
    } catch (error) {
      this.logger.error(`Error handling call ended: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Handle call failed event
   */
  async handleCallFailed(payload: GoogleVoiceWebhookPayload) {
    const { callId, timestamp, metadata } = payload;

    this.logger.error(`Call ${callId} failed at ${timestamp}: ${metadata?.reason || 'unknown error'}`);

    try {
      // Update call record
      await this.prisma.call.update({
        where: { id: callId },
        data: {
          endedAt: new Date(timestamp),
          disposition: 'failed',
        },
      });

      // Clean up session
      this.activeSessions.delete(callId);
    } catch (error) {
      this.logger.error(`Error handling call failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Process call after it ends
   * - Request recordings from Cloud Storage
   * - Trigger transcription
   * - Update CRM
   */
  private async processPostCall(callId: string, customerId?: string) {
    try {
      this.logger.log(`Processing post-call for ${callId}`);

      // Get recording URL
      const recording = await this.googleVoiceProvider.getRecording(callId);
      if (recording) {
        await this.prisma.call.update({
          where: { id: callId },
          data: { recordingStatus: 'recorded' },
        });
        this.logger.log(`Recording available: ${recording.url}`);
      }

      // Trigger transcript generation via Cloud Speech-to-Text
      // This happens asynchronously in Google Cloud
      const transcript = await this.googleVoiceProvider.getTranscript(callId);
      if (transcript) {
        await this.prisma.call.update({
          where: { id: callId },
          data: { transcriptStatus: 'available' },
        });
        this.logger.log(`Transcript available: ${transcript.transcriptId}`);
      }

      // Create lead or update customer if needed
      if (customerId) {
        // Update existing customer interaction
        await this.prisma.customer.update({
          where: { id: customerId },
          data: { updatedAt: new Date() },
        });
      } else {
        // Create new lead from incoming call
        const callRecord = await this.prisma.call.findUnique({ where: { id: callId } });
        if (callRecord) {
          // Create lead for follow-up
          this.logger.log(`Creating lead from new caller`);
        }
      }
    } catch (error) {
      this.logger.warn(`Post-call processing error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get active call status
   */
  getCallStatus(callId: string) {
    return this.activeSessions.get(callId);
  }

  /**
   * List active sessions
   */
  getActiveSessions() {
    return Array.from(this.activeSessions.values());
  }
}
