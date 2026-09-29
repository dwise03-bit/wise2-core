/**
 * Revenue OS workflows (Phase 6).
 *
 * Long-running work never executes inside an HTTP request handler. Each
 * workflow is a durable BullMQ job so a deploy, restart or provider timeout
 * cannot silently drop a booked job or a follow-up.
 */

export const REVENUE_OS_QUEUE = 'revenue-os';

export enum WorkflowKey {
  SPEED_TO_LEAD = 'speed-to-lead',
  INBOUND_RECEPTIONIST = 'inbound-receptionist',
  ESTIMATE_RECOVERY = 'estimate-recovery',
  REVIEW_REQUEST = 'review-request',
  MEMBERSHIP_OFFER = 'membership-offer',
  REACTIVATION = 'reactivation',
}

/** Every job carries its tenant; workers scope all queries by it. */
export interface BaseJob {
  tenantId: string;
}

export interface SpeedToLeadJob extends BaseJob {
  leadId: string;
  /** Retry number within the configured cadence. */
  attempt?: number;
}

export interface InboundReceptionistJob extends BaseJob {
  conversationId: string;
}

export interface EstimateRecoveryJob extends BaseJob {
  estimateId: string;
}

export interface ReviewRequestJob extends BaseJob {
  serviceJobId: string;
}

export interface MembershipOfferJob extends BaseJob {
  customerId: string;
  serviceJobId?: string;
}

export interface ReactivationJob extends BaseJob {
  /** Cohort window in days since last service. */
  dormantDays: number;
}

export type WorkflowJob =
  | SpeedToLeadJob
  | InboundReceptionistJob
  | EstimateRecoveryJob
  | ReviewRequestJob
  | MembershipOfferJob
  | ReactivationJob;

/**
 * Speed-to-lead retry cadence in minutes. Contacting a new lead within
 * minutes is the single biggest driver of booking rate, so the first retries
 * are deliberately aggressive and then taper.
 */
export const SPEED_TO_LEAD_CADENCE_MINUTES = [0, 5, 30, 120, 1440];

/** Days after an estimate is sent before recovery follow-up begins. */
export const ESTIMATE_RECOVERY_DELAY_DAYS = 3;
