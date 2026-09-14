import { Injectable, Logger } from '@nestjs/common';
import { TelnyxProvider } from '@wise2/ai-phone/dist/telnyx-provider.js';
import { CallSessionManager } from '@wise2/ai-phone/dist/call-session.js';
import { TelnyxDatabaseService } from './telnyx-database.service';

interface TelnyxWebhookEvent {
  callId: string;
  callControlId: string;
  timestamp: string;
  from?: string;
  to?: string;
  cause?: string;
  reason?: string;
  dtmfDigits?: string;
}

@Injectable()
export class TelnyxService {
  private readonly logger = new Logger('TelnyxService');
  private telnyxProvider?: TelnyxProvider;
  private sessionManager?: CallSessionManager;
  private activeSessions = new Map<string, {
    sessionId: string;
    callId: string;
    callControlId: string;
    customerId?: string;
    databaseCallId?: string;
  }>();

  constructor(private databaseService: TelnyxDatabaseService) {
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

      // Look up or create customer in database
      const customer = await this.databaseService.lookupCustomer(from!);
      this.logger.log(`Processing call from ${from} (Customer: ${customer?.id || 'new'})`);

      // Create call record in database
      const dbCall = await this.databaseService.createCall({
        callSid: callControlId,
        inboundNumber: to!,
        callerNumber: from!,
        direction: 'INBOUND',
        startedAt: new Date(),
        customerId: customer?.id,
      });

      // Automatically accept call
      await this.telnyxProvider.acceptCall(callId);

      // Update database call status to answered
      if (dbCall) {
        await this.databaseService.updateCallAnswered(dbCall.id, new Date());
      }

      // Create conversation session
      const session = this.sessionManager.createSession(callId, 'default', []);

      // Store session mapping with database call ID
      this.activeSessions.set(callId, {
        sessionId: session.sessionId,
        callId,
        callControlId,
        customerId: customer?.id,
        databaseCallId: dbCall?.id,
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

      // End call with provider
      if (this.telnyxProvider) {
        await this.telnyxProvider.endCall(callId);
      }

      // Update database call to disconnected
      if (sessionInfo?.databaseCallId) {
        await this.databaseService.endCall(
          sessionInfo.databaseCallId,
          new Date(timestamp),
          undefined,
          'UNKNOWN'
        );
      }

      // Get call summary from session
      if (sessionInfo && this.sessionManager) {
        const summary = this.sessionManager.getSummary(sessionInfo.sessionId);
        this.logger.log(`Call ${callId} summary: ${(summary as any)?.messageCount || 0} messages, ${(summary as any)?.toolsUsed?.length || 0} tools used`);
      }

      // Trigger post-call processing
      await this.processPostCall(
        callId,
        sessionInfo?.customerId,
        sessionInfo?.databaseCallId,
        sessionInfo?.sessionId
      );

      // Clean up session
      this.activeSessions.delete(callId);
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
   * - Create callback tasks
   * - Update customer record
   */
  private async processPostCall(
    callId: string,
    customerId?: string,
    databaseCallId?: string,
    sessionId?: string
  ) {
    try {
      this.logger.log(`Processing post-call for ${callId}`);

      if (!this.telnyxProvider) {
        return;
      }

      // Get recording URL
      const recording = await this.telnyxProvider.getRecording(callId);
      if (recording && databaseCallId) {
        // Update call record with recording URL
        this.logger.log(`Recording available: ${recording.url}`);
        // Note: Use the database service method if extended for recording updates
      }

      // Trigger transcript generation via Telnyx Speech-to-Text
      const transcript = await this.telnyxProvider.getTranscript(callId);
      if (transcript) {
        this.logger.log(`Transcript available: ${transcript.transcriptId}`);
        // Note: Store transcript in database for compliance/audit
      }

      // Create callback task for follow-up
      if (customerId) {
        const metrics = await this.databaseService.getTodayMetrics();
        const followUpNeeded = metrics && metrics.answered > 0 && (metrics.failureRate as any) < 20;

        if (followUpNeeded) {
          await this.databaseService.createCallbackTask(
            customerId,
            `Follow-up call after previous conversation (Session: ${sessionId})`,
            new Date(Date.now() + 24 * 60 * 60 * 1000) // Next day
          );

          this.logger.log(`Created callback task for customer ${customerId}`);
        }
      }

      // Log daily metrics for monitoring
      const metrics = await this.databaseService.getTodayMetrics();
      if (metrics) {
        this.logger.log(
          `📊 Today's metrics - Total: ${metrics.total}, Answered: ${metrics.answered}, ` +
          `Failed: ${metrics.failed}, Avg Duration: ${metrics.averageDurationSeconds}s`
        );
      }
    } catch (error) {
      this.logger.warn(`Post-call processing error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Handle DTMF input during a call
   */
  async handleDTMFInput(event: TelnyxWebhookEvent) {
    const { callId, dtmfDigits } = event;

    this.logger.debug(`DTMF input on call ${callId}: ${dtmfDigits}`);

    try {
      if (!this.telnyxProvider) {
        throw new Error('Telnyx provider not initialized');
      }

      // Record DTMF in provider
      this.telnyxProvider.recordDTMF(callId, dtmfDigits!);

      // IVR logic could go here
      // Example: Route call based on DTMF menu selection
      const currentDTMF = this.telnyxProvider.getDTMFInput(callId);
      this.logger.debug(`Accumulated DTMF for call ${callId}: ${currentDTMF}`);

      // TODO: Implement IVR routing based on DTMF sequence
      // if (currentDTMF === '1') { /* Route to sales */ }
      // if (currentDTMF === '2') { /* Route to support */ }
    } catch (error) {
      this.logger.error(
        `Error handling DTMF input: ${error instanceof Error ? error.message : String(error)}`
      );
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

  /**
   * Get call metrics
   */
  async getCallMetrics() {
    try {
      return await this.databaseService.getTodayMetrics();
    } catch (error) {
      this.logger.warn(
        `Failed to get metrics: ${error instanceof Error ? error.message : String(error)}`
      );
      return null;
    }
  }

  /**
   * Get customer call history
   */
  async getCustomerCallHistory(customerId: string) {
    try {
      return await this.databaseService.getCustomerCallHistory(customerId);
    } catch (error) {
      this.logger.warn(
        `Failed to get call history: ${error instanceof Error ? error.message : String(error)}`
      );
      return [];
    }
  }
}
