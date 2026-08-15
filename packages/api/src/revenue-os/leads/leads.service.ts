import { Injectable, NotFoundException } from '@nestjs/common';
import { LeadStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLeadDto, ListLeadsFilter, UpdateLeadDto } from './dto/lead.dto';

/**
 * Lead pipeline, tenant-scoped.
 *
 * Every method takes `tenantId` as its first argument and every Prisma call
 * filters on it — including reads of a single record by id. Fetching by id
 * alone and checking the tenant afterwards would leak existence, so the
 * tenant is always part of the query.
 */
@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: CreateLeadDto) {
    // Guard against a caller attaching another tenant's customer/campaign.
    await this.assertOwnedRelations(tenantId, data.customerId, data.campaignId);

    return this.prisma.lead.create({
      data: {
        tenantId,
        customerId: data.customerId,
        campaignId: data.campaignId,
        source: data.source,
        serviceType: data.serviceType,
        hvacCategory: data.hvacCategory,
        urgency: data.urgency,
        status: data.status ?? LeadStatus.NEW,
        summary: data.summary,
        estimatedValue: data.estimatedValue,
      },
    });
  }

  async findAll(tenantId: string, filters: ListLeadsFilter = {}) {
    const { status, urgency, campaignId, search, limit = 50, offset = 0 } = filters;

    const where: Prisma.LeadWhereInput = {
      tenantId,
      ...(status ? { status } : {}),
      ...(urgency ? { urgency } : {}),
      ...(campaignId ? { campaignId } : {}),
      ...(search
        ? {
            OR: [
              { summary: { contains: search, mode: 'insensitive' as const } },
              { source: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        include: { customer: true, campaign: true },
        orderBy: { createdAt: 'desc' },
        take: Math.min(limit, 200),
        skip: offset,
      }),
      this.prisma.lead.count({ where }),
    ]);

    return { items, total, limit, offset };
  }

  async findOne(tenantId: string, id: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, tenantId },
      include: { customer: true, campaign: true, conversations: true, estimates: true },
    });

    if (!lead) {
      // Same response whether the lead is absent or belongs to another
      // tenant — callers must not be able to probe for foreign ids.
      throw new NotFoundException('Lead not found');
    }

    return lead;
  }

  async update(tenantId: string, id: string, data: UpdateLeadDto) {
    await this.findOne(tenantId, id);
    await this.assertOwnedRelations(tenantId, data.customerId, data.campaignId);

    // updateMany, not update: it takes a where clause including tenantId, so
    // there is no window where an id alone selects the row.
    await this.prisma.lead.updateMany({
      where: { id, tenantId },
      data: {
        ...data,
        ...(data.status === LeadStatus.BOOKED ? { bookedAt: new Date() } : {}),
        ...(data.status === LeadStatus.WON ? { wonAt: new Date() } : {}),
      },
    });

    return this.findOne(tenantId, id);
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    await this.prisma.lead.deleteMany({ where: { id, tenantId } });
    return { deleted: true, id };
  }

  /** Pipeline counts and value, for the Revenue OS dashboard. */
  async pipelineSummary(tenantId: string) {
    const grouped = await this.prisma.lead.groupBy({
      by: ['status'],
      where: { tenantId },
      _count: { _all: true },
      _sum: { estimatedValue: true },
    });

    return Object.values(LeadStatus).map((status) => {
      const row = grouped.find((g) => g.status === status);
      return {
        status,
        count: row?._count._all ?? 0,
        value: row?._sum.estimatedValue ?? 0,
      };
    });
  }

  /**
   * Rejects relations belonging to another tenant. Without this a caller
   * could attach their lead to a foreign customer and read it back through
   * the include.
   */
  private async assertOwnedRelations(
    tenantId: string,
    customerId?: string,
    campaignId?: string,
  ) {
    if (customerId) {
      const customer = await this.prisma.revenueCustomer.findFirst({
        where: { id: customerId, tenantId },
        select: { id: true },
      });
      if (!customer) {
        throw new NotFoundException('Customer not found');
      }
    }

    if (campaignId) {
      const campaign = await this.prisma.campaign.findFirst({
        where: { id: campaignId, tenantId },
        select: { id: true },
      });
      if (!campaign) {
        throw new NotFoundException('Campaign not found');
      }
    }
  }
}
