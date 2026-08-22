import { TelephonyProvider, CallInfo, CallDirection, CallState } from './types';

interface TwilioConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}

export class TwilioProvider implements TelephonyProvider {
  readonly name = 'Twilio';
  private config: TwilioConfig;
  private callCache = new Map<string, CallInfo>();

  constructor(config: TwilioConfig) {
    this.config = config;
  }

  async acceptCall(callId: string): Promise<void> {
    const call = this.callCache.get(callId);
    if (!call) throw new Error(`Call ${callId} not found`);

    // Mark as answered
    call.state = 'answered';
    call.connectedAt = new Date();
    this.callCache.set(callId, call);

    console.log(`✅ Accepted call ${callId} from ${call.from}`);
  }

  async rejectCall(callId: string): Promise<void> {
    const call = this.callCache.get(callId);
    if (!call) throw new Error(`Call ${callId} not found`);

    call.state = 'failed';
    call.endedAt = new Date();
    this.callCache.set(callId, call);

    console.log(`❌ Rejected call ${callId}`);
  }

  async startMediaStream(callId: string, wsUrl: string): Promise<void> {
    const call = this.callCache.get(callId);
    if (!call) throw new Error(`Call ${callId} not found`);

    // Start WebSocket media stream for bidirectional audio
    console.log(`🎙️  Starting media stream for ${callId} at ${wsUrl}`);

    // In production, this would establish a WebSocket connection
    // to Twilio's media stream for real-time audio processing
  }

  async transferCall(callId: string, destination: string): Promise<void> {
    const call = this.callCache.get(callId);
    if (!call) throw new Error(`Call ${callId} not found`);

    call.state = 'transferring';
    this.callCache.set(callId, call);

    console.log(`📞 Transferring call ${callId} to ${destination}`);

    // In production, this would use Twilio's transfer API
    // to route the call to the destination number/extension
  }

  async endCall(callId: string): Promise<void> {
    const call = this.callCache.get(callId);
    if (!call) throw new Error(`Call ${callId} not found`);

    call.state = 'completed';
    call.endedAt = new Date();
    call.duration = call.endedAt.getTime() - call.startedAt.getTime();

    this.callCache.set(callId, call);
    console.log(`✅ Call ${callId} ended after ${call.duration}ms`);
  }

  async getCall(callId: string): Promise<CallInfo> {
    const call = this.callCache.get(callId);
    if (!call) throw new Error(`Call ${callId} not found`);
    return call;
  }

  // Helper to register incoming call
  async incomingCall(
    callId: string,
    from: string,
    to: string
  ): Promise<CallInfo> {
    const callInfo: CallInfo = {
      callId,
      from,
      to,
      direction: 'inbound',
      state: 'ringing',
      startedAt: new Date(),
    };

    this.callCache.set(callId, callInfo);
    console.log(`📞 Incoming call ${callId} from ${from}`);

    return callInfo;
  }
}
