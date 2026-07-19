import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, email, fullName, successUrl, cancelUrl } = body;

    if (!planId || !email || !fullName || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Call backend billing API to create checkout session
    const response = await fetch(`${API_BASE_URL}/v1/billing/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId,
        successUrl,
        cancelUrl,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Billing API error:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Failed to create checkout session' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      url: data.url || data.sessionUrl,
      sessionId: data.id || data.sessionId,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
