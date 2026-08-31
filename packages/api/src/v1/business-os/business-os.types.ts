// ─── Core Dashboard & Command ─────────────────────────────────────────────────

export interface BusinessDashboardDto {
  revenueToday: number;
  revenueMonth: number;
  hotLeadCount: number;
  activeJobCount: number;
  unpaidInvoiceCount: number;
  criticalAlertCount: number;
}

export interface CommandResultDto {
  summary: string;
  module?: string;
}

export interface BusinessOperationDto<T> {
  operationId: string;
  status: string;
  message: string;
  auditEventId?: string | null;
  result?: T | null;
}

export const ALLOWED_COMMAND_INTENTS = [
  'show_hot_leads',
  'show_business_summary',
  'health_check',
] as const;

export type AllowedCommandIntent = (typeof ALLOWED_COMMAND_INTENTS)[number];

export const BLOCKED_COMMAND_CAPABILITIES = [
  'shell',
  'exec',
  'ssh',
  'run_command',
  'terminal',
] as const;

// ─── CRM ──────────────────────────────────────────────────────────────────────

export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'AUDIT_SCHEDULED'
  | 'AUDIT_COMPLETE'
  | 'PROPOSAL_SENT'
  | 'WON'
  | 'LOST';

export interface CrmStageDto {
  name: LeadStatus;
  count: number;
  totalValue: number;
}

export interface CrmPipelineDto {
  stages: CrmStageDto[];
  totalCount: number;
  totalValue: number;
  wonValue: number;
  conversionRate: number;
}

export interface LeadDto {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  status: LeadStatus;
  estimatedValue: number;
  leadSource: string;
  claimedBy?: string | null;
  createdAt: string;
}

export interface LeadClaimDto {
  leadId: string;
  claimedBy: string;
  claimedAt: string;
}

export interface LeadListDto {
  leads: LeadDto[];
  total: number;
  limit: number;
  offset: number;
}

// ─── Customers ────────────────────────────────────────────────────────────────

export interface CustomerDto {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  status: string;
  mrr: number;
  industry?: string | null;
  createdAt: string;
}

export interface CustomerStatsDto {
  total: number;
  active: number;
  totalMrr: number;
  averageMrr: number;
}

export interface CustomerListDto {
  customers: CustomerDto[];
  total: number;
  limit: number;
  offset: number;
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export type ProjectStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'IN_REVIEW'
  | 'DELIVERED'
  | 'REJECTED'
  | 'ARCHIVED';

export interface ProjectDto {
  id: string;
  title: string;
  status: ProjectStatus | string;
  userId?: string;
  updatedAt: string;
}

// ─── Jobs (Field Service / HVAC) ──────────────────────────────────────────────

export type JobType = 'INSTALL' | 'REPAIR' | 'MAINTENANCE' | 'INSPECTION' | 'ESTIMATE';
export type JobStatus = 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface JobDto {
  id: string;
  title: string;
  type: JobType;
  status: JobStatus;
  customerName?: string | null;
  address?: string | null;
  scheduledAt?: string | null;
  technicianId?: string | null;
  estimatedDurationMinutes?: number | null;
}

export interface HvacJobDto extends JobDto {
  systemType?: string | null;
  modelNumber?: string | null;
  warrantyExpiry?: string | null;
}

// ─── Agents (Hermes) ──────────────────────────────────────────────────────────

export type AgentRisk = 'low' | 'medium' | 'high' | 'critical';
export type AgentActionStatus =
  | 'queued'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'executing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface AgentActionDto {
  id: string;
  mode: string;
  kind: string;
  risk: AgentRisk;
  status: AgentActionStatus;
  title: string;
  summary?: string | null;
  requiresApproval: boolean;
  createdAt: string;
}

// ─── Conversations ────────────────────────────────────────────────────────────

export interface ConversationMessageDto {
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

export interface ConversationDto {
  id: string;
  mode: string;
  summary?: string | null;
  lastMessage: string;
  messageCount: number;
  updatedAt: string;
}

// ─── Cloud / Infrastructure ───────────────────────────────────────────────────

export type CloudStatus = 'ok' | 'degraded' | 'unreachable';

export interface CloudHealthDto {
  status: CloudStatus;
  latencyMs?: number | null;
  message?: string | null;
  checkedAt: string;
}

export interface CloudDeployDto {
  service: string;
  image?: string;
  tag?: string;
  env?: Record<string, string>;
}

export interface CloudRestartDto {
  service: string;
  force?: boolean;
}

export interface CloudRollbackDto {
  service: string;
  steps?: number;
  toTag?: string;
}

export interface CloudInventoryDto {
  services: Array<{
    name: string;
    status: string;
    image?: string;
    uptime?: string;
  }>;
  generatedAt: string;
}

export interface CloudOperationResultDto {
  success: boolean;
  service?: string;
  output?: string;
  error?: string;
  executedAt: string;
}

// ─── Studio ───────────────────────────────────────────────────────────────────

export interface StudioProjectDto {
  id: string;
  name: string;
  status?: string | null;
  updatedAt: string;
}

export interface StudioStatsDto {
  totalProjects: number;
  activeProjects: number;
  galleryAssets: number;
}

// ─── Finance ──────────────────────────────────────────────────────────────────

export interface FinanceSnapshotDto {
  revenueToday: number;
  revenueMonth: number;
  totalMrr: number;
  unpaidInvoices: number;
  unpaidInvoiceCount: number;
  activeCustomers: number;
  projectedMonthRevenue: number;
}

// ─── Capabilities ─────────────────────────────────────────────────────────────

export interface CapabilityDto {
  name: string;
  available: boolean;
  source: string;
  description?: string;
}

export interface CapabilityMatrixDto {
  capabilities: CapabilityDto[];
  generatedAt: string;
}
