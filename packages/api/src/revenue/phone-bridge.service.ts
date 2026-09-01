import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LeadScoringService } from './lead-scoring.service';
import { OfferRecommendationService } from './offer-recommendation.service';
import { FollowUpService } from './followup.service';
import { Call, Lead, Deal } from '@prisma/client';

export interface CallInitiatedEvent {
  callSessionId: string;
  from: string;
  to: string;
  timestamp: Date;
}

export interface CallCompletedEvent {
  callSessionId: string;
  callId: string;
  duration: number;
  transcript?: string;
  summary?: string;
  status: string;
}

@Injectable()
export class PhoneBridgeService {
  constructor(
    private prisma: PrismaService,
    private scoringService: LeadScoringService,
    private recommendationService: OfferRecommendationService,
    private followUpService: FollowUpService,
  ) {}

  /**
   * Handle inbound call initiation
   * Called when Telnyx webhook receives "call.initiated" event
   */
  async handleCallInitiated(event: CallInitiatedEvent): Promise<{
    leadId?: string;
    customerId?: string;
    isNewLead: boolean;
  }> {
    const callerNumber = event.from;

    // 1. Try to find existing customer by phone
    let customer = await this.prisma.customer.findFirst({
      where: { phone: callerNumber },
    });

    // 2. Find or create lead
    let lead: Lead | null = null;

    if (customer) {
      lead = await this.prisma.lead.findFirst({
        where: { customerId: customer.id },
      });
    }

    const isNewLead = !lead;

    if (!lead) {
      // Create new lead for unknown caller
      lead = await this.prisma.lead.create({
        data: {
          tenantId: 'default-workspace', // TODO: Get from context
          source: 'inbound_call',
          status: 'NEW',
          summary: `Inbound call from ${callerNumber}`,
        },
      });

      // If no customer yet, create placeholder
      if (!customer) {
        customer = await this.prisma.customer.create({
          data: {
            businessName: callerNumber,
            contactName: callerNumber,
            email: `${callerNumber}@phone.wise2.io`,
            phone: callerNumber,
            status: 'ACTIVE',
          },
        });
      }

      // Link lead to customer
      await this.prisma.lead.update({
        where: { id: lead.id },
        data: { customerId: customer.id },
      });
    }

    // 3. Update lead with call context
    await this.prisma.lead.update({
      where: { id: lead.id },
      data: {
        updatedAt: new Date(),
      },
    });

    return {
      leadId: lead.id,
      customerId: customer?.id,
      isNewLead,
    };
  }

  /**
   * Handle call completion
   * Triggered when call ends and transcript is available
   */
  async handleCallCompleted(event: CallCompletedEvent): Promise<void> {
    const call = await this.prisma.call.findUnique({
      where: { id: event.callId },
      include: {
        customer: true,
        transcript: { include: { segments: true } },
      },
    });

    if (!call || !call.customer) {
      console.error(`Call ${event.callId} or customer not found`);
      return;
    }

    // 1. Find or create deal
    let deal = await this.prisma.deal.findFirst({
      where: { customerId: call.customerId },
    });

    if (!deal) {
      // Create new deal from call
      deal = await this.prisma.deal.create({
        data: {
          customerId: call.customerId,
          stage: 'DISCOVERY',
          status: 'OPEN',
          source: 'inbound_call',
          discoveredAt: new Date(),
          description: `Inbound call on ${new Date().toISOString()}`,
        },
      });

      console.log(`Created deal ${deal.id} from call`);
    }

    // 2. Find associated lead
    const lead = await this.prisma.lead.findFirst({
      where: { customerId: call.customerId },
    });

    if (!lead) {
      console.error(`No lead found for customer ${call.customerId}`);
      return;
    }

    // 3. Calculate lead score
    try {
      const leadScore = await this.scoringService.calculateLeadScore(lead.id);
      console.log(`Lead score: ${leadScore.totalScore}/700 (${leadScore.level})`);

      // Update deal with recommended offer if score is high
      if (leadScore.level === 'HOT' || leadScore.level === 'CLOSING_READY') {
        const recommendation =
          await this.recommendationService.getRecommendedOffer(lead.id);
        if (recommendation) {
          await this.prisma.deal.update({
            where: { id: deal.id },
            data: {
              aiClosableOfferId: recommendation.offer.id,
              stage:
                leadScore.level === 'CLOSING_READY'
                  ? 'CLOSING'
                  : 'PROPOSAL',
            },
          });
        }
      }
    } catch (error) {
      console.error(`Error scoring lead: ${error instanceof Error ? error.message : String(error)}`);
    }

    // 4. Schedule follow-ups
    try {
      const leadScore = await this.prisma.leadScore.findUnique({
        where: { leadId: lead.id },
      });

      if (leadScore && leadScore.level !== 'COLD') {
        // Create follow-up sequence
        const stage = this.mapScoreLevelToStage(leadScore.level);
        await this.followUpService.createFollowUpSequence(lead.id, stage);
        console.log(`Scheduled follow-ups for lead ${lead.id}`);
      }
    } catch (error) {
      console.error(`Error scheduling follow-ups: ${error instanceof Error ? error.message : String(error)}`);
    }

    // 5. Log call activity
    await this.prisma.dealActivity.create({
      data: {
        dealId: deal.id,
        activityType: 'call',
        channel: 'phone',
        summary: event.summary || `Inbound call - ${event.duration}s`,
        completedAt: new Date(),
      },
    });

    // 6. Log event for revenue tracking
    await this.prisma.revenueEvent.create({
      data: {
        eventType: 'inbound_call',
        dealId: deal.id,
        customerId: call.customerId,
        details: {
          callId: event.callId,
          duration: event.duration,
          leadScore: (
            await this.prisma.leadScore.findUnique({
              where: { leadId: lead.id },
            })
          )?.totalScore,
        },
      },
    });
  }

  /**
   * Post lead card to Discord when HOT lead detected
   */
  async publishLeadCardToDiscord(leadId: string): Promise<void> {
    const leadScore = await this.prisma.leadScore.findUnique({
      where: { leadId },
      include: { lead: true },
    });

    if (!leadScore) {
      console.error(`Lead score not found for ${leadId}`);
      return;
    }

    if (leadScore.level !== 'HOT' && leadScore.level !== 'CLOSING_READY') {
      return; // Only publish HOT/CLOSING leads
    }

    // TODO: Post to Discord channel
    const card = {
      title: `🔥 ${leadScore.level} Lead`,
      leadId,
      score: leadScore.totalScore,
      recommended: leadScore.recommendedAction,
      lead: leadScore.lead,
    };

    console.log(`Would post to Discord: ${JSON.stringify(card)}`);
  }

  /**
   * Map lead score level to deal stage
   */
  private mapScoreLevelToStage(level: string): string {
    const mapping = {
      COLD: 'DISCOVERY',
      WARM: 'QUALIFICATION',
      HOT: 'PROPOSAL',
      CLOSING_READY: 'CLOSING',
    };
    return mapping[level] || 'DISCOVERY';
  }

  /**
   * Get call history for a lead
   */
  async getCallHistory(leadId: string): Promise<Call[]> {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead || !lead.customerId) {
      return [];
    }

    return this.prisma.call.findMany({
      where: { customerId: lead.customerId },
      orderBy: { startedAt: 'desc' },
      take: 10,
    });
  }

  /**
   * Track missed call and schedule callback
   */
  async handleMissedCall(
    event: CallInitiatedEvent,
  ): Promise<{
    callbackScheduled: boolean;
    taskId?: string;
  }> {
    const callContext = await this.handleCallInitiated(event);

    if (!callContext.leadId) {
      return { callbackScheduled: false };
    }

    // Schedule callback task
    try {
      const taskId = await this.scheduleCallback(callContext.leadId);
      console.log(`Callback scheduled for lead ${callContext.leadId}`);

      return {
        callbackScheduled: true,
        taskId,
      };
    } catch (error) {
      console.error(`Error scheduling callback: ${error instanceof Error ? error.message : String(error)}`);
      return { callbackScheduled: false };
    }
  }

  /**
   * Schedule callback task for missed call
   */
  private async scheduleCallback(leadId: string): Promise<string> {
    const task = await this.followUpService.scheduleFollowUp(
      leadId,
      'sms',
      'Sorry we missed your call! Let\'s connect soon. Reply to this message to schedule a time.',
      5, // 5 minutes delay
    );

    return task.id;
  }
}
