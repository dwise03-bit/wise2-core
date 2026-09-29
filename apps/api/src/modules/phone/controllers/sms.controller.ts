/**
 * SMS & Outbound Communication API Controller
 * Endpoints for SMS sending, campaigns, and callbacks
 */

import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
  Inject,
} from '@nestjs/common';
import { ITelephonyProvider } from '../providers/telephony.provider';
import { PrismaService } from '@shared/services/prisma.service';

export interface SendSMSDto {
  customerId: string;
  toNumber: string;
  message: string;
  fromNumber?: string;
  templateId?: string;
  variables?: Record<string, string>;
}

export interface CreateCampaignDto {
  name: string;
  campaignType: 'reminder' | 'follow_up' | 'maintenance' | 'survey' | 'other';
  templateText: string;
  targetAudience: 'all' | 'customers' | 'new_customers' | 'at_risk';
  scheduledAt?: Date;
}

export interface CreateCallbackDto {
  customerId: string;
  toNumber: string;
  maxAttempts?: number;
  method?: 'CALL' | 'SMS';
}

@Controller('api/v1/phone')
export class SMSController {
  private readonly logger = new Logger(SMSController.name);

  constructor(
    @Inject('TELEPHONY_PROVIDER') private provider: ITelephonyProvider,
    private prisma: PrismaService,
  ) {}

  /**
   * Send SMS to customer
   */
  @Post('sms/send')
  @HttpCode(HttpStatus.CREATED)
  async sendSMS(@Body() dto: SendSMSDto): Promise<{
    smsId: string;
    status: string;
    to: string;
  }> {
    try {
      this.logger.log(`Sending SMS to ${dto.toNumber}`);

      // Send via provider
      const smsId = await this.provider.sendSMS(
        dto.toNumber,
        dto.message,
        dto.fromNumber
      );

      // Store in database
      const sms = await this.prisma.sMSMessage.create({
        data: {
          smsId,
          fromNumber: dto.fromNumber || '',
          toNumber: dto.toNumber,
          customerId: dto.customerId,
          message: dto.message,
          direction: 'OUTBOUND',
          status: 'SENT',
          sentAt: new Date(),
          templateId: dto.templateId,
          variables: dto.variables ? JSON.stringify(dto.variables) : undefined,
        },
      });

      return {
        smsId: sms.id,
        status: 'SENT',
        to: dto.toNumber,
      };
    } catch (error) {
      this.logger.error(`SMS send failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get SMS status
   */
  @Get('sms/:smsId')
  async getSMSStatus(@Param('smsId') smsId: string): Promise<{
    smsId: string;
    status: string;
    deliveredAt?: Date;
  }> {
    try {
      const sms = await this.prisma.sMSMessage.findUnique({
        where: { id: smsId },
      });

      if (!sms) {
        throw new Error(`SMS not found: ${smsId}`);
      }

      return {
        smsId: sms.id,
        status: sms.status,
        deliveredAt: sms.deliveredAt || undefined,
      };
    } catch (error) {
      this.logger.error(`SMS status lookup failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create SMS campaign
   */
  @Post('campaigns/create')
  @HttpCode(HttpStatus.CREATED)
  async createCampaign(@Body() dto: CreateCampaignDto): Promise<{
    campaignId: string;
    name: string;
    status: string;
  }> {
    try {
      this.logger.log(`Creating SMS campaign: ${dto.name}`);

      const campaign = await this.prisma.outboundCampaign.create({
        data: {
          name: dto.name,
          campaignType: dto.campaignType,
          templateText: dto.templateText,
          targetAudience: dto.targetAudience,
          status: 'DRAFT',
          scheduledAt: dto.scheduledAt,
        },
      });

      return {
        campaignId: campaign.id,
        name: campaign.name,
        status: 'DRAFT',
      };
    } catch (error) {
      this.logger.error(`Campaign creation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get campaign status
   */
  @Get('campaigns/:campaignId')
  async getCampaignStatus(@Param('campaignId') campaignId: string): Promise<{
    campaignId: string;
    name: string;
    status: string;
    messagesSent: number;
    messagesDelivered: number;
    messagesFailed: number;
  }> {
    try {
      const campaign = await this.prisma.outboundCampaign.findUnique({
        where: { id: campaignId },
      });

      if (!campaign) {
        throw new Error(`Campaign not found: ${campaignId}`);
      }

      return {
        campaignId: campaign.id,
        name: campaign.name,
        status: campaign.status,
        messagesSent: campaign.messagesSent,
        messagesDelivered: campaign.messagesDelivered,
        messagesFailed: campaign.messagesFailed,
      };
    } catch (error) {
      this.logger.error(`Campaign status lookup failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send campaign message to customer
   */
  @Post('campaigns/:campaignId/send-to/:customerId')
  @HttpCode(HttpStatus.OK)
  async sendCampaignMessage(
    @Param('campaignId') campaignId: string,
    @Param('customerId') customerId: string
  ): Promise<{ success: boolean; smsId: string }> {
    try {
      const campaign = await this.prisma.outboundCampaign.findUnique({
        where: { id: campaignId },
      });

      const customer = await this.prisma.customer.findUnique({
        where: { id: customerId },
      });

      if (!campaign || !customer) {
        throw new Error('Campaign or customer not found');
      }

      // Check customer consent
      const consent = await this.prisma.consent.findUnique({
        where: { customerId_consentType: { customerId, consentType: 'sms_marketing' } },
      });

      if (!consent?.isGiven) {
        this.logger.warn(`SMS blocked - no consent for ${customerId}`);
        return { success: false, smsId: '' };
      }

      // Check if opted out
      const optOut = await this.prisma.optOut.findUnique({
        where: { phoneNumber: customer.phone || '' },
      });

      if (optOut) {
        this.logger.warn(`SMS blocked - opted out ${customerId}`);
        return { success: false, smsId: '' };
      }

      // Send SMS
      const smsId = await this.provider.sendSMS(
        customer.phone || '',
        campaign.templateText
      );

      // Record SMS
      const sms = await this.prisma.sMSMessage.create({
        data: {
          smsId,
          fromNumber: '',
          toNumber: customer.phone || '',
          customerId,
          message: campaign.templateText,
          direction: 'OUTBOUND',
          status: 'SENT',
          campaignId,
          sentAt: new Date(),
        },
      });

      // Update campaign metrics
      await this.prisma.outboundCampaign.update({
        where: { id: campaignId },
        data: { messagesSent: { increment: 1 } },
      });

      return { success: true, smsId: sms.id };
    } catch (error) {
      this.logger.error(`Campaign message send failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create callback task for missed call
   */
  @Post('callbacks/create')
  @HttpCode(HttpStatus.CREATED)
  async createCallback(@Body() dto: CreateCallbackDto): Promise<{
    callbackId: string;
    status: string;
    nextAttempt: Date;
  }> {
    try {
      this.logger.log(`Creating callback task for ${dto.customerId}`);

      // Calculate next attempt (in 1 hour)
      const nextAttempt = new Date(Date.now() + 60 * 60 * 1000);

      const callback = await this.prisma.callbackTask.create({
        data: {
          customerId: dto.customerId,
          maxAttempts: dto.maxAttempts || 3,
          nextAttempt,
          status: 'PENDING',
          method: dto.method || 'CALL',
        },
      });

      return {
        callbackId: callback.id,
        status: 'PENDING',
        nextAttempt,
      };
    } catch (error) {
      this.logger.error(`Callback creation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get pending callbacks
   */
  @Get('callbacks/pending')
  async getPendingCallbacks(): Promise<{
    count: number;
    callbacks: Array<{
      callbackId: string;
      customerId: string;
      nextAttempt: Date;
      attempts: number;
    }>;
  }> {
    try {
      const callbacks = await this.prisma.callbackTask.findMany({
        where: {
          status: 'PENDING',
          nextAttempt: { lte: new Date() },
        },
        take: 20,
      });

      return {
        count: callbacks.length,
        callbacks: callbacks.map((c) => ({
          callbackId: c.id,
          customerId: c.customerId,
          nextAttempt: c.nextAttempt || new Date(),
          attempts: c.attempts,
        })),
      };
    } catch (error) {
      this.logger.error(`Pending callbacks fetch failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Mark callback as completed
   */
  @Post('callbacks/:callbackId/complete')
  @HttpCode(HttpStatus.OK)
  async completeCallback(@Param('callbackId') callbackId: string): Promise<{
    success: boolean;
  }> {
    try {
      await this.prisma.callbackTask.update({
        where: { id: callbackId },
        data: { status: 'COMPLETED', updatedAt: new Date() },
      });

      return { success: true };
    } catch (error) {
      this.logger.error(`Callback completion failed: ${error.message}`);
      throw error;
    }
  }
}
