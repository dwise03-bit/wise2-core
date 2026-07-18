import type { Metadata, Viewport } from 'next';
import './styles/globals.css';
import { SiteNav } from './components/SiteNav';
import { SiteFooter } from './components/SiteFooter';
import ChatWidgetWrapper from '../components/ChatWidgetWrapper';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'WISE² | Organized Chaos Command Center',
  description: 'Enterprise AI operating system for creators, businesses, and entrepreneurs. All-in-one platform for brand creation, audio production, and AI-powered automation.',
  keywords: 'brand creation, audio branding, AI, music production, design, marketing, AI tools, automation',
  robots: 'index, follow',
  metadataBase: new URL('https://wise2.net'),
  openGraph: {
    type: 'website',
    url: 'https://wise2.net',
    title: 'WISE² | Organized Chaos Command Center',
    description: 'Enterprise AI operating system for creators, businesses, and entrepreneurs.',
    siteName: 'WISE²',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'WISE² Enterprise',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WISE² | Organized Chaos Command Center',
    description: 'Enterprise AI operating system for creators, businesses, and entrepreneurs.',
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
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="bg-wise text-wise-primary">
        <div className="min-h-screen flex flex-col">
          {/* Navigation (hidden on pages that render their own, e.g. "/" and "/community") */}
          <SiteNav />

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer (hidden on pages that render their own, e.g. "/") */}
          <SiteFooter />

          {/* Global support chat */}
          <ChatWidgetWrapper />
        </div>
      </body>
    </html>
  );
}
