import { Injectable, NotFoundException } from '@nestjs/common';
import { ServiceJobStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { isolateQuery, withTenant } from '../../common/prisma/tenant-isolation';
import { CreateServiceJobDto, ListServiceJobsFilter, UpdateServiceJobDto } from './dto/service-job.dto';

@Injectable()
export class ServiceJobsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: CreateServiceJobDto) {
    return isolateQuery(this.prisma, tenantId, async () => {
      await this.assertOwnedRelations(tenantId, data.customerId, data.leadId);

      return this.prisma.serviceJob.create({
        data: {
          tenantId,
          customerId: data.customerId,
          leadId: data.leadId,
          serviceType: data.serviceType,
          scheduledStart: data.scheduledStart,
          scheduledEnd: data.scheduledEnd,
          technician: data.technician,
          status: data.status ?? ServiceJobStatus.SCHEDULED,
          notes: data.notes,
          revenue: data.revenue ? new Prisma.Decimal(data.revenue) : undefined,
          sourceAttribution: data.sourceAttribution,
          campaignId: data.campaignId,
        },
      });
    });
  }

  async findAll(tenantId: string, filters: ListServiceJobsFilter = {}) {
    return isolateQuery(this.prisma, tenantId, async () => {
      const { status, customerId, leadId, technician, search, limit = 50, offset = 0 } = filters;

      const where: Prisma.ServiceJobWhereInput = withTenant(tenantId, {
        ...(status ? { status } : {}),
        ...(customerId ? { customerId } : {}),
        ...(leadId ? { leadId } : {}),
        ...(technician ? { technician } : {}),
        ...(search
          ? {
              OR: [
                { id: { contains: search, mode: 'insensitive' as const } },
                { serviceType: { contains: search, mode: 'insensitive' as const } },
              ],
            }
          : {}),
      });

      const [items, total] = await Promise.all([
        this.prisma.serviceJob.findMany({
          where,
          include: { customer: true, lead: true },
          orderBy: { createdAt: 'desc' },
          take: Math.min(limit, 200),
          skip: offset,
        }),
        this.prisma.serviceJob.count({ where }),
      ]);

      return { items, total, limit, offset };
    });
  }

  async findOne(tenantId: string, id: string) {
    return isolateQuery(this.prisma, tenantId, async () => {
      const job = await this.prisma.serviceJob.findFirst({
        where: withTenant(tenantId, { id }),
        include: { customer: true, lead: true },
      });

      if (!job) {
        throw new NotFoundException('Service job not found');
      }

      return job;
    });
  }

  async update(tenantId: string, id: string, data: UpdateServiceJobDto) {
    return isolateQuery(this.prisma, tenantId, async () => {
      await this.findOne(tenantId, id);
      await this.assertOwnedRelations(tenantId, data.customerId, data.leadId);

      await this.prisma.serviceJob.updateMany({
        where: withTenant(tenantId, { id }),
        data: {
          ...(data.customerId !== undefined ? { customerId: data.customerId } : {}),
          ...(data.leadId !== undefined ? { leadId: data.leadId } : {}),
          ...(data.serviceType !== undefined ? { serviceType: data.serviceType } : {}),
          ...(data.scheduledStart !== undefined ? { scheduledStart: data.scheduledStart } : {}),
          ...(data.scheduledEnd !== undefined ? { scheduledEnd: data.scheduledEnd } : {}),
          ...(data.technician !== undefined ? { technician: data.technician } : {}),
          ...(data.status !== undefined ? { status: data.status } : {}),
          ...(data.notes !== undefined ? { notes: data.notes } : {}),
          ...(data.revenue !== undefined ? { revenue: new Prisma.Decimal(data.revenue) } : {}),
          ...(data.status === ServiceJobStatus.COMPLETED ? { completedAt: new Date() } : {}),
          ...(data.completedAt !== undefined ? { completedAt: data.completedAt } : {}),
          ...(data.sourceAttribution !== undefined ? { sourceAttribution: data.sourceAttribution } : {}),
          ...(data.campaignId !== undefined ? { campaignId: data.campaignId } : {}),
        },
      });

      return this.findOne(tenantId, id);
    });
  }

  async remove(tenantId: string, id: string) {
    return isolateQuery(this.prisma, tenantId, async () => {
      await this.findOne(tenantId, id);
      await this.prisma.serviceJob.deleteMany({ where: withTenant(tenantId, { id }) });
      return { deleted: true, id };
    });
  }

  async getTodaysJobs(tenantId: string) {
    return isolateQuery(this.prisma, tenantId, async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      return this.prisma.serviceJob.findMany({
        where: withTenant(tenantId, {
          scheduledStart: { gte: today, lt: tomorrow },
        }),
        include: { customer: true, lead: true },
        orderBy: { scheduledStart: 'asc' },
      });
    });
  }

  async getJobsByStatus(tenantId: string, status: ServiceJobStatus) {
    return isolateQuery(this.prisma, tenantId, async () => {
      return this.prisma.serviceJob.count({
        where: withTenant(tenantId, { status }),
      });
    });
  }

  async getCompletedRevenue(tenantId: string, startDate: Date, endDate: Date) {
    return isolateQuery(this.prisma, tenantId, async () => {
      const result = await this.prisma.serviceJob.aggregate({
        where: withTenant(tenantId, {
          status: ServiceJobStatus.COMPLETED,
          completedAt: { gte: startDate, lte: endDate },
        }),
        _sum: { revenue: true },
      });

      return Number(result._sum.revenue ?? 0);
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
