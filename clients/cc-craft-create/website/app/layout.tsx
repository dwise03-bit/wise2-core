import type { Metadata, Viewport } from 'next';
import { Lora, Poppins, Great_Vibes } from 'next/font/google';
import { DemoBanner } from '@/components/DemoBanner';
import { Providers } from './providers';
import './globals.css';

const lora = Lora({
  variable: '--font-lora',
  subsets: ['latin'],
  weight: ['400', '700'],
});

const poppins = Poppins({
  variable: '--font-poppins',
  weight: ['400', '600', '700'],
  subsets: ['latin'],
});

const greatVibes = Great_Vibes({
  variable: '--font-script',
  weight: '400',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'CC Craft & Create — Custom Personalized Products',
  description:
    'Custom personalized products for every occasion. Fast turnaround, high-quality printing, made with love.',
  openGraph: {
    title: 'CC Craft & Create — Crafted for the Moment. Created for the Memory.',
    description: 'Custom products for birthdays, graduations, memorials, holidays, and more.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#6D2DBD',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${lora.variable} ${poppins.variable} ${greatVibes.variable}`}>
      <body className="min-h-screen flex flex-col antialiased font-poppins">
        <Providers>
          <DemoBanner />
          {children}
        </Providers>
      </body>
    </html>
  );
}
