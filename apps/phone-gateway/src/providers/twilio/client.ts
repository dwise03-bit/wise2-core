import twilio from 'twilio';
import { logger } from '../../logger';

export class TwilioClient {
  private client: twilio.Twilio;
  private accountSid: string;
  private authToken: string;
  private phoneNumber: string;
  private messagingServiceSid?: string;
  private webhookBaseUrl: string;
  private recordingEnabled: boolean;
  private transcriptionEnabled: boolean;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER || '';
    this.messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
    this.webhookBaseUrl = process.env.TWILIO_WEBHOOK_BASE_URL || '';
    this.recordingEnabled = process.env.TWILIO_ENABLE_RECORDING === 'true';
    this.transcriptionEnabled = process.env.TWILIO_ENABLE_TRANSCRIPTION === 'true';

    if (!this.accountSid || !this.authToken) {
      throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN required');
    }

    this.client = twilio(this.accountSid, this.authToken);
    logger.info('Twilio client initialized', {
      accountSid: this.accountSid.substring(0, 5) + '***',
      recordingEnabled: this.recordingEnabled,
      transcriptionEnabled: this.transcriptionEnabled,
    });
  }

  /**
   * Send SMS via Twilio
   */
  async sendSms(to: string, body: string): Promise<{ sid: string; status: string }> {
    try {
      const message = await this.client.messages.create({
        messagingServiceSid: this.messagingServiceSid || undefined,
        from: this.messagingServiceSid ? undefined : this.phoneNumber,
        to,
        body,
      });

      logger.info('SMS sent', { to, messageSid: message.sid, status: message.status });
      return { sid: message.sid, status: message.status };
    } catch (error) {
      logger.error('SMS send failed', { to, error });
      throw error;
    }
  }

  /**
   * Make outbound voice call
   */
  async makeCall(
    to: string,
    twimlUrl: string,
    options?: { recordingEnabled?: boolean }
  ): Promise<{ sid: string; status: string }> {
    try {
      const call = await this.client.calls.create({
        from: this.phoneNumber,
        to,
        url: twimlUrl,
        record: options?.recordingEnabled ?? this.recordingEnabled,
        transcribeCallback: this.transcriptionEnabled ? `${this.webhookBaseUrl}/twilio/transcription` : undefined,
      });

      logger.info('Outbound call initiated', { to, callSid: call.sid, status: call.status });
      return { sid: call.sid, status: call.status };
    } catch (error) {
      logger.error('Call initiation failed', { to, error });
      throw error;
    }
  }

  /**
   * Fetch call details
   */
  async getCall(callSid: string) {
    try {
      return await this.client.calls(callSid).fetch();
    } catch (error) {
      logger.error('Failed to fetch call', { callSid, error });
      throw error;
    }
  }

  /**
   * Fetch recording
   */
  async getRecording(recordingSid: string) {
    try {
      return await this.client.recordings(recordingSid).fetch();
    } catch (error) {
      logger.error('Failed to fetch recording', { recordingSid, error });
      throw error;
    }
  }

  /**
   * Fetch transcription
   */
  async getTranscription(transcriptionSid: string) {
    try {
      return await this.client.transcriptions(transcriptionSid).fetch();
    } catch (error) {
      logger.error('Failed to fetch transcription', { transcriptionSid, error });
      throw error;
    }
  }

  /**
   * Update call status (e.g., hangup)
   */
  async updateCall(callSid: string, status: 'completed'): Promise<void> {
    try {
      await this.client.calls(callSid).update({ status });
      logger.info('Call updated', { callSid, status });
    } catch (error) {
      logger.error('Failed to update call', { callSid, status, error });
      throw error;
    }
  }

  getAccountSid(): string {
    return this.accountSid;
  }

  getPhoneNumber(): string {
    return this.phoneNumber;
  }

  getWebhookBaseUrl(): string {
    return this.webhookBaseUrl;
  }

  isRecordingEnabled(): boolean {
    return this.recordingEnabled;
  }

  isTranscriptionEnabled(): boolean {
    return this.transcriptionEnabled;
  }
}

// Singleton instance
let twilioClientInstance: TwilioClient | null = null;

export function getTwilioClient(): TwilioClient {
  if (!twilioClientInstance) {
    try {
      twilioClientInstance = new TwilioClient();
    } catch (error) {
      logger.warn('Twilio client initialization failed - proceeding with Asterisk fallback', { error });
    }
  }
  return twilioClientInstance as TwilioClient;
}
