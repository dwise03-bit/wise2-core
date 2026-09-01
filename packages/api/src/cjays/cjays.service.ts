import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { CjaysSyncInput } from './cjays.types';

@Injectable()
export class CjaysService {
  constructor(private readonly prisma: PrismaService) {}

  async bootstrap(tenantId: string) {
    const [customers, vehicles, jobs] = await Promise.all([
      this.prisma.cjaysCustomer.findMany({ where: { tenantId }, orderBy: { updatedAt: 'asc' } }),
      this.prisma.cjaysVehicle.findMany({ where: { tenantId }, orderBy: { updatedAt: 'asc' } }),
      this.prisma.cjaysJob.findMany({ where: { tenantId }, orderBy: { updatedAt: 'asc' } }),
    ]);
    return { customers: customers.map((x) => ({ id: x.clientId, name: x.name, phone: x.phone, email: x.email })), vehicles: vehicles.map((x) => ({ id: x.clientId, customerId: x.customerClientId ?? '', vin: x.vin, year: x.year, make: x.make, model: x.model, color: x.color })), jobs: jobs.map((x) => ({ id: x.clientId, vehicleId: x.vehicleClientId, service: x.service, status: x.status, price: x.price, checklist: x.checklist, notes: x.notes, paymentMethod: x.paymentMethod, paidAmount: x.paidAmount, beforePhotos: x.beforePhotos, afterPhotos: x.afterPhotos })), serverTime: new Date().toISOString() };
  }

  async sync(tenantId: string, userId: string, role: string, input: CjaysSyncInput) {
    if (role === 'VIEWER') throw new BadRequestException('Viewer accounts cannot modify CJAYS records');
    if (!input?.requestId || !Array.isArray(input.customers) || !Array.isArray(input.vehicles) || !Array.isArray(input.jobs)) throw new BadRequestException('Invalid CJAYS sync payload');
    if (input.customers.length + input.vehicles.length + input.jobs.length > 2000) throw new BadRequestException('Sync batch is too large');

    const duplicate = await this.prisma.cjaysSyncEvent.findUnique({ where: { tenantId_requestId: { tenantId, requestId: input.requestId } } });
    if (duplicate) return { accepted: true, duplicate: true, ...(await this.bootstrap(tenantId)) };

    await this.prisma.$transaction(async (tx) => {
      for (const customer of input.customers) {
        if (!customer.id || !customer.name || !customer.phone) throw new BadRequestException('Customer id, name, and phone are required');
        await tx.cjaysCustomer.upsert({ where: { tenantId_clientId: { tenantId, clientId: customer.id } }, create: { tenantId, clientId: customer.id, name: customer.name, phone: customer.phone, email: customer.email ?? '' }, update: { name: customer.name, phone: customer.phone, email: customer.email ?? '', serverVersion: { increment: 1 } } });
      }
      for (const vehicle of input.vehicles) {
        if (!vehicle.id || !vehicle.vin) throw new BadRequestException('Vehicle id and VIN are required');
        await tx.cjaysVehicle.upsert({ where: { tenantId_clientId: { tenantId, clientId: vehicle.id } }, create: { tenantId, clientId: vehicle.id, customerClientId: vehicle.customerId || null, vin: vehicle.vin, year: vehicle.year ?? '', make: vehicle.make ?? '', model: vehicle.model ?? '', color: vehicle.color ?? '', qrTagId: '' }, update: { customerClientId: vehicle.customerId || null, vin: vehicle.vin, year: vehicle.year ?? '', make: vehicle.make ?? '', model: vehicle.model ?? '', color: vehicle.color ?? '', serverVersion: { increment: 1 } } });
      }
      for (const job of input.jobs) {
        if (!job.id || !job.vehicleId || !job.service) throw new BadRequestException('Job id, vehicle id, and service are required');
        const data = { vehicleClientId: job.vehicleId, service: job.service, status: job.status ?? 'In Progress', price: job.price ?? '', checklist: job.checklist ?? [], notes: job.notes ?? '', paymentMethod: job.paymentMethod ?? '', paidAmount: job.paidAmount ?? '', beforePhotos: job.beforePhotos ?? [], afterPhotos: job.afterPhotos ?? [] };
        await tx.cjaysJob.upsert({ where: { tenantId_clientId: { tenantId, clientId: job.id } }, create: { tenantId, clientId: job.id, ...data }, update: { ...data, serverVersion: { increment: 1 } } });
      }
      await tx.cjaysSyncEvent.create({ data: { tenantId, requestId: input.requestId, userId, recordCounts: { customers: input.customers.length, vehicles: input.vehicles.length, jobs: input.jobs.length } } });
    });
    return { accepted: true, duplicate: false, ...(await this.bootstrap(tenantId)) };
  }
}
