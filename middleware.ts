import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@wise2/auth';

export async function middleware(request: NextRequest) {
  const session = await auth();

  if (!session && isProtectedRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  const response = NextResponse.next();

  if (session) {
    response.headers.set('x-user-id', session.user?.id || '');
    response.headers.set('x-user-email', session.user?.email || '');
  }

  return response;
}

function isProtectedRoute(pathname: string): boolean {
  const protectedPaths = [
    '/dashboard',
    '/admin',
    '/sound-labs',
    '/settings',
    '/profile',
  ];

  return protectedPaths.some(path => pathname.startsWith(path));
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
