import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Route prefixes that require an authenticated session.
  // Keep this list in sync with `config.matcher` below — the matcher decides
  // which requests reach this middleware at all, so a prefix that is missing
  // there is unprotected no matter what this check says.
  const PROTECTED_PREFIXES = [
    '/dashboard',
    '/revenue-os',
    '/leads',
    '/customers',
    '/billing',
    '/hvac',
  ];

  if (PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    const authToken = request.cookies.get('authToken')?.value;

    if (!authToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/revenue-os/:path*',
    '/leads/:path*',
    '/customers/:path*',
    '/billing/:path*',
    '/hvac/:path*',
  ],
};
