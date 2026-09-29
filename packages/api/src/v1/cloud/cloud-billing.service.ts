import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { getCloudPlan } from './cloud.catalog';
import { CloudOrderStore } from './cloud-order.store';
import { CloudProvisioningService } from './cloud-provisioning.service';
import { CloudStripeEventStore } from './cloud-stripe-event.store';
import { CloudStripeService } from './cloud-stripe.service';
import { CloudPlanId, CloudSubscriptionStatus } from './cloud.types';

@Injectable()
export class CloudBillingService {
  private readonly logger = new Logger(CloudBillingService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly orderStore: CloudOrderStore,
    private readonly provisioningService: CloudProvisioningService,
    private readonly stripeService: CloudStripeService,
    private readonly stripeEvents: CloudStripeEventStore,
  ) {}

  async createCheckout(input: {
    planId: CloudPlanId;
    email: string;
    domainName: string;
    successUrl?: string;
    cancelUrl?: string;
  }) {
    const plan = getCloudPlan(this.configService, input.planId);
    if (!plan) {
      throw new Error('Invalid cloud plan');
    }
    if (!plan.twentyIPackageTypeId) {
      throw new Error(`20i package type is not configured for ${plan.name}`);
    }

    if (!this.isTestBillingMode() && !this.isStorefrontLive()) {
      throw new Error(
        'WISE² Cloud storefront is not live yet. Complete launch checks and set CLOUD_STOREFRONT_LIVE=true.',
      );
    }

    const order = this.orderStore.create({
      planId: input.planId,
      email: input.email,
      domainName: input.domainName,
    });

    const cloudBaseUrl =
      this.configService.get<string>('CLOUD_BASE_URL') ||
      `${this.configService.get<string>('APP_URL') || 'https://wise2.net'}/cloud`;

    if (this.isTestBillingMode()) {
      return this.completeTestCheckout(order.id, cloudBaseUrl);
    }

    if (!plan.stripePriceId) {
      throw new Error(`Stripe price is not configured for ${plan.name}`);
    }

    const stripeCustomerId = await this.stripeService.getOrCreateCustomer({
      email: input.email,
      cloudOrderId: order.id,
    });

    this.orderStore.update(order.id, { stripeCustomerId });

    const session = await this.stripeService.client.checkout.sessions.create(
      {
        customer: stripeCustomerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        allow_promotion_codes: true,
        line_items: [{ price: plan.stripePriceId, quantity: 1 }],
        success_url:
          input.successUrl ||
          `${cloudBaseUrl}/order/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: input.cancelUrl || `${cloudBaseUrl}/plans?cancelled=1`,
        metadata: {
          product: 'cloud',
          cloudOrderId: order.id,
          planId: input.planId,
          domainName: input.domainName,
          email: input.email,
        },
        subscription_data: {
          metadata: {
            product: 'cloud',
            cloudOrderId: order.id,
            planId: input.planId,
            domainName: input.domainName,
            email: input.email,
          },
        },
      },
      {
        idempotencyKey: `cloud-checkout-${order.id}`,
      },
    );

    this.orderStore.update(order.id, { stripeSessionId: session.id });

    return {
      orderId: order.id,
      url: session.url,
      sessionId: session.id,
      testMode: false,
    };
  }

  async createPortalSession(input: { email: string; returnUrl?: string }) {
    const orders = this.orderStore.listByEmail(input.email);
    const order = orders.find((candidate) => candidate.stripeCustomerId);

    if (!order?.stripeCustomerId) {
      throw new Error('No WISE² Cloud billing account found for that email');
    }

    const returnUrl =
      input.returnUrl ||
      `${this.configService.get<string>('CLOUD_BASE_URL') || 'https://cloud.wise2.net'}/plans`;

    const url = await this.stripeService.createBillingPortalSession(order.stripeCustomerId, returnUrl);
    return { url };
  }

  async handleStripeEvent(event: Stripe.Event): Promise<void> {
    if (this.stripeEvents.hasProcessed(event.id)) {
      this.logger.log(`Skipping duplicate Stripe event ${event.id} (${event.type})`);
      return;
    }

    let handled = false;

    switch (event.type) {
      case 'checkout.session.completed':
        handled = await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.updated':
        handled = await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        handled = await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.payment_failed':
        handled = await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        return;
    }

    if (handled) {
      this.stripeEvents.markProcessed(event.id, event.type);
    }
  }

  async handleCheckoutSessionCompleted(sessionInput: Stripe.Checkout.Session): Promise<boolean> {
    if (sessionInput.metadata?.product !== 'cloud') {
      return false;
    }

    const session = await this.stripeService.retrieveCheckoutSession(sessionInput.id);
    if (session.metadata?.product !== 'cloud') {
      return false;
    }

    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      this.logger.warn(`Cloud checkout ${session.id} not paid yet (${session.payment_status})`);
      return false;
    }

    const orderId = session.metadata.cloudOrderId;
    if (!orderId) {
      throw new Error('Cloud checkout session missing cloudOrderId metadata');
    }

    const existing = this.orderStore.get(orderId);
    if (!existing) {
      throw new Error(`Cloud order not found for session ${session.id}`);
    }

    if (existing.state === 'active' && existing.externalServiceId) {
      return true;
    }

    const subscriptionId =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription?.id;

    let subscriptionStatus: CloudSubscriptionStatus | undefined;
    let stripePriceId: string | undefined;
    if (subscriptionId) {
      const subscription = await this.stripeService.retrieveSubscription(subscriptionId);
      subscriptionStatus = mapSubscriptionStatus(subscription.status);
      stripePriceId = subscription.items.data[0]?.price.id;
    }

    this.orderStore.transition(orderId, 'paid', {
      stripeSessionId: session.id,
      stripeSubscriptionId: subscriptionId,
      stripeCustomerId:
        typeof session.customer === 'string' ? session.customer : session.customer?.id,
      stripePriceId,
      subscriptionStatus,
    });

    this.orderStore.transition(orderId, 'queued');
    await this.provisioningService.enqueueProvision(orderId);
    return true;
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<boolean> {
    if (subscription.metadata?.product !== 'cloud') {
      return false;
    }

    const order =
      this.orderStore.getBySubscription(subscription.id) ||
      (subscription.metadata.cloudOrderId
        ? this.orderStore.get(subscription.metadata.cloudOrderId)
        : undefined);

    if (!order) {
      this.logger.warn(`No cloud order found for subscription ${subscription.id}`);
      return false;
    }

    const subscriptionStatus = mapSubscriptionStatus(subscription.status);
    this.orderStore.update(order.id, {
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0]?.price.id,
      subscriptionStatus,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });

    if (subscriptionStatus === 'past_due' || subscriptionStatus === 'unpaid') {
      await this.provisioningService.suspendService(order.id);
    }

    if (subscriptionStatus === 'active' && order.externalServiceId) {
      await this.provisioningService.unsuspendService(order.id);
    }

    return true;
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<boolean> {
    if (subscription.metadata?.product !== 'cloud') {
      return false;
    }

    const order = this.orderStore.getBySubscription(subscription.id);
    if (!order) {
      return false;
    }

    this.orderStore.transition(order.id, 'cancelled', {
      subscriptionStatus: 'canceled',
      cancelAtPeriodEnd: false,
    });

    await this.provisioningService.suspendService(order.id);
    return true;
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<boolean> {
    if (!invoice.subscription) {
      return false;
    }

    const subscriptionId =
      typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription.id;

    const subscription = await this.stripeService.retrieveSubscription(subscriptionId);
    if (subscription.metadata?.product !== 'cloud') {
      return false;
    }

    const order = this.orderStore.getBySubscription(subscriptionId);
    if (!order) {
      return false;
    }

    this.orderStore.update(order.id, {
      subscriptionStatus: 'past_due',
      failureReason: `Invoice payment failed (attempt ${invoice.attempt_count ?? 1})`,
    });

    if ((invoice.attempt_count ?? 1) >= 3) {
      await this.provisioningService.suspendService(order.id);
    }

    return true;
  }

  getOrder(orderId: string) {
    const order = this.orderStore.get(orderId);
    if (!order) {
      throw new Error('Cloud order not found');
    }

    return {
      id: order.id,
      planId: order.planId,
      email: order.email,
      domainName: order.domainName,
      state: order.state,
      subscriptionStatus: order.subscriptionStatus,
      cancelAtPeriodEnd: order.cancelAtPeriodEnd ?? false,
      externalServiceId: order.externalServiceId,
      failureReason: order.failureReason,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  getServices(email: string) {
    return this.orderStore.listByEmail(email).map((order) => ({
      id: order.id,
      planId: order.planId,
      domainName: order.domainName,
      state: order.state,
      subscriptionStatus: order.subscriptionStatus,
      externalServiceId: order.externalServiceId,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));
  }

  private isTestBillingMode(): boolean {
    const mode = (this.configService.get<string>('CLOUD_STRIPE_MODE') || '').toLowerCase();
    return mode === 'fake' || mode === 'test';
  }

  private isStorefrontLive(): boolean {
    return (this.configService.get<string>('CLOUD_STOREFRONT_LIVE') || '').toLowerCase() === 'true';
  }

  private async completeTestCheckout(orderId: string, cloudBaseUrl: string) {
    this.logger.warn(`CLOUD_STRIPE_MODE=test: skipping Stripe for order ${orderId}`);

    this.orderStore.update(orderId, {
      stripeSessionId: `cs_test_${orderId}`,
      stripeCustomerId: `cus_test_${orderId}`,
      stripeSubscriptionId: `sub_test_${orderId}`,
      subscriptionStatus: 'active',
    });
    this.orderStore.transition(orderId, 'paid');
    this.orderStore.transition(orderId, 'queued');
    await this.provisioningService.enqueueProvision(orderId);

    return {
      orderId,
      url: `${cloudBaseUrl}/order/${orderId}?test=1`,
      sessionId: `cs_test_${orderId}`,
      testMode: true,
    };
  }
}

function mapSubscriptionStatus(status: Stripe.Subscription.Status): CloudSubscriptionStatus {
  switch (status) {
    case 'trialing':
      return 'trialing';
    case 'active':
      return 'active';
    case 'past_due':
      return 'past_due';
    case 'canceled':
      return 'canceled';
    case 'unpaid':
      return 'unpaid';
    case 'paused':
      return 'paused';
    default:
      return 'active';
  }
}
