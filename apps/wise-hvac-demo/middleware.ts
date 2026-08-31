import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  if (process.env.WISE_HVAC_DEMO_MODE === 'true') {
    return NextResponse.next();
  }

  const token = request.cookies.get('wise2_access_token')?.value;
  if (token) return NextResponse.next();

  const signinUrl = request.nextUrl.clone();
  signinUrl.pathname = '/signin';
  signinUrl.search = '';
  return NextResponse.redirect(signinUrl);
}

export const config = {
  matcher: ['/wise-hvac-demo/field-tech/:path*', '/field-tech/:path*'],
};
