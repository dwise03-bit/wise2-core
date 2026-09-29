/**
 * WISE² Telephony Provider Interface
 * Provider-neutral abstraction for phone service carriers
 * Implementations: Twilio, Telnyx, SignalWire, Google Voice, etc.
 */

export interface CallInitiationOptions {
  toNumber: string;
  fromNumber?: string;
  webhookUrl?: string;
  recordingEnabled?: boolean;
  timeout?: number; // ms
  metadata?: Record<string, any>;
}

export interface CallAnswerOptions {
  callSid: string;
  playTone?: boolean;
  recordingEnabled?: boolean;
}

export interface CallTransferOptions {
  callSid: string;
  toNumber: string;
  method?: 'BLIND' | 'ATTENDED';
}

export interface CallPlayAudioOptions {
  callSid: string;
  audioUrl: string;
  loop?: boolean;
}

export interface CallStreamAudioOptions {
  callSid: string;
  audioStream: NodeJS.ReadableStream;
  contentType?: string; // audio/wav, audio/ulaw, etc.
  sampleRate?: number; // 8000, 16000, etc.
}

export interface CallSendDTMFOptions {
  callSid: string;
  digits: string;
  playDuration?: number; // ms per digit
}

export interface CallStatus {
  callSid: string;
  status: 'initiated' | 'ringing' | 'answered' | 'in-progress' | 'held' | 'transferring' | 'disconnected' | 'failed';
  duration?: number; // seconds
  recordingUrl?: string;
  error?: string;
}

export interface CallRecording {
  recordingUrl: string;
  duration: number; // seconds
  size: number; // bytes
  contentType: string; // audio/wav, audio/mp3, etc.
}

export interface TelephonyProviderConfig {
  accountId: string;
  apiKey: string;
  authToken?: string;
  webhookUrl?: string;
  webhookSecret?: string;
  inboundNumber?: string;
  outboundNumber?: string;
}

export interface ProviderHealthCheck {
  isConnected: boolean;
  lastChecked: Date;
  error?: string;
  accountStatus?: string;
}

/**
 * TelephonyProvider Interface
 * All providers must implement these core methods
 */
export interface ITelephonyProvider {
  // Provider info
  getName(): string;
  isConfigured(): boolean;
  isConnected(): Promise<boolean>;
  getConfig(): TelephonyProviderConfig;
  setConfig(config: Partial<TelephonyProviderConfig>): Promise<void>;

  // Inbound management
  setWebhookUrl(url: string, secret?: string): Promise<void>;
  handleWebhook(body: any, signature?: string): Promise<any>;

  // Call management
  initiateCall(options: CallInitiationOptions): Promise<string>; // returns callSid
  answerCall(options: CallAnswerOptions): Promise<void>;
  endCall(callSid: string): Promise<void>;
  holdCall(callSid: string): Promise<void>;
  resumeCall(callSid: string): Promise<void>;
  transferCall(options: CallTransferOptions): Promise<void>;

  // Audio
  playAudio(options: CallPlayAudioOptions): Promise<void>;
  streamAudio(options: CallStreamAudioOptions): Promise<void>;
  sendDTMF(options: CallSendDTMFOptions): Promise<void>;

  // Status & Recording
  getCallStatus(callSid: string): Promise<CallStatus>;
  getRecording(callSid: string): Promise<CallRecording | null>;
  deleteRecording(recordingUrl: string): Promise<void>;

  // Health
  healthCheck(): Promise<ProviderHealthCheck>;

  // SMS (optional, but part of unified interface)
  sendSMS?(toNumber: string, message: string, fromNumber?: string): Promise<string>;
  receiveSMS?(body: any): Promise<any>;
}

/**
 * Factory for creating provider instances
 */
export type ProviderType = 'google-voice' | 'twilio' | 'telnyx' | 'signalwire';

export interface IProviderFactory {
  createProvider(type: ProviderType, config: TelephonyProviderConfig): Promise<ITelephonyProvider>;
  getProvider(type: ProviderType): ITelephonyProvider | null;
  listProviders(): ProviderType[];
}
