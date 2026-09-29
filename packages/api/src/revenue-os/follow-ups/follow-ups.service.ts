import { Injectable, NotFoundException } from '@nestjs/common';
import { FollowUpStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { isolateQuery, withTenant } from '../../common/prisma/tenant-isolation';
import { CreateFollowUpDto, ListFollowUpsFilter, UpdateFollowUpDto } from './dto/follow-up.dto';

@Injectable()
export class FollowUpsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: CreateFollowUpDto) {
    return isolateQuery(this.prisma, tenantId, async () => {
      return this.prisma.followUp.create({
        data: {
          tenantId,
          followUpType: data.followUpType,
          relatedEntityType: data.relatedEntityType,
          relatedEntityId: data.relatedEntityId,
          assignedTo: data.assignedTo,
          message: data.message,
          priority: data.priority ?? 0,
          dueAt: data.dueAt,
          status: FollowUpStatus.PENDING,
        },
      });
    });
  }

  async findAll(tenantId: string, filters: ListFollowUpsFilter = {}) {
    return isolateQuery(this.prisma, tenantId, async () => {
      const { status, assignedTo, relatedEntityType, relatedEntityId, limit = 50, offset = 0 } = filters;

      const where: Prisma.FollowUpWhereInput = withTenant(tenantId, {
        ...(status ? { status } : {}),
        ...(assignedTo ? { assignedTo } : {}),
        ...(relatedEntityType ? { relatedEntityType } : {}),
        ...(relatedEntityId ? { relatedEntityId } : {}),
      });

      const [items, total] = await Promise.all([
        this.prisma.followUp.findMany({
          where,
          orderBy: { dueAt: 'asc' },
          take: Math.min(limit, 200),
          skip: offset,
        }),
        this.prisma.followUp.count({ where }),
      ]);

      return { items, total, limit, offset };
    });
  }

  async findOne(tenantId: string, id: string) {
    return isolateQuery(this.prisma, tenantId, async () => {
      const followUp = await this.prisma.followUp.findFirst({
        where: withTenant(tenantId, { id }),
      });

      if (!followUp) {
        throw new NotFoundException('Follow-up not found');
      }

      return followUp;
    });
  }

  async update(tenantId: string, id: string, data: UpdateFollowUpDto) {
    return isolateQuery(this.prisma, tenantId, async () => {
      await this.findOne(tenantId, id);

      await this.prisma.followUp.updateMany({
        where: withTenant(tenantId, { id }),
        data: {
          ...(data.followUpType !== undefined ? { followUpType: data.followUpType } : {}),
          ...(data.assignedTo !== undefined ? { assignedTo: data.assignedTo } : {}),
          ...(data.message !== undefined ? { message: data.message } : {}),
          ...(data.priority !== undefined ? { priority: data.priority } : {}),
          ...(data.dueAt !== undefined ? { dueAt: data.dueAt } : {}),
          ...(data.status !== undefined ? { status: data.status } : {}),
          ...(data.status === FollowUpStatus.COMPLETED ? { completedAt: new Date() } : {}),
          ...(data.completedAt !== undefined ? { completedAt: data.completedAt } : {}),
        },
      });

      return this.findOne(tenantId, id);
    });
  }

  async remove(tenantId: string, id: string) {
    return isolateQuery(this.prisma, tenantId, async () => {
      await this.findOne(tenantId, id);
      await this.prisma.followUp.deleteMany({ where: withTenant(tenantId, { id }) });
      return { deleted: true, id };
    });
  }

  async getPendingFollowUps(tenantId: string) {
    return isolateQuery(this.prisma, tenantId, async () => {
      return this.prisma.followUp.count({
        where: withTenant(tenantId, { status: FollowUpStatus.PENDING }),
      });
    });
  }

  async getOverdueFollowUps(tenantId: string) {
    return isolateQuery(this.prisma, tenantId, async () => {
      const now = new Date();
      return this.prisma.followUp.count({
        where: withTenant(tenantId, {
          status: FollowUpStatus.PENDING,
          dueAt: { lte: now },
        }),
      });
    });
  }

  async getFollowUpsByEntity(tenantId: string, entityType: string, entityId: string) {
    return isolateQuery(this.prisma, tenantId, async () => {
      return this.prisma.followUp.findMany({
        where: withTenant(tenantId, {
          relatedEntityType: entityType,
          relatedEntityId: entityId,
        }),
        orderBy: { dueAt: 'asc' },
      });
    });
  }
}
