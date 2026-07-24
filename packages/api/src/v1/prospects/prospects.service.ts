import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/db';

@Injectable()
export class ProspectsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new prospect
   */
  async createProspect(data: {
    businessName: string;
    contactName: string;
    email: string;
    phone?: string;
    website?: string;
    industry?: string;
    primaryProblem: string;
    leadSource?: string;
    estimatedOpportunity?: number;
    notes?: string;
    tags?: string[];
  }) {
    return this.prisma.prospect.create({
      data: {
        businessName: data.businessName,
        contactName: data.contactName,
        email: data.email,
        phone: data.phone,
        website: data.website,
        industry: data.industry,
        primaryProblem: data.primaryProblem,
        leadSource: data.leadSource || 'DIRECT',
        estimatedOpportunity: data.estimatedOpportunity || 0,
        notes: data.notes,
        tags: data.tags || [],
      },
    });
  }

  /**
   * Get all prospects with optional filtering
   */
  async getProspects(filters?: {
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }) {
    const { status, search, sortBy = 'createdAt', sortOrder = 'desc', limit = 50, offset = 0 } = filters || {};

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [prospects, total] = await Promise.all([
      this.prisma.prospect.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        take: limit,
        skip: offset,
      }),
      this.prisma.prospect.count({ where }),
    ]);

    return {
      prospects,
      total,
      limit,
      offset,
    };
  }

  /**
   * Get a single prospect by ID
   */
  async getProspect(id: string) {
    return this.prisma.prospect.findUnique({
      where: { id },
    });
  }

  /**
   * Update prospect details
   */
  async updateProspect(id: string, data: Partial<{
    status: string;
    notes: string;
    estimatedOpportunity: number;
    tags: string[];
    auditScheduledAt: Date;
    auditCompletedAt: Date;
    proposalSentAt: Date;
    wonAt: Date;
    lostAt: Date;
    lostReason: string;
  }>) {
    return this.prisma.prospect.update({
      where: { id },
      data,
    });
  }

  /**
   * Change prospect status
   */
  async updateProspectStatus(id: string, status: string, additionalData?: any) {
    const updateData: any = { status };

    // Update timestamps based on status
    if (status === 'CONTACTED') {
      // Could set a timestamp here if needed
    } else if (status === 'AUDIT_SCHEDULED') {
      updateData.auditScheduledAt = new Date();
    } else if (status === 'AUDIT_COMPLETE') {
      updateData.auditCompletedAt = new Date();
    } else if (status === 'PROPOSAL_SENT') {
      updateData.proposalSentAt = new Date();
    } else if (status === 'WON') {
      updateData.wonAt = new Date();
    } else if (status === 'LOST') {
      updateData.lostAt = new Date();
      if (additionalData?.reason) {
        updateData.lostReason = additionalData.reason;
      }
    }

    return this.prisma.prospect.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Delete/archive prospect
   */
  async deleteProspect(id: string) {
    return this.prisma.prospect.delete({
      where: { id },
    });
  }

  /**
   * Get prospect pipeline statistics
   */
  async getPipelineStats() {
    const prospects = await this.prisma.prospect.findMany();

    const statsByStatus = {
      NEW: 0,
      CONTACTED: 0,
      QUALIFIED: 0,
      AUDIT_SCHEDULED: 0,
      AUDIT_COMPLETE: 0,
      PROPOSAL_SENT: 0,
      WON: 0,
      LOST: 0,
    };

    let totalOpportunity = 0;
    let closedOpportunity = 0;
    let wonOpportunity = 0;

    prospects.forEach((prospect) => {
      statsByStatus[prospect.status as keyof typeof statsByStatus]++;
      totalOpportunity += prospect.estimatedOpportunity;

      if (prospect.status === 'WON' || prospect.status === 'LOST') {
        closedOpportunity += prospect.estimatedOpportunity;
      }
      if (prospect.status === 'WON') {
        wonOpportunity += prospect.estimatedOpportunity;
      }
    });

    return {
      byStatus: statsByStatus,
      totalProspects: prospects.length,
      totalOpportunity,
      closedOpportunity,
      wonOpportunity,
      conversionRate: prospects.length > 0 ? (statsByStatus.WON / prospects.length) * 100 : 0,
    };
  }

  /**
   * Get prospects by lead source
   */
  async getProspectsByLeadSource() {
    const prospects = await this.prisma.prospect.findMany();

    const bySource: Record<string, any> = {};

    prospects.forEach((prospect) => {
      if (!bySource[prospect.leadSource]) {
        bySource[prospect.leadSource] = {
          count: 0,
          opportunity: 0,
        };
      }
      bySource[prospect.leadSource].count++;
      bySource[prospect.leadSource].opportunity += prospect.estimatedOpportunity;
    });

    return bySource;
  }
}
