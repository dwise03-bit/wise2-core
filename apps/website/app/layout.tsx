import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import './styles/globals.css';
import { SiteChrome } from '@/components/SiteChrome';
import { ToastProvider } from '@/components/ui/Toast';
import { isBlackhailBrand } from '@/lib/site-domains';
import { SessionProvider } from './providers';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: 'WISE² | Intelligent Tools for Real-World Businesses',
  description: 'WISE² builds field-ready software, AI workflows, edge systems, and client operating infrastructure for real businesses.',
  keywords: 'WISE2, WISE², field operations software, AI workflows, HVAC diagnostics, edge systems, business operating system, client infrastructure',
  robots: 'index, follow',
  metadataBase: new URL('https://wise2.net'),
  openGraph: {
    type: 'website',
    url: 'https://wise2.net',
    title: 'WISE² | Intelligent Tools for Real-World Businesses',
    description: 'Field-ready software, AI workflows, edge systems, and client operating infrastructure built by WISE².',
    siteName: 'WISE²',
    images: [
      {
        url: '/brand/wise2-brand-identity.png',
        width: 1200,
        height: 630,
        alt: 'WISE² connected business operating system artwork',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WISE² | Intelligent Tools for Real-World Businesses',
    description: 'Field-ready software, AI workflows, edge systems, and client operating infrastructure built by WISE².',
  },
  alternates: {
    canonical: 'https://wise2.net',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const siteBrand = headers().get('x-site-brand');
  const skipSiteChrome = isBlackhailBrand(siteBrand);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#050505" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { background: #000; color: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
          h1, h2, h3 { font-weight: 700; }
          a { color: #3ff14; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .max-w-7xl { max-width: 80rem; margin: 0 auto; }
          .px-4 { padding-left: 1rem; padding-right: 1rem; }
          .py-16 { padding-top: 4rem; padding-bottom: 4rem; }
          .mb-16 { margin-bottom: 4rem; }
          .mb-4 { margin-bottom: 1rem; }
          .mb-6 { margin-bottom: 1.5rem; }
          .grid { display: grid; }
          .grid-cols-1 { grid-template-columns: 1fr; }
          @media (min-width: 768px) { .md\\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); } }
          @media (min-width: 1024px) { .lg\\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); } }
          .gap-6 { gap: 1.5rem; }
          .gap-4 { gap: 1rem; }
          .gap-8 { gap: 2rem; }
          .text-5xl { font-size: 3rem; line-height: 1; }
          .text-xl { font-size: 1.25rem; }
          .text-2xl { font-size: 1.5rem; }
          .text-gray-300 { color: #d1d5db; }
          .text-gray-400 { color: #9ca3af; }
          .text-green-400 { color: #4ade80; }
          .text-blue-400 { color: #60a5fa; }
          .bg-gray-800 { background: #1f2937; }
          .bg-gray-700 { background: #374151; }
          .border { border: 1px solid; }
          .border-gray-700 { border-color: #374151; }
          .rounded-lg { border-radius: 0.5rem; }
          .p-6 { padding: 1.5rem; }
          .p-8 { padding: 2rem; }
          .flex { display: flex; }
          .items-center { align-items: center; }
          .justify-between { justify-content: space-between; }
          .justify-center { justify-content: center; }
          .space-y-2 > * + * { margin-top: 0.5rem; }
          .space-y-2 { display: flex; flex-direction: column; gap: 0.5rem; }
          .systems-page { min-height: 100vh; background: #000; color: #fff; font-family: system-ui, -apple-system, sans-serif; }
          .systems-container { max-width: 80rem; margin: 0 auto; padding: 0 1rem; padding-top: 4rem; padding-bottom: 4rem; }
          .transition-all { transition: all 0.3s; }
          .hover\\:border-green-500:hover { border-color: #22c55e; }
          .hover\\:bg-gray-800:hover { background: #1f2937; }
          .hover\\:text-green-400:hover { color: #4ade80; }
          button { padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; font-weight: 700; cursor: pointer; transition: all 0.3s; }
          .bg-green-500 { background: #22c55e; color: #000; }
          .bg-blue-500 { background: #3b82f6; color: #fff; }
          .hover\\:bg-green-400:hover { background: #4ade80; }
          .hover\\:bg-blue-400:hover { background: #60a5fa; }
        `}</style>
      </head>
      <body className="bg-wise-bg-primary text-wise-text-primary">
        <SessionProvider session={undefined}>
          <ToastProvider>
            {skipSiteChrome ? children : <SiteChrome>{children}</SiteChrome>}
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
