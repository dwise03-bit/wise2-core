import type { Metadata, Viewport } from 'next';
import { Cinzel, Great_Vibes, Playfair_Display, Poppins } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const sans = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
});
const serif = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' });
const display = Cinzel({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-display' });
const script = Great_Vibes({ subsets: ['latin'], weight: '400', variable: '--font-script' });

export const metadata: Metadata = {
  title: "Fergie's Table & Savôré",
  description: 'Real Food. Real Love. Real Results. Premium catering and table booking powered by WISE².',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#0A0A0A',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${sans.variable} ${serif.variable} ${display.variable} ${script.variable}`}>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
