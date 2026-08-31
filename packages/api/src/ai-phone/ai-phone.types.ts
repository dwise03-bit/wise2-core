export interface AiPhoneHoursDay {
  open?: string;
  close?: string;
  closed?: boolean;
}

export type AiPhoneHours = Record<string, AiPhoneHoursDay>;

export interface AiPhoneConfigDto {
  enabled: boolean;
  phoneNumber: string | null;
  greeting: string;
  afterHoursMessage: string | null;
  businessHours: unknown;
  timezone: string;
  transferNumber: string | null;
  smsEnabled: boolean;
  voicemailEnabled: boolean;
  recordingEnabled: boolean;
  aiPersona: string;
}

export interface AiPhoneCallDto {
  id: string;
  callerNumber: string;
  callerName: string | null;
  inboundNumber: string | null;
  direction: string;
  status: string;
  durationSeconds: number | null;
  intent: string | null;
  outcome: string | null;
  summary: string | null;
  startedAt: string;
}

export interface AiPhoneDashboardDto {
  config: AiPhoneConfigDto;
  stats: {
    callsToday: number;
    totalCalls: number;
    avgDurationSeconds: number;
    leadsCaptured: number;
    aiActive: boolean;
  };
  recentCalls: AiPhoneCallDto[];
  capabilities: string[];
  poweredBy: string;
}

export interface UpdateAiPhoneConfigInput {
  enabled?: boolean;
  phoneNumber?: string | null;
  greeting?: string;
  afterHoursMessage?: string | null;
  businessHours?: AiPhoneHours;
  timezone?: string;
  transferNumber?: string | null;
  smsEnabled?: boolean;
  voicemailEnabled?: boolean;
  recordingEnabled?: boolean;
  aiPersona?: string;
}

export interface SimulateCallInput {
  fromNumber?: string;
  messages: string[];
}

export const DEFAULT_AI_PHONE_GREETING =
  "Thanks for calling. I'm the WISE² assistant. I can look up your account, book a visit, or take a message. How can I help you today?";

export const DEFAULT_AI_PHONE_AFTER_HOURS =
  "We've closed for the day. I can take a message, text you when we're back, or transfer you if this is urgent.";

export const DEFAULT_AI_PHONE_HOURS: AiPhoneHours = {
  mon: { open: '09:00', close: '17:00' },
  tue: { open: '09:00', close: '17:00' },
  wed: { open: '09:00', close: '17:00' },
  thu: { open: '09:00', close: '17:00' },
  fri: { open: '09:00', close: '17:00' },
  sat: { closed: true },
  sun: { closed: true },
};

export const AI_PHONE_CAPABILITIES = [
  'Answer inbound calls 24/7 with a custom greeting',
  'Identify existing customers from caller ID',
  'Capture leads and book appointments',
  'Send SMS follow-ups after the call',
  'Transfer urgent callers to a human',
  'Take after-hours voicemail',
];
