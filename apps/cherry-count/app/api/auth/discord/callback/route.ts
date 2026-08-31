import { NextRequest, NextResponse } from 'next/server';
import { completeCherryOAuthLogin, getCherryCountBase, validateOAuthState } from '@/lib/oauth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');

  if (!code || !(await validateOAuthState('discord', state))) {
    return NextResponse.redirect(new URL('/login?error=oauth_state', getCherryCountBase()));
  }

  return completeCherryOAuthLogin('discord', code);
}
