import { NextRequest, NextResponse } from 'next/server';

// Protected routes that require admin authentication
const protectedRoutes = ['/admin/dashboard', '/admin/users', '/admin/settings', '/admin/logs'];
const publicRoutes = ['/auth/login'];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if it's a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    // Not a protected route, allow access
    return NextResponse.next();
  }

  // Get token from cookies (httpOnly) or localStorage fallback
  const token = request.cookies.get('wise2_access_token')?.value;

  if (!token) {
    // No token, redirect to login
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For now, we'll just check if token exists
  // More comprehensive validation (checking expiry, checking role) could be added here
  // The useAuth hook will handle role-based redirect on the client side

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
