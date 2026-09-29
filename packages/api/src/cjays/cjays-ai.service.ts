import { Injectable, NotFoundException } from '@nestjs/common';
import { HermesService } from '../hermes/hermes.service';
import { PrismaService } from '../prisma/prisma.service';

export type CjaysAiTask = 'summary' | 'follow_up' | 'checklist' | 'quality_review';

@Injectable()
export class CjaysAiService {
  constructor(private readonly prisma: PrismaService, private readonly hermes: HermesService) {}

  async assist(tenantId: string, jobClientId: string, task: CjaysAiTask) {
    const job = await this.prisma.cjaysJob.findUnique({ where: { tenantId_clientId: { tenantId, clientId: jobClientId } } });
    if (!job) throw new NotFoundException('CJAYS job not found');
    const vehicle = await this.prisma.cjaysVehicle.findFirst({ where: { tenantId, clientId: job.vehicleClientId } });
    const customer = vehicle?.customerClientId ? await this.prisma.cjaysCustomer.findFirst({ where: { tenantId, clientId: vehicle.customerClientId } }) : null;
    const instructions: Record<CjaysAiTask,string> = {
      summary: 'Write a concise professional job summary grounded only in the supplied record.',
      follow_up: 'Draft a friendly customer follow-up email. Do not claim it was sent.',
      checklist: 'Suggest missing quality-control checklist items. Do not state that any item was completed.',
      quality_review: 'Review the record for documentation gaps before completion. Be direct and concise.',
    };
    const evidence = JSON.stringify({ job: { service: job.service, status: job.status, notes: job.notes, checklist: job.checklist, beforePhotoCount: Array.isArray(job.beforePhotos) ? job.beforePhotos.length : 0, afterPhotoCount: Array.isArray(job.afterPhotos) ? job.afterPhotos.length : 0, paidAmount: job.paidAmount, paymentMethod: job.paymentMethod }, vehicle: vehicle ? { vin: vehicle.vin, year: vehicle.year, make: vehicle.make, model: vehicle.model, color: vehicle.color } : null, customer: customer ? { name: customer.name } : null });
    const result = await this.hermes.chat(tenantId, { message: `${instructions[task]}\nCJAYS record evidence:\n${evidence}`, mode: 'support', profile: 'fast', messages: [] });
    return { task, suggestion: result.response, model: result.model, evidenceStatus: 'tenant-record-grounded', requiresHumanApproval: true };
  }
}
