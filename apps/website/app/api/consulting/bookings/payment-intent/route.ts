import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

interface PaymentIntentRequest {
  bookingId: string;
  amount: number; // in cents
  paymentMethodId: string;
  cardholderName: string;
}

/**
 * POST /api/consulting/bookings/payment-intent
 * Create a Stripe PaymentIntent for consulting booking payment
 */
export async function POST(request: NextRequest) {
  try {
    const body: PaymentIntentRequest = await request.json();

    const { bookingId, amount, paymentMethodId, cardholderName } = body;

    // Validate required fields
    if (!bookingId || !amount || !paymentMethodId || !cardholderName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate amount is positive and reasonable
    if (amount < 100) {
      // minimum $1.00 USD
      return NextResponse.json(
        { error: 'Amount must be at least $1.00' },
        { status: 400 }
      );
    }

    if (amount > 99999900) {
      // maximum $999,999.00 USD
      return NextResponse.json(
        { error: 'Amount exceeds maximum limit' },
        { status: 400 }
      );
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: false, // Don't confirm immediately, let client handle it
      metadata: {
        bookingId,
        cardholderName,
      },
      description: `Consulting booking payment - ${bookingId}`,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);

    if (error instanceof Stripe.errors.StripeInvalidRequestError) {
      return NextResponse.json(
        { error: error.message || 'Invalid payment request' },
        { status: 400 }
      );
    }

    if (error instanceof Stripe.errors.StripeAuthenticationError) {
      return NextResponse.json(
        { error: 'Payment authentication failed' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
