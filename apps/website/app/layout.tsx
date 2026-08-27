import type { Metadata, Viewport } from 'next';
import './styles/globals.css';
import { SiteChrome } from '@/components/SiteChrome';
import { ToastProvider } from '@/components/ui/Toast';

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
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#050505" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="bg-wise-bg-primary text-wise-text-primary">
        <ToastProvider>
          <SiteChrome>{children}</SiteChrome>
        </ToastProvider>
      </body>
    </html>
  );
}
