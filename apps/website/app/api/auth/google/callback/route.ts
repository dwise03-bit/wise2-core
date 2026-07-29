import { NextRequest, NextResponse } from 'next/server';
import { DASHBOARD_URL } from '@/lib/urls';

/**
 * Google OAuth callback route
 * Handles the OAuth callback from Google with authorization code
 *
 * Flow:
 * 1. Receive authorization code from Google
 * 2. Exchange code for access token
 * 3. Fetch user profile info
 * 4. Create session and redirect to dashboard
 */

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/auth/google/callback';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle user rejection
  if (error) {
    console.log('User rejected Google OAuth:', error);
    return NextResponse.redirect(
      new URL('/auth/login?error=user_rejected', request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/auth/login?error=no_code', request.url)
    );
  }

  // Verify state cookie
  const storedState = request.cookies.get('google_oauth_state')?.value;
  if (!state || state !== storedState) {
    console.error('State mismatch in Google OAuth callback');
    return NextResponse.redirect(
      new URL('/auth/login?error=state_mismatch', request.url)
    );
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('Google OAuth credentials not configured');
    return NextResponse.redirect(
      new URL('/auth/login?error=server_error', request.url)
    );
  }

  try {
    // Step 1: Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
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
      console.error('Google token exchange failed:', {
        status: tokenResponse.status,
        error: errorText,
      });
      throw new Error('Token exchange failed');
    }

    const tokenData = await tokenResponse.json();
    const { access_token, id_token, expires_in, refresh_token } = tokenData;

    // Step 2: Fetch user profile using access token
    const userResponse = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (!userResponse.ok) {
      console.error('Failed to fetch Google user profile');
      throw new Error('Failed to fetch user profile');
    }

    const user = await userResponse.json();

    // Step 3: Create user session object
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      verified_email: user.verified_email,
      createdAt: new Date().toISOString(),
    };

    // Step 4: Create response and set session
    const response = NextResponse.redirect(DASHBOARD_URL);

    // Store user data in cookie for client-side access
    response.cookies.set('google_user', JSON.stringify(userData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    // Store access token in httpOnly cookie for server-side requests
    response.cookies.set('google_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expires_in || 3600, // Use Google's expiration or 1 hour default
      path: '/',
    });

    // Store refresh token if available (for offline access)
    if (refresh_token) {
      response.cookies.set('google_refresh_token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });
    }

    // Clear the state cookie
    response.cookies.delete('google_oauth_state');

    console.log('Google OAuth successful for user:', user.id);
    return response;
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/auth/login?error=oauth_failed', request.url)
    );
  }
}
