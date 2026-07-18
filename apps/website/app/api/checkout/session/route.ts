import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient, STRIPE_CONFIG } from '@/lib/stripe';

/**
 * POST /api/checkout/session
 * Create a Stripe checkout session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { priceId, customerId, successUrl, cancelUrl, metadata } = body;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    const stripe = getStripeClient();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${baseUrl}/checkout/cancel`,
      customer: customerId,
      metadata: {
        ...metadata,
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

    const stripe = getStripeClient();
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
