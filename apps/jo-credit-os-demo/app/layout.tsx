import type { Metadata, Viewport } from 'next';
import './styles/globals.css';
import { PublicNav, PublicFooter } from '@/components/navigation';
import { WiseImp } from '@/components/wise-imp/WiseImp';
import { ToastProvider } from '@/components/ui/Toast';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: 'WISE² | Building Empires, Changing Culture',
  description: 'WISE² is the new business OS for a founder-led empire: Wise Shine, Piff City Creative Studios, and the systems that power legacy.',
  keywords: 'WISE2, WISE², business OS, brand identity, Atlanta, Wise Shine, Piff City, creative studio, empire building, legacy brand',
  robots: 'index, follow',
  metadataBase: new URL('https://wise2.net'),
  openGraph: {
    type: 'website',
    url: 'https://wise2.net',
    title: 'WISE² | Building Empires, Changing Culture',
    description: 'The new WISE² brand identity and homepage for the next chapter of the business OS.',
    siteName: 'WISE²',
    images: [
      {
        url: '/brand/wise2-brand-identity.png',
        width: 1200,
        height: 630,
        alt: 'WISE² brand identity poster',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WISE² | Building Empires, Changing Culture',
    description: 'The new WISE² brand identity and homepage for the next chapter of the business OS.',
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
      <body className="bg-wise-bg-primary text-wise-text-primary">
        <ToastProvider>
          <PublicNav />
          <div className="min-h-screen flex flex-col">
            {/* Main Content - pt-16 accounts for fixed navigation (64px) */}
            <main className="flex-1 pt-16">
              {children}
            </main>

            {/* Wise Imp — WISE² AI companion */}
            <WiseImp />

            {/* Footer */}
            <PublicFooter />
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
