import type { Metadata, Viewport } from 'next';
import './styles/globals.css';
import { SiteChrome } from '@/components/SiteChrome';
import { ToastProvider } from '@/components/ui/Toast';
import Script from 'next/script';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: 'WISE² | AI Business Operating System',
  description: 'WISE² builds AI-powered business systems, automation, CRM, websites, phone AI, cloud infrastructure, and digital tools designed to help businesses operate and grow.',
  keywords: 'WISE2, WISE², field operations software, AI workflows, HVAC diagnostics, edge systems, business operating system, client infrastructure',
  robots: 'index, follow',
  metadataBase: new URL('https://wise2.net'),
  openGraph: {
    type: 'website',
    url: 'https://wise2.net',
    title: 'WISE² | AI Business Operating System',
    description: 'WISE² builds AI-powered business systems, automation, CRM, websites, phone AI, cloud infrastructure, and digital tools designed to help businesses operate and grow.',
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
    title: 'WISE² | AI Business Operating System',
    description: 'WISE² builds AI-powered business systems, automation, CRM, websites, phone AI, cloud infrastructure, and digital tools designed to help businesses operate and grow.',
    creator: '@wise2',
    site: '@wise2',
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
        <link rel="stylesheet" href="/scrollcraft/scrollcraft.css" />
        <Script src="/scrollcraft/scrollcraft.js" strategy="afterInteractive" />
        <Script src="/scrollcraft/init.js" strategy="afterInteractive" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'WISE²',
              url: 'https://wise2.net',
              logo: 'https://wise2.net/favicon.svg',
              description: 'AI-powered business systems, automation, CRM, websites, phone AI, cloud infrastructure, and digital tools.',
            }),
          }}
        />
        <ToastProvider>
          <SiteChrome>{children}</SiteChrome>
        </ToastProvider>
      </body>
    </html>
  );
}
