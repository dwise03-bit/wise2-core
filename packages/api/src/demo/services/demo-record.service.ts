import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * DemoRecordService
 *
 * Creates and manages demo business records (leads, jobs, estimates).
 * Integrates with existing Revenue OS models.
 *
 * All records created with isDemo: true flag (when models are extended).
 * Currently demonstrates the pattern; actual implementation pending
 * Lead/Customer/ServiceJob/Estimate model extension.
 */
@Injectable()
export class DemoRecordService {
  private readonly logger = new Logger('Demo/RecordService');

  // Sample data
  private readonly SAMPLE_CUSTOMERS = [
    { name: 'Marcus Johnson', phone: '(555) 123-4567', email: 'marcus.j@example.test' },
    { name: 'Sarah Williams', phone: '(555) 234-5678', email: 'sarah.w@example.test' },
    { name: 'James Chen', phone: '(555) 345-6789', email: 'james.c@example.test' },
    { name: 'Jennifer Martinez', phone: '(555) 456-7890', email: 'jennifer.m@example.test' },
    { name: 'Michael Rodriguez', phone: '(555) 567-8901', email: 'michael.r@example.test' },
  ];

  private readonly SAMPLE_SERVICES = {
    hvac: ['AC Repair', 'Furnace Maintenance', 'Ductwork Cleaning', 'Emergency Service'],
    plumbing: ['Leak Repair', 'Drain Cleaning', 'Water Heater', 'Pipe Replacement'],
    default: ['General Service', 'Maintenance', 'Repair', 'Installation'],
  };

  constructor(private prisma: PrismaService) {}

  /**
   * Create a demo lead
   * Returns structured data ready for Lead model creation
   */
  async createDemoLead(input: {
    tenantId: string;
    name?: string;
    phone?: string;
    email?: string;
    service?: string;
    source?: string;
    estimatedValue?: number;
  }): Promise<{
    tenantId: string;
    name: string;
    phone: string;
    email: string;
    service: string;
    source: string;
    stage: string;
    estimatedValue: number;
    isDemo: boolean;
  }> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: input.tenantId },
    });

    if (!tenant) {
      throw new Error(`Tenant ${input.tenantId} not found`);
    }

    const customer = this.getRandomItem(this.SAMPLE_CUSTOMERS);
    const services = this.SAMPLE_SERVICES[tenant.vertical as keyof typeof this.SAMPLE_SERVICES] ||
      this.SAMPLE_SERVICES.default;

    const demoLead = {
      tenantId: input.tenantId,
      name: input.name || customer.name,
      phone: input.phone || customer.phone,
      email: input.email || customer.email,
      service: input.service || this.getRandomItem(services),
      source: input.source || this.getRandomItem(['google', 'facebook', 'website', 'referral']),
      stage: this.getRandomItem(['new', 'contacted', 'qualified']),
      estimatedValue: input.estimatedValue || Math.floor(Math.random() * 1000) + 200,
      isDemo: true,
    };

    this.logger.debug(`Created demo lead: ${demoLead.name} for ${demoLead.service}`);

    // TODO: Once Lead model is extended with isDemo field:
    // return await this.prisma.lead.create({
    //   data: demoLead,
    // });

    return demoLead;
  }

  /**
   * Create a demo estimate
   * Returns structured data ready for Estimate model creation
   */
  async createDemoEstimate(input: {
    tenantId: string;
    leadId?: string;
    customerId?: string;
    service: string;
    description?: string;
    amount?: number;
  }): Promise<{
    tenantId: string;
    leadId?: string;
    customerId?: string;
    service: string;
    amount: number;
    status: string;
    isDemo: boolean;
  }> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: input.tenantId },
    });

    if (!tenant) {
      throw new Error(`Tenant ${input.tenantId} not found`);
    }

    const demoEstimate = {
      tenantId: input.tenantId,
      leadId: input.leadId,
      customerId: input.customerId,
      service: input.service,
      amount: input.amount || Math.floor(Math.random() * 1500) + 300,
      status: 'pending', // new estimate
      isDemo: true,
    };

    this.logger.debug(`Created demo estimate for ${input.service}: $${demoEstimate.amount}`);

    // TODO: Once Estimate model is extended with isDemo field:
    // return await this.prisma.estimate.create({
    //   data: demoEstimate,
    // });

    return demoEstimate;
  }

  /**
   * Create a demo job (service job record)
   * Returns structured data ready for ServiceJob model creation
   */
  async createDemoJob(input: {
    tenantId: string;
    customerId?: string;
    service: string;
    estimatedDuration?: number;
    scheduledDate?: Date;
    status?: string;
  }): Promise<{
    tenantId: string;
    customerId?: string;
    service: string;
    status: string;
    scheduledDate: Date;
    isDemo: boolean;
  }> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: input.tenantId },
    });

    if (!tenant) {
      throw new Error(`Tenant ${input.tenantId} not found`);
    }

    // Default to tomorrow at 9 AM
    const scheduledDate = input.scheduledDate || new Date(Date.now() + 24 * 60 * 60 * 1000);
    scheduledDate.setHours(9, 0, 0, 0);

    const demoJob = {
      tenantId: input.tenantId,
      customerId: input.customerId,
      service: input.service,
      status: input.status || 'scheduled',
      scheduledDate,
      isDemo: true,
    };

    this.logger.debug(`Created demo job for ${input.service} on ${scheduledDate.toDateString()}`);

    // TODO: Once ServiceJob model is extended with isDemo field:
    // return await this.prisma.serviceJob.create({
    //   data: demoJob,
    // });

    return demoJob;
  }

  /**
   * Create a demo payment record
   * Returns structured data ready for Payment model creation
   */
  async createDemoPayment(input: {
    tenantId: string;
    jobId?: string;
    estimateId?: string;
    amount: number;
    method?: string;
    status?: string;
  }): Promise<{
    tenantId: string;
    jobId?: string;
    estimateId?: string;
    amount: number;
    method: string;
    status: string;
    isDemo: boolean;
  }> {
    const demoPayment = {
      tenantId: input.tenantId,
      jobId: input.jobId,
      estimateId: input.estimateId,
      amount: input.amount,
      method: input.method || 'card',
      status: input.status || 'completed',
      isDemo: true,
    };

    this.logger.debug(`Created demo payment: $${demoPayment.amount} via ${demoPayment.method}`);

    // TODO: Once Payment model is extended with isDemo field:
    // return await this.prisma.payment.create({
    //   data: demoPayment,
    // });

    return demoPayment;
  }

  /**
   * Create a demo conversation (SMS/email thread)
   * Returns structured data ready for Conversation model creation
   */
  async createDemoConversation(input: {
    tenantId: string;
    leadId?: string;
    customerId?: string;
    type: 'sms' | 'email' | 'call';
    message: string;
    direction: 'inbound' | 'outbound';
  }): Promise<{
    tenantId: string;
    leadId?: string;
    customerId?: string;
    type: string;
    message: string;
    direction: string;
    isDemo: boolean;
  }> {
    const demoConversation = {
      tenantId: input.tenantId,
      leadId: input.leadId,
      customerId: input.customerId,
      type: input.type,
      message: input.message,
      direction: input.direction,
      isDemo: true,
    };

    this.logger.debug(`Created demo ${input.type} (${input.direction})`);

    // TODO: Once Conversation model is extended with isDemo field:
    // return await this.prisma.conversation.create({
    //   data: demoConversation,
    // });

    return demoConversation;
  }

  /**
   * Get demo records for a tenant
   * Filter by isDemo: true
   */
  async getDemoRecords(tenantId: string, type: 'leads' | 'jobs' | 'estimates' | 'payments') {
    this.logger.log(`Getting demo ${type} for tenant ${tenantId}`);

    // TODO: Once models are extended with isDemo field:
    // switch (type) {
    //   case 'leads':
    //     return await this.prisma.lead.findMany({
    //       where: { tenantId, isDemo: true },
    //       orderBy: { createdAt: 'desc' },
    //       take: 50,
    //     });
    //   case 'jobs':
    //     return await this.prisma.serviceJob.findMany({
    //       where: { tenantId, isDemo: true },
    //       orderBy: { createdAt: 'desc' },
    //       take: 50,
    //     });
    //   // ... etc
    // }

    return [];
  }

  /**
   * Helper: Get random item from array
   */
  private getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Helper: Get sample customer
   */
  getRandomCustomer() {
    return this.getRandomItem(this.SAMPLE_CUSTOMERS);
  }

  /**
   * Helper: Get service for industry
   */
  getServiceForIndustry(industry: string): string {
    const services = this.SAMPLE_SERVICES[industry as keyof typeof this.SAMPLE_SERVICES] ||
      this.SAMPLE_SERVICES.default;
    return this.getRandomItem(services);
  }
}
