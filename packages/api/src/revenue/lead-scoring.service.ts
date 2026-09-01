import { Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { CallTranscript, Lead, LeadScore, Call } from '@prisma/client';

export interface ScoringResult {
  leadId: string;
  scores: {
    fit: number;
    urgency: number;
    budget: number;
    authority: number;
    timeline: number;
    intent: number;
    engagement: number;
  };
  total: number;
  level: 'COLD' | 'WARM' | 'HOT' | 'CLOSING_READY';
  recommendedAction: string;
  confidence: number;
}

@Injectable()
export class LeadScoringService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calculate comprehensive lead score (0-700 scale)
   * Factors: Fit (100), Urgency (100), Budget (100), Authority (100),
   *          Timeline (100), Intent (100), Engagement (100)
   */
  async calculateLeadScore(leadId: string): Promise<LeadScore> {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        conversations: true,
        call: {
          include: {
            transcript: {
              include: { segments: true },
            },
            summary: true,
          },
        } as any,
      },
    });

    if (!lead) {
      throw new Error(`Lead ${leadId} not found`);
    }

    const scores = {
      fit: await this.scoreFit(lead),
      urgency: await this.scoreUrgency(lead),
      budget: await this.scoreBudget(lead),
      authority: await this.scoreAuthority(lead),
      timeline: await this.scoreTimeline(lead),
      intent: await this.scoreIntent(lead),
      engagement: await this.scoreEngagement(lead),
    };

    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    const level = this.scoreToLevel(total);

    const existingScore = await this.prisma.leadScore.findUnique({
      where: { leadId },
    });

    const leadScore = await this.prisma.leadScore.upsert({
      where: { leadId },
      update: {
        fitScore: scores.fit,
        urgencyScore: scores.urgency,
        budgetScore: scores.budget,
        authorityScore: scores.authority,
        timelineScore: scores.timeline,
        intentScore: scores.intent,
        engagementScore: scores.engagement,
        totalScore: total,
        level,
        recommendedAction: this.getRecommendedAction(level),
        lastCalculatedAt: new Date(),
        formula: JSON.stringify(scores),
      },
      create: {
        leadId,
        fitScore: scores.fit,
        urgencyScore: scores.urgency,
        budgetScore: scores.budget,
        authorityScore: scores.authority,
        timelineScore: scores.timeline,
        intentScore: scores.intent,
        engagementScore: scores.engagement,
        totalScore: total,
        level,
        recommendedAction: this.getRecommendedAction(level),
        formula: JSON.stringify(scores),
      },
    });

    return leadScore;
  }

  /**
   * Score: Service fit (does prospect need what we offer?)
   * Considers: stated service interest, industry match, problem alignment
   */
  private async scoreFit(lead: Lead & any): Promise<number> {
    let score = 0;

    // Service category match
    if (lead.serviceType) score += 20;
    if (lead.serviceCategory) score += 30;

    // Check transcript for service mentions
    if (lead.call?.transcript?.segments) {
      const transcript = lead.call.transcript.segments
        .map((s) => s.text)
        .join(' ')
        .toLowerCase();

      const serviceKeywords = [
        'website',
        'marketing',
        'sales',
        'automation',
        'crm',
        'dashboard',
        'ai',
        'business',
      ];
      const matches = serviceKeywords.filter((kw) => transcript.includes(kw));
      score += matches.length * 10;
    }

    // Call summary context
    if (lead.call?.summary?.reason) {
      if (
        lead.call.summary.reason.toLowerCase().includes('business') ||
        lead.call.summary.reason.toLowerCase().includes('growth')
      ) {
        score += 20;
      }
    }

    return Math.min(score, 100);
  }

  /**
   * Score: Urgency (how soon do they need this?)
   * Considers: stated timeline, urgency signals, call disposition
   */
  private async scoreUrgency(lead: Lead & any): Promise<number> {
    let score = 0;

    // Lead urgency status
    if (lead.urgency === 'URGENT') score += 40;
    else if (lead.urgency === 'HIGH') score += 25;
    else if (lead.urgency === 'NORMAL') score += 10;

    // Call summary urgency
    if (lead.call?.summary?.urgency === 'URGENT') score += 30;
    else if (lead.call?.summary?.urgency === 'PRIORITY') score += 20;

    // Urgency keywords in transcript
    if (lead.call?.transcript?.segments) {
      const transcript = lead.call.transcript.segments
        .map((s) => s.text)
        .join(' ')
        .toLowerCase();

      const urgencyKeywords = [
        'urgent',
        'asap',
        'immediately',
        'today',
        'this week',
        'critical',
        'broke',
        'broken',
        'failing',
      ];
      const urgencyMatches = urgencyKeywords.filter((kw) =>
        transcript.includes(kw),
      );
      score += urgencyMatches.length * 8;
    }

    return Math.min(score, 100);
  }

  /**
   * Score: Budget alignment (do they have budget?)
   * Considers: stated budget, company size, willingness to spend
   */
  private async scoreBudget(lead: Lead & any): Promise<number> {
    let score = 0;

    // Estimated value from lead
    if (lead.estimatedValue) {
      const value = Number(lead.estimatedValue);
      if (value > 5000) score += 40;
      else if (value > 1000) score += 25;
      else if (value > 0) score += 10;
    }

    // Budget keywords in transcript
    if (lead.call?.transcript?.segments) {
      const transcript = lead.call.transcript.segments
        .map((s) => s.text)
        .join(' ')
        .toLowerCase();

      if (transcript.includes('budget')) score += 15;
      if (
        transcript.includes('$') ||
        transcript.includes('thousand') ||
        transcript.includes('hundred')
      )
        score += 15;
      if (
        transcript.includes('approved') ||
        transcript.includes('investment') ||
        transcript.includes('spend')
      )
        score += 15;
    }

    return Math.min(score, 100);
  }

  /**
   * Score: Authority (are they the decision maker?)
   * Considers: title signals, decision-making language
   */
  private async scoreAuthority(lead: Lead & any): Promise<number> {
    let score = 0;

    // Decision authority keywords
    if (lead.call?.transcript?.segments) {
      const transcript = lead.call.transcript.segments
        .map((s) => s.text)
        .join(' ')
        .toLowerCase();

      const authorityKeywords = [
        'owner',
        'founder',
        'ceo',
        'cto',
        'director',
        'manager',
        'decision',
        'approve',
        'i can',
        "i'll",
      ];
      const matches = authorityKeywords.filter((kw) => transcript.includes(kw));
      score += matches.length * 10;

      // Negative signals
      if (
        transcript.includes('need to check with') ||
        transcript.includes('ask my boss')
      )
        score -= 20;
    }

    return Math.max(Math.min(score, 100), 0);
  }

  /**
   * Score: Timeline (realistic buying window?)
   * Considers: stated timeline, urgency, decision readiness
   */
  private async scoreTimeline(lead: Lead & any): Promise<number> {
    let score = 0;

    // Buying timeline keywords
    if (lead.call?.transcript?.segments) {
      const transcript = lead.call.transcript.segments
        .map((s) => s.text)
        .join(' ')
        .toLowerCase();

      if (transcript.includes('this week')) score += 30;
      else if (transcript.includes('next week')) score += 25;
      else if (transcript.includes('this month')) score += 20;
      else if (transcript.includes('next month')) score += 10;

      // Action-oriented signals
      if (transcript.includes('start') || transcript.includes('begin'))
        score += 15;
      if (transcript.includes('ready') || transcript.includes('prepared'))
        score += 15;
    }

    return Math.min(score, 100);
  }

  /**
   * Score: Intent (how interested are they?)
   * Considers: buying signals, objection handling, call completion
   */
  private async scoreIntent(lead: Lead & any): Promise<number> {
    let score = 0;

    // Call completion
    if (lead.call) {
      if (lead.call.durationSeconds && lead.call.durationSeconds > 300)
        score += 25;
      else if (lead.call.durationSeconds && lead.call.durationSeconds > 120)
        score += 15;

      if (lead.call.disposition === 'ANSWERED') score += 20;
    }

    // Buying intent keywords
    if (lead.call?.transcript?.segments) {
      const transcript = lead.call.transcript.segments
        .map((s) => s.text)
        .join(' ')
        .toLowerCase();

      const intentKeywords = [
        "i'm interested",
        'definitely',
        'absolutely',
        'sounds good',
        'lets do it',
        'when can',
        'how much',
        'tell me more',
      ];
      const matches = intentKeywords.filter((kw) => transcript.includes(kw));
      score += matches.length * 12;

      // Objection signals (lowers intent but not zero)
      if (
        transcript.includes('too expensive') ||
        transcript.includes('too much')
      )
        score = Math.max(score - 10, 0);
    }

    return Math.min(score, 100);
  }

  /**
   * Score: Engagement (how responsive/active are they?)
   * Considers: call history, conversation frequency, responsiveness
   */
  private async scoreEngagement(lead: Lead & any): Promise<number> {
    let score = 0;

    // Number of interactions
    const conversationCount = lead.conversations?.length || 0;
    if (conversationCount >= 5) score += 30;
    else if (conversationCount >= 3) score += 20;
    else if (conversationCount >= 1) score += 10;

    // Recent activity
    if (lead.updatedAt) {
      const daysSinceUpdate = Math.floor(
        (Date.now() - new Date(lead.updatedAt).getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysSinceUpdate === 0) score += 30;
      else if (daysSinceUpdate <= 2) score += 20;
      else if (daysSinceUpdate <= 7) score += 10;
    }

    // Call history
    if (lead.call?.answeredAt) score += 20;

    return Math.min(score, 100);
  }

  /**
   * Map total score (0-700) to level
   */
  private scoreToLevel(
    total: number,
  ): 'COLD' | 'WARM' | 'HOT' | 'CLOSING_READY' {
    if (total >= 551) return 'CLOSING_READY';
    if (total >= 351) return 'HOT';
    if (total >= 151) return 'WARM';
    return 'COLD';
  }

  /**
   * Get recommended action based on lead score level
   */
  private getRecommendedAction(
    level: 'COLD' | 'WARM' | 'HOT' | 'CLOSING_READY',
  ): string {
    switch (level) {
      case 'COLD':
        return 'nurture';
      case 'WARM':
        return 'follow_up';
      case 'HOT':
        return 'call_now';
      case 'CLOSING_READY':
        return 'close_now';
    }
  }

  /**
   * Batch recalculate scores for all leads
   * Useful for nightly or on-demand scoring updates
   */
  async batchRecalculateScores(limit = 100): Promise<LeadScore[]> {
    const leads = await this.prisma.lead.findMany({
      take: limit,
      orderBy: { updatedAt: 'desc' },
    });

    const results: LeadScore[] = [];
    for (const lead of leads) {
      try {
        const score = await this.calculateLeadScore(lead.id);
        results.push(score);
      } catch (error) {
        console.error(`Error scoring lead ${lead.id}:`, error);
      }
    }

    return results;
  }

  /**
   * Get score summary for a specific lead
   */
  async getScoreSummary(
    leadId: string,
  ): Promise<(LeadScore & { lead: Lead }) | null> {
    return this.prisma.leadScore.findUnique({
      where: { leadId },
      include: { lead: true },
    });
  }
}
