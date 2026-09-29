import { NextRequest, NextResponse } from 'next/server';
import { getServerApiUrl } from '../../../../src/lib/server-api';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('authToken')?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const API_URL = getServerApiUrl();

  try {
    const res = await fetch(`${API_URL}/v1/billing/subscription`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    let subscription = null;
    if (res.ok) {
      subscription = await res.json();
    }

    const payload = JSON.parse(atob(token.split('.')[1]));

    return NextResponse.json({
      authenticated: true,
      token,
      user: {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        firstName: payload.firstName,
        lastName: payload.lastName,
      },
      subscription,
    });
  } catch {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return NextResponse.json({
        authenticated: true,
        token,
        user: { id: payload.sub, email: payload.email, role: payload.role },
        subscription: null,
        apiReachable: false,
      });
    } catch {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
  }
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('authToken');
  return response;
}
