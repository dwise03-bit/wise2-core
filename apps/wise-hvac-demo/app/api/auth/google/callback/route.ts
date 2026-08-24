import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(
      new URL(`/wise-hvac-demo/signin?error=${error}`, req.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/wise-hvac-demo/signin?error=missing_code', req.url)
    );
  }

  try {
    // Exchange code for token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXTAUTH_URL || 'https://wise2.net'}/wise-hvac-demo/api/auth/google/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Token exchange failed');
    }

    const tokens = await tokenResponse.json();

    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const userInfo = await userResponse.json();

    // Store session and redirect to app
    const response = NextResponse.redirect(
      new URL('/wise-hvac-demo', req.url)
    );

    // Set session cookie (simplified - in production use proper session management)
    response.cookies.set('auth-token', tokens.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: tokens.expires_in,
    });

    response.cookies.set('user-email', userInfo.email, {
      httpOnly: false,
      secure: true,
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/wise-hvac-demo/signin?error=callback_failed', req.url)
    );
  }
}
