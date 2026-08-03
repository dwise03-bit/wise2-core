import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { query } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-04-10' as any });

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    // Get signature from headers
    const signature = request.headers.get('stripe-signature');
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Read raw body
    const body = await request.text();

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionEvent(subscription, 'active');
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionEvent(subscription, 'cancelled');
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionEvent(
  subscription: Stripe.Subscription,
  status: 'active' | 'cancelled'
) {
  try {
    // Get the tier from subscription items
    let tier = 'free';
    let price_cents = 0;

    if (subscription.items.data.length > 0) {
      const priceId = subscription.items.data[0].price.id;
      const stripePrice = await stripe.prices.retrieve(priceId);

      // Get product to extract tier name
      if (stripePrice.product) {
        const product = await stripe.products.retrieve(stripePrice.product as string);
        const productName = product.name || '';

        // Map product name to tier
        if (productName.includes('VIP')) {
          tier = 'vip';
        } else if (productName.includes('Pro')) {
          tier = 'pro';
        } else if (productName.includes('Starter')) {
          tier = 'starter';
        }
      }

      price_cents = stripePrice.unit_amount || 0;
    }

    // Get customer from Stripe
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    const customerEmail = (customer as Stripe.Customer).email;

    if (!customerEmail) {
      console.error('No email found for customer:', subscription.customer);
      return;
    }

    // Find user by email
    const result = await query(
      `SELECT id FROM users WHERE email = $1`,
      [customerEmail]
    );

    if (result.rows.length === 0) {
      console.error('No user found for email:', customerEmail);
      return;
    }

    const userId = result.rows[0].id;

    // Check if membership exists
    const existingMembership = await query(
      `SELECT id FROM memberships WHERE user_id = $1 AND stripe_subscription_id = $2`,
      [userId, subscription.id]
    );

    if (existingMembership.rows.length > 0) {
      // Update existing membership
      await query(
        `UPDATE memberships
         SET tier = $1, status = $2, price_cents = $3, updated_at = NOW()
         WHERE user_id = $4 AND stripe_subscription_id = $5`,
        [tier, status, price_cents, userId, subscription.id]
      );
    } else {
      // Create new membership
      await query(
        `INSERT INTO memberships (user_id, tier, status, price_cents, billing_cycle, stripe_subscription_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, tier, status, price_cents, 'monthly', subscription.id]
      );
    }

    console.log(`Subscription ${subscription.id} handled - tier: ${tier}, status: ${status}`);
  } catch (error) {
    console.error('Error handling subscription event:', error);
    throw error;
  }
}
