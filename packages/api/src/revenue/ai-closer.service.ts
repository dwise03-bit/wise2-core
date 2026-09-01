import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Deal, Offer, LeadScore, Quote } from '@prisma/client';

export interface ClosingContext {
  deal: Deal;
  offer: Offer;
  leadScore: LeadScore;
  customerId?: string;
}

export interface ClosingResult {
  canClose: boolean;
  reason?: string;
  quote?: Quote;
  paymentLink?: string;
  nextSteps?: string[];
  escalationRequired?: boolean;
  escalationReason?: string;
}

export interface ObjectionResponse {
  handled: boolean;
  response: string;
  shouldEscalate: boolean;
}

@Injectable()
export class AICloserService {
  constructor(private prisma: PrismaService) {}

  /**
   * Main closing decision engine
   * Determines if AI can safely close this deal with the given offer
   */
  async attemptClose(context: ClosingContext): Promise<ClosingResult> {
    const result: ClosingResult = { canClose: false };

    // Check 1: Offer must be AI-closable
    if (!context.offer.aiClosable) {
      result.reason = 'OFFER_NOT_AI_CLOSABLE';
      result.escalationRequired = true;
      result.escalationReason = 'Offer does not permit AI closing';
      return result;
    }

    // Check 2: Deal value must be within bounds
    if (context.deal.value) {
      const dealValue = Number(context.deal.value);

      if (dealValue > Number(context.offer.escalationThreshold)) {
        result.reason = 'DEAL_VALUE_EXCEEDS_THRESHOLD';
        result.escalationRequired = true;
        result.escalationReason = `Deal value ($${dealValue}) exceeds escalation threshold ($${context.offer.escalationThreshold})`;
        return result;
      }

      if (dealValue < Number(context.offer.minimumPrice)) {
        result.reason = 'DEAL_VALUE_BELOW_MINIMUM';
        result.escalationRequired = true;
        result.escalationReason = `Deal value ($${dealValue}) below minimum price ($${context.offer.minimumPrice})`;
        return result;
      }
    }

    // Check 3: Lead must be in CLOSING_READY state
    if (context.leadScore.level !== 'CLOSING_READY') {
      result.reason = 'LEAD_NOT_READY';
      result.escalationRequired = false;
      result.escalationReason = `Lead score level is ${context.leadScore.level}, needs CLOSING_READY`;
      return result;
    }

    // Check 4: Verify custom scope not required
    const customScopeDetected = await this.detectCustomScopeRequirement(
      context.deal,
    );
    if (customScopeDetected) {
      result.reason = 'CUSTOM_SCOPE_DETECTED';
      result.escalationRequired = true;
      result.escalationReason = 'Custom scope requirements detected - requires human review';
      return result;
    }

    // Check 5: Generate quote
    try {
      const quote = await this.generateQuote(context);
      const paymentLink = await this.generatePaymentLink(quote);

      result.canClose = true;
      result.quote = quote;
      result.paymentLink = paymentLink;
      result.nextSteps = [
        'Send payment link via SMS/email',
        'Book onboarding call',
        'Monitor payment status',
      ];

      // Log successful closing action
      await this.logClosingEvent(context.deal.id, 'CLOSE_APPROVED', {
        quoteId: quote.id,
        paymentLink,
      });

      return result;
    } catch (error) {
      result.reason = 'QUOTE_GENERATION_FAILED';
      result.escalationRequired = true;
      result.escalationReason = `Failed to generate quote: ${error.message}`;
      return result;
    }
  }

  /**
   * Handle prospect objections
   * Only respond to approved objection types
   */
  async handleObjection(
    context: ClosingContext,
    objectionText: string,
  ): Promise<ObjectionResponse> {
    // Define approved objection handling patterns
    const approvedObjections = [
      'price',
      'cost',
      'expensive',
      'budget',
      'timeline',
      'timeline',
      'features',
      'scope',
    ];

    // Check if objection is within approved scope
    const objectionLower = objectionText.toLowerCase();
    const isApproved = approvedObjections.some((pattern) =>
      objectionLower.includes(pattern),
    );

    if (!isApproved) {
      return {
        handled: false,
        response: 'Let me connect you with a specialist for that question.',
        shouldEscalate: true,
      };
    }

    // Generate response for approved objection
    const response = this.getApprovedObjectionResponse(
      context.offer,
      objectionText,
    );

    return {
      handled: true,
      response,
      shouldEscalate: false,
    };
  }

  /**
   * Check if custom scope signals are present in deal
   * Custom scope = non-standard requirements
   */
  private async detectCustomScopeRequirement(deal: Deal): Promise<boolean> {
    const customScopeKeywords = [
      'custom',
      'different',
      'special',
      'unique',
      'not standard',
      'custom solution',
      'bespoke',
      'tailored',
    ];

    if (deal.description) {
      const descLower = deal.description.toLowerCase();
      return customScopeKeywords.some((keyword) =>
        descLower.includes(keyword),
      );
    }

    return false;
  }

  /**
   * Generate formal quote with all pricing and terms
   */
  private async generateQuote(context: ClosingContext): Promise<Quote> {
    const dealValue =
      context.deal.value || Number(context.offer.basePrice);

    // Calculate discount if applicable
    const discountAmount = this.calculateDiscount(
      dealValue,
      context.offer.discountCeiling,
    );

    const finalPrice = Number(dealValue) - discountAmount;

    // Set validity (default: 7 days)
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 7);

    const quote = await this.prisma.quote.create({
      data: {
        dealId: context.deal.id,
        offerId: context.offer.id,
        basePrice: Number(dealValue),
        discountAmount,
        finalPrice,
        validUntil,
        status: 'SENT',
        sentAt: new Date(),
      },
    });

    return quote;
  }

  /**
   * Generate payment link (integration point for payment provider)
   * This is a placeholder - integrate with Stripe, PayPal, etc.
   */
  private async generatePaymentLink(quote: Quote): Promise<string> {
    // TODO: Integrate with actual payment provider (Stripe, etc.)
    // For now, return a placeholder
    const baseUrl = process.env.PAYMENT_GATEWAY_URL || 'https://payment.wise2.ai';
    return `${baseUrl}/checkout/${quote.id}?amount=${quote.finalPrice}`;
  }

  /**
   * Calculate allowable discount based on offer ceiling
   */
  private calculateDiscount(
    basePrice: number,
    discountCeiling: number,
  ): number {
    // Example: If prospect asks for discount and it's within ceiling, apply it
    // In production, this would be more sophisticated (read from conversation, etc.)
    const maxDiscount = basePrice * Number(discountCeiling);
    return Math.min(maxDiscount, basePrice * 0.15); // Cap at 15% of base price
  }

  /**
   * Generate response for approved objection type
   */
  private getApprovedObjectionResponse(offer: Offer, objection: string): string {
    const objLower = objection.toLowerCase();

    if (objLower.includes('price') || objLower.includes('cost')) {
      return `Great question! This offer includes ${offer.includedFeatures.join(', ')} for $${offer.basePrice}. ${offer.standardDeliveryDays ? `We'll have you live in ${offer.standardDeliveryDays} days.` : ''} Would that work for you?`;
    }

    if (objLower.includes('budget')) {
      return `I understand budget is a concern. This is our most cost-effective option at $${offer.basePrice}, and we can discuss payment terms if that helps. What would be comfortable for you?`;
    }

    if (objLower.includes('timeline')) {
      return `Perfect - we can deliver in ${offer.standardDeliveryDays || 14} days. Would that timeline work for your business?`;
    }

    if (objLower.includes('features')) {
      return `This package includes: ${offer.includedFeatures.join(', ')}. Any other specific features you need?`;
    }

    return 'That\'s a good point. Let me make sure I understand your full requirements. Can you tell me more?';
  }

  /**
   * Log closing event for audit trail
   */
  private async logClosingEvent(
    dealId: string,
    eventType: string,
    details: any,
  ): Promise<void> {
    try {
      await this.prisma.dealEvent.create({
        data: {
          dealId,
          eventType,
          description: `AI Closer: ${eventType}`,
          details,
          performedBy: 'AI_AGENT',
        },
      });
    } catch (error) {
      console.error(`Error logging closing event: ${error.message}`);
    }
  }

  /**
   * Escalation decision engine
   * Determines when to hand off to human
   */
  async shouldEscalateTohuman(context: ClosingContext): Promise<{
    escalate: boolean;
    reasons: string[];
  }> {
    const reasons: string[] = [];

    // Value exceeds threshold
    if (
      context.deal.value &&
      Number(context.deal.value) > Number(context.offer.escalationThreshold)
    ) {
      reasons.push('Deal value exceeds escalation threshold');
    }

    // Lead score not ready
    if (context.leadScore.level !== 'CLOSING_READY') {
      reasons.push(`Lead score level is ${context.leadScore.level}`);
    }

    // Offer not AI-closable
    if (!context.offer.aiClosable) {
      reasons.push('Offer does not permit AI closing');
    }

    // Custom scope detected
    const customScope = await this.detectCustomScopeRequirement(
      context.deal,
    );
    if (customScope) {
      reasons.push('Custom scope requirements detected');
    }

    return {
      escalate: reasons.length > 0,
      reasons,
    };
  }

  /**
   * Get closing recommendations for a deal
   */
  async getClosingRecommendations(dealId: string): Promise<{
    canClose: boolean;
    recommendations: string[];
    nextAction: string;
  }> {
    const deal = await this.prisma.deal.findUnique({
      where: { id: dealId },
      include: {
        aiClosableOffer: true,
        lead: { include: { score: true } },
      },
    });

    if (!deal) {
      throw new Error(`Deal ${dealId} not found`);
    }

    const recommendations: string[] = [];
    let canClose = false;
    let nextAction = 'contact_prospect';

    if (!deal.lead || !deal.lead.score) {
      recommendations.push('No lead score - run scoring first');
    } else if (deal.lead.score.level === 'CLOSING_READY') {
      if (deal.aiClosableOffer) {
        canClose = true;
        nextAction = 'send_offer';
        recommendations.push('Ready to send offer');
      } else {
        nextAction = 'assign_closer';
        recommendations.push('Lead ready but offer requires human closer');
      }
    } else if (deal.lead.score.level === 'HOT') {
      nextAction = 'follow_up';
      recommendations.push('Strong prospect - follow up with offer soon');
    } else {
      nextAction = 'nurture';
      recommendations.push('Lead needs nurturing before close attempt');
    }

    return {
      canClose,
      recommendations,
      nextAction,
    };
  }
}
