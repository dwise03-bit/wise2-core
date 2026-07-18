import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyWebhookSignature } from '@/lib/stripe';
import Stripe from 'stripe';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

async function handleCustomerSubscriptionCreated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;

  // Find customer and update subscription
  const customer = await prisma.user.findFirst({
    where: {
      subscription: {
        stripeCustomerId: subscription.customer as string,
      },
    },
  });

  if (!customer) {
    console.log('Customer not found for subscription creation:', subscription.id);
    return;
  }

  // Determine plan based on price ID
  const priceId =
    subscription.items.data[0]?.price?.id || 'price_unknown';
  const plan =
    priceId === process.env.STRIPE_PRICE_ID_MONTHLY ? 'PRO' : 'STARTER';

  await prisma.subscription.update({
    where: { userId: customer.id },
    data: {
      stripeSubscriptionId: subscription.id,
      status:
        subscription.status === 'active'
          ? 'ACTIVE'
          : subscription.status === 'trialing'
            ? 'TRIALING'
            : 'ACTIVE',
      plan,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });

  console.log(
    `Subscription created for customer ${customer.id}: ${subscription.id}`
  );
}

async function handleCustomerSubscriptionUpdated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;

  // Find subscription and update
  const existingSubscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!existingSubscription) {
    console.log('Subscription not found:', subscription.id);
    return;
  }

  // Update subscription status
  let status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'TRIALING' = 'ACTIVE';
  if (subscription.status === 'active') status = 'ACTIVE';
  if (subscription.status === 'trialing') status = 'TRIALING';
  if (subscription.status === 'canceled') status = 'CANCELED';
  if (subscription.status === 'past_due') status = 'PAST_DUE';

  await prisma.subscription.update({
    where: { id: existingSubscription.id },
    data: {
      status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      canceledAt: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : null,
    },
  });

  console.log(
    `Subscription updated: ${subscription.id} - Status: ${status}`
  );
}

async function handleCustomerSubscriptionDeleted(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;

  // Mark subscription as cancelled
  const existingSubscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!existingSubscription) {
    console.log('Subscription not found for deletion:', subscription.id);
    return;
  }

  await prisma.subscription.update({
    where: { id: existingSubscription.id },
    data: {
      status: 'CANCELED',
      canceledAt: new Date(),
    },
  });

  console.log(`Subscription cancelled: ${subscription.id}`);
}

async function handleInvoicePaymentSucceeded(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;

  // Find subscription and update
  if (invoice.subscription) {
    const subscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: invoice.subscription as string },
    });

    if (subscription) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'ACTIVE',
        },
      });

      console.log(
        `Payment succeeded for subscription: ${invoice.subscription}`
      );
    }
  }
}

async function handleInvoicePaymentFailed(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;

  // Find subscription and update
  if (invoice.subscription) {
    const subscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: invoice.subscription as string },
    });

    if (subscription) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'PAST_DUE',
        },
      });

      console.log(`Payment failed for subscription: ${invoice.subscription}`);
    }
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  const event = verifyWebhookSignature(body, signature, WEBHOOK_SECRET);
  if (!event) {
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 401 }
    );
  }

  try {
    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
        await handleCustomerSubscriptionCreated(event);
        break;

      case 'customer.subscription.updated':
        await handleCustomerSubscriptionUpdated(event);
        break;

      case 'customer.subscription.deleted':
        await handleCustomerSubscriptionDeleted(event);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
