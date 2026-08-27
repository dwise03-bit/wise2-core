import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  if (process.env.WISE_HVAC_DEMO_MODE !== 'false') {
    return NextResponse.next();
  }

  const session = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (session) return NextResponse.next();

  const canonicalUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;
  return NextResponse.redirect(new URL('/wise-hvac-demo/signin', canonicalUrl));
}

export const config = {
  matcher: ['/field-tech/:path*'],
};
