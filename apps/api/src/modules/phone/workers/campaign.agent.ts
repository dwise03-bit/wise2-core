/**
 * SMS Campaign Agent
 * Background worker for executing scheduled SMS campaigns
 * Targets customers and sends messages respecting consent/opt-out
 */

import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ITelephonyProvider } from '../providers/telephony.provider';
import { PrismaService } from '@shared/services/prisma.service';

@Injectable()
export class CampaignAgent {
  private readonly logger = new Logger(CampaignAgent.name);
  private isRunning = false;

  constructor(
    @Inject('TELEPHONY_PROVIDER') private provider: ITelephonyProvider,
    private prisma: PrismaService,
  ) {}

  /**
   * Check for scheduled campaigns every 5 minutes
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async executeScheduledCampaigns(): Promise<void> {
    if (this.isRunning) return;

    this.isRunning = true;

    try {
      const now = new Date();

      // Get campaigns that should run now
      const campaigns = await this.prisma.outboundCampaign.findMany({
        where: {
          status: 'ACTIVE',
          startAt: { lte: now },
          OR: [{ endAt: null }, { endAt: { gte: now } }],
        },
      });

      if (campaigns.length === 0) {
        return;
      }

      this.logger.log(`Processing ${campaigns.length} active campaigns`);

      for (const campaign of campaigns) {
        try {
          await this.executeCampaign(campaign);
        } catch (error) {
          this.logger.error(
            `Campaign execution failed: ${campaign.id} - ${error.message}`
          );
        }
      }
    } catch (error) {
      this.logger.error(`Campaign agent error: ${error.message}`);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Execute a campaign for all targeted customers
   */
  private async executeCampaign(campaign: any): Promise<void> {
    this.logger.log(`Executing campaign: ${campaign.name}`);

    // Determine target audience
    const where: any = {};

    if (campaign.targetAudience === 'customers') {
      where.status = 'ACTIVE';
    } else if (campaign.targetAudience === 'new_customers') {
      // Customers added in last 30 days
      where.createdAt = {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      };
    } else if (campaign.targetAudience === 'at_risk') {
      // Customers with no activity in 60 days
      where.updatedAt = {
        lte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      };
    }
    // 'all' = no filters

    // Get target customers
    const customers = await this.prisma.customer.findMany({
      where,
      select: { id: true, phone: true },
      take: 100, // Batch process
    });

    let messagesSent = 0;
    let messagesFailed = 0;

    for (const customer of customers) {
      try {
        // Check consent for SMS marketing
        const consent = await this.prisma.consent.findUnique({
          where: {
            customerId_consentType: {
              customerId: customer.id,
              consentType: 'sms_marketing',
            },
          },
        });

        if (!consent?.isGiven) {
          this.logger.debug(`SMS skipped - no consent for ${customer.id}`);
          continue;
        }

        // Check opt-out list
        const optOut = await this.prisma.optOut.findUnique({
          where: { phoneNumber: customer.phone || '' },
        });

        if (optOut) {
          this.logger.debug(`SMS skipped - opted out ${customer.id}`);
          continue;
        }

        // Send SMS
        const smsId = await this.provider.sendSMS(
          customer.phone || '',
          campaign.templateText
        );

        // Record SMS
        await this.prisma.sMSMessage.create({
          data: {
            smsId,
            fromNumber: '',
            toNumber: customer.phone || '',
            customerId: customer.id,
            message: campaign.templateText,
            direction: 'OUTBOUND',
            status: 'SENT',
            campaignId: campaign.id,
            sentAt: new Date(),
          },
        });

        messagesSent++;
      } catch (error) {
        this.logger.error(
          `Failed to send SMS to ${customer.id}: ${error.message}`
        );
        messagesFailed++;
      }
    }

    // Update campaign metrics
    await this.prisma.outboundCampaign.update({
      where: { id: campaign.id },
      data: {
        messagesSent: { increment: messagesSent },
        messagesFailed: { increment: messagesFailed },
      },
    });

    this.logger.log(
      `Campaign executed: ${messagesSent} sent, ${messagesFailed} failed`
    );
  }
}
