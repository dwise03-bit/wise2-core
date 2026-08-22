// Provider-neutral interfaces for Wise2 AI Phone

export type CallDirection = 'inbound' | 'outbound';
export type CallState = 'queued' | 'ringing' | 'answered' | 'in-progress' | 'transferring' | 'completed' | 'failed';
export type TransferStatus = 'pending' | 'initiated' | 'connected' | 'failed' | 'declined';
export type BookingStatus = 'pending' | 'confirmed' | 'scheduled' | 'completed' | 'cancelled' | 'no-show';
export type LeadStage = 'new' | 'qualified' | 'booked' | 'contacted' | 'lost' | 'nurture';
export type ConsentStatus = 'granted' | 'denied' | 'expired' | 'revoked';
export type RecordingStatus = 'none' | 'pending' | 'recorded' | 'transcribed' | 'redacted';

// Telephony Provider Interface
export interface TelephonyProvider {
  readonly name: string;

  // Accept inbound call
  acceptCall(callId: string): Promise<void>;

  // Reject inbound call
  rejectCall(callId: string): Promise<void>;

  // Start media stream
  startMediaStream(callId: string, wsUrl: string): Promise<void>;

  // Transfer call to number/extension
  transferCall(callId: string, destination: string): Promise<void>;

  // End call
  endCall(callId: string): Promise<void>;

  // Get call info
  getCall(callId: string): Promise<CallInfo>;
}

export interface CallInfo {
  callId: string;
  from: string;
  to: string;
  direction: CallDirection;
  state: CallState;
  startedAt: Date;
  connectedAt?: Date;
  endedAt?: Date;
  duration?: number;
}

// Voice/AI Model Provider Interface
export interface VoiceModelProvider {
  readonly name: string;

  // Stream audio and get response
  chat(
    sessionId: string,
    systemPrompt: string,
    messageHistory: ChatMessage[],
    tools: ToolDefinition[]
  ): Promise<AIResponse>;

  // Transcribe audio
  transcribe(audioBuffer: Buffer): Promise<string>;

  // Text to speech
  synthesize(text: string): Promise<Buffer>;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface AIResponse {
  text: string;
  toolCalls: ToolCall[];
  confidence: number;
  stopReason: 'stop_sequence' | 'tool_use' | 'max_tokens';
}

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

// CRM Provider Interface
export interface CRMProvider {
  readonly name: string;

  // Customer operations
  lookupCustomer(phone: string): Promise<Customer | null>;
  createCustomer(data: Partial<Customer>): Promise<Customer>;
  updateCustomer(id: string, data: Partial<Customer>): Promise<Customer>;
  getCustomer(id: string): Promise<Customer | null>;

  // Lead operations
  createLead(data: Partial<Lead>): Promise<Lead>;
  updateLead(id: string, data: Partial<Lead>): Promise<Lead>;

  // Call operations
  createCall(data: Partial<Call>): Promise<Call>;
  updateCall(id: string, data: Partial<Call>): Promise<Call>;
  getCall(id: string): Promise<Call | null>;

  // Booking operations
  createBooking(data: Partial<Booking>): Promise<Booking>;
  updateBooking(id: string, data: Partial<Booking>): Promise<Booking>;
  getAvailability(serviceType: string, date: Date): Promise<TimeSlot[]>;

  // Consent operations
  checkConsent(phone: string, purpose: string): Promise<ConsentEvent | null>;
  recordConsent(data: Partial<ConsentEvent>): Promise<ConsentEvent>;
}

// Scheduler Provider Interface
export interface SchedulerProvider {
  readonly name: string;

  // Get available slots
  getAvailability(serviceType: string, date: Date, duration: number): Promise<TimeSlot[]>;

  // Create booking
  createBooking(data: SchedulingRequest): Promise<ScheduledBooking>;

  // Cancel booking
  cancelBooking(id: string): Promise<void>;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  technician?: string;
}

export interface SchedulingRequest {
  serviceType: string;
  location: string;
  startTime: Date;
  endTime: Date;
  notes?: string;
}

export interface ScheduledBooking {
  id: string;
  confirmedAt: Date;
  confirmationNumber: string;
}

// Notification Provider Interface
export interface NotificationProvider {
  readonly name: string;

  // Send SMS
  sendSMS(phoneNumber: string, message: string): Promise<string>;

  // Send email
  sendEmail(email: string, subject: string, body: string): Promise<string>;

  // Send templated notification
  sendNotification(template: string, data: Record<string, unknown>): Promise<string>;
}

// Core Domain Models
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
  stage: LeadStage;
  priority: 'low' | 'medium' | 'high';
  estimatedValue?: number;
  ownerId?: string;
  createdAt: Date;
}

export interface Call {
  id: string;
  tenantId: string;
  providerId: string;
  direction: CallDirection;
  fromNumber: string;
  toNumber: string;
  startedAt: Date;
  connectedAt?: Date;
  endedAt?: Date;
  disposition: string;
  transferStatus?: TransferStatus;
  consentSnapshotId?: string;
  recordingStatus: RecordingStatus;
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
  status: BookingStatus;
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
  status: ConsentStatus;
  source: string;
  capturedAt: Date;
  expiresAt?: Date;
}

// Tool Definitions
export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  requiresConfirmation?: boolean;
  allowedFor?: string[];
}

// Session Context
export interface CallSession {
  sessionId: string;
  callId: string;
  tenantId: string;
  customerId?: string;
  state: CallState;
  startedAt: Date;
  transcript: ChatMessage[];
  tools: ToolDefinition[];
  context: SessionContext;
  metadata: Record<string, unknown>;
}

export interface SessionContext {
  intent?: string;
  isExistingCustomer?: boolean;
  requiresTransfer?: boolean;
  transferReason?: string;
  bookingInProgress?: Partial<Booking>;
  leadData?: Partial<Lead>;
  verificationLevel: 'unverified' | 'name_phone' | 'full';
  attemptCount: number;
  silenceCount: number;
}

// Tool Results
export interface ToolResult {
  toolName: string;
  success: boolean;
  output?: unknown;
  error?: string;
  auditId: string;
}
