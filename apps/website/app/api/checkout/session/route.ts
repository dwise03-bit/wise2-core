import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

/**
 * POST /api/checkout/session
 * Create a Stripe checkout session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, product, email, fullName, successUrl, cancelUrl } = body;

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe configuration missing' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-08-16',
    });

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wise2.net';

    // Map plan IDs to Stripe price IDs
    const isDigitalTwin = product === 'digital-twin';
    const planToPriceId: Record<string, string> = isDigitalTwin
      ? {
          STARTER: process.env.NEXT_PUBLIC_STRIPE_DIGITAL_TWIN_STARTER_PRICE_ID || 'price_digital_twin_starter_test',
          GROWTH: process.env.NEXT_PUBLIC_STRIPE_DIGITAL_TWIN_GROWTH_PRICE_ID || 'price_digital_twin_growth_test',
          SCALE: process.env.NEXT_PUBLIC_STRIPE_DIGITAL_TWIN_SCALE_PRICE_ID || 'price_digital_twin_scale_test',
          ENTERPRISE: process.env.NEXT_PUBLIC_STRIPE_DIGITAL_TWIN_ENTERPRISE_PRICE_ID || 'price_digital_twin_enterprise_test',
        }
      : {
          STARTER: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID || 'price_1QeJ9eD5L8vqYqJz8b8kY9z9',
          PRO: process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRICE_ID || 'price_1QeJ9eD5L8vqYqJz8b8kZ0z0',
          ENTERPRISE: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || 'price_1QeJ9eD5L8vqYqJz8b8kZ1z1',
        };

    const priceId = planToPriceId[planId];
    if (!priceId) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: isDigitalTwin ? 'payment' : 'subscription',
      success_url: successUrl || `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${baseUrl}/checkout/cancel`,
      customer_email: email,
      metadata: {
        fullName,
        email,
        planId,
        product: product || 'platform',
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Checkout session error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create checkout session';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/checkout/session
 * Retrieve checkout session details
 */
export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe configuration missing' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-08-16',
    });
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json({
      id: session.id,
      status: session.payment_status,
      customer: session.customer,
      subscription: session.subscription,
      amount_total: session.amount_total,
      currency: session.currency,
    });
  } catch (error) {
    console.error('Retrieve session error:', error);
    const message = error instanceof Error ? error.message : 'Failed to retrieve session';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
