import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const tiers = [
      {
        id: 'starter',
        name: 'Starter',
        price: 99,
        price_cents: 9900,
        sessions_per_month: 2,
        features: [
          '2 group sessions/month',
          'Video library access',
          'Community forum',
          'Basic progress tracking'
        ]
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 199,
        price_cents: 19900,
        sessions_per_month: 4,
        features: [
          '4 sessions/month (group + 1-on-1)',
          'Full video library',
          'Personalized drills',
          'Private coaching forum',
          'Priority booking'
        ]
      },
      {
        id: 'vip',
        name: 'VIP',
        price: 399,
        price_cents: 39900,
        sessions_per_month: null,
        features: [
          'Unlimited sessions',
          'Dedicated 1-on-1 coaching',
          'Custom learning plan',
          'Exclusive VIP content',
          'Priority support'
        ]
      }
    ];

    return NextResponse.json(tiers, { status: 200 });
  } catch (error) {
    console.error('Error fetching tiers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
