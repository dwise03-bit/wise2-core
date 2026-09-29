import { Injectable, Logger } from '@nestjs/common';
import { GoogleVoiceProvider, CallSessionManager } from '@wise2/ai-phone';
import { PrismaService } from '../prisma/prisma.service';

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
  private googleVoiceProvider?: GoogleVoiceProvider;
  private sessionManager?: CallSessionManager;
  private activeSessions = new Map<string, { sessionId: string; callId: string; customerId?: string }>();

  constructor(private readonly prisma: PrismaService) {
    this.initializeProviders();
  }

  private initializeProviders() {
    try {
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

      this.sessionManager = new CallSessionManager();
      this.logger.log('✓ Google Voice service initialized');
    } catch (error) {
      this.logger.error(`Failed to initialize: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async handleIncomingCall(payload: GoogleVoiceWebhookPayload) {
    const { callId, googleCallId, from, to, timestamp } = payload;
    this.logger.log(`Incoming call from ${from} to ${to}`);

    try {
      if (!this.googleVoiceProvider || !this.sessionManager) {
        throw new Error('Provider not initialized');
      }

      const callInfo = await this.googleVoiceProvider.incomingCall(callId, from, to, googleCallId);
      await this.googleVoiceProvider.acceptCall(callId);

      const session = this.sessionManager.createSession(callId, 'default', []);
      this.activeSessions.set(callId, { sessionId: session.sessionId, callId });

      const wsUrl = `wss://wise2.net/media/stream/${callId}`;
      await this.googleVoiceProvider.startMediaStream(callId, wsUrl);

      this.logger.log(`Call ${callId} connected`);
    } catch (error) {
      this.logger.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
      if (this.googleVoiceProvider) {
        await this.googleVoiceProvider.rejectCall(callId);
      }
    }
  }

  async handleCallConnected(payload: GoogleVoiceWebhookPayload) {
    const { callId, timestamp } = payload;
    this.logger.log(`Call ${callId} connected at ${timestamp}`);
  }

  async handleCallEnded(payload: GoogleVoiceWebhookPayload) {
    const { callId } = payload;
    this.logger.log(`Call ${callId} ended`);

    try {
      if (this.googleVoiceProvider) {
        await this.googleVoiceProvider.endCall(callId);
      }
      this.activeSessions.delete(callId);
    } catch (error) {
      this.logger.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async handleCallFailed(payload: GoogleVoiceWebhookPayload) {
    const { callId, metadata } = payload;
    this.logger.error(`Call ${callId} failed: ${metadata?.reason || 'unknown'}`);
    this.activeSessions.delete(callId);
  }

  getCallStatus(callId: string) {
    return this.activeSessions.get(callId);
  }

  getActiveSessions() {
    return Array.from(this.activeSessions.values());
  }
}
