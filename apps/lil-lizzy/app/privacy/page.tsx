import type { Metadata } from 'next';
import { LIZZY_LAYOUT } from '@/lib/brand-tokens';

export const metadata: Metadata = { title: 'Privacy' };

export default function PrivacyPage() {
  return (
    <main className={`${LIZZY_LAYOUT.page} ${LIZZY_LAYOUT.container} py-10`}>
      <h1 className="font-display text-4xl font-black">Privacy</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70">
        This is a preview brand site for Lil Lizzy & The BoomPopsters. The shop is a demo bag stored in your browser
        only. We do not collect child accounts, location, or third-party ads on this preview. A live store will add a
        full parent privacy policy before checkout goes live.
      </p>
    </main>
  );
}
