import type { Metadata } from 'next';
import { Bebas_Neue, Inter } from 'next/font/google';
import '../styles/globals.css';

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

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Ultra Wise Detail | Premium Auto Detailing & Restoration',
  description: 'Ultra Wise Detail provides premium mobile detailing, interior restoration, paint enhancement and vehicle protection services in South Florida.',
};

export default function UltraWiseDetailRouteGroup({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#030507" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="bg-[#030507]" style={{ margin: 0, padding: 0 }}>
        <div className={`${bebasNeue.variable} ${inter.variable}`}>
          {children}
        </div>
      </body>
    </html>
  );
}
