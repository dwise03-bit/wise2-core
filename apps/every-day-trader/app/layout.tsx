import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Every Day Trader | Professional Trading Dashboard',
  description: 'Real-time market intelligence, technical analysis, and AI-powered trading insights for professional traders.',
  keywords: ['trading', 'stocks', 'charts', 'market data', 'technical analysis', 'options', 'crypto'],
  authors: [{ name: 'Every Day Trader', url: 'https://everydaytrader.app' }],
  openGraph: {
    title: 'Every Day Trader',
    description: 'Professional Trading Dashboard with Live Market Data',
    url: 'https://everydaytrader.app',
    siteName: 'Every Day Trader',
    images: [
      {
        url: 'https://everydaytrader.app/og-image.png',
        width: 1200,
        height: 630,
      }
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Every Day Trader',
    description: 'Professional Trading Dashboard',
    images: ['https://everydaytrader.app/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}
