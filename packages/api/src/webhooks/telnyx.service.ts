import { Injectable, Logger } from '@nestjs/common';
import { TelnyxProvider, CallSessionManager } from '@wise2/ai-phone';

interface TelnyxWebhookEvent {
  callId: string;
  callControlId: string;
  timestamp: string;
  from?: string;
  to?: string;
  cause?: string;
  reason?: string;
}

@Injectable()
export class TelnyxService {
  private readonly logger = new Logger('TelnyxService');
  private telnyxProvider?: TelnyxProvider;
  private sessionManager?: CallSessionManager;
  private activeSessions = new Map<string, { sessionId: string; callId: string; callControlId: string; customerId?: string }>();

  constructor() {
    this.initializeProviders();
  }

  /**
   * Initialize Telnyx and orchestration components
   */
  private initializeProviders() {
    try {
      // Initialize Telnyx Provider
      this.telnyxProvider = new TelnyxProvider({
        apiKey: process.env.TELNYX_API_KEY!,
        apiUrl: process.env.TELNYX_API_URL || 'https://api.telnyx.com/v2',
        webhookSecret: process.env.TELNYX_WEBHOOK_SECRET,
        phoneNumber: process.env.TELNYX_PHONE_NUMBER!,
      });

      // Initialize session manager
      this.sessionManager = new CallSessionManager();

      // VoiceOrchestrator will be initialized when voice model provider is available
      // For now, we'll handle calls directly through the provider

      this.logger.log('✓ Telnyx service initialized successfully');
    } catch (error) {
      this.logger.error(`Failed to initialize Telnyx service: ${error instanceof Error ? error.message : String(error)}`);
      // Don't throw - allow service to start but webhooks will fail until configured
    }
  }

  /**
   * Handle call initiated event (inbound call)
   */
  async handleCallInitiated(event: TelnyxWebhookEvent) {
    const { callId, callControlId, from, to, timestamp } = event;

    this.logger.log(`Incoming call from ${from} to ${to} (callId: ${callId}, controlId: ${callControlId})`);

    try {
      if (!this.telnyxProvider || !this.sessionManager) {
        throw new Error('Telnyx service not initialized');
      }

      // Register call with provider
      const callInfo = await this.telnyxProvider.incomingCall(callId, from!, to!, callControlId);

      // TODO: Look up customer in database (requires Prisma setup)
      // For MVP: log as new caller
      this.logger.log(`Processing call from ${from}`);

      // Automatically accept call
      await this.telnyxProvider.acceptCall(callId);

      // TODO: Create call record in database (requires Prisma setup)
      this.logger.log(`Accepted call ${callId}`);

      // Create conversation session
      // TODO: Start voice conversation with OpenAI Realtime API
      const session = this.sessionManager.createSession(callId, 'default', []);

      // Store session mapping
      this.activeSessions.set(callId, {
        sessionId: session.sessionId,
        callId,
        callControlId,
      });

      // Start media stream
      const wsUrl = `wss://wise2.net/media/stream/${callId}`;
      await this.telnyxProvider.startMediaStream(callId, wsUrl);

      this.logger.log(`Call ${callId} connected and ready for conversation`);
    } catch (error) {
      this.logger.error(`Error handling incoming call: ${error instanceof Error ? error.message : String(error)}`);

      // Reject call on error
      try {
        if (this.telnyxProvider) {
          await this.telnyxProvider.rejectCall(callId);
        }
      } catch (rejectError) {
        this.logger.error(`Failed to reject call: ${rejectError instanceof Error ? rejectError.message : String(rejectError)}`);
      }

      throw error;
    }
  }

  /**
   * Handle call answered event
   */
  async handleCallAnswered(event: TelnyxWebhookEvent) {
    const { callId, timestamp } = event;

    this.logger.log(`Call ${callId} answered at ${timestamp}`);

    try {
      // TODO: Update call record in database (requires Prisma setup)
      this.logger.log(`Call ${callId} connected at ${timestamp}`);
    } catch (error) {
      this.logger.warn(`Could not process call answered: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Handle call ended event
   */
  async handleCallEnded(event: TelnyxWebhookEvent) {
    const { callId, timestamp } = event;

    this.logger.log(`Call ${callId} ended at ${timestamp}`);

    try {
      // Get session info
      const sessionInfo = this.activeSessions.get(callId);

      // End call
      if (this.telnyxProvider) {
        await this.telnyxProvider.endCall(callId);
      }

      // Get call summary from session
      if (sessionInfo && this.sessionManager) {
        const summary = this.sessionManager.getSummary(sessionInfo.sessionId);
        this.logger.log(`Call ${callId} summary: ${(summary as any)?.messageCount || 0} messages, ${(summary as any)?.toolsUsed?.length || 0} tools used`);
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
  async handleCallFailed(event: TelnyxWebhookEvent) {
    const { callId, timestamp, reason } = event;

    this.logger.error(`Call ${callId} failed at ${timestamp}: ${reason || 'unknown error'}`);

    try {
      // TODO: Update call record in database (requires Prisma setup)
      this.logger.log(`Call ${callId} failed: ${reason}`);

      // Clean up session
      this.activeSessions.delete(callId);
    } catch (error) {
      this.logger.error(`Error handling call failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Process call after it ends
   * - Request recordings from Telnyx
   * - Trigger transcription
   * - Update CRM
   */
  private async processPostCall(callId: string, customerId?: string) {
    try {
      this.logger.log(`Processing post-call for ${callId}`);

      if (!this.telnyxProvider) {
        return;
      }

      // Get recording URL
      const recording = await this.telnyxProvider.getRecording(callId);
      if (recording) {
        // TODO: Update database (requires Prisma setup)
        this.logger.log(`Recording available: ${recording.url}`);
      }

      // Trigger transcript generation via Telnyx Speech-to-Text
      const transcript = await this.telnyxProvider.getTranscript(callId);
      if (transcript) {
        // TODO: Update database (requires Prisma setup)
        this.logger.log(`Transcript available: ${transcript.transcriptId}`);
      }

      // TODO: Create lead or update customer if needed (requires Prisma setup)
      if (customerId) {
        this.logger.log(`Would update customer ${customerId}`);
      } else {
        this.logger.log(`Would create lead from new caller`);
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
