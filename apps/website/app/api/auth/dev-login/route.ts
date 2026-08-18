import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DEV_MODE = process.env.NODE_ENV !== 'production';
const PUBLIC_SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://wise2.net').replace(/\/$/, '');

/**
 * Dev-mode local authentication
 * Creates a mock session for testing Sound Labs without OAuth setup
 * Only enabled in development mode
 */
export async function POST(request: NextRequest) {
  if (!DEV_MODE) {
    return NextResponse.json({ error: 'Dev login not available in production' }, { status: 403 });
  }

  const body = await request.json();
  const { email = 'developer@wise2.local', name = 'Developer' } = body;

  const userData = {
    id: `dev_${Date.now()}`,
    userId: `dev_${Date.now()}`,
    email,
    firstName: name.split(' ')[0],
    lastName: name.split(' ').slice(1).join(' ') || 'User',
    picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0055FF&color=fff`,
    provider: 'dev',
    verified: true,
    createdAt: new Date().toISOString(),
  };

  const response = NextResponse.json({ success: true, user: userData });

  // Set auth token in localStorage format (JSON)
  response.cookies.set('app_state', JSON.stringify({
    auth: {
      token: `dev_token_${Date.now()}`,
      user: userData,
    },
  }), {
    httpOnly: false,
    secure: false, // Allow in dev
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });

  // Also set individual cookies for compatibility
  response.cookies.set('authUser', JSON.stringify(userData), {
    httpOnly: false,
    secure: false,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });

  response.cookies.set('authToken', `dev_token_${Date.now()}`, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });

  return response;
}
