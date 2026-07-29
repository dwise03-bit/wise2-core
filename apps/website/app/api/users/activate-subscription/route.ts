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

    // Call backend API to update database
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';
    const response = await fetch(`${apiUrl}/users/activate-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_SECRET_KEY || ''}`,
      },
      body: JSON.stringify({
        email,
        tier: planId,
        stripeCustomerId,
        stripeSubscriptionId,
      }),
    }).catch(err => {
      console.error('Database activation API error:', err);
      return null;
    });

    if (!response?.ok) {
      const errorData = await response?.text().catch(() => 'Unknown error');
      console.error('Failed to activate subscription in database:', errorData);
      // Still return 200 to acknowledge webhook; database will eventually be synced
    } else {
      console.log('Subscription activated in database:', {
        email,
        tier: planId,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Subscription activated',
        data: {
          email,
          tier: planId,
          stripeCustomerId,
          stripeSubscriptionId,
          isActive: true,
          timestamp,
        },
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
