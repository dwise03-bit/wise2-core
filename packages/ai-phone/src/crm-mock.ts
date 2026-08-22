import { CRMProvider, Customer, Lead, Call, Booking, ConsentEvent, TimeSlot } from './types';
import { v4 as uuid } from 'uuid';

export class CRMMock implements CRMProvider {
  readonly name = 'CRM Mock';

  private customers = new Map<string, Customer>();
  private leads = new Map<string, Lead>();
  private calls = new Map<string, Call>();
  private bookings = new Map<string, Booking>();
  private consents = new Map<string, ConsentEvent>();
  private phoneIndex = new Map<string, string>(); // phone -> customerId

  async lookupCustomer(phone: string): Promise<Customer | null> {
    const customerId = this.phoneIndex.get(phone);
    if (!customerId) return null;
    return this.customers.get(customerId) || null;
  }

  async createCustomer(data: Partial<Customer>): Promise<Customer> {
    const customer: Customer = {
      id: uuid(),
      tenantId: data.tenantId || 'default-tenant',
      fullName: data.fullName || 'Unknown',
      primaryPhone: data.primaryPhone || '',
      email: data.email,
      preferredContactMethod: data.preferredContactMethod || 'phone',
      verificationLevel: data.verificationLevel || 'unverified',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.customers.set(customer.id, customer);
    if (customer.primaryPhone) {
      this.phoneIndex.set(customer.primaryPhone, customer.id);
    }

    return customer;
  }

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
    const customer = this.customers.get(id);
    if (!customer) throw new Error(`Customer ${id} not found`);

    Object.assign(customer, data, { updatedAt: new Date() });
    return customer;
  }

  async getCustomer(id: string): Promise<Customer | null> {
    return this.customers.get(id) || null;
  }

  async createLead(data: Partial<Lead>): Promise<Lead> {
    const lead: Lead = {
      id: uuid(),
      customerId: data.customerId || '',
      source: data.source || 'inbound_call',
      intent: data.intent || '',
      stage: data.stage || 'new',
      priority: data.priority || 'medium',
      estimatedValue: data.estimatedValue,
      ownerId: data.ownerId,
      createdAt: new Date(),
    };

    this.leads.set(lead.id, lead);
    return lead;
  }

  async updateLead(id: string, data: Partial<Lead>): Promise<Lead> {
    const lead = this.leads.get(id);
    if (!lead) throw new Error(`Lead ${id} not found`);

    Object.assign(lead, data);
    return lead;
  }

  async createCall(data: Partial<Call>): Promise<Call> {
    const call: Call = {
      id: uuid(),
      tenantId: data.tenantId || 'default-tenant',
      providerId: data.providerId || uuid(),
      direction: data.direction || 'inbound',
      fromNumber: data.fromNumber || '',
      toNumber: data.toNumber || '',
      startedAt: new Date(),
      disposition: data.disposition || 'pending',
      recordingStatus: data.recordingStatus || 'none',
      transcriptStatus: 'pending',
      confidence: 0,
      costEstimate: 0,
      customerId: data.customerId,
      leadId: data.leadId,
    };

    this.calls.set(call.id, call);
    return call;
  }

  async updateCall(id: string, data: Partial<Call>): Promise<Call> {
    const call = this.calls.get(id);
    if (!call) throw new Error(`Call ${id} not found`);

    Object.assign(call, data);
    return call;
  }

  async getCall(id: string): Promise<Call | null> {
    return this.calls.get(id) || null;
  }

  async createBooking(data: Partial<Booking>): Promise<Booking> {
    const booking: Booking = {
      id: uuid(),
      customerId: data.customerId || '',
      locationId: data.locationId || '',
      serviceType: data.serviceType || 'general',
      startAt: data.startAt || new Date(),
      endAt: data.endAt || new Date(),
      status: data.status || 'pending',
      sourceCallId: data.sourceCallId,
      technicianId: data.technicianId,
      confirmationNumber: `CONF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    this.bookings.set(booking.id, booking);
    return booking;
  }

  async updateBooking(id: string, data: Partial<Booking>): Promise<Booking> {
    const booking = this.bookings.get(id);
    if (!booking) throw new Error(`Booking ${id} not found`);

    Object.assign(booking, data);
    return booking;
  }

  async getAvailability(serviceType: string, date: Date): Promise<TimeSlot[]> {
    // Mock availability - return 3 slots on the given date
    const slots: TimeSlot[] = [];

    for (let hour = 8; hour < 17; hour += 3) {
      const start = new Date(date);
      start.setHours(hour, 0, 0, 0);

      const end = new Date(start);
      end.setHours(hour + 1, 30, 0, 0);

      slots.push({ start, end, technician: `Tech-${Math.ceil(hour / 3)}` });
    }

    return slots;
  }

  async checkConsent(phone: string, purpose: string): Promise<ConsentEvent | null> {
    const consents = Array.from(this.consents.values()).filter(
      (c) => c.phone === phone && c.purpose === purpose
    );

    if (consents.length === 0) return null;

    const latest = consents.sort(
      (a, b) => b.capturedAt.getTime() - a.capturedAt.getTime()
    )[0];

    if (latest.expiresAt && latest.expiresAt < new Date()) {
      return null;
    }

    return latest.status === 'granted' ? latest : null;
  }

  async recordConsent(data: Partial<ConsentEvent>): Promise<ConsentEvent> {
    const consent: ConsentEvent = {
      id: uuid(),
      phone: data.phone || '',
      channel: data.channel || 'voice',
      purpose: data.purpose || '',
      legalBasis: data.legalBasis || 'explicit_consent',
      status: data.status || 'granted',
      source: data.source || 'inbound_call',
      capturedAt: new Date(),
      expiresAt: data.expiresAt,
    };

    this.consents.set(consent.id, consent);
    return consent;
  }

  // Test utilities
  getStats(): Record<string, number> {
    return {
      customers: this.customers.size,
      leads: this.leads.size,
      calls: this.calls.size,
      bookings: this.bookings.size,
      consents: this.consents.size,
    };
  }

  clear(): void {
    this.customers.clear();
    this.leads.clear();
    this.calls.clear();
    this.bookings.clear();
    this.consents.clear();
    this.phoneIndex.clear();
  }
}
