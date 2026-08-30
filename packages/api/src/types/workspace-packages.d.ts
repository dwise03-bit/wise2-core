declare module '@wise2/ai-phone' {
  export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: Date;
  }

  export interface ToolCall {
    id: string;
    name: string;
    input: Record<string, unknown>;
  }

  export interface ToolDefinition {
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
    requiresConfirmation?: boolean;
  }

  export interface AIResponse {
    text: string;
    toolCalls: ToolCall[];
    confidence: number;
    stopReason: 'stop_sequence' | 'tool_use' | 'max_tokens';
  }

  export interface TimeSlot {
    start: Date;
    end: Date;
    technician?: string;
  }

  export interface Customer {
    id: string;
    tenantId: string;
    fullName: string;
    primaryPhone: string;
    email?: string;
    preferredContactMethod: 'phone' | 'email' | 'sms';
    verificationLevel: 'unverified' | 'name_phone' | 'full';
    createdAt: Date;
    updatedAt: Date;
  }

  export interface Lead {
    id: string;
    customerId: string;
    source: 'inbound_call' | 'web' | 'email' | 'sms';
    intent: string;
    stage: 'new' | 'qualified' | 'booked' | 'contacted' | 'lost' | 'nurture';
    priority: 'low' | 'medium' | 'high';
    estimatedValue?: number;
    ownerId?: string;
    createdAt: Date;
  }

  export interface Call {
    id: string;
    tenantId: string;
    providerId: string;
    direction: 'inbound' | 'outbound';
    fromNumber: string;
    toNumber: string;
    startedAt: Date;
    connectedAt?: Date;
    endedAt?: Date;
    disposition: string;
    recordingStatus: 'none' | 'pending' | 'recorded' | 'transcribed' | 'redacted';
    transcriptStatus: 'pending' | 'available' | 'error';
    summary?: string;
    confidence: number;
    costEstimate: number;
    customerId?: string;
    leadId?: string;
  }

  export interface Booking {
    id: string;
    customerId: string;
    locationId: string;
    serviceType: string;
    startAt: Date;
    endAt: Date;
    status: 'pending' | 'confirmed' | 'scheduled' | 'completed' | 'cancelled' | 'no-show';
    sourceCallId?: string;
    technicianId?: string;
    confirmationNumber: string;
    createdAt: Date;
  }

  export interface ConsentEvent {
    id: string;
    customerId?: string;
    phone: string;
    channel: 'voice' | 'sms' | 'email';
    purpose: string;
    legalBasis: string;
    status: 'granted' | 'denied' | 'expired' | 'revoked';
    source: string;
    capturedAt: Date;
    expiresAt?: Date;
  }

  export interface CRMProvider {
    readonly name: string;
    lookupCustomer(phone: string): Promise<Customer | null>;
    createCustomer(data: Partial<Customer>): Promise<Customer>;
    updateCustomer(id: string, data: Partial<Customer>): Promise<Customer>;
    getCustomer(id: string): Promise<Customer | null>;
    createLead(data: Partial<Lead>): Promise<Lead>;
    updateLead(id: string, data: Partial<Lead>): Promise<Lead>;
    createCall(data: Partial<Call>): Promise<Call>;
    updateCall(id: string, data: Partial<Call>): Promise<Call>;
    getCall(id: string): Promise<Call | null>;
    createBooking(data: Partial<Booking>): Promise<Booking>;
    updateBooking(id: string, data: Partial<Booking>): Promise<Booking>;
    getAvailability(serviceType: string, date: Date): Promise<TimeSlot[]>;
    checkConsent(phone: string, purpose: string): Promise<ConsentEvent | null>;
    recordConsent(data: Partial<ConsentEvent>): Promise<ConsentEvent>;
  }

  export interface SchedulerProvider {
    readonly name: string;
    getAvailability(serviceType: string, date: Date, duration: number): Promise<TimeSlot[]>;
  }

  export interface VoiceModelProvider {
    readonly name: string;
    chat(
      sessionId: string,
      systemPrompt: string,
      messageHistory: ChatMessage[],
      tools: ToolDefinition[],
    ): Promise<AIResponse>;
    transcribe(audioBuffer: Buffer): Promise<string>;
    synthesize(text: string): Promise<Buffer>;
  }

  export class GoogleVoiceProvider {
    constructor(config: Record<string, unknown>);
    incomingCall(
      callId: string,
      from: string,
      to: string,
      googleCallId: string,
    ): Promise<unknown>;
    acceptCall(callId: string): Promise<void>;
    rejectCall(callId: string): Promise<void>;
    startMediaStream(callId: string, wsUrl: string): Promise<void>;
    endCall(callId: string): Promise<void>;
    getRecording(callId: string): Promise<{ url: string } | null>;
    getTranscript(callId: string): Promise<{ transcriptId: string } | null>;
  }

  export class CallSessionManager {
    createSession(
      callId: string,
      tenantId: string,
      tools: unknown[],
    ): { sessionId: string; callId: string; tenantId: string };
    getSession(sessionId: string): { sessionId: string; callId: string; context?: Record<string, unknown>; transcript?: ChatMessage[] } | undefined;
    getSessionByCallId(callId: string): { sessionId: string; callId: string; context?: Record<string, unknown>; transcript?: ChatMessage[] } | undefined;
    getSummary(sessionId: string): {
      messageCount?: number;
      toolsUsed?: unknown[];
      transcript?: ChatMessage[];
      context?: { intent?: string; requiresTransfer?: boolean; transferReason?: string };
      disposition?: string;
    } | null;
    endSession(sessionId: string, disposition: string): void;
    addMessage(sessionId: string, role: 'user' | 'assistant', content: string): void;
  }

  export class ToolRegistry {
    constructor(crm: CRMProvider, scheduler: SchedulerProvider);
    getTools(): ToolDefinition[];
  }

  export class VoiceOrchestrator {
    constructor(
      voiceModel: VoiceModelProvider,
      sessionManager: CallSessionManager,
      toolRegistry: ToolRegistry,
      options?: { systemPrompt?: string },
    );
    setSystemPrompt(prompt: string): void;
    handleConversationTurn(
      sessionId: string,
      userMessage: string,
    ): Promise<{ response: string; shouldTransfer: boolean }>;
  }

  export class SchedulerMock implements SchedulerProvider {
    readonly name: string;
    getAvailability(serviceType: string, date: Date, duration: number): Promise<TimeSlot[]>;
  }

  export class VoiceModelMock implements VoiceModelProvider {
    readonly name: string;
    chat(
      sessionId: string,
      systemPrompt: string,
      messageHistory: ChatMessage[],
      tools: ToolDefinition[],
    ): Promise<AIResponse>;
    transcribe(audioBuffer: Buffer): Promise<string>;
    synthesize(text: string): Promise<Buffer>;
  }

  export class OpenAIRealtimeProvider implements VoiceModelProvider {
    readonly name: string;
    constructor(config: { apiKey: string; model?: string; temperature?: number });
    chat(
      sessionId: string,
      systemPrompt: string,
      messageHistory: ChatMessage[],
      tools: ToolDefinition[],
    ): Promise<AIResponse>;
    transcribe(audioBuffer: Buffer): Promise<string>;
    synthesize(text: string): Promise<Buffer>;
  }

  export function createVoiceModel(apiKey?: string): VoiceModelProvider;
}

declare module '@wise2/db' {
  export { PrismaClient } from '@prisma/client';
  export const prisma: import('@prisma/client').PrismaClient;
}
