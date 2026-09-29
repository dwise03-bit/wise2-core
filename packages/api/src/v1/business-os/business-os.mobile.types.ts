/** iOS-compatible mobile facade DTOs (match BusinessOSModels.swift) */

export type MobileCrmStage = 'lead' | 'qualified' | 'proposal' | 'won' | 'lost';

export interface MobileBusinessLeadDto {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string | null;
  stage: MobileCrmStage;
  estimatedOpportunity: number;
  claimedBy: string | null;
  claimedAt: string | null;
  source: string;
}

export interface MobileBusinessOpportunityDto {
  id: string;
  title: string;
  amount: number;
  stage: MobileCrmStage;
}

export interface MobileLeadClaimResultDto {
  leadId: string;
  claimedBy: string;
  claimedAt: string;
  status: 'claimed' | 'already_claimed';
}

export interface MobileBusinessCustomerDto {
  id: string;
  businessName: string;
  contactName: string;
  mrr: number;
  status: string;
}

export interface MobileBusinessProjectDto {
  id: string;
  title: string;
  status: string;
}

export interface MobileBusinessJobDto {
  id: string;
  title: string;
  status: string;
}

export interface MobileAgentJobDto {
  id: string;
  summary: string;
  role: string;
  status: string;
  requiresApproval: boolean;
}

export interface MobileConversationDto {
  id: string;
  contactName: string;
  channel: 'sms' | 'email' | 'voice' | 'chat';
  preview: string;
  humanTakeover: boolean;
}

export interface MobileCloudInventoryDto {
  apps: string[];
  services: string[];
  controlBridgeConfigured: boolean;
}

export interface MobileCloudHealthDto {
  status: string;
  components: Array<{ name: string; status: string }>;
}

export interface MobileCloudOperationRequestDto {
  operation: string;
  target?: string;
}

export interface MobileCloudOperationResultDto {
  operation: string;
  target?: string | null;
}

export interface MobileHvacJobDto {
  id: string;
  customerName: string;
  status: string;
  technician: string | null;
}

export interface MobileHvacDraftDto {
  id: string;
  idempotencyKey: string;
  customerId: string | null;
  notes: string;
  synced: boolean;
  createdAt: string;
}

export interface MobileStudioSummaryDto {
  campaigns: number;
  attributedLeads: number;
  attributedRevenue: number;
  providerAvailable: boolean;
}

export interface MobileFinanceSummaryDto {
  revenueToday: number;
  revenueMonth: number;
  unpaidInvoiceCount: number;
  providerAvailable: boolean;
  message: string | null;
}

export interface MobileBusinessCapabilitiesDto {
  trading: boolean;
  cloud: boolean;
  hvac: boolean;
}

export const PROSPECT_TO_MOBILE_STAGE: Record<string, MobileCrmStage> = {
  NEW: 'lead',
  CONTACTED: 'lead',
  QUALIFIED: 'qualified',
  AUDIT_SCHEDULED: 'qualified',
  AUDIT_COMPLETE: 'proposal',
  PROPOSAL_SENT: 'proposal',
  WON: 'won',
  LOST: 'lost',
};
