import { NextRequest, NextResponse } from 'next/server';

const CLIENT_ID = process.env.DISCORD_CLIENT_ID || '';
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'http://localhost:3000/api/auth/discord/callback';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      return NextResponse.json({ error: 'Failed to exchange token' }, { status: 400 });
    }

    const tokenData = await tokenResponse.json();
    const { access_token, token_type } = tokenData;

    // Get user info
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `${token_type} ${access_token}` },
    });

    if (!userResponse.ok) {
      console.error('Failed to fetch user');
      return NextResponse.json({ error: 'Failed to get user' }, { status: 400 });
    }

    const user = await userResponse.json();

    // Get user guilds
    const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: { Authorization: `${token_type} ${access_token}` },
    });

    const guilds = guildsResponse.ok ? await guildsResponse.json() : [];

    // TODO: Store user session in database
    // For MVP, we'll use browser storage and JWT
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      discriminator: user.discriminator,
      guilds: guilds.slice(0, 5).map((g: any) => ({ id: g.id, name: g.name })),
      accessToken: access_token,
    };

    // Create response with user data
    const response = NextResponse.redirect(new URL('/dashboard', request.url));

    // Store user data in cookie for client-side access
    response.cookies.set('discord_user', JSON.stringify(userData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('OAuth error:', error);
    return NextResponse.redirect(
      new URL('/auth/login?error=authentication_failed', request.url)
    );
  }
}
