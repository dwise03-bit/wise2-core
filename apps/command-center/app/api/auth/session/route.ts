import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3011/api';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('authToken')?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const res = await fetch(`${API_URL}/v1/billing/subscription`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      return NextResponse.json({ authenticated: true, token, user: null, subscription: null });
    }

    const subscription = await res.json();

    const payload = JSON.parse(atob(token.split('.')[1]));

    return NextResponse.json({
      authenticated: true,
      token,
      user: { id: payload.sub, email: payload.email, role: payload.role },
      subscription,
    });
  } catch {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return NextResponse.json({
      authenticated: true,
      token,
      user: { id: payload.sub, email: payload.email, role: payload.role },
      subscription: null,
    });
  }
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('authToken');
  return response;
}
