import { ServiceJobStatus } from '@prisma/client';

export interface CreateServiceJobDto {
  customerId?: string;
  leadId?: string;
  serviceType?: string;
  scheduledStart?: Date;
  scheduledEnd?: Date;
  technician?: string;
  status?: ServiceJobStatus;
  notes?: string;
  revenue?: number;
  sourceAttribution?: string;
  campaignId?: string;
}

export interface UpdateServiceJobDto {
  customerId?: string;
  leadId?: string;
  serviceType?: string;
  scheduledStart?: Date;
  scheduledEnd?: Date;
  technician?: string;
  status?: ServiceJobStatus;
  notes?: string;
  revenue?: number;
  sourceAttribution?: string;
  campaignId?: string;
  completedAt?: Date;
}

export interface ListServiceJobsFilter {
  status?: ServiceJobStatus;
  customerId?: string;
  leadId?: string;
  technician?: string;
  search?: string;
  limit?: number;
  offset?: number;
}
