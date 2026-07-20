import { NextRequest, NextResponse } from 'next/server';

/**
 * OAuth callback route for Discord authentication
 * Discord redirects here with authorization code
 *
 * This route:
 * 1. Receives authorization code from Discord
 * 2. Exchanges code for access token
 * 3. Fetches user profile and guilds
 * 4. Creates session cookie
 * 5. Redirects to dashboard
 */

const CLIENT_ID = process.env.DISCORD_CLIENT_ID || '';
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'http://localhost:3000/api/auth/discord/callback';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle user rejection
  if (error) {
    console.log('User rejected OAuth:', error);
    return NextResponse.redirect(
      new URL('/auth/login?error=user_rejected', request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/auth/login?error=no_code', request.url)
    );
  }

  try {
    // Step 1: Exchange authorization code for access token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Discord token exchange failed:', {
        status: tokenResponse.status,
        error: errorText,
      });
      throw new Error('Token exchange failed');
    }

    const tokenData = await tokenResponse.json();
    const { access_token, token_type, expires_in, refresh_token } = tokenData;

    // Step 2: Fetch user profile
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `${token_type} ${access_token}`,
      },
    });

    if (!userResponse.ok) {
      console.error('Failed to fetch Discord user profile');
      throw new Error('Failed to fetch user profile');
    }

    const user = await userResponse.json();

    // Step 3: Fetch user guilds (optional)
    let guilds = [];
    try {
      const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
        headers: {
          Authorization: `${token_type} ${access_token}`,
        },
      });

      if (guildsResponse.ok) {
        guilds = await guildsResponse.json();
      }
    } catch (guildError) {
      console.warn('Failed to fetch guilds:', guildError);
    }

    // Step 4: Create user session object
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      discriminator: user.discriminator,
      banner: user.banner,
      verified: user.verified,
      createdAt: new Date().toISOString(),
      guilds: guilds.slice(0, 10).map((g: any) => ({
        id: g.id,
        name: g.name,
        icon: g.icon,
        owner: g.owner,
      })),
    };

    // Step 5: Create response and set session
    const dashboardUrl = new URL('/dashboard', request.url);
    const response = NextResponse.redirect(dashboardUrl);

    // Store user data in secure cookie
    response.cookies.set('discord_user', JSON.stringify(userData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    // Store access token in httpOnly cookie for server-side requests
    response.cookies.set('discord_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expires_in, // Match Discord's expiration
      path: '/',
    });

    // Store refresh token if available
    if (refresh_token) {
      response.cookies.set('discord_refresh_token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });
    }

    console.log('Discord OAuth successful for user:', user.id);
    return response;
  } catch (error) {
    console.error('Discord OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/auth/login?error=oauth_failed', request.url)
    );
  }
}
