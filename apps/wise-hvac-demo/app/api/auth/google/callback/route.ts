import { NextRequest, NextResponse } from 'next/server';
import { completeHvacOAuthLogin, getHvacAppUrl, validateOAuthState } from '@/lib/oauth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const oauthError = request.nextUrl.searchParams.get('error');

  if (oauthError) {
    const url = new URL(getHvacAppUrl('/signin'));
    url.searchParams.set('error', 'google_rejected');
    return NextResponse.redirect(url);
  }

  if (!code || !(await validateOAuthState('google', state))) {
    const url = new URL(getHvacAppUrl('/signin'));
    url.searchParams.set('error', 'oauth_state');
    return NextResponse.redirect(url);
  }

  return completeHvacOAuthLogin(code);
}
