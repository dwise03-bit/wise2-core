import type { Metadata } from 'next';
import { Oswald, Inter } from 'next/font/google';
import { headers } from 'next/headers';
import { blakkhailBrand } from '@/components/sencere/blakkhail/config';
import { isBlackhailHost, normalizeHost } from '@/lib/site-domains';

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

export async function generateMetadata(): Promise<Metadata> {
  const headerList = headers();
  const host = normalizeHost(headerList.get('x-forwarded-host') ?? headerList.get('host'));
  const onBlackhailDomain = isBlackhailHost(host);

  return {
    title: `SenCere Creative LLC | ${blakkhailBrand.name}`,
    description:
      'Blakk Hail — legacy streetwear and original fashion from SenCere Creative LLC. Design. Create. Produce. Deliver.',
    metadataBase: onBlackhailDomain ? new URL(blakkhailBrand.siteUrl) : undefined,
    alternates: onBlackhailDomain
      ? { canonical: `${blakkhailBrand.siteUrl}/sencere` }
      : undefined,
    openGraph: {
      title: `SenCere Creative LLC | ${blakkhailBrand.name}`,
      description:
        'Legacy streetwear and original fashion. Take control. No apologies.',
      url: onBlackhailDomain ? `${blakkhailBrand.siteUrl}/sencere` : undefined,
      siteName: blakkhailBrand.name,
      images: [
        {
          url: '/sencere-assets/blakkhail-brand-board.jpg',
          width: 1920,
          height: 1080,
          alt: 'Blakk Hail brand identity',
        },
      ],
    },
    robots: onBlackhailDomain
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}

export default function BlakkhailLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        /* BLAKKHAIL NUCLEAR: Destroy all overlays */
        nav, header, aside, [class*="SiteChrome"], [class*="siteChrome"], [class*="site-chrome"], header[role="navigation"], header[class*="Nav"], nav[class*="Nav"], [class*="trading"], [class*="dashboard"], [class*="overlay"], [class*="modal"] { display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; position: absolute !important; top: -9999px !important; height: 0 !important; width: 0 !important; margin: 0 !important; padding: 0 !important; border: 0 !important; }
        body > div > nav, body > div > header, body > div > aside, body > div > [class*="Chrome"] { display: none !important; }
        /* Ensure BLAKKHAIL content is visible */
        .bh-page, [class*="blakkhail"], main { display: block !important; visibility: visible !important; opacity: 1 !important; position: static !important; }
      `}</style>
      <div
        className={`${oswald.variable} ${inter.variable} min-h-screen antialiased`}
        style={{ fontFamily: 'var(--font-body)', backgroundColor: '#0A0A0A', color: '#A8A8A8', ['--font-headers' as string]: 'var(--font-display)' }}
      >
        {children}
      </div>
    </>
  );
}
