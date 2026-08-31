import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { CherryLogo, Wise2Badge } from '@/components/ui';
import { CHERRY_LAYOUT } from '@/lib/brand-tokens';

export default function LandingPage() {
  return (
    <div className={`${CHERRY_LAYOUT.page} relative`}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-cherry-hot/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-cherry-royal/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
        <CherryLogo size="lg" />

        <p className="mt-6 font-script text-3xl text-cherry-bubblegum sm:text-4xl">
          Track It. Pack It. Profit.
        </p>

        <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
          The all-in-one inventory, sales and pop-up management system for mobile retailers.
        </p>

        <div className="mt-10 flex w-full flex-col gap-3">
          <Link href="/dashboard" className={`w-full ${CHERRY_LAYOUT.btnPrimary}`}>
            Open Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link href="/login" className={`w-full ${CHERRY_LAYOUT.btnGhost}`}>
            Sign In
          </Link>
          <Link href="/presentation" className={`w-full text-center text-xs text-white/40 hover:text-cherry-hot`}>
            <Sparkles className="mr-2 inline h-3 w-3" />
            Client Presentation
          </Link>
        </div>

        <Wise2Badge className="mt-12" />
      </div>
    </div>
  );
}
