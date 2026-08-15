import { LeadStatus, LeadUrgency, HvacServiceCategory } from '@prisma/client';

/**
 * Note the absence of `tenantId` on every DTO in this file. Tenant is taken
 * from the authenticated session via TenantGuard, never from the payload.
 */

export interface CreateLeadDto {
  customerId?: string;
  campaignId?: string;
  source: string;
  serviceType?: string;
  hvacCategory?: HvacServiceCategory;
  urgency?: LeadUrgency;
  status?: LeadStatus;
  summary?: string;
  estimatedValue?: number;
}

export interface UpdateLeadDto {
  customerId?: string;
  campaignId?: string;
  serviceType?: string;
  hvacCategory?: HvacServiceCategory;
  urgency?: LeadUrgency;
  status?: LeadStatus;
  summary?: string;
  estimatedValue?: number;
  lostReason?: string;
}

export interface ListLeadsFilter {
  status?: LeadStatus;
  urgency?: LeadUrgency;
  campaignId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}
