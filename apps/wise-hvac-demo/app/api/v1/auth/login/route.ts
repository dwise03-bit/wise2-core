import { NextRequest, NextResponse } from 'next/server';
import { wise2ApiBaseUrl } from '@/lib/wise2-api';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const response = await fetch(`${wise2ApiBaseUrl()}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json(
        { error: payload.message || payload.error || 'Login failed' },
        { status: response.status },
      );
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Login proxy error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
