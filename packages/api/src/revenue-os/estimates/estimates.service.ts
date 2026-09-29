import { Injectable, NotFoundException } from '@nestjs/common';
import { EstimateStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { isolateQuery, withTenant } from '../../common/prisma/tenant-isolation';
import { CreateEstimateDto, ListEstimatesFilter, UpdateEstimateDto } from './dto/estimate.dto';

@Injectable()
export class EstimatesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: CreateEstimateDto) {
    return isolateQuery(this.prisma, tenantId, async () => {
      await this.assertOwnedRelations(tenantId, data.customerId, data.leadId);

      return this.prisma.estimate.create({
        data: {
          tenantId,
          customerId: data.customerId,
          leadId: data.leadId,
          amount: new Prisma.Decimal(data.amount),
          status: data.status ?? EstimateStatus.DRAFT,
          followUpAt: data.followUpAt,
          objection: data.objection,
        },
      });
    });
  }

  async findAll(tenantId: string, filters: ListEstimatesFilter = {}) {
    return isolateQuery(this.prisma, tenantId, async () => {
      const { status, customerId, leadId, search, limit = 50, offset = 0 } = filters;

      const where: Prisma.EstimateWhereInput = withTenant(tenantId, {
        ...(status ? { status } : {}),
        ...(customerId ? { customerId } : {}),
        ...(leadId ? { leadId } : {}),
        ...(search
          ? {
              OR: [
                { id: { contains: search, mode: 'insensitive' as const } },
              ],
            }
          : {}),
      });

      const [items, total] = await Promise.all([
        this.prisma.estimate.findMany({
          where,
          include: { customer: true, lead: true },
          orderBy: { createdAt: 'desc' },
          take: Math.min(limit, 200),
          skip: offset,
        }),
        this.prisma.estimate.count({ where }),
      ]);

      return { items, total, limit, offset };
    });
  }

  async findOne(tenantId: string, id: string) {
    return isolateQuery(this.prisma, tenantId, async () => {
      const estimate = await this.prisma.estimate.findFirst({
        where: withTenant(tenantId, { id }),
        include: { customer: true, lead: true },
      });

      if (!estimate) {
        throw new NotFoundException('Estimate not found');
      }

      return estimate;
    });
  }

  async update(tenantId: string, id: string, data: UpdateEstimateDto) {
    return isolateQuery(this.prisma, tenantId, async () => {
      await this.findOne(tenantId, id);
      await this.assertOwnedRelations(tenantId, data.customerId, data.leadId);

      await this.prisma.estimate.updateMany({
        where: withTenant(tenantId, { id }),
        data: {
          ...(data.customerId !== undefined ? { customerId: data.customerId } : {}),
          ...(data.leadId !== undefined ? { leadId: data.leadId } : {}),
          ...(data.amount !== undefined ? { amount: new Prisma.Decimal(data.amount) } : {}),
          ...(data.status !== undefined ? { status: data.status } : {}),
          ...(data.followUpAt !== undefined ? { followUpAt: data.followUpAt } : {}),
          ...(data.status === EstimateStatus.SOLD ? { soldAt: new Date() } : {}),
          ...(data.objection !== undefined ? { objection: data.objection } : {}),
        },
      });

      return this.findOne(tenantId, id);
    });
  }

  async remove(tenantId: string, id: string) {
    return isolateQuery(this.prisma, tenantId, async () => {
      await this.findOne(tenantId, id);
      await this.prisma.estimate.deleteMany({ where: withTenant(tenantId, { id }) });
      return { deleted: true, id };
    });
  }

  async pipelineSummary(tenantId: string) {
    return isolateQuery(this.prisma, tenantId, async () => {
      const grouped = await this.prisma.estimate.groupBy({
        by: ['status'],
        where: withTenant(tenantId),
        _count: { _all: true },
        _sum: { amount: true },
      });

      const statuses = Object.values(EstimateStatus);
      const summary = statuses.map((status) => {
        const row = grouped.find((g) => g.status === status);
        return {
          status,
          count: row?._count._all ?? 0,
          value: row?._sum.amount ? Number(row._sum.amount) : 0,
        };
      });

      const totalValue = summary.reduce((sum, s) => sum + s.value, 0);
      const soldCount = summary.find((s) => s.status === EstimateStatus.SOLD)?.count ?? 0;
      const sentCount = summary.find((s) => s.status === EstimateStatus.SENT)?.count ?? 0;

      const conversionRate = sentCount > 0 ? ((soldCount / sentCount) * 100).toFixed(1) : '0';

      return {
        pipeline: summary,
        totalPipelineValue: totalValue,
        conversionRate: parseFloat(conversionRate),
      };
    });
  }

  async getCountByStatus(tenantId: string, status: EstimateStatus) {
    return isolateQuery(this.prisma, tenantId, async () => {
      return this.prisma.estimate.count({
        where: withTenant(tenantId, { status }),
      });
    });
  }

  private async assertOwnedRelations(tenantId: string, customerId?: string, leadId?: string) {
    if (customerId) {
      const customer = await this.prisma.revenueCustomer.findFirst({
        where: withTenant(tenantId, { id: customerId }),
        select: { id: true },
      });
      if (!customer) {
        throw new NotFoundException('Customer not found');
      }
    }

    if (leadId) {
      const lead = await this.prisma.lead.findFirst({
        where: withTenant(tenantId, { id: leadId }),
        select: { id: true },
      });
      if (!lead) {
        throw new NotFoundException('Lead not found');
      }
    }
  }
}
