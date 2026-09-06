import { NextRequest, NextResponse } from 'next/server';
import { isBlackhailHost, normalizeHost } from '@/lib/site-domains';

const BLACKHAIL_PREFIX = '/sencere/blakkhail';
const SENCERE_PREFIX = '/sencere';

function withBlackhailBrand(request: NextRequest): Headers {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-site-brand', 'blakkhail');
  return requestHeaders;
}

function rewriteTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.rewrite(url, {
    request: { headers: withBlackhailBrand(request) },
  });
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
    return rewriteTo(request, BLACKHAIL_PREFIX);
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
    return rewriteTo(request, BLACKHAIL_PREFIX);
  }

  if (pathname === '/products' || pathname.startsWith('/products/')) {
    return rewriteTo(request, `${SENCERE_PREFIX}${pathname}`);
  }

  if (pathname === '/checkout' || pathname.startsWith('/checkout/')) {
    return rewriteTo(request, `${SENCERE_PREFIX}${pathname}`);
  }

  if (pathname === '/order-confirmation' || pathname.startsWith('/order-confirmation/')) {
    return rewriteTo(request, `${SENCERE_PREFIX}${pathname}`);
  }

  return NextResponse.next({
    request: { headers: withBlackhailBrand(request) },
  });
}

export const config = {
  matcher: ['/blakkhail/Home.html', '/blakkhail/home.html', '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
