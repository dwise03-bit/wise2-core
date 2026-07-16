import type { Metadata, Viewport } from 'next';
import './styles/globals.css';
import { SiteNav } from './components/SiteNav';
import { SiteFooter } from './components/SiteFooter';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'WISE² Enterprise | AI-Powered Brand Operating System',
  description: 'Create, manage, and grow your brand with AI-powered tools. Professional-grade audio, video, and design. One platform. Unlimited possibilities.',
  keywords: 'brand creation, audio branding, AI, music production, design, marketing',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    url: 'https://wise2.com',
    title: 'WISE² Enterprise',
    description: 'AI-powered brand operating system',
    images: [
      {
        url: 'https://wise2.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'WISE² Enterprise',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WISE² Enterprise',
    description: 'AI-powered brand operating system',
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
        </div>
      </body>
    </html>
  );
}
