import { NextRequest, NextResponse } from 'next/server';
import { getServerApiUrl } from '../../../../src/lib/server-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const API_URL = getServerApiUrl();
    const res = await fetch(`${API_URL}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message =
        data.message ||
        data.error?.message ||
        (typeof data.error === 'string' ? data.error : null) ||
        'Invalid email or password';
      return NextResponse.json({ error: message }, { status: res.status });
    }

    const token = data.accessToken || data.access_token;
    if (!token) {
      return NextResponse.json({ error: 'No token in response' }, { status: 502 });
    }

    const response = NextResponse.json({
      user: data.user,
      subscription: data.subscription ?? null,
      token,
      accessToken: token,
    });

    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch {
    return NextResponse.json(
      {
        error:
          'Authentication service unavailable. Start the Nest API (pnpm --filter @wise2/platform-api dev, port 3010).',
      },
      { status: 502 },
    );
  }
}
