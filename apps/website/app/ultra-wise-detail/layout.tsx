import { Metadata } from 'next';
import { Bebas_Neue, Inter } from 'next/font/google';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-body',
  display: 'swap',
});

// Force dynamic rendering so the main SiteChrome correctly detects
// /ultra-wise-detail as an isolated subtree and excludes the global nav
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Ultra Wise Detail | Premium Auto Detailing & Restoration',
  description:
    'Ultra Wise Detail provides premium mobile detailing, interior restoration, paint enhancement and vehicle protection services in South Florida. Call Ronald Wise at (917) 749-8960.',
  keywords: [
    'auto detailing',
    'car detailing',
    'premium detailing',
    'vehicle restoration',
    'paint protection',
    'ceramic coating',
    'South Florida detailing',
    'mobile detailing',
  ],
  openGraph: {
    title: 'Ultra Wise Detail | Premium Auto Detailing',
    description:
      'Premium detailing & auto recon services that bring your vehicle back to life.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function UltraWiseDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${bebasNeue.variable} ${inter.variable}`}
      style={{ fontFamily: 'var(--font-body)' }}
    >
      {children}
    </div>
  );
}
