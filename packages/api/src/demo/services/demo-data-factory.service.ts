import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * DemoDatabFactory
 *
 * Generates realistic demo data for demo environments.
 * Creates demo customers, leads, jobs, etc.
 * All created records are marked with isDemo: true (to be extended in Lead/Customer models)
 */
@Injectable()
export class DemoDatabFactory {
  private readonly logger = new Logger('Demo/DataFactory');

  // Sample names for demo customers
  private readonly SAMPLE_NAMES = [
    'Marcus Johnson',
    'Sarah Williams',
    'James Chen',
    'Jennifer Martinez',
    'Michael Rodriguez',
    'Lisa Thompson',
    'David Lee',
    'Amanda Brown',
    'Robert Anderson',
    'Nicole Garcia',
  ];

  // Sample phone numbers (555 area code is reserved)
  private readonly SAMPLE_PHONES = [
    '(555) 123-4567',
    '(555) 234-5678',
    '(555) 345-6789',
    '(555) 456-7890',
    '(555) 567-8901',
  ];

  // Sample service types by industry
  private readonly SAMPLE_SERVICES = {
    hvac: ['AC Repair', 'Furnace Maintenance', 'Ductwork Cleaning', 'Emergency Service'],
    plumbing: ['Leak Repair', 'Drain Cleaning', 'Water Heater', 'Pipe Replacement'],
    default: ['General Service', 'Maintenance', 'Repair', 'Installation'],
  };

  // Sample sources for leads
  private readonly SAMPLE_SOURCES = ['google', 'facebook', 'direct', 'referral', 'website'];

  constructor(private prisma: PrismaService) {}

  /**
   * Generate demo customers for a tenant
   * Creates realistic customer records marked as demo
   */
  async generateDemoCustomers(
    tenantId: string,
    count: number = 3,
  ): Promise<void> {
    this.logger.log(
      `Generating ${count} demo customers for tenant ${tenantId}`,
    );

    // Note: This would create Lead records with isDemo: true
    // once the Lead model is extended with an isDemo field.
    // For now, we log the intention.

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    const customers = Array.from({ length: count }, (_, i) => ({
      tenantId,
      name: this.getRandomItem(this.SAMPLE_NAMES),
      phone: this.getRandomItem(this.SAMPLE_PHONES),
      email: `customer${i}@example.test`,
      isDemo: true,
      source: this.getRandomItem(this.SAMPLE_SOURCES),
      createdAt: new Date(),
    }));

    this.logger.log(`Demo customers generated (pending Lead model extension)`);

    // Once Lead model is extended with isDemo field, implement:
    // for (const customer of customers) {
    //   await this.prisma.lead.create({
    //     data: customer,
    //   });
    // }
  }

  /**
   * Generate demo leads for a tenant
   * Creates realistic lead records at various pipeline stages
   */
  async generateDemoLeads(
    tenantId: string,
    count: number = 5,
  ): Promise<void> {
    this.logger.log(`Generating ${count} demo leads for tenant ${tenantId}`);

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    const services = this.SAMPLE_SERVICES[tenant.vertical as keyof typeof this.SAMPLE_SERVICES] ||
      this.SAMPLE_SERVICES.default;

    const leads = Array.from({ length: count }, (_, i) => ({
      tenantId,
      name: this.getRandomItem(this.SAMPLE_NAMES),
      phone: this.getRandomItem(this.SAMPLE_PHONES),
      email: `lead${i}@example.test`,
      service: this.getRandomItem(services),
      source: this.getRandomItem(this.SAMPLE_SOURCES),
      stage: this.getRandomItem(['new', 'contacted', 'qualified', 'proposed']),
      value: Math.floor(Math.random() * 1000) + 200, // $200-$1200
      isDemo: true,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Past 30 days
    }));

    this.logger.log(`Demo leads generated (pending Lead model extension)`);

    // Once Lead model is extended with isDemo field, implement:
    // for (const lead of leads) {
    //   await this.prisma.lead.create({
    //     data: lead,
    //   });
    // }
  }

  /**
   * Generate demo jobs for a tenant
   * Creates realistic job records with estimates and payments
   */
  async generateDemoJobs(
    tenantId: string,
    count: number = 2,
  ): Promise<void> {
    this.logger.log(`Generating ${count} demo jobs for tenant ${tenantId}`);

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    const services = this.SAMPLE_SERVICES[tenant.vertical as keyof typeof this.SAMPLE_SERVICES] ||
      this.SAMPLE_SERVICES.default;

    const jobs = Array.from({ length: count }, (_, i) => ({
      tenantId,
      customerName: this.getRandomItem(this.SAMPLE_NAMES),
      customerPhone: this.getRandomItem(this.SAMPLE_PHONES),
      customerEmail: `customer${i}@example.test`,
      service: this.getRandomItem(services),
      status: this.getRandomItem(['scheduled', 'in-progress', 'completed']),
      estimatedValue: Math.floor(Math.random() * 1500) + 300, // $300-$1800
      actualValue: Math.floor(Math.random() * 1500) + 300,
      isDemo: true,
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000), // Past 60 days
    }));

    this.logger.log(`Demo jobs generated (pending ServiceJob model extension)`);

    // Once ServiceJob model is extended with isDemo field, implement:
    // for (const job of jobs) {
    //   await this.prisma.serviceJob.create({
    //     data: job,
    //   });
    // }
  }

  /**
   * Cleanup demo data for a tenant
   * Removes all records marked as demo (isDemo: true)
   */
  async cleanupDemoData(tenantId: string): Promise<void> {
    this.logger.log(`Cleaning up demo data for tenant ${tenantId}`);

    // This will be implemented once Lead, Customer, ServiceJob models have isDemo field:

    // await this.prisma.$transaction([
    //   this.prisma.lead.deleteMany({
    //     where: { tenantId, isDemo: true },
    //   }),
    //   this.prisma.customer.deleteMany({
    //     where: { tenantId, isDemo: true },
    //   }),
    //   this.prisma.serviceJob.deleteMany({
    //     where: { tenantId, isDemo: true },
    //   }),
    // ]);

    this.logger.log(`Demo data cleanup complete (pending model extensions)`);
  }

  /**
   * Helper: Get random item from array
   */
  private getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Helper: Generate email address
   */
  private generateEmail(name: string): string {
    const sanitized = name.toLowerCase().replace(/\s+/g, '.');
    return `${sanitized}@example.test`;
  }

  /**
   * Helper: Generate phone number
   */
  private generatePhone(): string {
    const areaCode = Math.floor(Math.random() * 900) + 100;
    const exchange = Math.floor(Math.random() * 900) + 100;
    const lineNumber = Math.floor(Math.random() * 9000) + 1000;
    return `(${areaCode}) ${exchange}-${lineNumber}`;
  }
}
