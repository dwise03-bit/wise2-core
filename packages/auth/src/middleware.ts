import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware to protect routes that require authentication
 * Usage:
 * - Add routes to PROTECTED_ROUTES array
 * - Middleware will redirect unauthenticated users to /auth/signin
 */

const PROTECTED_ROUTES = [
  '/dashboard',
  '/studio',
  '/admin',
  '/profile',
  '/account',
  '/settings',
];

const ADMIN_ROUTES = ['/admin'];

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const pathname = request.nextUrl.pathname;

  // Check if route requires authentication
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtected && !token) {
    // Redirect to sign in page if not authenticated
    return NextResponse.redirect(
      new URL(`/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`, request.url),
    );
  }

  // Check if route requires admin role
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));
  if (isAdminRoute && token) {
    const userRole = (token as any).role || 'user';
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/auth/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
