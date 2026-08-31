import { NextRequest, NextResponse } from 'next/server';
import { applyHandoffAuth, getHvacAppUrl } from '@/lib/oauth';
import { consumeHandoffTicket } from '@/lib/oauth-handoff';

export const dynamic = 'force-dynamic';

function wantsJson(request: NextRequest): boolean {
  if (request.nextUrl.searchParams.get('format') === 'json') return true;
  return (request.headers.get('accept') || '').includes('application/json');
}

export async function GET(request: NextRequest) {
  const ticket = request.nextUrl.searchParams.get('ticket');
  const auth = consumeHandoffTicket(ticket);
  if (!auth?.accessToken) {
    if (wantsJson(request)) {
      return NextResponse.json({ error: 'oauth_state' }, { status: 401 });
    }
    const url = new URL(getHvacAppUrl('/signin'));
    url.searchParams.set('error', 'oauth_state');
    return NextResponse.redirect(url);
  }

  if (wantsJson(request)) {
    return NextResponse.json({
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
      expiresIn: auth.expiresIn,
      user: auth.user,
    });
  }

  return applyHandoffAuth(auth);
}
