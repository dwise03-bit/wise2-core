import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class CloudStripeService {
  private readonly stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-02-24.acacia',
      appInfo: {
        name: 'wise2-cloud',
        version: '1.0.0',
      },
    });
  }

  get client(): Stripe {
    return this.stripe;
  }

  async getOrCreateCustomer(input: {
    email: string;
    name?: string;
    cloudOrderId: string;
  }): Promise<string> {
    const existing = await this.stripe.customers.list({
      email: input.email,
      limit: 1,
    });

    if (existing.data[0]?.id) {
      return existing.data[0].id;
    }

    const customer = await this.stripe.customers.create({
      email: input.email,
      name: input.name,
      metadata: {
        product: 'cloud',
        cloudOrderId: input.cloudOrderId,
      },
    });

    return customer.id;
  }

  async retrieveCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    return this.stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });
  }

  async retrieveSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.retrieve(subscriptionId);
  }

  async createBillingPortalSession(customerId: string, returnUrl: string): Promise<string> {
    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return session.url;
  }
}
