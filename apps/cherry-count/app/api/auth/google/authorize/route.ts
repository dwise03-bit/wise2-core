import { NextResponse } from 'next/server';
import {
  buildGoogleAuthorizeUrl,
  createOAuthState,
} from '@/lib/oauth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const state = createOAuthState('google');
    const response = NextResponse.redirect(buildGoogleAuthorizeUrl(state));
    response.cookies.set('google_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/cherry-count',
      maxAge: 600,
    });
    return response;
  } catch (error) {
    console.error('Google authorize failed:', error);
    return NextResponse.json({ error: 'Google OAuth is not configured' }, { status: 503 });
  }
}
