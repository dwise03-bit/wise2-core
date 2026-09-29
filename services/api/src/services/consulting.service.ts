/**
 * Consulting Service
 * Business logic for consulting lead management, scoring, and recommendations
 */

import { PrismaClient } from '@wise2/db';
import Stripe from 'stripe';
import { redis } from './redis.service';
import { paymentService } from './payment.service';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export class ConsultingServiceImpl {
  /**
   * Create a new consulting lead from intake form
   */
  async createLead(data: {
    fullName: string;
    email: string;
    phone?: string;
    companyName: string;
    website?: string;
    industry?: string;
    businessDescription?: string;
    currentProblem: string;
    desiredBuild: string;
    currentTools: string[];
    desiredResult?: string;
    timeline?: string;
    budgetRange?: string;
    teamSize?: number;
    revenueRange?: string;
    crm?: string;
    websitePlatform?: string;
    socialPlatforms: string[];
    existingAutomations: string[];
    aiTools: string[];
    notes?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
  }) {
    // Calculate lead score
    const score = this.calculateLeadScoreFromData(data);

    // Determine qualification status
    const qualificationStatus = score >= 60 ? 'QUALIFIED' : score >= 40 ? 'QUALIFYING' : 'NEW';

    // Get recommended service
    const recommendedService = this.recommendServiceForData(data);

    // Create lead record
    const lead = await prisma.consultingLead.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        companyName: data.companyName,
        website: data.website,
        industry: data.industry,
        businessDescription: data.businessDescription,
        currentProblem: data.currentProblem,
        desiredBuild: data.desiredBuild,
        currentTools: data.currentTools,
        desiredResult: data.desiredResult,
        timeline: data.timeline,
        budgetRange: data.budgetRange,
        teamSize: data.teamSize,
        revenueRange: data.revenueRange,
        crm: data.crm,
        websitePlatform: data.websitePlatform,
        socialPlatforms: data.socialPlatforms,
        existingAutomations: data.existingAutomations,
        aiTools: data.aiTools,
        notes: data.notes,
        leadScore: score,
        qualificationStatus: qualificationStatus as any,
        recommendedService: recommendedService?.id,
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
      },
    });

    // Publish event for worker jobs
    await redis.publish('consulting:events', JSON.stringify({
      type: 'lead.created',
      leadId: lead.id,
      email: lead.email,
      leadScore: score,
      qualificationStatus,
      timestamp: new Date().toISOString(),
    }));

    return { lead, score, recommendedService };
  }

  /**
   * Calculate lead score from intake data (0-100)
   */
  calculateLeadScoreFromData(data: {
    currentProblem?: string;
    desiredBuild?: string;
    budgetRange?: string;
    companyName?: string;
    websitePlatform?: string;
    teamSize?: number;
    revenueRange?: string;
  }): number {
    let score = 20; // Base score

    // Business strength signals
    if (data.companyName) score += 10;
    if (data.revenueRange === '6-figure' || data.revenueRange === '7-figure') score += 15;
    if (data.revenueRange === '5-figure') score += 5;

    // Problem clarity
    if (data.currentProblem && data.currentProblem.length > 20) score += 15;

    // Budget signal
    if (data.budgetRange === '$5000+') score += 20;
    if (data.budgetRange === '$1000-5000') score += 10;

    // Technical readiness
    if (data.websitePlatform) score += 10;
    if (data.teamSize && data.teamSize >= 3) score += 10;

    // Implementation intent
    if (data.desiredBuild && data.desiredBuild.length > 20) score += 15;

    return Math.min(score, 100);
  }

  /**
   * Calculate lead score from existing lead record
   */
  calculateLeadScore(lead: any): number {
    const data = {
      currentProblem: lead.currentProblem,
      desiredBuild: lead.desiredBuild,
      budgetRange: lead.budgetRange,
      companyName: lead.companyName,
      websitePlatform: lead.websitePlatform,
      teamSize: lead.teamSize,
      revenueRange: lead.revenueRange,
    };
    return this.calculateLeadScoreFromData(data);
  }

  /**
   * Recommend service based on lead data
   */
  recommendServiceForData(data: {
    budgetRange?: string;
    desiredBuild?: string;
    currentProblem?: string;
  }): any {
    // Budget-based recommendation
    if (data.budgetRange === '$5000+') {
      return { id: 'impl-day', name: 'AI Implementation Day' };
    }
    if (data.budgetRange === '$1000-5000') {
      return { id: 'live-build', name: 'WISE² Live Build Session' };
    }
    // Default to audit
    return { id: 'audit', name: 'AI Business Audit' };
  }

  /**
   * Recommend service from existing lead
   */
  recommendService(lead: any): any {
    return this.recommendServiceForData({
      budgetRange: lead.budgetRange,
      desiredBuild: lead.desiredBuild,
      currentProblem: lead.currentProblem,
    });
  }

  /**
   * Get lead by ID (with access control)
   */
  async getLeadById(leadId: string, userId?: string, userRole?: string): Promise<any> {
    const lead = await prisma.consultingLead.findUnique({
      where: { id: leadId },
    });

    if (!lead) return null;

    // Users can only view their own leads (matched by email)
    // Admins can view any lead
    if (userRole !== 'ADMIN' && userRole !== 'FOUNDER' && userId) {
      // For now, allow viewing if user email matches
      // TODO: Link lead to user in database
      return null;
    }

    return lead;
  }

  /**
   * Update lead record
   */
  async updateLead(leadId: string, data: any): Promise<any> {
    const lead = await prisma.consultingLead.update({
      where: { id: leadId },
      data: {
        qualificationStatus: data.qualificationStatus,
        recommendedService: data.recommendedService,
        notes: data.notes,
        leadScore: data.leadScore,
      },
    });

    return lead;
  }

  /**
   * Create Stripe Checkout Session for consulting service
   */
  async createCheckoutSession(data: {
    leadId?: string;
    serviceId?: string;
    email?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
  }): Promise<{ sessionId: string; checkoutUrl: string; expiresAt: Date }> {
    // Get the service
    let service;
    if (data.serviceId) {
      service = await prisma.consultingService.findUnique({
        where: { id: data.serviceId },
      });
    }

    if (!service || !service.stripePriceId) {
      throw new Error('Service not found or not configured for payment');
    }

    // Get lead if provided
    let leadEmail = data.email;
    if (data.leadId) {
      const lead = await prisma.consultingLead.findUnique({
        where: { id: data.leadId },
      });
      if (!lead) throw new Error('Lead not found');
      leadEmail = lead.email;
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: service.stripePriceId,
          quantity: 1,
        },
      ],
      mode: service.isRecurring ? 'subscription' : 'payment',
      success_url: `${process.env.APP_URL || 'https://wise2.net'}/consulting/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL || 'https://wise2.net'}/consulting`,
      customer_email: leadEmail,
      metadata: {
        leadId: data.leadId,
        serviceId: service.id,
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
      },
    });

    // Update lead with checkout session ID
    if (data.leadId) {
      await prisma.consultingLead.update({
        where: { id: data.leadId },
        data: {
          qualificationStatus: 'BOOKED',
        },
      });
    }

    // Publish event
    await redis.publish('consulting:events', JSON.stringify({
      type: 'checkout.created',
      leadId: data.leadId,
      sessionId: session.id,
      timestamp: new Date().toISOString(),
    }));

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    return {
      sessionId: session.id,
      checkoutUrl: session.url!,
      expiresAt,
    };
  }

  /**
   * Get all consulting services
   */
  async getAllServices(): Promise<any[]> {
    const services = await prisma.consultingService.findMany({
      where: { tags: { has: 'consulting' } },
      orderBy: { featured: 'desc' },
    });
    return services;
  }

  /**
   * Complete consulting project and trigger workflows
   */
  async completeProject(
    projectId: string,
    data: {
      deliverables?: any;
      recommendations?: any;
      nextSteps?: any;
    }
  ): Promise<any> {
    // For now, update the booking directly
    // TODO: Create proper ConsultingProject model integration
    const booking = await prisma.booking.update({
      where: { id: projectId },
      data: {
        status: 'completed',
        deliverableReportUrl: JSON.stringify(data.deliverables),
      },
    });

    // Publish completion event
    await redis.publish('consulting:events', JSON.stringify({
      type: 'session.completed',
      projectId,
      timestamp: new Date().toISOString(),
    }));

    return booking;
  }

  /**
   * Get project by ID
   */
  async getProjectById(projectId: string): Promise<any> {
    const booking = await prisma.booking.findUnique({
      where: { id: projectId },
      include: {
        user: true,
        service: true,
        consultant: true,
        postCallSummary: true,
      },
    });
    return booking;
  }
}

export const consultingService = new ConsultingServiceImpl();
