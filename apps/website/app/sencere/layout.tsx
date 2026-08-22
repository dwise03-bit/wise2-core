import type { Metadata } from 'next';
import { Oswald, Inter } from 'next/font/google';

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

// Forces per-request rendering instead of build-time static prerendering.
// SiteChrome (apps/website/components/SiteChrome.tsx) decides whether to
// render the global WISE² platform nav based on usePathname(), which
// resolves incorrectly during static generation and bakes the global nav
// into the prerendered HTML (the same pre-existing issue affects
// /soundlab). Dynamic rendering resolves the pathname correctly per
// request, matching what already works in `next dev`.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    default: 'SenCere Creative LLC | Custom Apparel, Printing & Fabrication',
    template: '%s | SenCere Creative LLC',
  },
  description:
    'SenCere Creative LLC brings ideas into reality with custom apparel, printing, engraving, fabrication, prototyping and creative production solutions powered by WISE².',
};

export default function SenCereLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${oswald.variable} ${inter.variable} bg-[#050505] antialiased`}
      style={{ fontFamily: 'var(--font-body)' }}
    >
      {children}
    </div>
  );
}
