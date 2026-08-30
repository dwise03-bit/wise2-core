import {
  CRMProvider,
  Customer,
  Lead,
  Call,
  Booking,
  ConsentEvent,
  TimeSlot,
} from '@wise2/ai-phone';
import { PrismaService } from '../prisma/prisma.service';
import { phonesMatch, phoneTail } from './ai-phone.hours';

function fullName(first?: string | null, last?: string | null, fallback = 'Unknown'): string {
  const name = [first, last].filter(Boolean).join(' ').trim();
  return name || fallback;
}

export class TenantCrmAdapter implements CRMProvider {
  readonly name = 'WISE² CRM';

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantId: string,
  ) {}

  async lookupCustomer(phone: string): Promise<Customer | null> {
    const exact = await this.prisma.revenueCustomer.findFirst({
      where: { tenantId: this.tenantId, phone },
    });
    if (exact) return this.toCustomer(exact);

    const candidates = await this.prisma.revenueCustomer.findMany({
      where: { tenantId: this.tenantId, phone: { not: null } },
      take: 200,
    });
    const match = candidates.find((row) => phonesMatch(row.phone, phone));
    return match ? this.toCustomer(match) : null;
  }

  async createCustomer(data: Partial<Customer>): Promise<Customer> {
    const parts = (data.fullName || 'Caller').split(' ');
    const created = await this.prisma.revenueCustomer.create({
      data: {
        tenantId: this.tenantId,
        firstName: parts[0],
        lastName: parts.slice(1).join(' ') || null,
        phone: data.primaryPhone || null,
        email: data.email ?? null,
      },
    });
    return this.toCustomer(created);
  }

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
    const updated = await this.prisma.revenueCustomer.update({
      where: { id },
      data: {
        phone: data.primaryPhone,
        email: data.email,
      },
    });
    return this.toCustomer(updated);
  }

  async getCustomer(id: string): Promise<Customer | null> {
    const row = await this.prisma.revenueCustomer.findFirst({
      where: { id, tenantId: this.tenantId },
    });
    return row ? this.toCustomer(row) : null;
  }

  async createLead(data: Partial<Lead>): Promise<Lead> {
    const created = await this.prisma.lead.create({
      data: {
        tenantId: this.tenantId,
        customerId: data.customerId || undefined,
        source: data.source || 'ai-phone',
        summary: data.intent || 'Inbound AI Phone call',
        serviceCategory: data.intent,
        status: 'NEW',
      },
    });
    return this.toLead(created, data);
  }

  async updateLead(id: string, data: Partial<Lead>): Promise<Lead> {
    const updated = await this.prisma.lead.update({
      where: { id },
      data: {
        summary: data.intent,
        status: data.stage === 'qualified' ? 'QUALIFIED' : undefined,
      },
    });
    return this.toLead(updated, data);
  }

  async createCall(data: Partial<Call>): Promise<Call> {
    const created = await this.prisma.aiPhoneCall.create({
      data: {
        tenantId: this.tenantId,
        callSid: data.providerId,
        callerNumber: data.fromNumber || 'unknown',
        inboundNumber: data.toNumber,
        direction: data.direction === 'outbound' ? 'OUTBOUND' : 'INBOUND',
        status: 'IN_PROGRESS',
        summary: data.summary,
        customerId: data.customerId,
        leadId: data.leadId,
        startedAt: data.startedAt ?? new Date(),
      },
    });
    return this.toCall(created, data);
  }

  async updateCall(id: string, data: Partial<Call>): Promise<Call> {
    const updated = await this.prisma.aiPhoneCall.update({
      where: { id },
      data: {
        status: data.disposition === 'completed' ? 'COMPLETED' : undefined,
        summary: data.summary,
        endedAt: data.endedAt,
        customerId: data.customerId,
        leadId: data.leadId,
      },
    });
    return this.toCall(updated, data);
  }

  async getCall(id: string): Promise<Call | null> {
    const row = await this.prisma.aiPhoneCall.findFirst({
      where: { id, tenantId: this.tenantId },
    });
    return row ? this.toCall(row, {}) : null;
  }

  async createBooking(data: Partial<Booking>): Promise<Booking> {
    const job = await this.prisma.serviceJob.create({
      data: {
        tenantId: this.tenantId,
        customerId: data.customerId || undefined,
        serviceType: data.serviceType,
        scheduledStart: data.startAt,
        scheduledEnd: data.endAt,
        status: 'SCHEDULED',
        notes: `Booked via WISE² AI Phone${data.sourceCallId ? ` (call ${data.sourceCallId})` : ''}`,
        sourceAttribution: 'ai-phone',
      },
    });
    return {
      id: job.id,
      customerId: data.customerId || '',
      locationId: this.tenantId,
      serviceType: data.serviceType || 'service',
      startAt: data.startAt || new Date(),
      endAt: data.endAt || new Date(),
      status: 'confirmed',
      sourceCallId: data.sourceCallId,
      confirmationNumber: job.id.slice(-8).toUpperCase(),
      createdAt: job.createdAt,
    };
  }

  async updateBooking(id: string, data: Partial<Booking>): Promise<Booking> {
    const job = await this.prisma.serviceJob.update({
      where: { id },
      data: {
        scheduledStart: data.startAt,
        scheduledEnd: data.endAt,
        notes: data.status,
      },
    });
    return {
      id: job.id,
      customerId: job.customerId || '',
      locationId: this.tenantId,
      serviceType: job.serviceType || 'service',
      startAt: job.scheduledStart || new Date(),
      endAt: job.scheduledEnd || new Date(),
      status: data.status || 'confirmed',
      confirmationNumber: job.id.slice(-8).toUpperCase(),
      createdAt: job.createdAt,
    };
  }

  async getAvailability(serviceType: string, date: Date): Promise<TimeSlot[]> {
    const start = new Date(date);
    start.setHours(9, 0, 0, 0);
    return [
      { start, end: new Date(start.getTime() + 90 * 60 * 1000), technician: 'Available tech' },
      {
        start: new Date(start.getTime() + 3 * 60 * 60 * 1000),
        end: new Date(start.getTime() + 4.5 * 60 * 60 * 1000),
        technician: 'Available tech',
      },
    ];
  }

  async checkConsent(phone: string, purpose: string): Promise<ConsentEvent | null> {
    const customer = await this.lookupCustomer(phone);
    if (!customer) return null;
    const record = await this.prisma.consentRecord.findFirst({
      where: { tenantId: this.tenantId, customerId: customer.id, channel: 'CALL' },
      orderBy: { occurredAt: 'desc' },
    });
    if (!record) return null;
    return {
      id: record.id,
      customerId: customer.id,
      phone,
      channel: 'voice',
      purpose,
      legalBasis: 'consent',
      status: record.state === 'OPTED_IN' ? 'granted' : 'denied',
      source: record.source || 'ai-phone',
      capturedAt: record.occurredAt,
    };
  }

  async recordConsent(data: Partial<ConsentEvent>): Promise<ConsentEvent> {
    const customer = data.phone ? await this.lookupCustomer(data.phone) : null;
    const channel =
      data.channel === 'sms' ? 'SMS' : data.channel === 'email' ? 'EMAIL' : 'CALL';
    const record = await this.prisma.consentRecord.create({
      data: {
        tenantId: this.tenantId,
        customerId: customer?.id ?? data.customerId,
        channel,
        state: data.status === 'denied' ? 'OPTED_OUT' : 'OPTED_IN',
        source: data.source || 'ai-phone',
        keyword: data.purpose,
      },
    });
    return {
      id: record.id,
      customerId: record.customerId ?? undefined,
      phone: data.phone || phoneTail(customer?.primaryPhone) || '',
      channel: data.channel || 'voice',
      purpose: data.purpose || 'follow-up',
      legalBasis: data.legalBasis || 'consent',
      status: data.status || 'granted',
      source: 'ai-phone',
      capturedAt: record.occurredAt,
    };
  }

  private toCustomer(row: {
    id: string;
    tenantId: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    email: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Customer {
    return {
      id: row.id,
      tenantId: row.tenantId,
      fullName: fullName(row.firstName, row.lastName),
      primaryPhone: row.phone || '',
      email: row.email ?? undefined,
      preferredContactMethod: 'phone',
      verificationLevel: 'name_phone',
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private toLead(
    row: { id: string; customerId: string | null; source: string; summary: string | null; createdAt: Date },
    data: Partial<Lead>,
  ): Lead {
    return {
      id: row.id,
      customerId: row.customerId || data.customerId || '',
      source: 'inbound_call',
      intent: data.intent || row.summary || '',
      stage: data.stage || 'new',
      priority: data.priority || 'medium',
      createdAt: row.createdAt,
    };
  }

  private toCall(
    row: {
      id: string;
      tenantId: string;
      callSid: string | null;
      callerNumber: string;
      inboundNumber: string | null;
      direction: string;
      startedAt: Date;
      endedAt: Date | null;
      summary: string | null;
      customerId: string | null;
      leadId: string | null;
    },
    data: Partial<Call>,
  ): Call {
    return {
      id: row.id,
      tenantId: row.tenantId,
      providerId: row.callSid || row.id,
      direction: row.direction === 'OUTBOUND' ? 'outbound' : 'inbound',
      fromNumber: row.callerNumber,
      toNumber: row.inboundNumber || '',
      startedAt: row.startedAt,
      endedAt: row.endedAt ?? undefined,
      disposition: data.disposition || 'in-progress',
      recordingStatus: 'none',
      transcriptStatus: 'pending',
      summary: row.summary ?? undefined,
      confidence: 0.9,
      costEstimate: 0,
      customerId: row.customerId ?? undefined,
      leadId: row.leadId ?? undefined,
    };
  }
}
