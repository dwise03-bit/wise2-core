'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { checkoutPath } from '@/lib/site-domains';
import { BLAKKHAIL } from './brand-tokens';

/** Sticky shop bar on mobile — keeps buy path one tap away. */
export function BlakkhailMobileShopBar() {
  const [host, setHost] = useState<string | null>(null);

  useEffect(() => {
    setHost(window.location.hostname);
  }, []);

  if (!host) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 flex gap-2 border-t p-3 md:hidden"
      style={{
        borderColor: BLAKKHAIL.darkGold,
        backgroundColor: BLAKKHAIL.jetBlack,
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
      }}
    >
      <Link
        href="#collection"
        className="flex min-h-11 flex-1 items-center justify-center text-sm font-bold uppercase tracking-wide text-black"
        style={{ backgroundColor: BLAKKHAIL.gold }}
      >
        Shop Now
      </Link>
      <Link
        href={checkoutPath(host)}
        className="flex min-h-11 min-w-[44%] items-center justify-center gap-2 border text-sm font-bold uppercase tracking-wide"
        style={{ borderColor: BLAKKHAIL.gold, color: BLAKKHAIL.gold }}
      >
        <ShoppingCart size={18} aria-hidden />
        Cart
      </Link>
    </div>
  );
}
