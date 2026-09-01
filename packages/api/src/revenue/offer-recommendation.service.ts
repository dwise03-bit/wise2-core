import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Lead, Offer, LeadScore } from '@prisma/client';
import { LeadScoringService } from './lead-scoring.service';

export interface OfferRecommendation {
  offer: Offer;
  fitScore: number;
  reason: string;
  canAIClose: boolean;
}

@Injectable()
export class OfferRecommendationService {
  constructor(
    private prisma: PrismaService,
    private scoringService: LeadScoringService,
  ) {}

  /**
   * Get recommended offers for a lead based on fit and score level
   */
  async getRecommendedOffers(leadId: string): Promise<OfferRecommendation[]> {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new Error(`Lead ${leadId} not found`);
    }

    const score = await this.prisma.leadScore.findUnique({
      where: { leadId },
    });

    if (!score) {
      throw new Error(`Score not found for lead ${leadId}`);
    }

    // Get all active offers
    const offers = await this.prisma.offer.findMany({
      where: { isActive: true },
    });

    // Score each offer for fit
    const recommendations: OfferRecommendation[] = [];

    for (const offer of offers) {
      const fitScore = this.calculateOfferFit(lead, offer, score);

      // Only recommend if fit is decent (>30%)
      if (fitScore > 30) {
        recommendations.push({
          offer,
          fitScore,
          reason: this.getFitReason(lead, offer, score),
          canAIClose:
            offer.aiClosable && score.level === 'CLOSING_READY' && fitScore > 70,
        });
      }
    }

    // Sort by fit score descending
    recommendations.sort((a, b) => b.fitScore - a.fitScore);

    return recommendations;
  }

  /**
   * Get the single best offer recommendation
   */
  async getRecommendedOffer(leadId: string): Promise<OfferRecommendation | null> {
    const recommendations = await this.getRecommendedOffers(leadId);
    return recommendations.length > 0 ? recommendations[0] : null;
  }

  /**
   * Calculate fit score for a specific offer (0-100)
   */
  private calculateOfferFit(
    lead: Lead,
    offer: Offer,
    score: LeadScore,
  ): number {
    let fit = 0;

    // Service category alignment
    if (lead.serviceCategory && offer.allowedIndustries.length > 0) {
      if (offer.allowedIndustries.includes(lead.serviceCategory)) {
        fit += 25;
      } else {
        // Severe mismatch - probably not a good fit
        return 10;
      }
    } else if (offer.allowedIndustries.length > 0) {
      // No service category specified but offer has restrictions - slight penalty
      fit += 15;
    } else {
      // No restrictions, neutral starting point
      fit += 20;
    }

    // Budget alignment
    if (offer.minBudget || offer.maxBudget) {
      const leadBudget = lead.estimatedValue
        ? Number(lead.estimatedValue)
        : null;

      if (leadBudget) {
        if (
          (!offer.minBudget || leadBudget >= Number(offer.minBudget)) &&
          (!offer.maxBudget || leadBudget <= Number(offer.maxBudget))
        ) {
          fit += 25; // Perfect fit
        } else if (
          offer.minBudget &&
          leadBudget < Number(offer.minBudget) * 1.5
        ) {
          fit += 10; // Close but under
        } else if (
          offer.maxBudget &&
          leadBudget > Number(offer.maxBudget) * 0.67
        ) {
          fit += 10; // Close but over
        }
        // Otherwise no fit
      } else {
        // No budget info, give neutral score
        fit += 15;
      }
    } else {
      // No budget restrictions
      fit += 20;
    }

    // Lead score alignment (closing-ready leads match AI-closable offers)
    if (offer.aiClosable) {
      if (score.level === 'CLOSING_READY') fit += 20;
      else if (score.level === 'HOT') fit += 10;
    } else {
      // Non-AI-closable needs human, any level OK
      fit += 15;
    }

    // Escalation threshold check
    if (lead.estimatedValue) {
      const value = Number(lead.estimatedValue);
      if (value > Number(offer.escalationThreshold)) {
        // This deal should escalate, lower fit for automated close
        if (offer.aiClosable) fit -= 15;
      }
    }

    return Math.max(0, Math.min(fit, 100));
  }

  /**
   * Generate human-readable reason for recommendation
   */
  private getFitReason(lead: Lead, offer: Offer, score: LeadScore): string {
    const reasons: string[] = [];

    if (score.level === 'CLOSING_READY') {
      reasons.push('lead is ready to close');
    } else if (score.level === 'HOT') {
      reasons.push('strong buying signals');
    }

    if (offer.aiClosable) {
      reasons.push('can close via AI');
    } else {
      reasons.push('requires human closer');
    }

    if (lead.estimatedValue) {
      const value = Number(lead.estimatedValue);
      if (value >= Number(offer.basePrice)) {
        reasons.push('budget aligned');
      }
    }

    return reasons.join(', ');
  }

  /**
   * Store recommended offer in lead score
   */
  async setRecommendedOffer(leadId: string): Promise<void> {
    const recommendation = await this.getRecommendedOffer(leadId);

    if (recommendation) {
      await this.prisma.leadScore.update({
        where: { leadId },
        data: {
          recommendedOfferId: recommendation.offer.id,
          recommendedAction: recommendation.canAIClose
            ? 'close_now'
            : 'send_offer',
        },
      });
    }
  }

  /**
   * Get offer details for display/quoting
   */
  async getOfferDetails(offerId: string): Promise<Offer | null> {
    return this.prisma.offer.findUnique({
      where: { id: offerId },
    });
  }
}
