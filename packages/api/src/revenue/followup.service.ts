import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FollowUpTask } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class FollowUpService {
  constructor(private prisma: PrismaService) {}

  /**
   * Schedule a follow-up task
   */
  async scheduleFollowUp(
    leadId: string,
    channel: 'sms' | 'email' | 'call',
    message: string,
    delayMinutes: number,
  ): Promise<FollowUpTask> {
    // Verify lead exists
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new Error(`Lead ${leadId} not found`);
    }

    // Check opt-out status
    const hasOptedOut = await this.checkOptOut(leadId, channel);
    if (hasOptedOut) {
      throw new Error(`Lead has opted out of ${channel} communications`);
    }

    // Calculate scheduled time
    const scheduledFor = new Date();
    scheduledFor.setMinutes(scheduledFor.getMinutes() + delayMinutes);

    const task = await this.prisma.followUpTask.create({
      data: {
        leadId,
        channel,
        message,
        scheduledFor,
        status: 'PENDING',
        optOut: false,
      },
    });

    return task;
  }

  /**
   * Create automated follow-up sequence based on deal stage
   */
  async createFollowUpSequence(leadId: string, stage: string): Promise<void> {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new Error(`Lead ${leadId} not found`);
    }

    const sequences = {
      DISCOVERY: [
        { delay: 0, channel: 'sms', message: 'Thanks for speaking with us today! We\'d love to help your business.' },
        { delay: 1440, channel: 'email', message: 'Following up on our conversation - here are some resources.' },
        { delay: 2880, channel: 'sms', message: 'Quick check-in - any questions about what we discussed?' },
      ],
      QUALIFICATION: [
        { delay: 0, channel: 'sms', message: 'We\'ve reviewed your needs. This solution is a perfect fit.' },
        { delay: 720, channel: 'email', message: 'See how similar companies have benefited from this.' },
        { delay: 1440, channel: 'call', message: 'Brief call to answer any final questions before moving forward?' },
      ],
      PROPOSAL: [
        { delay: 0, channel: 'sms', message: 'Proposal sent! Here\'s the link to review: [link]' },
        { delay: 1440, channel: 'email', message: 'Custom proposal ready - let\'s discuss implementation timeline.' },
        { delay: 2880, channel: 'sms', message: 'Ready to move forward? We can start setup this week.' },
      ],
      CLOSING: [
        { delay: 0, channel: 'sms', message: 'Payment link sent - let\'s get started! 🚀' },
        { delay: 120, channel: 'sms', message: 'Quick reminder: payment link expires in 7 days.' },
        { delay: 1440, channel: 'call', message: 'Onboarding call scheduled - let\'s make sure you\'re all set.' },
      ],
    };

    const sequence = sequences[stage] || [];

    for (const task of sequence) {
      try {
        await this.scheduleFollowUp(
          leadId,
          task.channel as any,
          task.message,
          task.delay,
        );
      } catch (error) {
        console.error(`Error scheduling follow-up: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  /**
   * Reactivation campaign for old leads
   */
  async createReactivationCampaign(leadId: string): Promise<void> {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new Error(`Lead ${leadId} not found`);
    }

    const daysSinceUpdate = Math.floor(
      (Date.now() - new Date(lead.updatedAt).getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysSinceUpdate < 30) {
      throw new Error('Lead not old enough for reactivation campaign');
    }

    const messages = [
      {
        delay: 0,
        channel: 'email',
        message: 'We haven\'t heard from you in a while - miss us? 😊',
      },
      {
        delay: 1440,
        channel: 'sms',
        message: 'Special offer just for you: [offer]. Valid for 5 days only.',
      },
      {
        delay: 2880,
        channel: 'call',
        message: 'Brief call to see what\'s changed and how we can help now.',
      },
    ];

    for (const msg of messages) {
      try {
        await this.scheduleFollowUp(
          leadId,
          msg.channel as any,
          msg.message,
          msg.delay,
        );
      } catch (error) {
        console.error(`Error scheduling reactivation: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  /**
   * Process pending follow-ups (runs every 5 minutes)
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async processPendingFollowUps(): Promise<void> {
    const now = new Date();

    const pendingTasks = await this.prisma.followUpTask.findMany({
      where: {
        status: 'PENDING',
        scheduledFor: { lte: now },
        optOut: false,
      },
      include: { lead: true },
      take: 50, // Process max 50 per run
    });

    for (const task of pendingTasks) {
      try {
        await this.sendFollowUp(task);
      } catch (error) {
        console.error(
          `Error sending follow-up ${task.id}: ${error instanceof Error ? error.message : String(error)}`,
        );

        // Mark as failed
        await this.prisma.followUpTask.update({
          where: { id: task.id },
          data: { status: 'FAILED' },
        });
      }
    }
  }

  /**
   * Send a follow-up via the appropriate channel
   */
  private async sendFollowUp(task: FollowUpTask & { lead: { id: string } }): Promise<void> {
    const message = task.message || '';
    switch (task.channel) {
      case 'sms':
        await this.sendSMS(task.lead.id, message);
        break;
      case 'email':
        await this.sendEmail(task.lead.id, message);
        break;
      case 'call':
        await this.scheduleCall(task.lead.id, message);
        break;
      default:
        throw new Error(`Unknown channel: ${task.channel}`);
    }

    // Mark as sent
    await this.prisma.followUpTask.update({
      where: { id: task.id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    });
  }

  /**
   * Send SMS follow-up
   * TODO: Integrate with SMS provider (Twilio, Telnyx, etc.)
   */
  private async sendSMS(leadId: string, message: string): Promise<void> {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new Error(`Lead ${leadId} not found`);
    }

    // TODO: Integrate with SMS provider
    console.log(`[SMS] To ${lead.id}: ${message}`);

    // TODO: Log SMS message once smsMessage model exists
    // await this.prisma.smsMessage.create({
    //   data: {
    //     fromNumber: process.env.SMS_FROM_NUMBER || '+1-WISE2-CORE',
    //     toNumber: '+1-PLACEHOLDER', // TODO: Get real phone number
    //     direction: 'OUTBOUND',
    //     message,
    //     status: 'SENT',
    //     sentAt: new Date(),
    //   },
    // });
  }

  /**
   * Send email follow-up
   * TODO: Integrate with email provider
   */
  private async sendEmail(leadId: string, message: string): Promise<void> {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new Error(`Lead ${leadId} not found`);
    }

    // TODO: Integrate with email provider (SendGrid, etc.)
    console.log(`[EMAIL] To ${lead.id}: ${message}`);
  }

  /**
   * Schedule a callback call
   */
  private async scheduleCall(leadId: string, message: string): Promise<void> {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new Error(`Lead ${leadId} not found`);
    }

    // TODO: Integrate with phone system to schedule call
    console.log(`[CALL] To ${lead.id}: ${message}`);
  }

  /**
   * Check if lead has opted out of a communication channel
   */
  private async checkOptOut(leadId: string, channel: string): Promise<boolean> {
    // TODO: Implement consent check once Consent model is available
    // For now, assume all leads have opted in
    return false;
  }

  /**
   * Map communication channel to consent type
   */
  private mapChannelToConsentType(channel: string): string {
    const mapping = {
      sms: 'sms_marketing',
      email: 'email_marketing',
      call: 'call_marketing',
    };
    return mapping[channel] || channel;
  }

  /**
   * Get pending follow-ups for a lead
   */
  async getPendingFollowUps(leadId: string): Promise<FollowUpTask[]> {
    return this.prisma.followUpTask.findMany({
      where: {
        leadId,
        status: 'PENDING',
      },
      orderBy: { scheduledFor: 'asc' },
    });
  }

  /**
   * Cancel follow-up task
   */
  async cancelFollowUp(taskId: string): Promise<void> {
    await this.prisma.followUpTask.update({
      where: { id: taskId },
      data: { status: 'CANCELLED' },
    });
  }
}
