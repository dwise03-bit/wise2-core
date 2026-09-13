import { NextResponse } from 'next/server';

type OAuthProvider = 'google' | 'discord';

interface WiseAuthResponse {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role?: string;
    firstName?: string;
    lastName?: string;
  };
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

function getApiBaseUrl(): string {
  const internal = process.env.API_INTERNAL_URL?.replace(/\/$/, '');
  if (internal) return internal;

  const publicApi = (process.env.NEXT_PUBLIC_API_URL || 'https://api.wise2.net').replace(
    /\/$/,
    '',
  );
  return publicApi.endsWith('/api') ? publicApi : `${publicApi}/api`;
}

function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://wise2.net').replace(/\/$/, '');
}

function getDashboardUrl(): string {
  const siteUrl = getSiteUrl();
  return (process.env.NEXT_PUBLIC_DASHBOARD_URL || `${siteUrl}/dashboard`).replace(/\/$/, '');
}

function getCookieDomain(): string | undefined {
  const siteUrl = getSiteUrl();
  return siteUrl.endsWith('wise2.net') ? '.wise2.net' : undefined;
}

export async function completeOAuthLogin(
  provider: OAuthProvider,
  code: string,
  redirectUri: string,
): Promise<NextResponse> {
  const siteUrl = getSiteUrl();
  const dashboardUrl = getDashboardUrl();
  const cookieDomain = getCookieDomain();
  const isProduction = process.env.NODE_ENV === 'production';

  const exchangeUrl = `${getApiBaseUrl()}/v1/auth/oauth/${provider}/exchange`;
  let exchangeRes: Response | undefined;
  let lastError: unknown;

  // The website and API are separate containers. During a rolling restart the
  // API can accept connections a moment after the website receives Google's
  // callback; retry transient transport failures so users are not bounced
  // back to sign-in during that short readiness window.
  for (const delayMs of [0, 300, 900]) {
    if (delayMs) await new Promise((resolve) => setTimeout(resolve, delayMs));
    try {
      exchangeRes = await fetch(exchangeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, redirectUri }),
        cache: 'no-store',
      });
      if (exchangeRes.ok || exchangeRes.status < 500) break;
    } catch (error) {
      lastError = error;
    }
  }

  if (!exchangeRes) {
    console.error(`${provider} OAuth exchange transport failed after retries:`, lastError);
    return NextResponse.redirect(new URL('/auth/signin?error=oauth_failed', siteUrl));
  }

  if (!exchangeRes.ok) {
    const errorText = await exchangeRes.text();
    console.error(`${provider} OAuth exchange failed:`, errorText);
    return NextResponse.redirect(new URL('/auth/signin?error=oauth_failed', siteUrl));
  }

  const auth = (await exchangeRes.json()) as WiseAuthResponse;
  const response = NextResponse.redirect(new URL(dashboardUrl));
  const cookieBase = {
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    ...(cookieDomain ? { domain: cookieDomain } : {}),
  };

  response.cookies.set('auth_token', auth.accessToken, {
    ...cookieBase,
    httpOnly: false,
    maxAge: auth.expiresIn || 60 * 60 * 24 * 7,
  });

  response.cookies.set('authToken', auth.accessToken, {
    ...cookieBase,
    httpOnly: true,
    maxAge: auth.expiresIn || 60 * 60 * 24 * 7,
  });

  response.cookies.set('authUser', JSON.stringify(auth.user), {
    ...cookieBase,
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 7,
  });

  if (auth.refreshToken) {
    response.cookies.set('refresh_token', auth.refreshToken, {
      ...cookieBase,
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  response.cookies.delete(`${provider}_oauth_state`);
  return response;
}
