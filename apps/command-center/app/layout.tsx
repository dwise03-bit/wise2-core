import type { Metadata, Viewport } from 'next';
import { AppShellProvider } from '../src/components/AppShellProvider';
import '../src/styles/globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: 'WISE² Command Center | Dashboard',
  description: 'Enterprise command center for real-time monitoring, automation, and AI-powered business operations.',
  robots: 'noindex, nofollow',
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
        <AppShellProvider>
          {children}
        </AppShellProvider>
      </body>
    </html>
  );
}
