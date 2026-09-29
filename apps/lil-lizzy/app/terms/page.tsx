import type { Metadata } from 'next';
import { LIZZY_LAYOUT } from '@/lib/brand-tokens';

export const metadata: Metadata = { title: 'Terms' };

export default function TermsPage() {
  return (
    <main className={`${LIZZY_LAYOUT.page} ${LIZZY_LAYOUT.container} py-10`}>
      <h1 className="font-display text-4xl font-black">Terms of use</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70">
        Lil Lizzy, the BoomPopsters, and Boom Tag are preview brands. Product prices, hardware specs, and availability
        are design targets, not a live offer. Powered by WISE².
      </p>
    </main>
  );
}
