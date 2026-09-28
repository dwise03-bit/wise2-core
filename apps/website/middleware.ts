import { NextRequest, NextResponse } from 'next/server';
import { isBlackhailHost, normalizeHost } from '@/lib/site-domains';

const BLACKHAIL_PREFIX = '/sencere/blakkhail';
const SENCERE_PREFIX = '/sencere';

function withBlackhailBrand(request: NextRequest): Headers {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-site-brand', 'blakkhail');
  return requestHeaders;
}

export function middleware(request: NextRequest) {
  const host = normalizeHost(request.headers.get('host'));

  if (!isBlackhailHost(host)) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Force all BLAKKHAIL requests to the new storefront design
  // Disable any old legacy pages or cached content
  if (pathname === '/' || pathname === '' || pathname.toLowerCase() === '/blakkhail/home.html') {
    const url = request.nextUrl.clone();
    url.pathname = BLACKHAIL_PREFIX;
    const response = NextResponse.redirect(url);
    response.cookies.set('x-brand', 'blakkhail', { maxAge: 3600 });
    return response;
  }

  // Keep campaign links shareable while the storefront remains section-based.
  if (pathname === '/latest-drop' || pathname === '/collection') {
    return NextResponse.redirect(new URL('/#latest-drop', request.url));
  }

  if (
    pathname === '/sencere' ||
    pathname === '/sencere/' ||
    pathname === '/sencere/blakkhail' ||
    pathname === '/sencere/blakkhail/'
  ) {
    const url = request.nextUrl.clone();
    url.pathname = BLACKHAIL_PREFIX;
    return NextResponse.redirect(url);
  }

  if (pathname === '/products' || pathname.startsWith('/products/')) {
    const url = request.nextUrl.clone();
    url.pathname = `${SENCERE_PREFIX}${pathname}`;
    return NextResponse.redirect(url);
  }

  if (pathname === '/checkout' || pathname.startsWith('/checkout/')) {
    const url = request.nextUrl.clone();
    url.pathname = `${SENCERE_PREFIX}${pathname}`;
    return NextResponse.redirect(url);
  }

  if (pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = `${BLACKHAIL_PREFIX}/login`;
    return NextResponse.redirect(url);
  }

  if (pathname === '/order-confirmation' || pathname.startsWith('/order-confirmation/')) {
    const url = request.nextUrl.clone();
    url.pathname = `${SENCERE_PREFIX}${pathname}`;
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next({
    request: { headers: withBlackhailBrand(request) },
  });
  response.cookies.set('x-brand', 'blakkhail', { maxAge: 3600 });
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
