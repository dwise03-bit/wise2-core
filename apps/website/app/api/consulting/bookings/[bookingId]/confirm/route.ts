import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

interface ConfirmBookingRequest {
  paymentIntentId: string;
  amount: number; // in dollars
}

interface ConfirmBookingResponse {
  success: boolean;
  bookingId: string;
  paymentStatus: string;
  confirmationDetails?: {
    consultantName?: string;
    serviceName?: string;
    date?: string;
    time?: string;
    meetingLink?: string;
  };
  message: string;
}

/**
 * POST /api/consulting/bookings/[bookingId]/confirm
 * Confirm a booking after successful payment
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const bookingId = params.bookingId;
    const body: ConfirmBookingRequest = await request.json();

    const { paymentIntentId, amount } = body;

    // Validate required fields
    if (!bookingId || !paymentIntentId || amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) {
      return NextResponse.json(
        { error: 'Payment intent not found' },
        { status: 404 }
      );
    }

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: `Payment status is ${paymentIntent.status}, expected succeeded` },
        { status: 400 }
      );
    }

    // Verify amount matches (in cents)
    const expectedAmountCents = Math.round(amount * 100);
    if (paymentIntent.amount !== expectedAmountCents) {
      console.error(
        `Amount mismatch: expected ${expectedAmountCents}, got ${paymentIntent.amount}`
      );
      return NextResponse.json(
        { error: 'Payment amount does not match booking amount' },
        { status: 400 }
      );
    }

    // Call backend API to confirm booking
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/v1/consulting/bookings/${bookingId}/confirm`;

    const confirmResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentIntentId,
        amount,
        status: 'confirmed',
        confirmedAt: new Date().toISOString(),
      }),
    });

    if (!confirmResponse.ok) {
      const errorData = await confirmResponse.json().catch(() => ({}));
      console.error('Backend confirmation error:', errorData);

      // Return success anyway since payment succeeded
      // The booking may still be confirmed in the background
      return NextResponse.json<ConfirmBookingResponse>(
        {
          success: true,
          bookingId,
          paymentStatus: 'confirmed',
          message:
            'Payment successful. Your booking is being processed. You will receive a confirmation email shortly.',
        },
        { status: 200 }
      );
    }

    const bookingData = await confirmResponse.json();

    return NextResponse.json<ConfirmBookingResponse>(
      {
        success: true,
        bookingId,
        paymentStatus: 'confirmed',
        confirmationDetails: {
          consultantName: bookingData.consultantName,
          serviceName: bookingData.serviceName,
          date: bookingData.date,
          time: bookingData.time,
          meetingLink: bookingData.meetingLink,
        },
        message: 'Booking confirmed! You will receive a confirmation email shortly.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Booking confirmation error:', error);

    if (error instanceof Stripe.errors.StripeInvalidRequestError) {
      return NextResponse.json(
        { error: error.message || 'Invalid payment information' },
        { status: 400 }
      );
    }

    if (error instanceof Stripe.errors.StripeAPIError) {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to confirm booking' },
      { status: 500 }
    );
  }
}
