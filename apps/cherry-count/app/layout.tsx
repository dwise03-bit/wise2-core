import type { Metadata, Viewport } from 'next';
import { DM_Sans, Great_Vibes, Playfair_Display } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const sans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' });
const serif = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' });
const script = Great_Vibes({ subsets: ['latin'], weight: '400', variable: '--font-script' });

export const metadata: Metadata = {
  title: 'Cherry Count™ — Track It. Pack It. Profit.',
  description:
    'The all-in-one inventory, sales and pop-up management system for mobile retailers. Powered by WISE².',
  icons: { icon: '/favicon.ico' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#050505',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${sans.variable} ${serif.variable} ${script.variable}`}>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
