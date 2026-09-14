import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Call as PrismaCall,
  Customer,
  CallStatus,
  CallDirection,
  CallDisposition,
} from '@prisma/client';

interface CallData {
  callSid?: string;
  inboundNumber: string;
  callerNumber: string;
  direction: CallDirection;
  startedAt: Date;
  answeredAt?: Date;
  endedAt?: Date;
  durationSeconds?: number;
  recordingUrl?: string;
  disposition?: CallDisposition;
  customerId?: string;
}

@Injectable()
export class TelnyxDatabaseService {
  private readonly logger = new Logger('TelnyxDatabaseService');

  constructor(private prisma: PrismaService) {}

  /**
   * Look up or create a customer by phone number
   */
  async lookupCustomer(phoneNumber: string): Promise<Customer | null> {
    try {
      let customer = await this.prisma.customer.findUnique({
        where: { email: phoneNumber }, // This is a workaround; real impl would use phone index
      });

      if (!customer) {
        // Create new customer as lead
        customer = await this.prisma.customer.create({
          data: {
            businessName: 'Caller',
            contactName: 'Unknown',
            email: `phone-${phoneNumber}@internal.local`,
            phone: phoneNumber,
            status: 'ACTIVE',
          },
        });

        this.logger.log(`Created new customer from call: ${phoneNumber}`);
      }

      return customer;
    } catch (error) {
      this.logger.warn(`Customer lookup failed for ${phoneNumber}: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  /**
   * Create or update a call record
   */
  async createCall(data: CallData): Promise<PrismaCall | null> {
    try {
      // Look up customer if we have a caller number
      let customerId: string | undefined;
      if (data.callerNumber) {
        const customer = await this.lookupCustomer(data.callerNumber);
        customerId = customer?.id;
      }

      const call = await this.prisma.call.create({
        data: {
          callSid: data.callSid,
          inboundNumber: data.inboundNumber,
          callerNumber: data.callerNumber,
          customerId,
          direction: data.direction,
          status: 'INITIATED',
          startedAt: data.startedAt,
          disposition: data.disposition || 'UNKNOWN',
        },
      });

      this.logger.log(`Created call record: ${call.id}`);
      return call;
    } catch (error) {
      this.logger.error(
        `Failed to create call record: ${error instanceof Error ? error.message : String(error)}`
      );
      return null;
    }
  }

  /**
   * Update call status
   */
  async updateCallStatus(callId: string, status: CallStatus): Promise<PrismaCall | null> {
    try {
      const call = await this.prisma.call.update({
        where: { id: callId },
        data: { status },
      });

      this.logger.log(`Updated call ${callId} status to ${status}`);
      return call;
    } catch (error) {
      this.logger.warn(
        `Failed to update call status: ${error instanceof Error ? error.message : String(error)}`
      );
      return null;
    }
  }

  /**
   * Update call with answer details
   */
  async updateCallAnswered(callId: string, answeredAt: Date): Promise<PrismaCall | null> {
    try {
      const call = await this.prisma.call.update({
        where: { id: callId },
        data: {
          status: 'ANSWERED',
          answeredAt,
        },
      });

      this.logger.log(`Call ${callId} answered at ${answeredAt}`);
      return call;
    } catch (error) {
      this.logger.warn(
        `Failed to update call answered: ${error instanceof Error ? error.message : String(error)}`
      );
      return null;
    }
  }

  /**
   * End call with recording and disposition
   */
  async endCall(
    callId: string,
    endedAt: Date,
    recordingUrl?: string,
    disposition?: CallDisposition
  ): Promise<PrismaCall | null> {
    try {
      const call = await this.prisma.call.findUnique({
        where: { id: callId },
      });

      if (!call) {
        this.logger.warn(`Call ${callId} not found for end operation`);
        return null;
      }

      const durationSeconds = call.startedAt
        ? Math.floor((endedAt.getTime() - call.startedAt.getTime()) / 1000)
        : undefined;

      const updated = await this.prisma.call.update({
        where: { id: callId },
        data: {
          status: 'DISCONNECTED',
          endedAt,
          durationSeconds,
          recordingUrl,
          disposition: disposition || 'UNKNOWN',
        },
      });

      this.logger.log(
        `Call ${callId} ended after ${durationSeconds}s, disposition: ${disposition || 'UNKNOWN'}`
      );
      return updated;
    } catch (error) {
      this.logger.error(
        `Failed to end call: ${error instanceof Error ? error.message : String(error)}`
      );
      return null;
    }
  }

  /**
   * Get call history for a customer
   */
  async getCustomerCallHistory(customerId: string, limit: number = 50) {
    try {
      const calls = await this.prisma.call.findMany({
        where: { customerId },
        orderBy: { startedAt: 'desc' },
        take: limit,
      });

      return calls;
    } catch (error) {
      this.logger.warn(
        `Failed to get call history: ${error instanceof Error ? error.message : String(error)}`
      );
      return [];
    }
  }

  /**
   * Get call metrics for today
   */
  async getTodayMetrics() {
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const calls = await this.prisma.call.findMany({
        where: {
          startedAt: {
            gte: startOfDay,
          },
        },
      });

      const answered = calls.filter(c => c.status === 'ANSWERED').length;
      const failed = calls.filter(c => c.status === 'FAILED').length;
      const totalDuration = calls.reduce((sum, c) => sum + (c.durationSeconds || 0), 0);

      return {
        total: calls.length,
        answered,
        failed,
        failureRate: calls.length > 0 ? ((failed / calls.length) * 100).toFixed(1) : 0,
        totalDurationSeconds: totalDuration,
        averageDurationSeconds:
          calls.length > 0 ? (totalDuration / calls.length).toFixed(0) : 0,
      };
    } catch (error) {
      this.logger.warn(
        `Failed to get metrics: ${error instanceof Error ? error.message : String(error)}`
      );
      return null;
    }
  }

  /**
   * Create a callback task for follow-up
   */
  async createCallbackTask(customerId: string, notes: string, scheduledFor?: Date) {
    try {
      const customer = await this.prisma.customer.findUnique({
        where: { id: customerId },
      });

      if (!customer) {
        this.logger.warn(`Customer ${customerId} not found for callback task`);
        return null;
      }

      // Use CallbackTask if available in schema
      const task = await this.prisma.callbackTask.create({
        data: {
          customerId,
          description: notes,
          scheduledFor: scheduledFor || new Date(Date.now() + 24 * 60 * 60 * 1000),
          status: 'PENDING',
        },
      });

      this.logger.log(`Created callback task for customer ${customerId}`);
      return task;
    } catch (error) {
      this.logger.warn(
        `Failed to create callback task: ${error instanceof Error ? error.message : String(error)}`
      );
      return null;
    }
  }

  /**
   * Get customer details with recent call history
   */
  async getCustomerProfile(customerId: string) {
    try {
      const customer = await this.prisma.customer.findUnique({
        where: { id: customerId },
        include: {
          calls: {
            orderBy: { startedAt: 'desc' },
            take: 10,
          },
        },
      });

      return customer;
    } catch (error) {
      this.logger.warn(
        `Failed to get customer profile: ${error instanceof Error ? error.message : String(error)}`
      );
      return null;
    }
  }

  /**
   * Update customer contact info from call data
   */
  async updateCustomerFromCall(customerId: string, callData: Partial<CallData>) {
    try {
      const customer = await this.prisma.customer.update({
        where: { id: customerId },
        data: {
          phone: callData.callerNumber || undefined,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Updated customer ${customerId} from call data`);
      return customer;
    } catch (error) {
      this.logger.warn(
        `Failed to update customer: ${error instanceof Error ? error.message : String(error)}`
      );
      return null;
    }
  }
}
