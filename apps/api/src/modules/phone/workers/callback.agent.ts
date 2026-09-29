/**
 * Callback Agent
 * Background worker for executing missed-call callbacks
 * Polls pending callbacks and initiates calls
 */

import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ITelephonyProvider } from '../providers/telephony.provider';
import { CallSessionService } from '../services/call-session.service';
import { PrismaService } from '@shared/services/prisma.service';

@Injectable()
export class CallbackAgent {
  private readonly logger = new Logger(CallbackAgent.name);
  private isRunning = false;

  constructor(
    @Inject('TELEPHONY_PROVIDER') private provider: ITelephonyProvider,
    private callSession: CallSessionService,
    private prisma: PrismaService,
  ) {}

  /**
   * Run every minute to check for pending callbacks
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async processPendingCallbacks(): Promise<void> {
    if (this.isRunning) return; // Prevent concurrent executions

    this.isRunning = true;

    try {
      const now = new Date();

      // Get pending callbacks that are ready to execute
      const pendingCallbacks = await this.prisma.callbackTask.findMany({
        where: {
          status: 'PENDING',
          nextAttempt: { lte: now },
          attempts: { lt: 10 }, // Configurable max attempts
        },
        include: { customer: true },
        take: 5, // Process max 5 at a time to avoid overload
      });

      if (pendingCallbacks.length === 0) {
        return; // No callbacks to process
      }

      this.logger.log(`Processing ${pendingCallbacks.length} pending callbacks`);

      for (const callback of pendingCallbacks) {
        try {
          await this.executeCallback(callback);
        } catch (error) {
          this.logger.error(
            `Callback execution failed: ${callback.id} - ${error.message}`
          );
          // Will retry on next interval
        }
      }
    } catch (error) {
      this.logger.error(`Callback agent error: ${error.message}`);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Execute a single callback
   */
  private async executeCallback(callback: any): Promise<void> {
    this.logger.log(
      `Executing callback ${callback.id} to ${callback.customer.phone}`
    );

    if (callback.method === 'CALL') {
      // Initiate call to customer
      const callSid = await this.provider.initiateCall({
        toNumber: callback.customer.phone || '',
        metadata: {
          callbackId: callback.id,
          customerId: callback.customerId,
          isCallback: true,
        },
      });

      // Start session
      await this.callSession.startSession(callSid, {
        callbackId: callback.id,
        customerId: callback.customerId,
        isCallback: true,
      });

      // Update callback status
      await this.prisma.callbackTask.update({
        where: { id: callback.id },
        data: {
          status: 'IN_PROGRESS',
          attempts: { increment: 1 },
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Callback call initiated: ${callSid}`);
    } else if (callback.method === 'SMS') {
      // Send SMS instead of call
      const message =
        'Hi! This is a callback from WISE² HVAC Solutions regarding your recent service request. Please call us back at your convenience.';

      const smsId = await this.provider.sendSMS(
        callback.customer.phone || '',
        message
      );

      await this.prisma.sMSMessage.create({
        data: {
          smsId,
          fromNumber: '',
          toNumber: callback.customer.phone || '',
          customerId: callback.customerId,
          message,
          direction: 'OUTBOUND',
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      // Mark callback as completed
      await this.prisma.callbackTask.update({
        where: { id: callback.id },
        data: {
          status: 'COMPLETED',
          attempts: { increment: 1 },
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Callback SMS sent: ${smsId}`);
    }
  }
}
