import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-2026-change-in-production';
const PROTECTED_ROUTES = ['/dashboard', '/crm', '/sales', '/projects', '/invoices', '/automation', '/ai-studio', '/settings'];

export function withAuth(handler: Function) {
  return async (request: NextRequest) => {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      (request as any).user = decoded;
      return handler(request);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  };
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    try {
      jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/crm/:path*', '/sales/:path*', '/projects/:path*', '/invoices/:path*', '/automation/:path*', '/ai-studio/:path*', '/settings/:path*'],
};
