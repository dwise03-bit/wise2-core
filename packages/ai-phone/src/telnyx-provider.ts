import { TelephonyProvider, CallInfo, CallDirection, CallState } from './types';

interface TelnyxConfig {
  apiKey: string;
  apiUrl?: string;
  webhookSecret?: string;
  phoneNumber: string;
  maxRetries?: number;
  retryDelayMs?: number;
  requestTimeoutMs?: number;
}

interface TelnyxCallState {
  callId: string;
  telnyxCallId?: string;
  state: CallState;
  startedAt: Date;
  connectedAt?: Date;
  endedAt?: Date;
  from: string;
  to: string;
  direction: CallDirection;
  duration?: number;
  recordingId?: string;
  transcriptId?: string;
  isOnHold?: boolean;
  voicemailUrl?: string;
  dtmfDigits?: string;
  conferenceId?: string;
  retryCount?: number;
}

export class TelnyxProvider implements TelephonyProvider {
  readonly name = 'Telnyx';
  private config: Required<TelnyxConfig>;
  private callCache = new Map<string, TelnyxCallState>();
  private apiUrl: string;
  private readonly DEFAULT_MAX_RETRIES = 3;
  private readonly DEFAULT_RETRY_DELAY_MS = 1000;
  private readonly DEFAULT_REQUEST_TIMEOUT_MS = 30000;

  constructor(config: TelnyxConfig) {
    this.config = {
      ...config,
      maxRetries: config.maxRetries ?? this.DEFAULT_MAX_RETRIES,
      retryDelayMs: config.retryDelayMs ?? this.DEFAULT_RETRY_DELAY_MS,
      requestTimeoutMs: config.requestTimeoutMs ?? this.DEFAULT_REQUEST_TIMEOUT_MS,
    };
    this.apiUrl = this.config.apiUrl || 'https://api.telnyx.com/v2';
  }

  private getAuthHeader(): { Authorization: string } {
    return {
      Authorization: `Bearer ${this.config.apiKey}`,
    };
  }

  /**
   * Retry logic with exponential backoff
   */
  private async fetchWithRetry<T>(
    url: string,
    options: RequestInit,
    retryCount = 0
  ): Promise<T> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.requestTimeoutMs);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Telnyx API error: ${response.status} ${response.statusText}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      clearTimeout(0);

      // Retry on network errors or 5xx errors
      const shouldRetry =
        (error instanceof Error && error.name === 'AbortError') ||
        (error instanceof Error && error.message.includes('5'));

      if (shouldRetry && retryCount < this.config.maxRetries) {
        const delayMs = this.config.retryDelayMs * Math.pow(2, retryCount);
        console.warn(
          `Telnyx API request failed (attempt ${retryCount + 1}/${this.config.maxRetries}), ` +
          `retrying in ${delayMs}ms`
        );
        await new Promise(resolve => setTimeout(resolve, delayMs));
        return this.fetchWithRetry(url, options, retryCount + 1);
      }

      throw error;
    }
  }

  async acceptCall(callId: string): Promise<void> {
    const call = this.callCache.get(callId);
    if (!call) throw new Error(`Call ${callId} not found`);

    if (!call.telnyxCallId) {
      throw new Error(`Telnyx call ID not set for ${callId}`);
    }

    try {
      await this.fetchWithRetry(
        `${this.apiUrl}/calls/${call.telnyxCallId}/actions/answer`,
        {
          method: 'POST',
          headers: this.getAuthHeader(),
          body: JSON.stringify({
            client_state: callId,
          }),
        }
      );

      call.state = 'answered';
      call.connectedAt = new Date();
      this.callCache.set(callId, call);

      console.log(`✅ Telnyx: Accepted call ${callId} (${call.telnyxCallId}) from ${call.from}`);
    } catch (error) {
      console.error(`❌ Telnyx: Failed to accept call ${callId}:`, error);
      throw error;
    }
  }

  async rejectCall(callId: string): Promise<void> {
    const call = this.callCache.get(callId);
    if (!call) throw new Error(`Call ${callId} not found`);

    if (!call.telnyxCallId) {
      throw new Error(`Telnyx call ID not set for ${callId}`);
    }

    try {
      await this.fetchWithRetry(
        `${this.apiUrl}/calls/${call.telnyxCallId}/actions/hangup`,
        {
          method: 'POST',
          headers: this.getAuthHeader(),
        }
      );

      call.state = 'failed';
      call.endedAt = new Date();
      this.callCache.set(callId, call);

      console.log(`❌ Telnyx: Rejected call ${callId} (${call.telnyxCallId})`);
    } catch (error) {
      console.error(`❌ Telnyx: Failed to reject call ${callId}:`, error);
      throw error;
    }
  }

  async startMediaStream(callId: string, wsUrl: string): Promise<void> {
    const call = this.callCache.get(callId);
    if (!call) throw new Error(`Call ${callId} not found`);

    if (!call.telnyxCallId) {
      throw new Error(`Telnyx call ID not set for ${callId}`);
    }

    try {
      await this.fetchWithRetry(
        `${this.apiUrl}/calls/${call.telnyxCallId}/actions/playback_start`,
        {
          method: 'POST',
          headers: this.getAuthHeader(),
          body: JSON.stringify({
            audio_url: 'file:///dev/null',
            client_state: callId,
          }),
        }
      );

      call.state = 'in-progress';
      this.callCache.set(callId, call);

      console.log(`🎙️  Telnyx: Starting media stream for ${callId} (${call.telnyxCallId}) at ${wsUrl}`);
    } catch (error) {
      console.error(`❌ Telnyx: Failed to start media stream for ${callId}:`, error);
      throw error;
    }
  }

  async transferCall(callId: string, destination: string): Promise<void> {
    const call = this.callCache.get(callId);
    if (!call) throw new Error(`Call ${callId} not found`);

    if (!call.telnyxCallId) {
      throw new Error(`Telnyx call ID not set for ${callId}`);
    }

    try {
      await this.fetchWithRetry(
        `${this.apiUrl}/calls/${call.telnyxCallId}/actions/transfer`,
        {
          method: 'POST',
          headers: this.getAuthHeader(),
          body: JSON.stringify({
            to: destination,
            client_state: callId,
          }),
        }
      );

      call.state = 'transferring';
      this.callCache.set(callId, call);

      console.log(`📞 Telnyx: Transferring call ${callId} (${call.telnyxCallId}) to ${destination}`);
    } catch (error) {
      console.error(`❌ Telnyx: Failed to transfer call ${callId}:`, error);
      throw error;
    }
  }

  async endCall(callId: string): Promise<void> {
    const call = this.callCache.get(callId);
    if (!call) throw new Error(`Call ${callId} not found`);

    if (!call.telnyxCallId) {
      throw new Error(`Telnyx call ID not set for ${callId}`);
    }

    try {
      await this.fetchWithRetry(
        `${this.apiUrl}/calls/${call.telnyxCallId}/actions/hangup`,
        {
          method: 'POST',
          headers: this.getAuthHeader(),
        }
      );

      call.state = 'completed';
      call.endedAt = new Date();
      call.duration = call.endedAt.getTime() - call.startedAt.getTime();

      this.callCache.set(callId, call);

      console.log(`✅ Telnyx: Call ${callId} (${call.telnyxCallId}) ended after ${call.duration}ms`);
    } catch (error) {
      console.error(`❌ Telnyx: Failed to end call ${callId}:`, error);
      throw error;
    }
  }

  async getCall(callId: string): Promise<CallInfo> {
    const call = this.callCache.get(callId);
    if (!call) throw new Error(`Call ${callId} not found`);

    return {
      callId,
      from: call.from,
      to: call.to,
      direction: call.direction,
      state: call.state,
      startedAt: call.startedAt,
      connectedAt: call.connectedAt,
      endedAt: call.endedAt,
      duration: call.duration,
    };
  }

  // Helper to register incoming call from Telnyx webhook
  async incomingCall(
    callId: string,
    from: string,
    to: string,
    telnyxCallId?: string
  ): Promise<CallInfo> {
    const callState: TelnyxCallState = {
      callId,
      telnyxCallId,
      from,
      to,
      direction: 'inbound',
      state: 'ringing',
      startedAt: new Date(),
    };

    this.callCache.set(callId, callState);

    console.log(`📞 Telnyx: Incoming call ${callId} (Telnyx ID: ${telnyxCallId || 'N/A'}) from ${from} to ${to}`);

    return {
      callId,
      from,
      to,
      direction: 'inbound',
      state: 'ringing',
      startedAt: new Date(),
    };
  }

  // Helper to initiate outbound call via Telnyx
  async initiateOutboundCall(
    callId: string,
    from: string,
    to: string
  ): Promise<CallInfo> {
    try {
      const data = await this.fetchWithRetry<any>(
        `${this.apiUrl}/calls`,
        {
          method: 'POST',
          headers: this.getAuthHeader(),
          body: JSON.stringify({
            to,
            from,
            connection_id: process.env.TELNYX_CONNECTION_ID,
            webhook_url: process.env.TELNYX_WEBHOOK_URL,
            webhook_url_method: 'POST',
            client_state: callId,
          }),
        }
      );

      const telnyxCallId = data.data?.id;

      const callState: TelnyxCallState = {
        callId,
        telnyxCallId,
        from,
        to,
        direction: 'outbound',
        state: 'queued',
        startedAt: new Date(),
      };

      this.callCache.set(callId, callState);

      console.log(`📞 Telnyx: Initiating outbound call ${callId} (${telnyxCallId}) from ${from} to ${to}`);

      return {
        callId,
        from,
        to,
        direction: 'outbound',
        state: 'queued',
        startedAt: new Date(),
      };
    } catch (error) {
      console.error(`❌ Telnyx: Failed to initiate outbound call:`, error);
      throw error;
    }
  }

  // Get recording for a completed call
  async getRecording(callId: string): Promise<{ recordingId: string; url: string } | null> {
    const call = this.callCache.get(callId);
    if (!call || !call.recordingId) return null;

    try {
      // In production, would fetch recording from Telnyx storage
      const response = await fetch(`${this.apiUrl}/recordings/${call.recordingId}`, {
        method: 'GET',
        headers: this.getAuthHeader(),
      });

      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as any;

      console.log(`🎙️  Telnyx: Fetching recording ${call.recordingId} for call ${callId}`);

      return {
        recordingId: call.recordingId,
        url: data.data?.download_url || `https://api.telnyx.com/v2/recordings/${call.recordingId}/download`,
      };
    } catch (error) {
      console.error(`❌ Telnyx: Failed to get recording for ${callId}:`, error);
      return null;
    }
  }

  // Get transcript for a recorded call
  async getTranscript(callId: string): Promise<{ transcriptId: string; text: string } | null> {
    const call = this.callCache.get(callId);
    if (!call || !call.transcriptId) return null;

    try {
      // In production, would fetch transcript from Telnyx API or database
      console.log(`📝 Telnyx: Fetching transcript ${call.transcriptId} for call ${callId}`);

      return {
        transcriptId: call.transcriptId,
        text: '[Transcript would be fetched from Telnyx or database]',
      };
    } catch (error) {
      console.error(`❌ Telnyx: Failed to get transcript for ${callId}:`, error);
      return null;
    }
  }

  // Mark call as recorded
  recordingStarted(callId: string, recordingId: string): void {
    const call = this.callCache.get(callId);
    if (call) {
      call.recordingId = recordingId;
      this.callCache.set(callId, call);
      console.log(`🎙️  Telnyx: Recording started for call ${callId} (ID: ${recordingId})`);
    }
  }

  // Mark call as having a transcript
  transcriptReady(callId: string, transcriptId: string): void {
    const call = this.callCache.get(callId);
    if (call) {
      call.transcriptId = transcriptId;
      this.callCache.set(callId, call);
      console.log(`📝 Telnyx: Transcript ready for call ${callId} (ID: ${transcriptId})`);
    }
  }

  /**
   * Advanced Call Features
   */

  // Hold a call
  async holdCall(callId: string): Promise<void> {
    const call = this.callCache.get(callId);
    if (!call) throw new Error(`Call ${callId} not found`);
    if (!call.telnyxCallId) throw new Error(`Telnyx call ID not set for ${callId}`);

    try {
      await this.fetchWithRetry(
        `${this.apiUrl}/calls/${call.telnyxCallId}/actions/hold`,
        {
          method: 'POST',
          headers: this.getAuthHeader(),
        }
      );

      call.isOnHold = true;
      call.state = 'held';
      this.callCache.set(callId, call);

      console.log(`⏸️  Telnyx: Call ${callId} placed on hold`);
    } catch (error) {
      console.error(`❌ Telnyx: Failed to hold call ${callId}:`, error);
      throw error;
    }
  }

  // Resume a held call
  async resumeCall(callId: string): Promise<void> {
    const call = this.callCache.get(callId);
    if (!call) throw new Error(`Call ${callId} not found`);
    if (!call.telnyxCallId) throw new Error(`Telnyx call ID not set for ${callId}`);

    try {
      await this.fetchWithRetry(
        `${this.apiUrl}/calls/${call.telnyxCallId}/actions/unhold`,
        {
          method: 'POST',
          headers: this.getAuthHeader(),
        }
      );

      call.isOnHold = false;
      call.state = 'in-progress';
      this.callCache.set(callId, call);

      console.log(`▶️  Telnyx: Call ${callId} resumed`);
    } catch (error) {
      console.error(`❌ Telnyx: Failed to resume call ${callId}:`, error);
      throw error;
    }
  }

  // Send call to voicemail
  async sendToVoicemail(callId: string): Promise<void> {
    const call = this.callCache.get(callId);
    if (!call) throw new Error(`Call ${callId} not found`);
    if (!call.telnyxCallId) throw new Error(`Telnyx call ID not set for ${callId}`);

    try {
      const response = await this.fetchWithRetry<any>(
        `${this.apiUrl}/calls/${call.telnyxCallId}/actions/transfer`,
        {
          method: 'POST',
          headers: this.getAuthHeader(),
          body: JSON.stringify({
            to: `*611`, // Voicemail code
            ringless: true,
          }),
        }
      );

      call.voicemailUrl = response.data?.voicemail_url;
      call.state = 'completed';
      this.callCache.set(callId, call);

      console.log(`📧 Telnyx: Call ${callId} sent to voicemail`);
    } catch (error) {
      console.error(`❌ Telnyx: Failed to send call to voicemail:`, error);
      throw error;
    }
  }

  // Detect and store DTMF input
  recordDTMF(callId: string, digits: string): void {
    const call = this.callCache.get(callId);
    if (call) {
      call.dtmfDigits = (call.dtmfDigits || '') + digits;
      this.callCache.set(callId, call);
      console.log(`🔢 Telnyx: DTMF input for call ${callId}: ${digits} (total: ${call.dtmfDigits})`);
    }
  }

  // Get accumulated DTMF input
  getDTMFInput(callId: string): string | undefined {
    const call = this.callCache.get(callId);
    return call?.dtmfDigits;
  }

  // Create conference call
  async createConference(callId: string, conferenceId: string): Promise<void> {
    const call = this.callCache.get(callId);
    if (!call) throw new Error(`Call ${callId} not found`);
    if (!call.telnyxCallId) throw new Error(`Telnyx call ID not set for ${callId}`);

    try {
      await this.fetchWithRetry(
        `${this.apiUrl}/conferences`,
        {
          method: 'POST',
          headers: this.getAuthHeader(),
          body: JSON.stringify({
            name: conferenceId,
            beep_on_enter: true,
            beep_on_exit: true,
          }),
        }
      );

      call.conferenceId = conferenceId;
      this.callCache.set(callId, call);

      console.log(`🤝 Telnyx: Conference ${conferenceId} created for call ${callId}`);
    } catch (error) {
      console.error(`❌ Telnyx: Failed to create conference:`, error);
      throw error;
    }
  }

  // Add participant to conference
  async addToConference(callId: string, conferenceId: string): Promise<void> {
    const call = this.callCache.get(callId);
    if (!call) throw new Error(`Call ${callId} not found`);
    if (!call.telnyxCallId) throw new Error(`Telnyx call ID not set for ${callId}`);

    try {
      await this.fetchWithRetry(
        `${this.apiUrl}/conferences/${conferenceId}/participants`,
        {
          method: 'POST',
          headers: this.getAuthHeader(),
          body: JSON.stringify({
            call_control_id: call.telnyxCallId,
            mute: false,
          }),
        }
      );

      call.conferenceId = conferenceId;
      this.callCache.set(callId, call);

      console.log(`🤝 Telnyx: Call ${callId} added to conference ${conferenceId}`);
    } catch (error) {
      console.error(`❌ Telnyx: Failed to add call to conference:`, error);
      throw error;
    }
  }

  // Mute/unmute in conference
  async muteParticipant(callId: string, conferenceId: string, mute: boolean): Promise<void> {
    const call = this.callCache.get(callId);
    if (!call) throw new Error(`Call ${callId} not found`);
    if (!call.telnyxCallId) throw new Error(`Telnyx call ID not set for ${callId}`);

    try {
      await this.fetchWithRetry(
        `${this.apiUrl}/conferences/${conferenceId}/participants/${call.telnyxCallId}`,
        {
          method: 'PATCH',
          headers: this.getAuthHeader(),
          body: JSON.stringify({
            mute,
          }),
        }
      );

      console.log(`🔇 Telnyx: Call ${callId} ${mute ? 'muted' : 'unmuted'} in conference`);
    } catch (error) {
      console.error(`❌ Telnyx: Failed to mute/unmute participant:`, error);
      throw error;
    }
  }
}
