import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface StripeCustomer {
  id: string
  email: string
  name?: string
  metadata?: Record<string, string>
}

export interface StripeSubscription {
  id: string
  customerId: string
  priceId: string
  status: 'active' | 'past_due' | 'unpaid' | 'canceled'
  currentPeriodStart: Date
  currentPeriodEnd: Date
}

export interface StripeInvoice {
  id: string
  customerId: string
  subscriptionId?: string
  amount: number
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
  pdfUrl?: string
}

@Injectable()
export class StripeService {
  private readonly logger = new Logger('StripeService');
  private stripeApiKey: string;
  private readonly apiUrl = 'https://api.stripe.com/v1';

  constructor(private configService: ConfigService) {
    this.stripeApiKey = this.configService.get('STRIPE_SECRET_KEY') || '';
    if (this.stripeApiKey) {
      this.logger.log('💳 Stripe service initialized');
    } else {
      this.logger.warn('⚠️  STRIPE_SECRET_KEY not configured - payment features disabled');
    }
  }

  /**
   * Create a Stripe customer
   */
  async createCustomer(userId: string, email: string, name?: string): Promise<StripeCustomer> {
    if (!this.stripeApiKey) {
      throw new BadRequestException('Stripe is not configured');
    }

    try {
      const response = await this.post('/customers', {
        email,
        name,
        metadata: { userId },
      });

      this.logger.log(`✅ Created Stripe customer for ${email}`);
      return {
        id: response.id,
        email: response.email,
        name: response.name,
        metadata: response.metadata,
      };
    } catch (error) {
      this.logger.error(`Failed to create customer: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Get a Stripe customer by ID
   */
  async getCustomer(customerId: string): Promise<StripeCustomer> {
    if (!this.stripeApiKey) {
      throw new BadRequestException('Stripe is not configured');
    }

    try {
      const response = await this.get(`/customers/${customerId}`);
      return {
        id: response.id,
        email: response.email,
        name: response.name,
        metadata: response.metadata,
      };
    } catch (error) {
      this.logger.error(`Failed to get customer: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Create a subscription for a customer
   */
  async createSubscription(customerId: string, priceId: string, trialDays?: number): Promise<StripeSubscription> {
    if (!this.stripeApiKey) {
      throw new BadRequestException('Stripe is not configured');
    }

    try {
      const params: Record<string, any> = {
        customer: customerId,
        items: [{ price: priceId }],
      };

      if (trialDays) {
        params.trial_period_days = trialDays;
      }

      const response = await this.post('/subscriptions', params);

      this.logger.log(`✅ Created subscription for customer ${customerId}`);
      return {
        id: response.id,
        customerId: response.customer,
        priceId: response.items.data[0].price.id,
        status: response.status,
        currentPeriodStart: new Date(response.current_period_start * 1000),
        currentPeriodEnd: new Date(response.current_period_end * 1000),
      };
    } catch (error) {
      this.logger.error(`Failed to create subscription: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Get subscription by ID
   */
  async getSubscription(subscriptionId: string): Promise<StripeSubscription> {
    if (!this.stripeApiKey) {
      throw new BadRequestException('Stripe is not configured');
    }

    try {
      const response = await this.get(`/subscriptions/${subscriptionId}`);
      return {
        id: response.id,
        customerId: response.customer,
        priceId: response.items.data[0].price.id,
        status: response.status,
        currentPeriodStart: new Date(response.current_period_start * 1000),
        currentPeriodEnd: new Date(response.current_period_end * 1000),
      };
    } catch (error) {
      this.logger.error(`Failed to get subscription: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Update a subscription (e.g., change plan)
   */
  async updateSubscription(subscriptionId: string, newPriceId: string): Promise<StripeSubscription> {
    if (!this.stripeApiKey) {
      throw new BadRequestException('Stripe is not configured');
    }

    try {
      const subscription = await this.get(`/subscriptions/${subscriptionId}`);

      const response = await this.post(`/subscriptions/${subscriptionId}`, {
        items: [
          {
            id: subscription.items.data[0].id,
            price: newPriceId,
          },
        ],
        proration_behavior: 'create_prorations',
      });

      this.logger.log(`✅ Updated subscription ${subscriptionId}`);
      return {
        id: response.id,
        customerId: response.customer,
        priceId: response.items.data[0].price.id,
        status: response.status,
        currentPeriodStart: new Date(response.current_period_start * 1000),
        currentPeriodEnd: new Date(response.current_period_end * 1000),
      };
    } catch (error) {
      this.logger.error(`Failed to update subscription: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<StripeSubscription> {
    if (!this.stripeApiKey) {
      throw new BadRequestException('Stripe is not configured');
    }

    try {
      const response = await this.delete(`/subscriptions/${subscriptionId}`);

      this.logger.log(`✅ Cancelled subscription ${subscriptionId}`);
      return {
        id: response.id,
        customerId: response.customer,
        priceId: response.items.data[0].price.id,
        status: response.status,
        currentPeriodStart: new Date(response.current_period_start * 1000),
        currentPeriodEnd: new Date(response.current_period_end * 1000),
      };
    } catch (error) {
      this.logger.error(`Failed to cancel subscription: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Get invoices for a customer
   */
  async getInvoices(customerId: string, limit: number = 10): Promise<StripeInvoice[]> {
    if (!this.stripeApiKey) {
      throw new BadRequestException('Stripe is not configured');
    }

    try {
      const response = await this.get('/invoices', { customer: customerId, limit });

      return response.data.map((invoice: any) => ({
        id: invoice.id,
        customerId: invoice.customer,
        subscriptionId: invoice.subscription,
        amount: invoice.amount_due,
        status: invoice.status,
        pdfUrl: invoice.invoice_pdf,
      }));
    } catch (error) {
      this.logger.error(`Failed to get invoices: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Create a checkout session for subscription
   */
  async createCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<{ sessionId: string; url: string }> {
    if (!this.stripeApiKey) {
      throw new BadRequestException('Stripe is not configured');
    }

    try {
      const response = await this.post('/checkout/sessions', {
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        billing_address_collection: 'auto',
      });

      this.logger.log(`✅ Created checkout session for customer ${customerId}`);
      return {
        sessionId: response.id,
        url: response.url,
      };
    } catch (error) {
      this.logger.error(`Failed to create checkout session: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Handle Stripe webhook event
   */
  async handleWebhookEvent(event: any): Promise<void> {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object);
          break;
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object);
          break;
        default:
          this.logger.debug(`Unhandled Stripe event type: ${event.type}`);
      }
    } catch (error) {
      this.logger.error(`Failed to handle webhook: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Verify Stripe webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.stripeApiKey) {
      return false;
    }

    try {
      const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
      if (!webhookSecret) {
        this.logger.warn('STRIPE_WEBHOOK_SECRET not configured');
        return false;
      }

      // In production, use crypto.timingSafeEqual for signature verification
      // This is a simplified version
      const crypto = require('crypto');
      const hash = crypto.createHmac('sha256', webhookSecret).update(payload).digest('hex');
      const signature_hash = signature.split(',')[1]?.split('=')[1];

      return hash === signature_hash;
    } catch (error) {
      this.logger.error(`Failed to verify webhook signature: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * Create a payment intent for one-time purchase or setup
   */
  async createPaymentIntent(
    customerId: string,
    amount: number,
    currency: string = 'usd',
    metadata?: Record<string, string>
  ): Promise<{ clientSecret: string; id: string }> {
    if (!this.stripeApiKey) {
      throw new BadRequestException('Stripe is not configured');
    }

    try {
      const params: Record<string, any> = {
        customer: customerId,
        amount,
        currency,
        automatic_payment_methods: { enabled: true },
      };

      if (metadata) {
        params.metadata = metadata;
      }

      const response = await this.post('/payment_intents', params);

      this.logger.log(`✅ Created payment intent for customer ${customerId}`);
      return {
        id: response.id,
        clientSecret: response.client_secret,
      };
    } catch (error) {
      this.logger.error(`Failed to create payment intent: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Private helper methods
   */

  private async handlePaymentIntentSucceeded(paymentIntent: any): Promise<void> {
    this.logger.log(`💳 Payment intent succeeded: ${paymentIntent.id}`);
    // Extract userId from metadata and update subscription
    if (paymentIntent.metadata?.userId) {
      this.logger.log(`✅ Payment successful for user ${paymentIntent.metadata.userId}`);
      // TODO: Call billing service to update subscription
    }
  }

  private async handleSubscriptionUpdated(subscription: any): Promise<void> {
    this.logger.log(`📢 Subscription updated: ${subscription.id}`);
    this.logger.log(`   Status: ${subscription.status}, Plan: ${subscription.items.data[0]?.plan?.id || 'unknown'}`);
    // TODO: Call billing service to update subscription record
  }

  private async handleSubscriptionDeleted(subscription: any): Promise<void> {
    this.logger.log(`📢 Subscription deleted: ${subscription.id}`);
    this.logger.log(`   Customer: ${subscription.customer}`);
    // TODO: Call billing service to mark subscription as cancelled
  }

  private async handleInvoicePaymentSucceeded(invoice: any): Promise<void> {
    this.logger.log(`💰 Invoice payment succeeded: ${invoice.id}`);
    this.logger.log(`   Amount: ${invoice.amount_paid / 100} ${invoice.currency.toUpperCase()}`);
    // TODO: Send receipt email, update subscription record
  }

  private async handleInvoicePaymentFailed(invoice: any): Promise<void> {
    this.logger.warn(`❌ Invoice payment failed: ${invoice.id}`);
    this.logger.warn(`   Next retry: ${new Date(invoice.next_payment_attempt * 1000).toISOString()}`);
    // TODO: Send retry email, mark subscription as PAST_DUE
  }

  private async post(path: string, data: Record<string, any>): Promise<any> {
    const response = await fetch(`${this.apiUrl}${path}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.stripeApiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(this.flattenObject(data)).toString(),
    });

    if (!response.ok) {
      const error = (await response.json()) as any;
      throw new Error(`Stripe error: ${error?.error?.message || error?.message || 'Unknown error'}`);
    }

    return response.json();
  }

  private async get(path: string, params?: Record<string, any>): Promise<any> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';

    const response = await fetch(`${this.apiUrl}${path}${query}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.stripeApiKey}`,
      },
    });

    if (!response.ok) {
      const error = (await response.json()) as any;
      throw new Error(`Stripe error: ${error?.error?.message || error?.message || 'Unknown error'}`);
    }

    return response.json();
  }

  private async delete(path: string): Promise<any> {
    const response = await fetch(`${this.apiUrl}${path}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.stripeApiKey}`,
      },
    });

    if (!response.ok) {
      const error = (await response.json()) as any;
      throw new Error(`Stripe error: ${error?.error?.message || error?.message || 'Unknown error'}`);
    }

    return response.json();
  }

  private flattenObject(obj: Record<string, any>, prefix = ''): Record<string, string> {
    const result: Record<string, string> = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        const newKey = prefix ? `${prefix}[${key}]` : key;

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          Object.assign(result, this.flattenObject(value, newKey));
        } else if (Array.isArray(value)) {
          value.forEach((item, index) => {
            result[`${newKey}[${index}]`] = String(item);
          });
        } else {
          result[newKey] = String(value);
        }
      }
    }

    return result;
  }

  /**
   * Check if Stripe is properly configured
   */
  getStatus(): {
    configured: boolean
    publishableKey?: string
  } {
    return {
      configured: !!this.stripeApiKey,
      publishableKey: this.configService.get('STRIPE_PUBLISHABLE_KEY'),
    };
  }
}
