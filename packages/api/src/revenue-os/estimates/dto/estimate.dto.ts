import { EstimateStatus } from '@prisma/client';

export interface CreateEstimateDto {
  customerId?: string;
  leadId?: string;
  amount: number;
  status?: EstimateStatus;
  followUpAt?: Date;
  objection?: string;
}

export interface UpdateEstimateDto {
  customerId?: string;
  leadId?: string;
  amount?: number;
  status?: EstimateStatus;
  followUpAt?: Date;
  soldAt?: Date;
  objection?: string;
}

export interface ListEstimatesFilter {
  status?: EstimateStatus;
  customerId?: string;
  leadId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}
