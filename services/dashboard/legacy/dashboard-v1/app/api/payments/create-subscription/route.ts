import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { verifyToken } from '@/lib/auth';
import { getUserById } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-04-10' as any });

// Pricing mapping
const TIER_PRICING: Record<string, number> = {
  starter: 9900,
  pro: 19900,
  vip: 39900,
};

const TIER_PRODUCT_NAMES: Record<string, string> = {
  starter: 'Wise Defense Starter',
  pro: 'Wise Defense Pro',
  vip: 'Wise Defense VIP',
};

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { tier } = body;

    // Validate tier
    if (!tier || !Object.keys(TIER_PRICING).includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be one of: starter, pro, vip' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await getUserById(payload.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create or retrieve Stripe customer
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.first_name || ''}${user.last_name ? ' ' + user.last_name : ''}`.trim(),
      });
      customerId = customer.id;
      // Note: In production, you'd want to save this to the user record
    }

    // Get or create price for this tier
    const productName = TIER_PRODUCT_NAMES[tier];
    const priceCents = TIER_PRICING[tier];

    // List existing products to find or create one
    let product = null;
    const products = await stripe.products.list({ limit: 100 });
    product = products.data.find((p) => p.name === productName);

    if (!product) {
      product = await stripe.products.create({
        name: productName,
        type: 'service',
      });
    }

    // Get or create price for this product
    let price = null;
    const prices = await stripe.prices.list({ product: product.id, limit: 100 });
    price = prices.data.find((p) => p.unit_amount === priceCents && p.recurring?.interval === 'month');

    if (!price) {
      price = await stripe.prices.create({
        product: product.id,
        unit_amount: priceCents,
        currency: 'usd',
        recurring: {
          interval: 'month',
        },
      });
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: price.id,
        },
      ],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    // Extract client_secret from payment intent
    const latestInvoice = subscription.latest_invoice as any;
    const paymentIntent = latestInvoice?.payment_intent;
    const clientSecret = paymentIntent?.client_secret || '';

    return NextResponse.json(
      {
        subscription_id: subscription.id,
        client_secret: clientSecret,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Create subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
