import { TelephonyProvider, CallInfo, CallDirection, CallState } from './types';

interface TelnyxConfig {
  apiKey: string;
  apiUrl?: string;
  webhookSecret?: string;
  phoneNumber: string;
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
}

export class TelnyxProvider implements TelephonyProvider {
  readonly name = 'Telnyx';
  private config: TelnyxConfig;
  private callCache = new Map<string, TelnyxCallState>();
  private apiUrl: string;

  constructor(config: TelnyxConfig) {
    this.config = config;
    this.apiUrl = config.apiUrl || 'https://api.telnyx.com/v2';
  }

  private getAuthHeader(): { Authorization: string } {
    return {
      Authorization: `Bearer ${this.config.apiKey}`,
    };
  }

  async acceptCall(callId: string): Promise<void> {
    const call = this.callCache.get(callId);
    if (!call) throw new Error(`Call ${callId} not found`);

    if (!call.telnyxCallId) {
      throw new Error(`Telnyx call ID not set for ${callId}`);
    }

    try {
      // In production, would use Telnyx Call Control API to answer the call
      const response = await fetch(`${this.apiUrl}/calls/${call.telnyxCallId}/actions/answer`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: JSON.stringify({
          client_state: callId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Telnyx API error: ${response.statusText}`);
      }

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
      // In production, would use Telnyx Call Control API to reject/hangup
      const response = await fetch(`${this.apiUrl}/calls/${call.telnyxCallId}/actions/hangup`, {
        method: 'POST',
        headers: this.getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error(`Telnyx API error: ${response.statusText}`);
      }

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
      // In production, this would establish media stream with Telnyx WebRTC/RTP
      // Using the Call Control API to route audio to the WebSocket
      const response = await fetch(`${this.apiUrl}/calls/${call.telnyxCallId}/actions/playback_start`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: JSON.stringify({
          audio_url: 'file:///dev/null', // Placeholder - real audio would be streamed via WebSocket
          client_state: callId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Telnyx API error: ${response.statusText}`);
      }

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
      // Use Telnyx Call Control API to transfer the call
      const response = await fetch(`${this.apiUrl}/calls/${call.telnyxCallId}/actions/transfer`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: JSON.stringify({
          to: destination,
          client_state: callId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Telnyx API error: ${response.statusText}`);
      }

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
      // Use Telnyx Call Control API to hangup the call
      const response = await fetch(`${this.apiUrl}/calls/${call.telnyxCallId}/actions/hangup`, {
        method: 'POST',
        headers: this.getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error(`Telnyx API error: ${response.statusText}`);
      }

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
      // Use Telnyx Outbound Call API to initiate
      const response = await fetch(`${this.apiUrl}/calls`, {
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
      });

      if (!response.ok) {
        throw new Error(`Telnyx API error: ${response.statusText}`);
      }

      const data = (await response.json()) as any;
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
}
