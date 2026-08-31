/**
 * CRM HTTP Client
 * Communicates with WISE² API for lead/customer/booking operations
 */

import axios, { AxiosInstance } from 'axios';
import { logger } from '../logger';

export interface CRMCustomer {
  id: string;
  fullName: string;
  primaryPhone: string;
  email?: string;
}

export interface CRMLead {
  id: string;
  customerId?: string;
  source: string;
  intent: string;
  stage: 'new' | 'qualified' | 'lost';
}

export interface CRMBooking {
  id: string;
  customerId: string;
  serviceType: string;
  startAt: Date;
  endAt: Date;
  confirmationNumber: string;
  status: 'confirmed' | 'cancelled';
}

export class CRMClient {
  private client: AxiosInstance;
  private tenantId: string;

  constructor(tenantId: string, apiBaseUrl: string = 'http://localhost:3000') {
    this.tenantId = tenantId;
    this.client = axios.create({
      baseURL: apiBaseUrl,
      headers: {
        'X-Tenant-ID': tenantId,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
  }

  async lookupCustomer(phone: string): Promise<CRMCustomer | null> {
    try {
      logger.info(`[CRM] Looking up customer: ${phone}`);
      const response = await this.client.get('/api/v1/ai-phone/customer/lookup', {
        params: { phone },
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        logger.info(`[CRM] Customer not found: ${phone}`);
        return null;
      }
      logger.error(`[CRM] Lookup failed: ${error.message}`);
      return null;
    }
  }

  async createCustomer(data: {
    fullName: string;
    phone: string;
    email?: string;
  }): Promise<CRMCustomer> {
    try {
      logger.info(`[CRM] Creating customer: ${data.fullName}`);
      const response = await this.client.post(
        '/api/v1/ai-phone/customer',
        {
          fullName: data.fullName,
          primaryPhone: data.phone,
          email: data.email,
        },
      );
      logger.info(`[CRM] Customer created: ${response.data.id}`);
      return response.data;
    } catch (error: any) {
      logger.error(
        `[CRM] Create customer failed: ${error.response?.status || error.message}`,
      );
      throw error;
    }
  }

  async createLead(data: {
    customerId?: string;
    intent: string;
    sourceCallId: string;
  }): Promise<CRMLead> {
    try {
      logger.info(
        `[CRM] Creating lead: intent=${data.intent}, callId=${data.sourceCallId}`,
      );
      const response = await this.client.post('/api/v1/ai-phone/lead', {
        customerId: data.customerId,
        source: 'ai-phone',
        intent: data.intent,
        sourceCallId: data.sourceCallId,
      });
      logger.info(`[CRM] Lead created: ${response.data.id}`);
      return response.data;
    } catch (error: any) {
      logger.error(
        `[CRM] Create lead failed: ${error.response?.status || error.message}`,
      );
      throw error;
    }
  }

  async createBooking(data: {
    customerId: string;
    serviceType: string;
    startAt: Date;
    endAt: Date;
    sourceCallId: string;
  }): Promise<CRMBooking> {
    try {
      logger.info(
        `[CRM] Creating booking: ${data.serviceType} for ${data.customerId}`,
      );
      const response = await this.client.post('/api/v1/ai-phone/booking', {
        customerId: data.customerId,
        serviceType: data.serviceType,
        startAt: data.startAt,
        endAt: data.endAt,
        sourceCallId: data.sourceCallId,
      });
      logger.info(`[CRM] Booking created: ${response.data.confirmationNumber}`);
      return response.data;
    } catch (error: any) {
      logger.error(
        `[CRM] Create booking failed: ${error.response?.status || error.message}`,
      );
      throw error;
    }
  }

  async recordCallEvent(data: {
    callId: string;
    leadId?: string;
    customerId?: string;
    transcript: string;
    summary: string;
    duration: number;
    disposition: 'completed' | 'transferred' | 'ended';
  }): Promise<void> {
    try {
      logger.info(
        `[CRM] Recording call: ${data.callId} (${data.disposition})`,
      );
      await this.client.post('/api/v1/ai-phone/call-event', {
        callSid: data.callId,
        leadId: data.leadId,
        customerId: data.customerId,
        transcript: data.transcript,
        summary: data.summary,
        duration: data.duration,
        disposition: data.disposition,
      });
      logger.info(`[CRM] Call recorded: ${data.callId}`);
    } catch (error: any) {
      logger.error(
        `[CRM] Record call failed: ${error.response?.status || error.message}`,
      );
      throw error;
    }
  }
}

export default CRMClient;
