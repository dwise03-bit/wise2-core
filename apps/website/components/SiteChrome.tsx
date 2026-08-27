'use client';

import { usePathname } from 'next/navigation';
import { PublicNav, PublicFooter } from '@/components/navigation';
import { WiseImp } from '@/components/wise-imp/WiseImp';

/**
 * Routes that own a fully custom header/footer and must not receive the
 * shared site chrome (PublicNav/PublicFooter/WiseImp).
 */
const CUSTOM_SHELL_ROUTES = ['/soundlab', '/sencere'];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hasCustomShell = CUSTOM_SHELL_ROUTES.some(
    (route) => pathname === route || pathname?.startsWith(`${route}/`)
  );

  if (hasCustomShell) {
    return <>{children}</>;
  }

  return (
    <>
      <PublicNav />
      <div className="min-h-screen flex flex-col pt-16">
        <div className="flex-1">{children}</div>
        {pathname !== '/' && <WiseImp />}
        <PublicFooter />
      </div>
    </>
  );
}
