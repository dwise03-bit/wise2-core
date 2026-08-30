import type { Metadata, Viewport } from 'next';
import { AppShellProvider } from '../src/components/AppShellProvider';
import { PwaRegister } from '../src/components/PwaRegister';
import '../src/styles/globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#050505',
};

export const metadata: Metadata = {
  title: 'WISE² Command Center | Dashboard',
  description: 'Enterprise command center for real-time monitoring, automation, and AI-powered business operations.',
  robots: 'noindex, nofollow',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'WISE²',
  },
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#050505" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-wise-black text-text-primary antialiased">
        <PwaRegister />
        <AppShellProvider>
          {children}
        </AppShellProvider>
      </body>
    </html>
  );
}
