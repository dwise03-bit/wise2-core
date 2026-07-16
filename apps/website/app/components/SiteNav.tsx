'use client';

import { usePathname } from 'next/navigation';

// Pages that render their own <nav> and must not get the shared site nav on top of it.
const PAGES_WITH_OWN_NAV = ['/', '/community'];

export function SiteNav() {
  const pathname = usePathname();

  if (PAGES_WITH_OWN_NAV.includes(pathname)) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 bg-wise/80 backdrop-blur-md border-b border-wise-subtle">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-6 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold">
          WISE<sup className="text-lg">²</sup>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="/#sound-labs" className="hover:text-wise-primary transition-colors">Sound Labs</a>
          <a href="/#features" className="hover:text-wise-primary transition-colors">Features</a>
          <a href="/#pricing" className="hover:text-wise-primary transition-colors">Pricing</a>
          <a href="/community" className="hover:text-wise-primary transition-colors">Community</a>
        </div>
        <button className="px-6 py-2 bg-wise-primary hover:bg-wise-primary-hover text-wise font-semibold rounded-md transition-colors shadow-glow-blue-sm hover:shadow-glow-blue-md">
          Get Started
        </button>
      </div>
    </nav>
  );
}
