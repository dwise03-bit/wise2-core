export const CONVERSATION_STATUSES = [
  'new',
  'needs_review',
  'callback_due',
  'scheduled',
  'dispatched',
  'quoted',
  'completed',
  'deferred',
] as const;

export type ConversationStatus = (typeof CONVERSATION_STATUSES)[number];

export const ACTION_STATUSES = [
  'draft',
  'awaiting_confirmation',
  'simulated_success',
  'canceled',
  'failed',
] as const;

export type ActionStatus = (typeof ACTION_STATUSES)[number];

export const ACTION_TYPES = ['call', 'text', 'book', 'dispatch', 'quote', 'open_crm'] as const;
export type ActionType = (typeof ACTION_TYPES)[number];

export const CHANNELS = ['phone', 'sms', 'web', 'email'] as const;
export type Channel = (typeof CHANNELS)[number];

export const PRIORITY_BANDS = ['critical', 'high', 'medium', 'low'] as const;
export type PriorityBand = (typeof PRIORITY_BANDS)[number];

export const QUEUE_FILTERS = ['all', 'emergency', 'needs_action', 'scheduled', 'completed'] as const;
export type QueueFilter = (typeof QUEUE_FILTERS)[number];

export const RULES_VERSION = 'priority-rules-v1';

export type DetectedSignals = {
  immediateSafety: boolean;
  completeLossEssential: boolean;
  vulnerableOccupant: boolean;
  activePropertyDamage: boolean;
  existingCustomer: boolean;
  repeatFailure: boolean;
  sameDayAvailability: boolean;
  highOpportunityPoints: number;
  routineAdministrative: boolean;
  alreadyScheduledOrResolved: boolean;
};

export type Conversation = {
  id: string;
  channel: Channel;
  direction: 'inbound' | 'outbound';
  receivedAt: string;
  transcript: TranscriptLine[];
  summary: string;
  customerStatement: string;
  status: ConversationStatus;
  priorityOverride: number | null;
  customerId: string;
  issue: string;
  detectedSignals: DetectedSignals;
};

export type TranscriptLine = {
  speaker: 'customer' | 'agent' | 'system';
  at: string;
  text: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  flags: string[];
  preferredContactMethod: 'phone' | 'sms' | 'email';
};

export type Location = {
  id: string;
  customerId: string;
  address: string;
  indoorCondition: string | null;
  accessNotes: string | null;
};

export type Equipment = {
  id: string;
  locationId: string;
  category: string;
  manufacturer: string | null;
  model: string | null;
  serial: string | null;
  ageYears: number | null;
  warrantyStatus: string | null;
};

export type ServiceEvent = {
  id: string;
  customerId: string;
  equipmentId: string | null;
  occurredAt: string;
  type: string;
  summary: string;
  outcome: string;
};

export type Opportunity = {
  conversationId: string;
  lowEstimate: number;
  highEstimate: number;
  confidence: 'low' | 'medium' | 'high';
};

export type PriorityFactor = {
  code: string;
  label: string;
  points: number;
};

export type PriorityAssessment = {
  score: number;
  band: PriorityBand;
  factors: PriorityFactor[];
  evaluatedAt: string;
  rulesVersion: string;
};

export type RecommendedAction = {
  type: ActionType;
  label: string;
  rationale: string;
  urgency: 'immediate' | 'today' | 'routine';
  payloadPreview: Record<string, string>;
};

export type ActionAttempt = {
  id: string;
  conversationId: string;
  type: ActionType;
  status: ActionStatus;
  requestedAt: string;
  confirmedAt: string | null;
  result: string | null;
  destination: string;
  details: string;
};

export type AuditEvent = {
  id: string;
  actor: string;
  action: string;
  objectType: string;
  objectId: string;
  timestamp: string;
  metadata: Record<string, string>;
};

export type Technician = {
  id: string;
  name: string;
  trade: string;
  availableToday: boolean;
};

export type QueueItem = {
  conversation: Conversation;
  customer: Customer;
  location: Location | null;
  equipment: Equipment | null;
  opportunity: Opportunity | null;
  assessment: PriorityAssessment;
  recommended: RecommendedAction;
  rank: number;
};

export type ConversationDetail = QueueItem & {
  serviceHistory: ServiceEvent[];
  actions: ActionAttempt[];
  audit: AuditEvent[];
};

export type CommandMetrics = {
  urgentItems: number;
  unbookedOpportunities: number;
  callbacksDue: number;
  scheduledValueCents: number;
};

export type ActionReview = {
  conversationId: string;
  type: ActionType;
  customerName: string;
  destination: string;
  proposedAction: string;
  details: string;
  simulationNotice: string;
};
