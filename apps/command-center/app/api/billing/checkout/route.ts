import { Buffer } from 'node:buffer';
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface CheckoutRequest {
  plan: 'starter' | 'pro' | 'enterprise';
  billingCycle: 'monthly' | 'annual';
  email?: string;
  fullName?: string;
}

function decodeJwtPayload(token: string): { sub?: string; email?: string; role?: string } | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('authToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CheckoutRequest = await request.json();
    const { plan, billingCycle } = body;
    const payload = decodeJwtPayload(token);
    const email = body.email || payload?.email;
    const fullName = body.fullName || (email ? email.split('@')[0].replace(/[._-]+/g, ' ') : 'Customer');

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan is required' },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Missing email for checkout' },
        { status: 400 }
      );
    }

    // Create Checkout Session
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3011/api';
    const response = await fetch(`${API_URL}/v1/billing/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        planId: plan.toUpperCase(),
        email,
        fullName,
        billingCycle: billingCycle || 'monthly',
        successUrl: `${request.nextUrl.origin}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${request.nextUrl.origin}/dashboard/billing?cancelled=1`,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || data.error || 'Failed to create checkout session' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      sessionId: data.sessionId || data.id,
      url: data.url,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
