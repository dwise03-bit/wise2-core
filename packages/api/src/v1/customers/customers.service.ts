import { Injectable, NotFoundException } from '@nestjs/common';
import { CustomerStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    businessName: string;
    contactName: string;
    email: string;
    phone?: string;
    website?: string;
    industry?: string;
    notes?: string;
    tags?: string[];
    mrr?: number;
    prospectId?: string;
    userId?: string;
  }) {
    return this.prisma.customer.create({
      data: {
        businessName: data.businessName,
        contactName: data.contactName,
        email: data.email,
        phone: data.phone,
        website: data.website,
        industry: data.industry,
        notes: data.notes,
        tags: data.tags || [],
        mrr: data.mrr || 0,
        prospectId: data.prospectId,
        userId: data.userId,
      },
    });
  }

  async findAll(filters?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const { status, search, limit = 50, offset = 0 } = filters || {};
    const where: any = {};

    if (status && Object.values(CustomerStatus).includes(status as CustomerStatus)) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.customer.count({ where }),
    ]);

    return { customers, total, limit, offset };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException(`Customer ${id} not found`);
    return customer;
  }

  async update(id: string, data: Partial<{
    businessName: string;
    contactName: string;
    email: string;
    phone: string;
    website: string;
    industry: string;
    notes: string;
    tags: string[];
    status: string;
    mrr: number;
  }>) {
    const { status, ...rest } = data;
    const updateData: any = rest;
    if (status && Object.values(CustomerStatus).includes(status as CustomerStatus)) {
      updateData.status = status;
    }
    return this.prisma.customer.update({ where: { id }, data: updateData });
  }

  async remove(id: string) {
    return this.prisma.customer.delete({ where: { id } });
  }

  async convertFromProspect(prospectId: string) {
    const prospect = await this.prisma.prospect.findUnique({ where: { id: prospectId } });
    if (!prospect) throw new NotFoundException(`Prospect ${prospectId} not found`);

    return this.prisma.customer.create({
      data: {
        businessName: prospect.businessName,
        contactName: prospect.contactName,
        email: prospect.email,
        phone: prospect.phone,
        website: prospect.website,
        industry: prospect.industry,
        notes: prospect.notes,
        tags: prospect.tags,
        prospectId: prospect.id,
        mrr: 0,
      },
    });
  }

  async getStats() {
    const [total, active, customers] = await Promise.all([
      this.prisma.customer.count(),
      this.prisma.customer.count({ where: { status: 'ACTIVE' } }),
      this.prisma.customer.findMany({ select: { mrr: true } }),
    ]);

    const totalMrr = customers.reduce((sum, c) => sum + c.mrr, 0);

    return {
      total,
      active,
      totalMrr,
      averageMrr: total > 0 ? totalMrr / total : 0,
    };
  }
}
