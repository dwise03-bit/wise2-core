import { Injectable } from '@nestjs/common';

const mockSubscriptions: any[] = [];

@Injectable()
export class BillingService {
  async createCheckoutSession(userId: string, planId: string) {
    const plans: any = { starter: 29, pro: 99, enterprise: 299 };
    const price = plans[planId] || 99;

    // Mock Stripe session
    const sessionId = 'cs_' + Math.random().toString(36).substr(2, 9);
    const sessionUrl = `https://checkout.stripe.com/mock?session=${sessionId}`;

    // Store mock subscription
    mockSubscriptions.push({
      userId,
      planId,
      status: 'active',
      price,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    return {
      sessionId,
      sessionUrl,
      message: 'Checkout session created',
    };
  }

  async getSubscription(userId: string) {
    const sub = mockSubscriptions.find(s => s.userId === userId);
    return sub || { status: 'free', plan: 'starter', price: 0 };
  }

  async handleStripeWebhook(data: any) {
    console.log('Webhook received:', data.type);
    return { received: true };
  }
}
