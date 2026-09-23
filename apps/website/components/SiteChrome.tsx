'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PublicNav, PublicFooter } from '@/components/navigation';
import { WiseImp } from '@/components/wise-imp/WiseImp';
import { isBlackhailHost } from '@/lib/site-domains';

/**
 * Routes that own a fully custom header/footer and must not receive the
 * shared site chrome (PublicNav/PublicFooter/WiseImp).
 */
const CUSTOM_SHELL_ROUTES = ['/soundlab', '/sencere', '/sencere/blakkhail'];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [blackhailHost, setBlackhailHost] = useState(false);

  useEffect(() => {
    setBlackhailHost(isBlackhailHost(window.location.hostname));
  }, []);

  // Check if this is a BLAKKHAIL route (either by host or by path)
  const isBlakkhailRoute =
    blackhailHost ||
    pathname?.startsWith('/sencere/blakkhail');

  // Check if this is any SenCere route (more restrictive)
  const isSencereRoute =
    pathname?.startsWith('/sencere');

  const hasCustomShell =
    isBlakkhailRoute ||
    isSencereRoute ||
    CUSTOM_SHELL_ROUTES.some(
      (route) => pathname === route || pathname?.startsWith(`${route}/`)
    );

  if (hasCustomShell) {
    return <>{children}</>;
  }

  return (
    <>
      <PublicNav />
      <div className="flex min-h-screen flex-col overflow-x-hidden pt-16">
        <div className="min-w-0 flex-1">{children}</div>
        {pathname !== '/' && pathname !== '/products/imp' && !isSencereRoute && <WiseImp />}
        <PublicFooter />
      </div>
    </>
  );
}
