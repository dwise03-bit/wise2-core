import { NextResponse } from 'next/server';
import {
  buildGoogleAuthorizeUrl,
  createOAuthState,
  getHvacAppUrl,
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
      path: '/',
      maxAge: 600,
    });
    return response;
  } catch (error) {
    console.error('HVAC Google authorize failed:', error);
    const url = new URL(getHvacAppUrl('/signin'));
    url.searchParams.set('error', 'google_not_configured');
    return NextResponse.redirect(url);
  }
}
