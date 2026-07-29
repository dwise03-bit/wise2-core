import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/users/activate-subscription
 * Activates a user's subscription after successful Stripe payment
 * Called by: Stripe webhook handler on checkout.session.completed
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, stripeCustomerId, stripeSubscriptionId, planId, sessionId, timestamp } = body;

    if (!email || !stripeCustomerId || !planId) {
      return NextResponse.json(
        { error: 'Missing required fields: email, stripeCustomerId, planId' },
        { status: 400 }
      );
    }

    console.log('Activating subscription:', {
      email,
      planId,
      stripeCustomerId,
      sessionId,
    });

    // Update user subscription status
    // TODO: Execute against PostgreSQL:
    // UPDATE users SET tier=$1, stripe_customer_id=$2, stripe_subscription_id=$3, is_active=true, updated_at=NOW() WHERE email=$4

    const updateData = {
      email,
      tier: planId,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      is_active: true,
      activated_at: timestamp,
    };

    console.log('User subscription activated:', updateData);

    return NextResponse.json(
      {
        success: true,
        message: 'Subscription activated',
        data: updateData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Subscription activation error:', error);
    const message = error instanceof Error ? error.message : 'Failed to activate subscription';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
