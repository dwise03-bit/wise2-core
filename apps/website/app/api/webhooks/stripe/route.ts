import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2023-10-16',
    });

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    const message = error instanceof Error ? error.message : 'Webhook processing failed';
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}

/**
 * Handle successful checkout session
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    const { customer_email, subscription, customer, metadata } = session;
    const email = customer_email || (metadata?.email as string);
    const planId = (metadata?.planId as string) || 'STARTER';

    console.log('Checkout session completed:', {
      sessionId: session.id,
      email,
      customerId: customer,
      subscriptionId: subscription,
      planId,
    });

    if (!email) {
      console.error('No email found in checkout session');
      return;
    }

    // Update user subscription status in database
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/users/activate-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          stripeCustomerId: customer,
          stripeSubscriptionId: subscription,
          planId,
          sessionId: session.id,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Failed to activate subscription:', error);
      } else {
        console.log('Subscription activated successfully');
      }
    } catch (error) {
      console.error('Error updating subscription status:', error);
    }

    // Send Discord notification
    try {
      const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            embeds: [{
              title: '💰 Payment Successful',
              description: `New subscription activated`,
              fields: [
                { name: 'Email', value: email, inline: true },
                { name: 'Plan', value: planId, inline: true },
                { name: 'Stripe Customer ID', value: String(customer), inline: false },
                { name: 'Session ID', value: session.id, inline: false },
              ],
              color: 0x00ff00,
              timestamp: new Date().toISOString(),
            }],
            username: 'WISE² Payments',
          }),
        }).catch(err => console.error('Discord notification failed:', err));
      }
    } catch (error) {
      console.error('Error sending Discord notification:', error);
    }
  } catch (error) {
    console.error('Error handling checkout session:', error);
  }
}

/**
 * Handle subscription creation
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Subscription created:', {
    subscriptionId: subscription.id,
    customerId: subscription.customer,
    status: subscription.status,
    items: subscription.items.data.map(item => ({
      priceId: item.price.id,
      quantity: item.quantity,
    })),
  });

  // TODO: Create subscription record in database
}

/**
 * Handle subscription update
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', {
    subscriptionId: subscription.id,
    status: subscription.status,
    canceledAt: subscription.canceled_at,
  });

  // TODO: Update subscription record in database
}

/**
 * Handle subscription deletion
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', {
    subscriptionId: subscription.id,
    customerId: subscription.customer,
  });

  // TODO: Revoke subscription access
  // TODO: Send cancellation email
}

/**
 * Handle successful invoice payment
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Invoice payment succeeded:', {
    invoiceId: invoice.id,
    customerId: invoice.customer,
    amount: invoice.amount_paid,
    subscriptionId: invoice.subscription,
  });

  // TODO: Record successful payment
}

/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Invoice payment failed:', {
    invoiceId: invoice.id,
    customerId: invoice.customer,
    amount: invoice.amount_due,
    subscriptionId: invoice.subscription,
  });

  // TODO: Send payment failure notification
}
