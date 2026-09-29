/**
 * Provider abstraction (Phase 11).
 *
 * Revenue OS is not wired to any single vendor. Each capability is an
 * interface; a concrete provider is selected from configuration at runtime.
 * When credentials are absent the mock provider is used and the capability
 * reports NEEDS_CONFIG — it never fabricates vendor credentials and never
 * pretends an action succeeded.
 */

export type ProviderStatus = 'READY' | 'NEEDS_CONFIG' | 'ERROR';

export interface ProviderHealth {
  name: string;
  status: ProviderStatus;
  /** Which env vars are missing, so the UI can say exactly what to set. */
  missing?: string[];
  detail?: string;
}

export interface SendSmsInput {
  to: string;
  body: string;
  tenantId: string;
}

export interface SendSmsResult {
  /** False when the provider is not configured — never a fabricated success. */
  sent: boolean;
  externalId?: string;
  status: ProviderStatus;
  detail?: string;
}

export interface PlaceCallInput {
  to: string;
  tenantId: string;
  script?: string;
}

export interface PlaceCallResult {
  placed: boolean;
  externalId?: string;
  status: ProviderStatus;
  detail?: string;
}

export interface AppointmentSlot {
  start: Date;
  end: Date;
  technician?: string;
}

export interface MessagingProvider {
  readonly name: string;
  health(): ProviderHealth;
  sendSms(input: SendSmsInput): Promise<SendSmsResult>;
}

export interface TelephonyProvider {
  readonly name: string;
  health(): ProviderHealth;
  placeCall(input: PlaceCallInput): Promise<PlaceCallResult>;
  /** Verifies an inbound webhook signature. */
  verifySignature(rawBody: string, signature: string | undefined): boolean;
}

export interface CalendarProvider {
  readonly name: string;
  health(): ProviderHealth;
  /**
   * Real availability only. An agent must never invent a slot, so an
   * unconfigured provider returns an empty list rather than plausible times.
   */
  availableSlots(tenantId: string, from: Date, to: Date): Promise<AppointmentSlot[]>;
}

export interface LeadSourceProvider {
  readonly name: string;
  health(): ProviderHealth;
  verifySignature(rawBody: string, signature: string | undefined): boolean;
}

export interface ReviewProvider {
  readonly name: string;
  health(): ProviderHealth;
  /** Returns null when no tenant review link is configured. */
  reviewLink(tenantId: string): Promise<string | null>;
}
