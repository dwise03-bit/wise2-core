// Revenue OS — shared types.
//
// These mirror the contract served by packages/api under /api/revenue-os/*.
// Every field is optional on the wire: the normalizers in `normalize.ts` are
// responsible for turning whatever actually arrives into these shapes without
// ever inventing a value. A missing number stays `null`, never 0-as-a-guess.

export type PipelineStage =
  | 'NEW'
  | 'CONTACTING'
  | 'QUALIFIED'
  | 'BOOKED'
  | 'ESTIMATE'
  | 'WON'
  | 'COMPLETED';

export const PIPELINE_STAGES: PipelineStage[] = [
  'NEW',
  'CONTACTING',
  'QUALIFIED',
  'BOOKED',
  'ESTIMATE',
  'WON',
  'COMPLETED',
];

export type AgentStatus = 'ONLINE' | 'PAUSED' | 'ERROR' | 'NEEDS_CONFIG';

export type AgentKey =
  | 'receptionist'
  | 'speed_to_lead'
  | 'booking'
  | 'recovery'
  | 'membership'
  | 'reviews'
  | 'reactivation';

export interface WorkforceAgent {
  key: AgentKey | string;
  name: string;
  status: AgentStatus;
  /** Free-text detail from the API (last run, error message, missing config). */
  detail: string | null;
  handledToday: number | null;
}

export interface Lead {
  id: string;
  customerName: string | null;
  serviceNeed: string | null;
  source: string | null;
  stage: PipelineStage | null;
  /** What the AI workforce has done / is doing with this lead. */
  aiStatus: string | null;
  aiAgent: string | null;
  opportunityValue: number | null;
  nextAction: string | null;
  nextActionAt: string | null;
  createdAt: string | null;
}

export interface PipelineColumn {
  stage: PipelineStage;
  count: number | null;
  value: number | null;
}

export interface Kpis {
  revenueToday: number | null;
  newLeads: number | null;
  booked: number | null;
  openEstimateValue: number | null;
  closeRate: number | null;
  roas: number | null;
}

export interface MarketingRoiRow {
  channel: string;
  spend: number | null;
  leads: number | null;
  bookedRevenue: number | null;
  soldRevenue: number | null;
  roas: number | null;
}

export type ActivityKind =
  | 'lead_created'
  | 'ai_contacted'
  | 'appointment_booked'
  | 'estimate_sent'
  | 'estimate_sold'
  | 'job_completed'
  | 'review_requested'
  | 'membership_sold'
  | 'customer_reactivated';

export interface ActivityItem {
  id: string;
  kind: ActivityKind | string;
  message: string;
  actor: string | null;
  value: number | null;
  at: string | null;
}

export interface AttributionResponse {
  kpis: Kpis;
  channels: MarketingRoiRow[];
  activity: ActivityItem[];
}
