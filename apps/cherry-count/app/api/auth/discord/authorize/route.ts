import { NextResponse } from 'next/server';
import {
  buildDiscordAuthorizeUrl,
  createOAuthState,
} from '@/lib/oauth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const state = createOAuthState('discord');
    const response = NextResponse.redirect(buildDiscordAuthorizeUrl(state));
    response.cookies.set('discord_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/cherry-count',
      maxAge: 600,
    });
    return response;
  } catch (error) {
    console.error('Discord authorize failed:', error);
    return NextResponse.json({ error: 'Discord OAuth is not configured' }, { status: 503 });
  }
}
