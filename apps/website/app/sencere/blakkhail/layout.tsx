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
        .blakkhail-admin-header {
          position: fixed;
          top: 0;
          right: 0;
          z-index: 9999;
          padding: 1rem 2rem;
          background: rgba(0, 0, 0, 0.9);
          border-left: 2px solid #e8c56b;
          border-bottom: 2px solid #e8c56b;
          border-radius: 0 0 0 8px;
          font-family: Arial, sans-serif;
        }
        .blakkhail-admin-btn {
          padding: 0.75rem 1.5rem;
          background: #e8c56b;
          color: #000;
          border: none;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
        }
        .blakkhail-admin-btn:hover {
          background: #f5d98d;
          transform: translateY(-2px);
        }
      `}</style>
      <div className="blakkhail-admin-header">
        <a href="/blakkhail-admin-tv-login.html" className="blakkhail-admin-btn">
          🔐 Admin Login
        </a>
      </div>
      <div
        className={`${oswald.variable} ${inter.variable} min-h-screen antialiased`}
        style={{ fontFamily: 'var(--font-body)', backgroundColor: '#0A0A0A', color: '#A8A8A8', ['--font-headers' as string]: 'var(--font-display)' }}
      >
        {children}
      </div>
    </>
  );
}
