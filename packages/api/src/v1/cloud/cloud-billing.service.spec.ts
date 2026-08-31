import { ConfigService } from '@nestjs/config';
import { CloudBillingService } from './cloud-billing.service';
import { CloudOrderStore } from './cloud-order.store';
import { CloudProvisioningService } from './cloud-provisioning.service';
import { CloudStripeEventStore } from './cloud-stripe-event.store';
import { CloudStripeService } from './cloud-stripe.service';
import { FakeProvider } from './providers/fake.provider';

describe('CloudBillingService', () => {
  beforeEach(() => {
    new CloudStripeEventStore().clear();
  });

  const config = {
    get: (key: string) => {
      const values: Record<string, string> = {
        STRIPE_SECRET_KEY: 'sk_test_placeholder',
        TWENTYI_PACKAGE_TYPE_STARTER: '302135',
        TWENTYI_PACKAGE_TYPE_BUSINESS: '302133',
        TWENTYI_PACKAGE_TYPE_PRO: '302129',
        TWENTYI_PACKAGE_LABEL_STARTER: 'Web Builder',
        TWENTYI_PACKAGE_LABEL_BUSINESS: 'WordPress Unlimited',
        TWENTYI_PACKAGE_LABEL_PRO: 'Linux Unlimited',
        STRIPE_CLOUD_STARTER_PRICE_ID: 'price_starter',
        STRIPE_CLOUD_BUSINESS_PRICE_ID: 'price_business',
        STRIPE_CLOUD_PRO_PRICE_ID: 'price_pro',
        CLOUD_BASE_URL: 'https://cloud.wise2.net',
      };
      return values[key];
    },
  } as unknown as ConfigService;

  function createBilling() {
    const orderStore = new CloudOrderStore();
    const provisioning = {
      enqueueProvision: jest.fn().mockResolvedValue(undefined),
      suspendService: jest.fn().mockResolvedValue(undefined),
      unsuspendService: jest.fn().mockResolvedValue(undefined),
    } as unknown as CloudProvisioningService;

    const stripeService = {
      getOrCreateCustomer: jest.fn().mockResolvedValue('cus_test_123'),
      retrieveCheckoutSession: jest.fn(async (sessionId: string) => ({
        id: sessionId,
        payment_status: 'paid',
        status: 'complete',
        metadata: {
          product: 'cloud',
          cloudOrderId: 'pending-order-id',
        },
        subscription: 'sub_test_123',
        customer: 'cus_test_123',
      })),
      retrieveSubscription: jest.fn().mockResolvedValue({
        id: 'sub_test_123',
        status: 'active',
        metadata: { product: 'cloud' },
        items: { data: [{ price: { id: 'price_starter' } }] },
        cancel_at_period_end: false,
      }),
      client: {
        checkout: {
          sessions: {
            create: jest.fn().mockResolvedValue({
              id: 'cs_test_123',
              url: 'https://checkout.stripe.test/session',
            }),
          },
        },
      },
    } as unknown as CloudStripeService;

    const stripeEvents = new CloudStripeEventStore();
    const billing = new CloudBillingService(
      config,
      orderStore,
      provisioning,
      stripeService,
      stripeEvents,
    );

    return { billing, orderStore, provisioning, stripeService, stripeEvents };
  }

  it('marks a cloud checkout session as paid and provisions once', async () => {
    const { billing, orderStore, provisioning, stripeService } = createBilling();
    const order = orderStore.create({
      planId: 'starter',
      email: 'buyer@wise2.net',
      domainName: 'buyer-example.com',
      stripeSessionId: 'cs_test_123',
    });

    stripeService.retrieveCheckoutSession = jest.fn(async () => ({
      id: 'cs_test_123',
      payment_status: 'paid',
      status: 'complete',
      metadata: {
        product: 'cloud',
        cloudOrderId: order.id,
        planId: 'starter',
        domainName: 'buyer-example.com',
        email: 'buyer@wise2.net',
      },
      subscription: 'sub_test_123',
      customer: 'cus_test_123',
    })) as any;

    await billing.handleStripeEvent({
      id: 'evt_checkout_1',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          metadata: { product: 'cloud', cloudOrderId: order.id },
        },
      },
    } as any);

    const updated = orderStore.get(order.id);
    expect(updated?.state).toBe('queued');
    expect(updated?.stripeCustomerId).toBe('cus_test_123');
    expect(provisioning.enqueueProvision).toHaveBeenCalledWith(order.id);
  });

  it('skips duplicate Stripe webhook events', async () => {
    const { billing, orderStore, provisioning, stripeService } = createBilling();
    const order = orderStore.create({
      planId: 'starter',
      email: 'buyer@wise2.net',
      domainName: 'buyer-example.com',
    });

    stripeService.retrieveCheckoutSession = jest.fn(async () => ({
      id: 'cs_test_dup',
      payment_status: 'paid',
      status: 'complete',
      metadata: { product: 'cloud', cloudOrderId: order.id },
      subscription: 'sub_test_dup',
      customer: 'cus_test_123',
    })) as any;

    const event = {
      id: 'evt_dup_1',
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_test_dup', metadata: { product: 'cloud', cloudOrderId: order.id } } },
    } as any;

    await billing.handleStripeEvent(event);
    await billing.handleStripeEvent(event);

    expect(provisioning.enqueueProvision).toHaveBeenCalledTimes(1);
  });

  it('completes checkout in test billing mode without Stripe', async () => {
    const testConfig = {
      get: (key: string) => {
        const values: Record<string, string> = {
          CLOUD_STRIPE_MODE: 'test',
          CLOUD_BASE_URL: 'https://cloud.wise2.net',
          TWENTYI_PACKAGE_TYPE_STARTER: '302135',
          TWENTYI_PACKAGE_LABEL_STARTER: 'Web Builder',
        };
        return values[key];
      },
    } as unknown as ConfigService;

    const orderStore = new CloudOrderStore();
    const provisioning = {
      enqueueProvision: jest.fn().mockResolvedValue(undefined),
      suspendService: jest.fn(),
      unsuspendService: jest.fn(),
    } as unknown as CloudProvisioningService;

    const billing = new CloudBillingService(
      testConfig,
      orderStore,
      provisioning,
      {} as CloudStripeService,
      new CloudStripeEventStore(),
    );

    const result = await billing.createCheckout({
      planId: 'starter',
      email: 'test@wise2.net',
      domainName: 'test.example.com',
    });

    expect(result.testMode).toBe(true);
    expect(provisioning.enqueueProvision).toHaveBeenCalledWith(result.orderId);
  });
});

describe('FakeProvider cloud flow', () => {
  it('provisions with a stable external id', async () => {
    const provider = new FakeProvider();
    const first = await provider.provision({
      idempotencyKey: 'order-1:provision',
      packageTypeId: '302135',
      domainName: 'example.com',
    });
    const second = await provider.provision({
      idempotencyKey: 'order-1:provision',
      packageTypeId: '302135',
      domainName: 'example.com',
    });
    expect(second.externalId).toBe(first.externalId);
  });
});
