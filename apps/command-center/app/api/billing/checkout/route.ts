import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

interface CheckoutRequest {
  priceId: string;
  plan: 'starter' | 'pro' | 'enterprise';
  billingCycle: 'monthly' | 'annual';
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('authToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CheckoutRequest = await request.json();
    const { plan, billingCycle } = body;

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan is required' },
        { status: 400 }
      );
    }

    // Map plans to Stripe price IDs
    const priceIdMap: Record<string, Record<string, string>> = {
      starter: {
        monthly: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter_monthly',
        annual: process.env.STRIPE_STARTER_PRICE_ID_ANNUAL || 'price_starter_annual',
      },
      pro: {
        monthly: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
        annual: process.env.STRIPE_PRO_PRICE_ID_ANNUAL || 'price_pro_annual',
      },
      enterprise: {
        monthly: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_monthly',
        annual: process.env.STRIPE_ENTERPRISE_PRICE_ID_ANNUAL || 'price_enterprise_annual',
      },
    };

    const priceId = priceIdMap[plan]?.[billingCycle || 'monthly'];

    if (!priceId) {
      return NextResponse.json(
        { error: 'Invalid plan or billing cycle' },
        { status: 400 }
      );
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.STRIPE_SUCCESS_URL || 'http://localhost:3002/billing/success'}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: process.env.STRIPE_CANCEL_URL || 'http://localhost:3002/billing/cancel',
      customer_email: undefined, // Will be set from user context in production
      metadata: {
        plan,
        billingCycle,
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
